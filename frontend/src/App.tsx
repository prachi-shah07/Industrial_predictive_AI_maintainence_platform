import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

// Page imports
import ExecutiveOverview from './pages/ExecutiveOverview';
import MachineMonitoring from './pages/MachineMonitoring';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import AnomalyDetection from './pages/AnomalyDetection';
import RemainingUsefulLife from './pages/RemainingUsefulLife';
import Explainability from './pages/Explainability';
import Maintenance from './pages/Maintenance';
import Priority from './pages/Priority';
import CostImpact from './pages/CostImpact';
import DigitalFactory from './pages/DigitalFactory';
import Copilot from './pages/Copilot';
import MLOpsDrift from './pages/MLOpsDrift';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<ExecutiveOverview />} />
          <Route path="monitoring" element={<MachineMonitoring />} />
          <Route path="analytics" element={<PredictiveAnalytics />} />
          <Route path="anomalies" element={<AnomalyDetection />} />
          <Route path="rul" element={<RemainingUsefulLife />} />
          <Route path="explainability" element={<Explainability />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="prioritization" element={<Priority />} />
          <Route path="cost" element={<CostImpact />} />
          <Route path="factory" element={<DigitalFactory />} />
          <Route path="copilot" element={<Copilot />} />
          <Route path="mlops" element={<MLOpsDrift />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
