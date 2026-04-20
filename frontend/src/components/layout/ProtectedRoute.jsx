import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSidebarLayout } from "./SidebarLayoutContext";
import TabBar from "./TabBar";
import "../ui/PageShell.css";
import "../../styles/dashboard.css";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { isSidebarCollapsed } = useSidebarLayout();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="protected-layout">
      <TabBar />
      <main
        className={`protected-layout__content ${
          isSidebarCollapsed ? "protected-layout__content--collapsed" : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
