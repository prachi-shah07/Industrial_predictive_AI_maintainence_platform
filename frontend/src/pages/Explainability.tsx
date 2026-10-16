import React, { useEffect, useState } from 'react';
import { getMachines, getPredictions } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Explainability() {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    getMachines().then(data => {
      setMachines(data);
      if (data.length > 0) setSelectedMachine(data[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedMachine) {
      getPredictions(selectedMachine.id).then(data => {
        if (data.length > 0) {
          setPrediction(data[0]); // most recent
        }
      });
    }
  }, [selectedMachine]);

  let shapData = [];
  if (prediction && prediction.shap_values) {
    const features = ['Air Temp', 'Process Temp', 'Rotational Speed', 'Torque', 'Tool Wear', 'Temp Diff', 'Type L', 'Type M'];
    shapData = features.map((f, i) => ({
      name: f,
      value: prediction.shap_values[i] || 0
    })).sort((a,b) => Math.abs(b.value) - Math.abs(a.value));
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Explainable AI (SHAP)</h1>
        <p className="text-muted">Understand model predictions per machine</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
        <div className="glass-panel p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4 text-muted">Select Machine</h2>
          {machines.map(m => (
            <button key={m.id} onClick={() => setSelectedMachine(m)}
              className={`w-full text-left p-3 rounded mb-2 ${selectedMachine?.id === m.id ? 'bg-primary/20' : 'hover:bg-surface'}`}>
              {m.machine_code}
            </button>
          ))}
        </div>
        
        <div className="glass-panel p-6 md:col-span-3 flex flex-col">
          {prediction ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Failure Prediction: {(prediction.failure_probability*100).toFixed(1)}%</h2>
                <p className="text-muted">What factors are driving this prediction for {selectedMachine?.machine_code}?</p>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapData} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false}/>
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {
                        shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ef4444' : '#10b981'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted">No prediction data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure Cell is imported for BarChart
import { Cell } from 'recharts';