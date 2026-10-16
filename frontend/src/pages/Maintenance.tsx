import React, { useEffect, useState } from 'react';
import { getMachines, getMaintenance } from '../services/api';
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const ACTIONS: Record<string, { steps: string[]; icon: string }> = {
  'Tool Wear Failure': {
    icon: '🔧',
    steps: [
      'Stop machine and lock out power.',
      'Inspect tool for visible wear or chipping.',
      'Replace cutting tool with new one from inventory.',
      'Recalibrate tool offset in CNC controller.',
      'Run test cycle at 50% speed before full production.',
    ],
  },
  'Heat Dissipation Failure': {
    icon: '🌡️',
    steps: [
      'Check coolant level and top up if needed.',
      'Inspect coolant pump and flow rate.',
      'Clean heat exchanger fins of debris.',
      'Verify fan operation and replace if faulty.',
      'Monitor temperature for 30 minutes before resuming.',
    ],
  },
  'Power Failure': {
    icon: '⚡',
    steps: [
      'Check power supply voltage and amperage.',
      'Inspect drive motor for overheating or electrical burn.',
      'Test capacitors on VFD drive.',
      'Reset circuit breakers and surge protection.',
      'Log incident and schedule full electrical audit.',
    ],
  },
  'Overstrain Failure': {
    icon: '⚙️',
    steps: [
      'Reduce feed rate and depth of cut settings.',
      'Inspect spindle bearings for wear.',
      'Check workpiece clamping and fixture stability.',
      'Lubricate gearbox and moving joints.',
      'Review program for excessive load commands.',
    ],
  },
  'default': {
    icon: '🛠️',
    steps: [
      'Perform full visual inspection of the machine.',
      'Check all fluid levels (coolant, lubrication, hydraulic).',
      'Run diagnostic self-test from machine control panel.',
      'Log all findings in the maintenance management system.',
      'Escalate to senior engineer if issues persist.',
    ],
  },
};

export default function Maintenance() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = () => {
      getMachines().then(ms => {
        setMachines(ms);
        if (!selected && ms.length > 0) setSelected(ms[0]);
      }).catch(console.error);
      getMaintenance().then(setRecords).catch(console.error);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const failureType = selected?.predicted_failure_type || 'default';
  const prescription = ACTIONS[failureType] || ACTIONS['default'];
  const machineRecords = records.filter((r: any) => r.machine_id === selected?.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Prescriptive Maintenance</h1>
        <p className="text-muted">AI-generated step-by-step maintenance actions per machine</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine selector */}
        <div className="glass-panel p-4">
          <h2 className="text-lg font-semibold mb-3">Select Machine</h2>
          <div className="space-y-2">
            {machines.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected?.id === m.id
                    ? 'border-primary bg-primary/10 text-accent'
                    : 'border-border/50 bg-surface hover:border-primary/50'
                }`}
              >
                <p className="font-semibold">{m.machine_code}</p>
                <p className="text-xs text-muted">{m.machine_type} — {m.location}</p>
                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                  m.status === 'Healthy' ? 'bg-success/20 text-success' :
                  m.status === 'Critical' ? 'bg-critical/20 text-critical' :
                  'bg-warning/20 text-warning'
                }`}>{m.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prescription panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{prescription.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selected.machine_code} — Maintenance Plan</h2>
                    <p className="text-muted text-sm">Failure Type: <span className="text-warning">{failureType === 'default' ? 'General Inspection' : failureType}</span></p>
                  </div>
                </div>
                <div className="space-y-3">
                  {prescription.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border/50">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance History */}
              <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-accent" /> Maintenance History
                </h2>
                {machineRecords.length === 0 ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle size={16} />
                    <p className="text-sm">No maintenance records yet — machine is new or recently serviced.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {machineRecords.slice(0, 5).map((r: any, i: number) => (
                      <div key={i} className="flex justify-between p-3 bg-surface rounded-lg text-sm border border-border/50">
                        <span>{r.action || 'Scheduled Maintenance'}</span>
                        <span className="text-muted">{new Date(r.performed_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel p-6 flex items-center justify-center h-48">
              <p className="text-muted">Select a machine to see its maintenance plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}