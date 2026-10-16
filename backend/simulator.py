import time
import requests
import random
import threading
from datetime import datetime

API_URL = "http://localhost:8000/api"

def get_machines():
    try:
        response = requests.get(f"{API_URL}/machines")
        return response.json()
    except Exception as e:
        print(f"Error fetching machines: {e}")
        return []

def generate_sensor_data(machine_id, status):
    # Base ranges
    air_temp = random.uniform(295.0, 305.0)
    process_temp = air_temp + random.uniform(8.0, 12.0)
    rpm = random.uniform(1300.0, 1800.0)
    torque = random.uniform(30.0, 60.0)
    tool_wear = random.uniform(0.0, 200.0)

    # Induce anomalies based on status
    if status == "Warning":
        air_temp += random.uniform(2.0, 5.0)
        tool_wear += 50
    elif status == "High Risk":
        air_temp += random.uniform(5.0, 8.0)
        torque += 15
        tool_wear += 100
    elif status == "Critical":
        air_temp += random.uniform(8.0, 15.0)
        process_temp += 15.0
        rpm -= 200
        torque += 30
        tool_wear += 150

    return {
        "machine_id": machine_id,
        "air_temperature": round(air_temp, 2),
        "process_temperature": round(process_temp, 2),
        "rotational_speed": round(rpm, 2),
        "torque": round(torque, 2),
        "tool_wear": round(tool_wear, 2)
    }

def simulate_machine(machine):
    print(f"Started simulating Machine {machine['machine_code']} ({machine['status']})")
    while True:
        data = generate_sensor_data(machine['id'], machine['status'])
        try:
            requests.post(f"{API_URL}/sensors", json=data)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Sent data for {machine['machine_code']}")
        except Exception as e:
            print(f"Error sending data for {machine['machine_code']}: {e}")
            
        time.sleep(5)  # Send data every 5 seconds

if __name__ == "__main__":
    print("Starting Sensor Simulator...")
    time.sleep(2)  # Wait for backend to be ready
    machines = get_machines()
    if not machines:
        print("No machines found. Make sure backend is running.")
        exit(1)
        
    threads = []
    for machine in machines:
        t = threading.Thread(target=simulate_machine, args=(machine,))
        t.daemon = True
        t.start()
        threads.append(t)
        
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping simulator...")
