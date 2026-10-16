import pytest
import os
import joblib

def test_models_exist():
    assert os.path.exists('models/failure_model.pkl')
    assert os.path.exists('models/anomaly_model.pkl')
    assert os.path.exists('models/rul_model.pkl')

def test_metrics_exist():
    assert os.path.exists('models/metrics.json')

def test_model_loading():
    model = joblib.load('models/failure_model.pkl')
    assert model is not None
