import React, { useEffect, useState } from 'react';
import { getMachines } from '../services/api';
import { DollarSign, TrendingDown, TrendingUp, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

const DOWNTIME_COST_PER_HOUR = 4500;   // USD per hour unplanned downtime
const MAINTENANCE_COST = 800;           // USD per scheduled maintenance
const AVG_DOWNTIME_HOURS = 8;           // Avg hours per unplanned failure

export default function CostImpact() {
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = () => getMachines().then(setMachines).catch(console.error);
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const critical = machines.filter(m => m.status === 'Critical').length;
  const highRisk = machines.filter(m => m.status === 'High Risk').length;
  const warning = machines.filter(m => m.status === 'Warning').length;

  const expectedFailures = critical + highRisk * 0.5 + warning * 0.1;
  const unplannedDowntimeCost = Math.round(expectedFailures * AVG_DOWNTIME_HOURS * DOWNTIME_COST_PER_HOUR);
  const preventiveCost = Math.round((critical + highRisk + warning) * MAINTENANCE_COST);
  const savings = Math.max(0, unplannedDowntimeCost - preventiveCost);

  const roiData = [
    { name: 'Unplanned Downtime Cost', value: unplannedDowntimeCost, fill: '#ef4444' },
    { name: 'Preventive Maintenance Cost', value: preventiveCost, fill: '#3b82f6' },
    { name: 'Estimated Savings', value: savings, fill: '#10b981' },
  ];

  const machineData = machines.map(m => ({
    name: m.machine_code,
    risk_cost: m.status === 'Critical' ? AVG_DOWNTIME_HOURS * DOWNTIME_COST_PER_HOUR :
               m.status === 'High Risk' ? AVG_DOWNTIME_HOURS * DOWNTIME_COST_PER_HOUR * 0.5 :
               m.status === 'Warning' ? AVG_DOWNTIME_HOURS * DOWNTIME_COST_PER_HOUR * 0.1 : 0,
    maint_cost: MAINTENANCE_COST,
  }));

  const pieData = [
    { name: 'Critical', value: critical, color: '#ef4444' },
    { name: 'High Risk', value: highRisk, color: '#f97316' },
    { name: 'Warning', value: warning, color: '#f59e0b' },
    { name: 'Healthy', value: machines.filter(m => m.status === 'Healthy').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const fmt = (v: number) => `$${v.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Cost & Business Impact</h1>
        <p className="text-muted">Financial analysis of predictive maintenance vs. unplanned downtime</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-critical/20 text-critical"><TrendingDown size={24} /></div>
          <div>
            <p className="text-muted text-sm">Downtime Risk Cost</p>
            <p className="text-2xl font-bold">{fmt(unplannedDowntimeCost)}</p>
            <p className="text-xs text-muted">If failures occur unaddressed</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/20 text-primary"><DollarSign size={24} /></div>
          <div>
            <p className="text-muted text-sm">Preventive Cost</p>
            <p className="text-2xl font-bold">{fmt(preventiveCost)}</p>
            <p className="text-xs text-muted">Scheduled maintenance budget</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success/20 text-success"><TrendingUp size={24} /></div>
          <div>
            <p className="text-muted text-sm">Estimated Savings</p>
            <p className="text-2xl font-bold text-success">{fmt(savings)}</p>
            <p className="text-xs text-muted">By acting proactively</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-accent/20 text-accent"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-muted text-sm">ROI of AI System</p>
            <p className="text-2xl font-bold text-accent">
              {preventiveCost > 0 ? `${Math.round((savings / preventiveCost) * 100)}%` : 'N/A'}
            </p>
            <p className="text-xs text-muted">Return on investment</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost comparison */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Cost Comparison — Per Machine</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  formatter={(v: any) => [fmt(v)]}
                />
                <Legend />
                <Bar dataKey="risk_cost" name="Downtime Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maint_cost" name="Maintenance Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine status pie */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Fleet Health Distribution</h2>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-sm mt-2">
              {pieData.map((d, i) => (
                <span key={i} style={{ color: d.color }}>● {d.name}: {d.value}</span>
              ))}
            </div>
          </div>

          {/* Summary assumptions */}
          <div className="mt-4 p-3 bg-surface rounded-lg border border-border/50 text-xs text-muted space-y-1">
            <p>📌 Assumptions: ${DOWNTIME_COST_PER_HOUR.toLocaleString()}/hr unplanned downtime · {AVG_DOWNTIME_HOURS}h avg failure duration · ${MAINTENANCE_COST}/scheduled job</p>
            <p>⚠️ Simulation Mode — figures are illustrative estimates based on demo data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}