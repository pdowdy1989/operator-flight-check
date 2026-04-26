import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PilotDashboardPage from "./PilotDashboardPage";
import CompanyDashboardPage from "./CompanyDashboardPage";
import ClientDashboardPage from "./ClientDashboardPage";

export default function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === "COMPANY") return <CompanyDashboardPage />;
  if (user?.role === "CLIENT") return <ClientDashboardPage />;
  if (user?.role === "PILOT" || user?.role === "ADMIN") return <PilotDashboardPage />;

  return <Navigate to="/login" replace />;
}
