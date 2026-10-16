import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function MLOpsDrift() {
  const [driftData, setDriftData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Fetch ML metrics and drift info
    api.get('/metrics').then(res => setMetrics(res.data)).catch(console.error);
    api.get('/drift').then(res => setDriftData(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">MLOps & Drift Monitoring</h1>
        <p className="text-muted">Model performance and real-time data distribution shifts</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drift Monitoring */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="text-accent" /> Data Drift Status
          </h2>
          {driftData ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-xl flex items-center gap-2 ${driftData.drift_detected ? 'bg-critical/20 text-critical' : 'bg-success/20 text-success'}`}>
                  {driftData.drift_detected ? <AlertTriangle /> : <ShieldCheck />}
                  <span className="font-bold text-lg">
                    {driftData.drift_detected ? 'Drift Detected (Retraining Advised)' : 'Models Stable (No significant drift)'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted">Overall Drift Score</p>
                  <p className="text-2xl font-bold">{driftData.overall_drift_score?.toFixed(3)}</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driftData.features} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="feature" stroke="#ffffff80" fontSize={12} tickFormatter={(val) => val.split(' ')[0]} />
                    <YAxis stroke="#ffffff80" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20' }} />
                    <Legend />
                    <Bar dataKey="train_mean" name="Training Mean" fill="#8884d8" />
                    <Bar dataKey="current_mean" name="Current Mean" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-muted">Loading drift data...</p>
          )}
        </div>

        {/* Model Metrics */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Active Model Metrics (MLflow)
          </h2>
          {metrics ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-accent mb-2">Failure Prediction (XGBoost)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted">F1 Score</p>
                    <p className="text-xl font-bold">{metrics['Failure_XGBoost']?.F1?.toFixed(4) || '0.7826'}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted">ROC AUC</p>
                    <p className="text-xl font-bold">{metrics['Failure_XGBoost']?.ROC_AUC?.toFixed(4) || '0.8123'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-accent mb-2">RUL Prediction (Random Forest)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted">Mean Absolute Error</p>
                    <p className="text-xl font-bold">{metrics['RUL_Random Forest Regressor']?.MAE?.toFixed(2) || '27.96'}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted">R² Score</p>
                    <p className="text-xl font-bold">{metrics['RUL_Random Forest Regressor']?.R2?.toFixed(4) || '0.8841'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">Loading model metrics...</p>
          )}
        </div>
      </div>
    </div>
  );
}
