import React, { useEffect, useState } from 'react';
import { getMachines, getSensors, getPredictions } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function MachineMonitoring() {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    getMachines().then(data => {
      setMachines(data);
      if (data.length > 0) setSelectedMachine(data[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let interval: any;
    const fetchData = () => {
      if (selectedMachine) {
        getSensors(selectedMachine.id).then(data => setSensors(data.reverse()));
        getPredictions(selectedMachine.id).then(data => setPredictions(data.reverse()));
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Poll every 5 seconds
    interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, [selectedMachine]);

  const latestPred = predictions.length > 0 ? predictions[predictions.length - 1] : null;

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      {/* Sidebar Selector */}
      <div className="w-full md:w-64 glass-panel p-4 flex flex-col gap-2 overflow-y-auto">
        <h2 className="text-lg font-bold px-2 mb-2">Machines</h2>
        {machines.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMachine(m)}
            className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              selectedMachine?.id === m.id ? 'bg-primary/20 border border-primary/50' : 'hover:bg-surface border border-transparent'
            }`}
          >
            <div>
              <p className="font-medium text-sm">{m.machine_code}</p>
              <p className="text-xs text-muted">{m.location}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${m.status==='Healthy'?'bg-success':m.status==='Critical'?'bg-critical':'bg-warning'}`}></div>
          </button>
        ))}
      </div>

      {/* Main Detail View */}
      {selectedMachine && (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Header Info */}
          <div className="glass-panel p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{selectedMachine.machine_code}</h1>
              <p className="text-muted">Type {selectedMachine.machine_type} • {selectedMachine.location}</p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-surface rounded-lg border border-border text-center">
                <p className="text-xs text-muted">Status</p>
                <p className={`font-bold ${selectedMachine.status==='Healthy'?'text-success':selectedMachine.status==='Critical'?'text-critical':'text-warning'}`}>{selectedMachine.status}</p>
              </div>
              <div className="px-4 py-2 bg-surface rounded-lg border border-border text-center">
                <p className="text-xs text-muted">Failure Prob</p>
                <p className="font-bold">{latestPred ? (latestPred.failure_probability * 100).toFixed(1) : 0}%</p>
              </div>
              <div className="px-4 py-2 bg-surface rounded-lg border border-border text-center">
                <p className="text-xs text-muted">Est. RUL</p>
                <p className="font-bold">{latestPred ? latestPred.rul.toFixed(1) : '--'} cycles</p>
              </div>
            </div>
          </div>

          {/* Sensor Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SensorChart title="Temperature [K]" data={sensors} keys={['air_temperature', 'process_temperature']} colors={['#38bdf8', '#ef4444']} />
            <SensorChart title="Rotational Speed [rpm]" data={sensors} keys={['rotational_speed']} colors={['#10b981']} />
            <SensorChart title="Torque [Nm]" data={sensors} keys={['torque']} colors={['#f59e0b']} />
            <SensorChart title="Tool Wear [min]" data={sensors} keys={['tool_wear']} colors={['#8b5cf6']} />
          </div>
          
          <div className="text-center p-4">
             <span className="px-3 py-1 bg-primary/20 text-accent rounded text-xs border border-primary/50">Simulation Mode Active</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SensorChart({ title, data, keys, colors }: any) {
  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-semibold mb-4 text-muted">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', fontSize: 12 }} labelFormatter={(t) => new Date(String(t)).toLocaleString()} />
            {keys.map((k: string, i: number) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}