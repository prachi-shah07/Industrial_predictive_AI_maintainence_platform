import React, { useEffect, useState } from 'react';
import { getMachines, getPredictions } from '../services/api';
import { AlertTriangle, Wrench, CheckCircle } from 'lucide-react';

export default function Priority() {
  const [machines, setMachines] = useState<any[]>([]);
  const [prioritized, setPrioritized] = useState<any[]>([]);

  useEffect(() => {
    getMachines().then(data => {
      setMachines(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // In a real app, this would be computed by the backend
    // Here we compute a simple priority score on the frontend based on status
    const sorted = [...machines].sort((a, b) => {
      const score = (m: any) => m.status === 'Critical' ? 3 : m.status === 'High Risk' ? 2 : m.status === 'Warning' ? 1 : 0;
      return score(b) - score(a);
    });
    setPrioritized(sorted);
  }, [machines]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Maintenance Prioritization</h1>
        <p className="text-muted">Ranked action queue based on risk and criticality</p>
      </header>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface/50 border-b border-border text-muted text-sm">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Machine</th>
              <th className="p-4">Location</th>
              <th className="p-4">Criticality</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {prioritized.map((m, index) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="p-4 font-bold text-lg text-muted">#{index + 1}</td>
                <td className="p-4 font-medium">{m.machine_code}</td>
                <td className="p-4">{m.location}</td>
                <td className="p-4">{m.criticality}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {m.status === 'Critical' ? <AlertTriangle size={16} className="text-critical"/> : m.status === 'Warning' ? <AlertTriangle size={16} className="text-warning"/> : <CheckCircle size={16} className="text-success"/>}
                    <span className={m.status==='Critical'?'text-critical':m.status==='Warning'?'text-warning':'text-success'}>{m.status}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm font-medium transition-colors">
                    Schedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}