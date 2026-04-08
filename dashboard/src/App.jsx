import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import WebsiteInputPage from './pages/WebsiteInputPage.jsx';

import BotReportDashboard from './pages/BotReportDashboard.jsx';
import DeployGate from './pages/DeployGate.jsx';
import RuntimeDashboard from './pages/RuntimeDashboard.jsx';
import { ScanProvider } from './context/ScanContext.jsx';
import './App.css';

export default function App() {
  return (
    <ScanProvider>
      <div style={{ position: 'relative' }}>
        <div className="bg-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <NavBar />
        <Routes>
          <Route path="/"              element={<LandingPage />} />
          <Route path="/scan/website"  element={<WebsiteInputPage />} />
          <Route path="/report"        element={<BotReportDashboard />} />
          <Route path="/deploy"        element={<DeployGate />} />
          <Route path="/runtime"       element={<RuntimeDashboard />} />
        </Routes>
      </div>
    </ScanProvider>
  );
}