import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebarLayout } from "./SidebarLayoutContext";
import { useAuth } from "../../context/AuthContext";
import { getHomePathForRole } from "../../utils/roleRouting";

const PILOT_TABS = [
  { to: "/jobs", label: "Jobs", shortLabel: "Jobs", icon: "briefcase" },
  { to: "/documents", label: "Documents", shortLabel: "Docs", icon: "log" },
  { to: "/clients", label: "Clients", shortLabel: "Clients", icon: "users" },
  { to: "/drones", label: "Drones", shortLabel: "Drones", icon: "plane" },
  { to: "/invoices", label: "Invoices", shortLabel: "Invoices", icon: "receipt" },
  { to: "/weather", label: "Weather", shortLabel: "Weather", icon: "cloud" },
];
const COMPANY_TABS = [
  { to: "/my-requests", label: "My Requests", shortLabel: "Requests", icon: "log" },
  { to: "/request-work", label: "Request Work", shortLabel: "Request", icon: "briefcase" },
  { to: "/archive", label: "Archive", shortLabel: "Archive", icon: "layers" },
  { to: "/profile", label: "Profile", shortLabel: "Profile", icon: "users" },
];
const CLIENT_TABS = [
  { to: "/my-requests", label: "My Requests", shortLabel: "Requests", icon: "log" },
  { to: "/request-work", label: "Request Work", shortLabel: "Request", icon: "briefcase" },
  { to: "/archive", label: "Archive", shortLabel: "Archive", icon: "layers" },
  { to: "/profile", label: "Profile", shortLabel: "Profile", icon: "users" },
];
const ADMIN_TABS = [
  { to: "/jobs", label: "Jobs", shortLabel: "Jobs", icon: "briefcase" },
  { to: "/documents", label: "Documents", shortLabel: "Docs", icon: "log" },
  { to: "/clients", label: "Clients", shortLabel: "Clients", icon: "users" },
  { to: "/drones", label: "Drones", shortLabel: "Drones", icon: "plane" },
  { to: "/invoices", label: "Invoices", shortLabel: "Invoices", icon: "receipt" },
  { to: "/weather", label: "Weather", shortLabel: "Weather", icon: "cloud" },
];

export function getPrimaryTabsForRole(role) {
  if (role === "COMPANY") return COMPANY_TABS;
  if (role === "CLIENT") return CLIENT_TABS;
  if (role === "ADMIN") return ADMIN_TABS;
  return PILOT_TABS; // default for PILOT and any other
}

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function Icon({ name }) {
  if (name === "logout") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  if (name === "grid") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    );
  }

  if (name === "receipt") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-3 2V2z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === "cloud") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
      </svg>
    );
  }

  if (name === "plane") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (name === "log") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function linkStyle(active) {
  return active
    ? {
        background: "rgba(34,167,255,0.14)",
        color: "#fff",
        borderLeft: "2.5px solid #22a7ff",
      }
    : {
        color: "rgba(255,255,255,0.65)",
      };
}

function DesktopNavLink({ item, pathname, isCollapsed }) {
  const active = isActivePath(pathname, item.to);

  return (
    <NavLink
      to={item.to}
      aria-current={active ? "page" : undefined}
      title={isCollapsed ? item.label : undefined}
      className={`flex min-h-[44px] items-center rounded-xl px-3 py-2.5 font-semibold transition-all hover:opacity-100 hover:bg-[var(--bg-surface-hover)] ${
        isCollapsed ? "justify-center" : "gap-3"
      }`}
      style={linkStyle(active)}
    >
      <span className="flex-shrink-0">
        <Icon name={item.icon} />
      </span>
      {!isCollapsed ? <span className="hidden text-[14px] lg:inline">{item.label}</span> : null}
    </NavLink>
  );
}

export default function TabBar({ overlayMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed, setIsSidebarOpen } = useSidebarLayout();
  const { user, logout } = useAuth();
  const primaryTabs = getPrimaryTabsForRole(user?.role);
  const homePath = getHomePathForRole(user?.role);

  function handleLogout() {
    logout();
    setIsSidebarOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <>
      {!overlayMode ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 shadow-tab-bar md:hidden"
          aria-label="Primary navigation"
          style={{
            borderTop: "1px solid var(--glass-border)",
            background: "rgba(18, 18, 28, 0.84)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="flex gap-2 overflow-x-auto px-2 py-2">
            {primaryTabs.map((tab) => {
              const active = isActivePath(location.pathname, tab.to);

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  aria-current={active ? "page" : undefined}
                  className="flex min-w-[88px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-center transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                  style={
                    active
                      ? { background: "var(--brand-blue-muted)", color: "var(--brand-blue)", border: "1px solid rgba(34,167,255,0.2)" }
                      : { color: "var(--text-primary)", opacity: 0.65 }
                  }
                >
                  <Icon name={tab.icon} />
                  <span className="text-[10px] font-semibold leading-none">{tab.shortLabel}</span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-w-[88px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-center transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon name="logout" />
              <span className="text-[10px] font-semibold leading-none">Logout</span>
            </button>
          </div>
        </nav>
      ) : null}

      {overlayMode ? (
        <button
          type="button"
          className="fixed inset-0 z-40"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          style={{ background: "rgba(0, 0, 0, 0.55)" }}
        />
      ) : null}

      <nav
        className={`${
          overlayMode
            ? "fixed bottom-4 left-4 top-4 z-50 w-[280px] rounded-[24px] shadow-[0_24px_60px_rgba(15,23,42,0.28)] md:flex"
            : "fixed bottom-0 left-0 top-0 z-40 hidden border-r shadow-[10px_0_40px_rgba(15,23,42,0.16)] md:flex"
        } ${isCollapsed && !overlayMode ? "w-20 lg:w-24" : overlayMode ? "" : "w-20 lg:w-64"} flex-col transition-[width] duration-300`}
        aria-label="Main navigation"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(14,12,26,0.97) 100%)",
          borderColor: "rgba(255,255,255,0.07)",
          color: "var(--text-primary)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: overlayMode ? "0 24px 60px rgba(0,0,0,0.5)" : "4px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className={`px-3 py-3 ${isCollapsed ? "lg:px-3" : ""}`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className={`flex items-center gap-3 ${isCollapsed && !overlayMode ? "justify-center" : "justify-between"}`}>
            {/* Avatar — always visible */}
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-bold"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>

            {/* Name + email — hidden when collapsed */}
            {!isCollapsed || overlayMode ? (
              <div className="min-w-0 flex-1 hidden lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] leading-none mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Account
                </p>
                <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {user
                    ? (user.firstName || user.lastName)
                      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                      : (user.email ?? "")
                    : ""}
                </p>
              </div>
            ) : null}

            <div>
            {overlayMode ? (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-[var(--bg-surface-hover)]"
                aria-label="Close navigation"
                style={{
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "var(--text-primary)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCollapsed((current) => !current)}
                className="hidden h-9 w-9 items-center justify-center rounded-xl transition hover:bg-[var(--bg-surface-hover)] lg:inline-flex"
                aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
                title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
                style={{
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "var(--text-primary)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="mb-2">
            <p
              className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.28em] ${
                isCollapsed && !overlayMode ? "hidden" : "hidden lg:block"
              }`}
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Workspace
            </p>
            <div className="flex flex-col gap-1">
              {primaryTabs.map((tab) => (
                <DesktopNavLink
                  key={tab.to}
                  item={tab}
                  pathname={location.pathname}
                  isCollapsed={isCollapsed && !overlayMode}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-2 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div
            className={`px-3 pt-3 pb-2 ${isCollapsed && !overlayMode ? "hidden" : "hidden lg:block"}`}
          >
            <span
              className="text-[11px] font-black tracking-[0.3em] uppercase"
              style={{ background: "linear-gradient(90deg,#fb8b3b,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              PED AERIAL
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed && !overlayMode ? "Log out" : undefined}
            className={`flex min-h-[44px] w-full items-center rounded-xl px-3 py-2.5 font-semibold transition-all hover:bg-[rgba(255,255,255,0.06)] hover:opacity-100 ${
              isCollapsed && !overlayMode ? "justify-center" : "gap-3"
            }`}
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <span className="flex-shrink-0">
              <Icon name="logout" />
            </span>
            {isCollapsed && !overlayMode ? null : <span className="hidden text-[14px] lg:inline">Log out</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
