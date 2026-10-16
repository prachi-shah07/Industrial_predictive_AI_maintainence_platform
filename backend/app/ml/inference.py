import joblib
import pandas as pd
import numpy as np
import os
import json

# Paths relative to backend directory when run with uvicorn
MODEL_DIR = "../ml/models"

class MLService:
    def __init__(self):
        self.scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        self.failure_model = joblib.load(os.path.join(MODEL_DIR, "failure_model.pkl"))
        self.anomaly_model = joblib.load(os.path.join(MODEL_DIR, "anomaly_model.pkl"))
        self.rul_model = joblib.load(os.path.join(MODEL_DIR, "rul_model.pkl"))
        
        # Load SHAP explainer
        self.shap_explainer = joblib.load(os.path.join(MODEL_DIR, "shap_explainer.pkl"))
        
        # Load metrics
        with open(os.path.join(MODEL_DIR, "metrics.json"), "r") as f:
            self.metrics = json.load(f)

    def prepare_features(self, sensor_data: dict, machine_type: str):
        # Calculate derived feature
        temp_diff = sensor_data['process_temperature'] - sensor_data['air_temperature']
        
        # Determine one-hot encoding for type
        type_l = 1 if machine_type == 'L' else 0
        type_m = 1 if machine_type == 'M' else 0
        
        # The exact order from X_train columns
        features = {
            'Air temperature [K]': [sensor_data['air_temperature']],
            'Process temperature [K]': [sensor_data['process_temperature']],
            'Rotational speed [rpm]': [sensor_data['rotational_speed']],
            'Torque [Nm]': [sensor_data['torque']],
            'Tool wear [min]': [sensor_data['tool_wear']],
            'Temp_diff': [temp_diff],
            'Type_L': [type_l],
            'Type_M': [type_m]
        }
        
        df = pd.DataFrame(features)
        df_scaled = pd.DataFrame(self.scaler.transform(df), columns=df.columns)
        
        # XGBoost requires no brackets in column names
        df_scaled.columns = [c.replace('[', '').replace(']', '').replace('<', '') for c in df_scaled.columns]
        
        return df_scaled
    
    def predict(self, sensor_data: dict, machine_type: str):
        df_scaled = self.prepare_features(sensor_data, machine_type)
        
        # Failure Prediction
        fail_prob = float(self.failure_model.predict_proba(df_scaled)[0, 1]) if hasattr(self.failure_model, 'predict_proba') else float(self.failure_model.predict(df_scaled)[0])
        
        # Anomaly Detection (Isolation forest returns 1 for normal, -1 for anomaly)
        is_anomaly = self.anomaly_model.predict(df_scaled)[0] == -1
        anomaly_score = float(self.anomaly_model.decision_function(df_scaled)[0]) * -1 # Make higher = more anomalous
        
        # RUL
        rul = float(self.rul_model.predict(df_scaled)[0])
        
        # Generate SHAP explanation
        shap_values = self.shap_explainer(df_scaled)
        
        # Risk level logic
        risk_level = "Healthy"
        if fail_prob > 0.8:
            risk_level = "Critical"
        elif fail_prob > 0.5:
            risk_level = "High Risk"
        elif fail_prob > 0.2 or is_anomaly:
            risk_level = "Warning"
            
        return {
            "failure_probability": fail_prob,
            "is_anomaly": bool(is_anomaly),
            "anomaly_score": anomaly_score,
            "rul": rul,
            "risk_level": risk_level,
            "shap_values": shap_values.values[0].tolist(),
            "feature_names": df_scaled.columns.tolist(),
            "base_value": float(shap_values.base_values[0])
        }

ml_service = MLService()
