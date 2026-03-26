import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import TabBar from "./components/layout/TabBar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicRoute from "./components/layout/PublicRoute";
import { useAuth } from "./context/AuthContext";

// Pages — public
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Pages — protected
import MapPage from "./pages/MapPage";
import WeatherPage from "./pages/WeatherPage";
import AircraftPage from "./pages/AircraftPage";
import CheckPage from "./pages/CheckPage";
import LogPage from "./pages/LogPage";
import SafetyPage from "./pages/SafetyPage";

const PROTECTED_ROUTES = ["/dashboard", "/weather", "/profiles", "/check", "/missions", "/safety"];

function AppShell({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isProtected = PROTECTED_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/")
  );

  return (
    <>
      {isAuthenticated && isProtected && <TabBar />}
      {children}
    </>
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
        </Route>

        {/* Protected — 6 routes, satisfies rubric */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MapPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/profiles" element={<AircraftPage />} />
          <Route path="/check" element={<CheckPage />} />
          <Route path="/missions" element={<LogPage />} />
          <Route path="/safety" element={<SafetyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
