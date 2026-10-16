from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_apis():
    print("Testing /api/machines...")
    res = client.get("/api/machines")
    assert res.status_code == 200
    machines = res.json()
    print(f"Found {len(machines)} machines. First machine: {machines[0]['machine_code']}")
    
    print("\nTesting /api/sensors (POST) for inference...")
    # Add a sensor reading for machine 1
    reading = {
        "machine_id": 1,
        "air_temperature": 298.1,
        "process_temperature": 308.6,
        "rotational_speed": 1551.0,
        "torque": 42.8,
        "tool_wear": 0.0
    }
    res = client.post("/api/sensors", json=reading)
    assert res.status_code == 200
    pred = res.json()
    print(f"Prediction result: Risk Level={pred['risk_level']}, Failure Prob={pred['failure_probability']:.4f}, RUL={pred['rul']:.2f}")
    
    print("\nTesting /api/sensors/{machine_id} (GET)...")
    res = client.get("/api/sensors/1")
    assert res.status_code == 200
    print(f"Sensor history count: {len(res.json())}")
    
    print("\nTesting /api/anomalies...")
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    print(f"Anomalies count: {len(res.json())}")
    
    print("\nTesting /api/metrics...")
    res = client.get("/api/metrics")
    assert res.status_code == 200
    print(f"Metrics available: {list(res.json().keys())}")
    
    print("\nAll APIs tested successfully!")

if __name__ == "__main__":
    test_apis()
