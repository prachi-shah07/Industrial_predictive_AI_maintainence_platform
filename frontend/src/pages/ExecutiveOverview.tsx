import React, { useEffect, useState } from 'react';
import { getMachines, getAlerts } from '../services/api';
import { Activity, AlertTriangle, ShieldCheck, Factory, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ExecutiveOverview() {
  const [machines, setMachines] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = () => {
      getMachines().then(setMachines).catch(console.error);
      getAlerts().then(setAlerts).catch(console.error);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const healthy = machines.filter(m => m.status === 'Healthy').length;
  const warning = machines.filter(m => m.status === 'Warning').length;
  const highRisk = machines.filter(m => m.status === 'High Risk').length;
  const critical = machines.filter(m => m.status === 'Critical').length;
  
  const pieData = [
    { name: 'Healthy', value: healthy, color: '#10b981' },
    { name: 'Warning', value: warning, color: '#f59e0b' },
    { name: 'High Risk', value: highRisk, color: '#f97316' },
    { name: 'Critical', value: critical, color: '#ef4444' }
  ];

  const trendData = [
    { name: 'Mon', risk: 12 }, { name: 'Tue', risk: 15 }, { name: 'Wed', risk: 13 },
    { name: 'Thu', risk: 18 }, { name: 'Fri', risk: 14 }, { name: 'Sat', risk: 10 }, { name: 'Sun', risk: 8 }
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Executive Overview</h1>
          <p className="text-muted">Global Machine Health & Predictive Analytics</p>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI title="Total Machines" value={machines.length} icon={Factory} color="text-primary" />
        <KPI title="Healthy Machines" value={healthy} icon={ShieldCheck} color="text-success" />
        <KPI title="Critical Risk" value={critical} icon={AlertTriangle} color="text-critical" />
        <KPI title="Est. Savings" value="$145k" sub="Monthly" icon={DollarSign} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Failure Risk Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="risk" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Health Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-sm">
               <span className="text-success">Healthy: {healthy}</span>
               <span className="text-critical">Critical: {critical}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Risk Ranking */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">High Priority Machines</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-muted border-b border-border">
              <tr>
                <th className="pb-2">Machine</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.slice(0,5).map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="py-3 font-medium">{m.machine_code}</td>
                  <td className="py-3">{m.location}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${m.status==='Healthy'?'bg-success/20 text-success':m.status==='Critical'?'bg-critical/20 text-critical':'bg-warning/20 text-warning'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active Alerts */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? <p className="text-muted">No active alerts.</p> : 
              alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
                <AlertTriangle className="text-warning shrink-0" size={20} />
                <div>
                  <p className="text-sm font-medium">{a.message}</p>
                  <p className="text-xs text-muted mt-1">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="glass-panel p-5 flex items-center justify-between">
      <div>
        <p className="text-muted text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-full bg-surface border border-border ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}