from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MachineBase(BaseModel):
    machine_code: str
    machine_type: str
    location: str
    criticality: str
    status: str

class MachineCreate(MachineBase):
    installation_date: datetime

class MachineOut(MachineBase):
    id: int
    installation_date: datetime
    class Config:
        orm_mode = True

class SensorReadingBase(BaseModel):
    machine_id: int
    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float

class SensorReadingOut(SensorReadingBase):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class PredictionOut(BaseModel):
    id: int
    machine_id: int
    timestamp: datetime
    failure_probability: float
    risk_level: str
    predicted_failure_type: Optional[str]
    rul: float
    shap_values: Optional[List[float]] = None
    class Config:
        orm_mode = True

class AnomalyOut(BaseModel):
    id: int
    machine_id: int
    timestamp: datetime
    anomaly_score: float
    sensor: Optional[str]
    severity: str
    class Config:
        orm_mode = True

class MaintenanceRecordOut(BaseModel):
    id: int
    machine_id: int
    maintenance_date: datetime
    maintenance_type: str
    description: str
    cost: float
    class Config:
        orm_mode = True
