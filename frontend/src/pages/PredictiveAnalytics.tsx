import React, { useEffect, useState } from 'react';
import { getMetrics, getModels } from '../services/api';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PredictiveAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [models, setModels] = useState<any>(null);

  useEffect(() => {
    getMetrics().then(setMetrics).catch(console.error);
    getModels().then(setModels).catch(console.error);
  }, []);

  if (!metrics || !models) return <div className="p-6">Loading metrics...</div>;

  const failureMetrics = [
    { name: 'Logistic Regression', f1: metrics['Failure_Logistic Regression']?.F1 || 0, auc: metrics['Failure_Logistic Regression']?.ROC_AUC || 0 },
    { name: 'Random Forest', f1: metrics['Failure_Random Forest']?.F1 || 0, auc: metrics['Failure_Random Forest']?.ROC_AUC || 0 },
    { name: 'XGBoost', f1: metrics['Failure_XGBoost']?.F1 || 0, auc: metrics['Failure_XGBoost']?.ROC_AUC || 0 },
  ];

  const rulMetrics = [
    { name: 'Random Forest', mae: metrics['RUL_Random Forest Regressor']?.MAE || 0 },
    { name: 'XGBoost', mae: metrics['RUL_XGBoost Regressor']?.MAE || 0 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-muted">Model Performance & Evaluation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 text-center">
          <p className="text-muted text-sm mb-2">Active Failure Model</p>
          <p className="text-2xl font-bold text-primary">{models.failure_model}</p>
          <div className="mt-4 flex justify-center text-success items-center gap-2">
            <ShieldCheck size={20} /> <span className="text-sm">F1: {metrics['Failure_'+models.failure_model]?.F1.toFixed(4)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 text-center">
          <p className="text-muted text-sm mb-2">Active Anomaly Model</p>
          <p className="text-2xl font-bold text-accent">{models.anomaly_model}</p>
          <div className="mt-4 flex justify-center text-success items-center gap-2">
            <Activity size={20} /> <span className="text-sm">Unsupervised</span>
          </div>
        </div>

        <div className="glass-panel p-6 text-center">
          <p className="text-muted text-sm mb-2">Active RUL Model</p>
          <p className="text-2xl font-bold text-warning">{models.rul_model}</p>
          <div className="mt-4 flex justify-center text-success items-center gap-2">
            <AlertTriangle size={20} /> <span className="text-sm">MAE: {metrics['RUL_'+models.rul_model]?.MAE.toFixed(2)} cycles</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Failure Prediction (F1-Score)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 1]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="f1" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">RUL Prediction (MAE - Lower is better)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rulMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="mae" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}