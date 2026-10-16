import React, { useEffect, useState } from 'react';
import { getMachines } from '../services/api';
import api from '../services/api';
import { Clock, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';

export default function RemainingUsefulLife() {
  const [machines, setMachines] = useState<any[]>([]);
  const [rulData, setRulData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ms = await getMachines();
        setMachines(ms);
        // Fetch RUL for each machine
        const results = await Promise.all(
          ms.map((m: any) =>
            api.get(`/rul/${m.id}`)
              .then(r => ({ machine: m.machine_code, rul: Math.round(r.data.rul ?? r.data.rul_hours ?? 0), status: m.status }))
              .catch(() => ({ machine: m.machine_code, rul: 0, status: m.status }))
          )
        );
        setRulData(results);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRulColor = (rul: number) => {
    if (rul < 50) return '#ef4444';
    if (rul < 150) return '#f97316';
    if (rul < 300) return '#f59e0b';
    return '#10b981';
  };

  const getRulLabel = (rul: number) => {
    if (rul < 50) return { label: 'Critical', cls: 'text-critical bg-critical/20' };
    if (rul < 150) return { label: 'High Risk', cls: 'text-highrisk bg-highrisk/20' };
    if (rul < 300) return { label: 'Warning', cls: 'text-warning bg-warning/20' };
    return { label: 'Healthy', cls: 'text-success bg-success/20' };
  };

  const avgRul = rulData.length > 0
    ? Math.round(rulData.reduce((s, d) => s + d.rul, 0) / rulData.length)
    : 0;

  const critical = rulData.filter(d => d.rul < 50).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Remaining Useful Life</h1>
        <p className="text-muted">Predicted hours before each machine requires maintenance — powered by Random Forest</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20 text-primary"><Clock size={24} /></div>
          <div>
            <p className="text-muted text-sm">Fleet Avg RUL</p>
            <p className="text-3xl font-bold">{avgRul}h</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-critical/20 text-critical"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-muted text-sm">Critical (&lt;50h)</p>
            <p className="text-3xl font-bold">{critical}</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success/20 text-success"><TrendingDown size={24} /></div>
          <div>
            <p className="text-muted text-sm">Model MAE</p>
            <p className="text-3xl font-bold">27.97h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RUL Bar chart */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">RUL by Machine</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rulData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="h" />
                <YAxis type="category" dataKey="machine" stroke="#94a3b8" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  formatter={(v: any) => [`${v}h`, 'RUL']}
                />
                <Bar dataKey="rul" radius={[0, 4, 4, 0]}>
                  {rulData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRulColor(entry.rul)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RUL Table */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Machine RUL Details</h2>
          <div className="space-y-3">
            {rulData.map((d, i) => {
              const { label, cls } = getRulLabel(d.rul);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border/50">
                  <div>
                    <p className="font-semibold">{d.machine}</p>
                    <p className="text-xs text-muted mt-0.5">Predicted useful life remaining</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-xl font-bold">{d.rul}h</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{label}</span>
                  </div>
                </div>
              );
            })}
            {rulData.length === 0 && <p className="text-muted text-sm">Loading RUL data...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}