import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Activity, Cpu, AlertTriangle, Clock, Target, Wrench, ListOrdered, DollarSign, Factory, MessageSquare, Database } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Executive Overview', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Machine Monitoring', icon: Activity },
  { path: '/analytics', label: 'Predictive Analytics', icon: Cpu },
  { path: '/anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
  { path: '/rul', label: 'Remaining Useful Life', icon: Clock },
  { path: '/explainability', label: 'Explainable AI', icon: Target },
  { path: '/maintenance', label: 'Prescriptive Maintenance', icon: Wrench },
  { path: '/prioritization', label: 'Maintenance Priority', icon: ListOrdered },
  { path: '/cost', label: 'Cost & Impact', icon: DollarSign },
  { path: '/factory', label: 'Digital Factory', icon: Factory },
  { path: '/copilot', label: 'AI Copilot', icon: MessageSquare },
  { path: '/mlops', label: 'MLOps & Drift', icon: Database },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col hidden md:flex rounded-2xl">
        <div className="p-6 border-b border-border/50">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Industrial AI
          </h1>
          <p className="text-xs text-muted mt-1">Predictive Maintenance</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-accent font-medium shadow-[0_0_10px_rgba(56,189,248,0.2)]" 
                    : "text-muted hover:bg-surface hover:text-text"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
