from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database.database import Base

class Machine(Base):
    __tablename__ = "machines"
    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String, unique=True, index=True)
    machine_type = Column(String)  # 'L', 'M', 'H'
    location = Column(String)
    criticality = Column(String)
    installation_date = Column(DateTime)
    status = Column(String) # 'Healthy', 'Warning', 'High Risk', 'Critical'

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    timestamp = Column(DateTime, default=func.now())
    air_temperature = Column(Float)
    process_temperature = Column(Float)
    rotational_speed = Column(Float)
    torque = Column(Float)
    tool_wear = Column(Float)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    timestamp = Column(DateTime, default=func.now())
    failure_probability = Column(Float)
    risk_level = Column(String)
    predicted_failure_type = Column(String, nullable=True)
    rul = Column(Float)
    shap_values = Column(String, nullable=True)

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    timestamp = Column(DateTime, default=func.now())
    anomaly_score = Column(Float)
    sensor = Column(String, nullable=True)
    severity = Column(String)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    maintenance_date = Column(DateTime)
    maintenance_type = Column(String)
    description = Column(String)
    cost = Column(Float)
