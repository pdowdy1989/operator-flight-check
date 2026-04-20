import { useEffect, useMemo, useState } from "react";
import { Clock3, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "../SettingsModal";
import { getHomePathForRole, getRoleLabel } from "../../utils/roleRouting";

function formatClock(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(user) {
  if (!user?.email) return "P";
  return user.email[0].toUpperCase();
}

export default function WorkspaceHeader({ items }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const fallbackItems = useMemo(
    () =>
      [{ label: "Dashboard", to: getHomePathForRole(user?.role), icon: "missions" }],
    [user?.role]
  );
  const actionItems = useMemo(() => items ?? fallbackItems, [fallbackItems, items]);
  const settingsMode = user?.role === "CLIENT" ? "client" : "admin";
  const homePath = getHomePathForRole(user?.role);
  const resolvedUserMenu = menuOpen ? (
    <div className="dashboard-user__menu">
      <div>
        <p className="dashboard-user__email">{user?.email || "Pilot"}</p>
        <p className="dashboard-user__role">{getRoleLabel(user?.role)}</p>
      </div>
      <button
        type="button"
        className="dashboard-user__menu-action"
        onClick={() => {
          setSettingsOpen(true);
          setMenuOpen(false);
        }}
      >
        <Settings size={16} />
        <span>Settings</span>
      </button>
      <button
        type="button"
        className="dashboard-user__logout"
        onClick={() => {
          logout();
          setMenuOpen(false);
          navigate("/login", { replace: true });
        }}
      >
        Log out
      </button>
    </div>
  ) : null;

  return (
    <>
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__left">
          <Link to={homePath} className="dashboard-brand transition-opacity hover:opacity-85">
            <span className="dashboard-brand__dot" />
            <span>PED AERIAL</span>
          </Link>
        </div>

        <div className="dashboard-clock">
          <Clock3 size={14} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
          {formatClock(now)}
        </div>

        <div className="dashboard-user">
          <button
            type="button"
            className="dashboard-user__button"
            aria-label="Open user menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {getInitials(user)}
          </button>
          {resolvedUserMenu}
        </div>
      </header>
      {/* TODO: QuickActions re-added in pivot sub-phase 5 */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} mode={settingsMode} />
    </>
  );
}
