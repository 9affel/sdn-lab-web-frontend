import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import ToastContainer from './components/ui/ToastContainer';
import Dashboard from './pages/Dashboard';
import ThreatLogs from './pages/ThreatLogs';
import NetworkMap from './pages/NetworkMap';
import FlowInspector from './pages/FlowInspector';
import AIModelLab from './pages/AIModelLab';
import Settings from './pages/Settings';
import Login from './pages/Login';

/**
 * Root application component with route definitions.
 * Login is outside MainLayout; all other pages are wrapped in it.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Auth — standalone layout */}
        <Route path="/login" element={<Login />} />

        {/* App — wrapped in MainLayout (Sidebar + TopBar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<ThreatLogs />} />
          <Route path="/topology" element={<NetworkMap />} />
          <Route path="/network" element={<NetworkMap />} />
          <Route path="/flows" element={<FlowInspector />} />
          <Route path="/ai-lab" element={<AIModelLab />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
