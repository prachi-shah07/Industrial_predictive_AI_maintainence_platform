import React, { useEffect, useState } from 'react';
import { getAnomalies, getMachines } from '../services/api';
import { AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts';

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = () => {
      getAnomalies().then(setAnomalies).catch(console.error);
      getMachines().then(setMachines).catch(console.error);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const anomalyByMachine = machines.map(m => ({
    name: m.machine_code,
    anomalies: anomalies.filter((a: any) => a.machine_id === m.id).length,
  }));

  const recent = [...anomalies].sort((a, b) =>
    new Date(b.timestamp || b.detected_at).getTime() - new Date(a.timestamp || a.detected_at).getTime()
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        <p className="text-muted">Real-time anomalies detected by Isolation Forest ML model</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-critical/20 text-critical"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-muted text-sm">Total Anomalies</p>
            <p className="text-3xl font-bold">{anomalies.length}</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-warning/20 text-warning"><Clock size={24} /></div>
          <div>
            <p className="text-muted text-sm">Last 24h</p>
            <p className="text-3xl font-bold">
              {anomalies.filter((a: any) =>
                new Date(a.timestamp || a.detected_at) > new Date(Date.now() - 86400000)
              ).length}
            </p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success/20 text-success"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-muted text-sm">Machines Normal</p>
            <p className="text-3xl font-bold">
              {machines.filter(m => m.status === 'Healthy').length} / {machines.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly count per machine */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Anomalies Per Machine</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyByMachine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="anomalies" fill="#ef4444" radius={[4, 4, 0, 0]} name="Anomalies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent anomaly log */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Anomaly Log</h2>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {recent.length === 0 ? (
              <p className="text-muted text-sm">No anomalies detected yet.</p>
            ) : (
              recent.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border/50">
                  <AlertTriangle className="text-warning shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Machine ID {a.machine_id} — Anomaly Score: <span className="text-critical">{Number(a.anomaly_score).toFixed(3)}</span></p>
                    <p className="text-xs text-muted mt-1">{new Date(a.timestamp || a.detected_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}