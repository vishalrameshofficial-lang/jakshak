import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DemoProvider, useDemo } from "./context/DemoContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { SIHPresentationOverlay } from "./components/sih/SIHPresentationOverlay";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MonitoringPage } from "./pages/MonitoringPage";
import { SourcesPage } from "./pages/SourcesPage";
import { SourceDetailPage } from "./pages/SourceDetailPage";
import { TreatmentPage } from "./pages/TreatmentPage";
import { AlertsPage } from "./pages/AlertsPage";
import { MapPage } from "./pages/MapPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { FiltersPage } from "./pages/FiltersPage";
import { LabVerificationPage } from "./pages/LabVerificationPage";
import { DevicesPage } from "./pages/DevicesPage";
import { PresentationPage } from "./pages/PresentationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminPage } from "./pages/AdminPage";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { presentationModeActive, setPresentationModeActive } = useDemo();
  const location = useLocation();
  const isPublicPage = location.pathname === "/" || location.pathname === "/login";

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0b1329]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {presentationModeActive && (
        <SIHPresentationOverlay onClose={() => setPresentationModeActive(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DemoProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/sources/:id" element={<SourceDetailPage />} />
              <Route path="/treatment" element={<TreatmentPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/filters" element={<FiltersPage />} />
              <Route path="/lab-verification" element={<LabVerificationPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/presentation" element={<PresentationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </DemoProvider>
    </AuthProvider>
  );
};

export default App;
