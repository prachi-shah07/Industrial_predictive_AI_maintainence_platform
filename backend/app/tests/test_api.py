import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_machines():
    response = client.get("/api/machines")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_get_drift():
    response = client.get("/api/drift")
    assert response.status_code == 200
    data = response.json()
    assert "overall_drift_score" in data
    assert "features" in data
