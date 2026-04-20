import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicRoute from "./components/layout/PublicRoute";
import { SidebarLayoutProvider } from "./components/layout/SidebarLayoutContext";
import { useAuth } from "./context/AuthContext";

// Pages — public
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Pages — protected (pilot)
import PilotDashboardPage from "./pages/PilotDashboardPage";
import JobDetailPage from "./pages/JobDetailPage";
import NewJobPage from "./pages/NewJobPage";
import DocumentsPage from "./pages/DocumentsPage";
import ClientsPage from "./pages/ClientsPage";
import DronesPage from "./pages/DronesPage";
import InvoicesPage from "./pages/InvoicesPage";
import WeatherPage from "./pages/WeatherPage";

// Pages — protected (insurance / client)
import InsuranceDashboardPage from "./pages/InsuranceDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";

const PROTECTED_ROUTES = [
  "/dashboard", "/jobs", "/documents", "/clients", "/drones", "/invoices", "/weather",
];

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "COMPANY") return <InsuranceDashboardPage />;
  if (user?.role === "CLIENT") return <ClientDashboardPage />;
  return <PilotDashboardPage />;
}

function AppShell({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ped.sidebar.collapsed") === "true";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isProtected = PROTECTED_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/")
  );
  const sidebarValue = useMemo(
    () => ({
      isCollapsed: isSidebarCollapsed,
      isSidebarCollapsed,
      setIsCollapsed: setIsSidebarCollapsed,
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [isSidebarCollapsed, isSidebarOpen]
  );

  useEffect(() => {
    window.localStorage.setItem("ped.sidebar.collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <SidebarLayoutProvider value={sidebarValue}>
      {children}
    </SidebarLayoutProvider>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/:roleType" element={<RegisterPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/jobs" element={<PilotDashboardPage />} />
          <Route path="/jobs/new" element={<NewJobPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/drones" element={<DronesPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/weather" element={<WeatherPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
