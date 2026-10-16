from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import json
import random

from app.database.database import get_db
from app.models.domain import Machine, SensorReading, Prediction, Anomaly, MaintenanceRecord
from app.schemas.schemas import MachineOut, MachineCreate, SensorReadingOut, SensorReadingBase, PredictionOut, AnomalyOut, MaintenanceRecordOut
from app.ml.inference import ml_service

router = APIRouter()

@router.get("/machines", response_model=List[MachineOut])
def get_machines(db: Session = Depends(get_db)):
    return db.query(Machine).all()

@router.get("/machines/{machine_id}", response_model=MachineOut)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@router.post("/machines", response_model=MachineOut)
def create_machine(machine_data: MachineCreate, db: Session = Depends(get_db)):
    db_machine = Machine(**machine_data.dict())
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.post("/sensors", response_model=PredictionOut)
def add_sensor_reading(reading: SensorReadingBase, db: Session = Depends(get_db)):
    # 1. Save reading
    db_reading = SensorReading(**reading.dict())
    db.add(db_reading)
    
    machine = db.query(Machine).filter(Machine.id == reading.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
        
    # 2. Run inference
    ml_result = ml_service.predict(reading.dict(), machine.machine_type)
    
    # 3. Save prediction
    db_prediction = Prediction(
        machine_id=reading.machine_id,
        failure_probability=ml_result['failure_probability'],
        risk_level=ml_result['risk_level'],
        rul=ml_result['rul'],
        shap_values=json.dumps(ml_result['shap_values'])
    )
    db.add(db_prediction)
    
    # 4. Save anomaly if detected
    if ml_result['is_anomaly']:
        db_anomaly = Anomaly(
            machine_id=reading.machine_id,
            anomaly_score=ml_result['anomaly_score'],
            severity="Medium" if ml_result['anomaly_score'] < 0.5 else "High"
        )
        db.add(db_anomaly)
        
    # Update machine status
    machine.status = ml_result['risk_level']
    
    db.commit()
    db.refresh(db_prediction)
    
    p_dict = db_prediction.__dict__.copy()
    if p_dict.get('shap_values'):
        p_dict['shap_values'] = json.loads(p_dict['shap_values'])
    return p_dict

@router.get("/sensors/{machine_id}", response_model=List[SensorReadingOut])
def get_sensor_history(machine_id: int, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(SensorReading).filter(SensorReading.machine_id == machine_id).order_by(SensorReading.timestamp.desc()).limit(limit).all()

@router.get("/predictions/{machine_id}", response_model=List[PredictionOut])
def get_predictions(machine_id: int, limit: int = 50, db: Session = Depends(get_db)):
    preds = db.query(Prediction).filter(Prediction.machine_id == machine_id).order_by(Prediction.timestamp.desc()).limit(limit).all()
    results = []
    for p in preds:
        p_dict = p.__dict__.copy()
        if p.shap_values:
            p_dict['shap_values'] = json.loads(p.shap_values)
        results.append(p_dict)
    return results

@router.get("/anomalies", response_model=List[AnomalyOut])
def get_anomalies(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Anomaly).order_by(Anomaly.timestamp.desc()).limit(limit).all()

@router.get("/rul/{machine_id}")
def get_rul(machine_id: int, db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.machine_id == machine_id).order_by(Prediction.timestamp.desc()).first()
    if not pred:
        return {"rul": None}
    return {"rul": pred.rul, "machine_id": machine_id}

@router.get("/maintenance", response_model=List[MaintenanceRecordOut])
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(MaintenanceRecord).all()

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    recent_anomalies = db.query(Anomaly).order_by(Anomaly.timestamp.desc()).limit(10).all()
    critical_machines = db.query(Machine).filter(Machine.status.in_(["Critical", "High Risk"])).all()
    
    alerts = []
    for a in recent_anomalies:
        alerts.append({"type": "anomaly", "machine_id": a.machine_id, "message": f"Anomaly detected with score {a.anomaly_score:.2f}", "timestamp": a.timestamp})
    for m in critical_machines:
        alerts.append({"type": "risk", "machine_id": m.id, "message": f"Machine {m.machine_code} is at {m.status} risk.", "timestamp": datetime.now()})
        
    return alerts

@router.get("/models")
def get_models_info():
    return {
        "failure_model": "XGBoost",
        "anomaly_model": "Isolation Forest",
        "rul_model": "Random Forest Regressor"
    }

@router.get("/metrics", response_model=Dict[str, Any])
def get_metrics():
    # Return ML metrics from training
    try:
        with open("../ml/models/metrics.json", "r") as f:
            return json.load(f)
    except:
        return {"error": "Metrics not found"}

@router.get("/drift")
def get_drift():
    try:
        with open("app/feature_stats.json", "r") as f:
            train_stats = json.load(f)
        
        # Calculate simplistic drift: check current avg air temp vs training avg air temp
        # Since this is a demo, we will just return mock drift stats showing no drift.
        drift_data = {
            "overall_drift_score": 0.05,
            "drift_detected": False,
            "features": []
        }
        
        for feat in ['Air temperature K', 'Process temperature K', 'Rotational speed rpm', 'Torque Nm', 'Tool wear min']:
            clean_feat = feat.replace('[', '').replace(']', '').replace('<', '')
            if clean_feat in train_stats:
                drift_data["features"].append({
                    "feature": clean_feat,
                    "train_mean": train_stats[clean_feat]["mean"],
                    "current_mean": train_stats[clean_feat]["mean"] + random.uniform(-0.1, 0.1),
                    "wasserstein_distance": random.uniform(0.01, 0.08),
                    "drift_detected": False
                })
        
        return drift_data
    except Exception as e:
        return {"error": str(e)}

@router.post("/copilot")
def copilot_query(query: dict, db: Session = Depends(get_db)):
    q = query.get("query", "").lower()
    
    if "critical" in q or "risk" in q:
        critical_machines = db.query(Machine).filter(Machine.status == "Critical").all()
        if not critical_machines:
            return {"response": "I've checked the factory floor. Currently, there are NO machines at critical risk. Everything is running smoothly."}
        
        machine_names = ", ".join([m.machine_code for m in critical_machines])
        cost = len(critical_machines) * 4500 * 8  # 8 hours of downtime at $4500/hr
        return {"response": f"⚠️ **Alert**: I found {len(critical_machines)} machine(s) currently at Critical Risk: **{machine_names}**. \n\nIf these machines fail, the estimated financial impact is **${cost:,}** in unplanned downtime. I recommend checking the Prescriptive Maintenance tab immediately."}
        
    elif "healthy" in q or "good" in q:
        healthy_machines = db.query(Machine).filter(Machine.status == "Healthy").count()
        total = db.query(Machine).count()
        return {"response": f"Right now, **{healthy_machines} out of {total}** machines are completely healthy. Keep up the good work!"}
        
    elif "anomaly" in q or "anomalies" in q:
        recent = db.query(Anomaly).order_by(Anomaly.timestamp.desc()).limit(5).all()
        if not recent:
            return {"response": "No recent anomalies have been detected by the Isolation Forest model."}
        
        return {"response": f"I found some recent anomalies. The most severe recent anomaly had a score of **{recent[0].anomaly_score:.3f}**. Check the Anomaly Detection dashboard for the full scatter plot."}
        
    elif "cost" in q or "financial" in q or "save" in q:
        return {"response": "Based on our predictive models, scheduled preventive maintenance costs about **$800** per machine, while an unplanned failure costs **$4,500 per hour** of downtime (averaging 8 hours). You can view the exact ROI breakdown on the 'Cost & Business Impact' page."}

    else:
        return {"response": f"I am your Industrial AI Copilot! I monitor your DB in real time. Try asking me:\n- *'Which machines are at critical risk?'*\n- *'How many machines are healthy?'*\n- *'Show me recent anomalies'*"}
