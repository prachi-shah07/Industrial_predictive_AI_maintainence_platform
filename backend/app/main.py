from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database.database import engine, Base, SessionLocal
from app.models.domain import Machine
from app.api.endpoints import router as api_router
from datetime import datetime

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database with some machines if empty
def seed_db():
    db = SessionLocal()
    try:
        if db.query(Machine).count() == 0:
            machines = [
                Machine(machine_code="CNC-001", machine_type="M", location="Line A", criticality="High", installation_date=datetime.now(), status="Healthy"),
                Machine(machine_code="CNC-002", machine_type="L", location="Line B", criticality="Medium", installation_date=datetime.now(), status="Warning"),
                Machine(machine_code="MILL-003", machine_type="H", location="Line A", criticality="Critical", installation_date=datetime.now(), status="Healthy"),
                Machine(machine_code="LATHE-004", machine_type="M", location="Line B", criticality="High", installation_date=datetime.now(), status="Healthy"),
                Machine(machine_code="PRESS-005", machine_type="H", location="Line C", criticality="Critical", installation_date=datetime.now(), status="Critical"),
                Machine(machine_code="ROBOT-006", machine_type="L", location="Assembly 1", criticality="Medium", installation_date=datetime.now(), status="Warning"),
                Machine(machine_code="DRILL-007", machine_type="L", location="Line C", criticality="Low", installation_date=datetime.now(), status="Healthy"),
                Machine(machine_code="GRIND-008", machine_type="M", location="Line A", criticality="High", installation_date=datetime.now(), status="High Risk"),
            ]
            db.add_all(machines)
            db.commit()
    finally:
        db.close()

seed_db()

app = FastAPI(
    title="Industrial AI Predictive Maintenance API",
    description="API for Machine Health Intelligence Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend API"}

# Include routers
app.include_router(api_router, prefix="/api")
