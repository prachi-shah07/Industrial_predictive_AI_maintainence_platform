import React, { useEffect, useState } from 'react';
import { getMachines, createMachine } from '../services/api';
import { Factory, AlertTriangle, ShieldCheck, Plus, X } from 'lucide-react';

export default function DigitalFactory() {
  const [machines, setMachines] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    machine_code: '',
    machine_type: 'M',
    location: 'Line A',
    criticality: 'Medium',
    status: 'Healthy'
  });

  const loadMachines = () => {
    getMachines().then(setMachines).catch(console.error);
  };

  useEffect(() => {
    loadMachines();
    const interval = setInterval(loadMachines, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.machine_code) return;
    try {
      await createMachine({
        ...formData,
        installation_date: new Date().toISOString()
      });
      setShowModal(false);
      setFormData({ machine_code: '', machine_type: 'M', location: 'Line A', criticality: 'Medium', status: 'Healthy' });
      loadMachines();
    } catch (err) {
      console.error('Failed to create machine', err);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Digital Factory Twin</h1>
          <p className="text-muted">Live physical layout monitoring ({machines.length} Machines Active)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Add Machine
        </button>
      </header>

      <div className="flex-1 glass-panel p-8 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {/* Factory Floor Grid Representation */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {machines.map(m => (
            <div key={m.id} className="relative group cursor-pointer">
              {/* Pulse effect for critical/warning */}
              {(m.status === 'Critical' || m.status === 'Warning') && (
                <div className={`absolute -inset-2 rounded-xl opacity-50 blur-lg animate-pulse ${m.status === 'Critical' ? 'bg-critical' : 'bg-warning'}`}></div>
              )}
              
              <div className="relative bg-surface border border-border rounded-xl p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
                <Factory size={48} className={`mx-auto mb-4 ${m.status === 'Healthy' ? 'text-success' : m.status === 'Critical' ? 'text-critical' : 'text-warning'}`} />
                <h3 className="font-bold text-lg">{m.machine_code}</h3>
                <p className="text-xs text-muted mb-2">{m.location}</p>
                
                <div className="flex justify-center items-center gap-2 text-sm font-medium">
                  {m.status === 'Healthy' ? <ShieldCheck size={16} className="text-success"/> : <AlertTriangle size={16} className={m.status === 'Critical' ? 'text-critical' : 'text-warning'}/>}
                  <span className={m.status === 'Healthy' ? 'text-success' : m.status === 'Critical' ? 'text-critical' : 'text-warning'}>{m.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add Machine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Factory size={22} className="text-primary" /> Register New Machine
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Machine Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LATHE-101, CNC-005, PRESS-202"
                  value={formData.machine_code}
                  onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={formData.machine_type}
                    onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="L">Light Duty (L)</option>
                    <option value="M">Medium Duty (M)</option>
                    <option value="H">Heavy Duty (H)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Criticality</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="High Risk">High Risk</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}