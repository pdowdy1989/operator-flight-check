import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Forecast", path: "/dashboard" },
  { label: "Missions", path: "/missions" },
  { label: "Checklist", path: "/checklist" },
];

function NavLink({ item, active, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center justify-between rounded-[1.35rem] border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-white/40 bg-white/22 text-white shadow-[0_18px_36px_rgba(124,45,18,0.2)]"
          : "border-transparent bg-transparent text-orange-50/92 hover:border-white/18 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span>{item.label}</span>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          active ? "bg-orange-100 shadow-[0_0_18px_rgba(255,237,213,0.85)]" : "bg-orange-100/40"
        }`}
      />
    </Link>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const isLanding = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const shellBody = (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-orange-300/40 bg-[linear-gradient(180deg,#f97316_0%,#ea580c_100%)] p-6 shadow-[0_30px_90px_rgba(194,65,12,0.28)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
        <div className="pointer-events-none absolute -right-10 top-16 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.38em] text-white/95">
          PED AERIAL
        </p>
        <div className="relative mt-4">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            <Link to="/" className="transition hover:text-white/90">
              Operator Flight Check
            </Link>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-7 text-orange-50/92">
            Flight planning with weather signal clarity, aircraft-aware thresholds, and reusable
            mission context.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="relative mt-8 space-y-5">
            <div className="rounded-[1.5rem] border border-white/20 bg-white/12 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/88">
                Session
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{user.email}</p>
              <p className="mt-1 text-xs text-orange-50/88">Authenticated pilot workspace ready</p>
            </div>

            <nav className="space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="rounded-[1.5rem] border border-white/20 bg-white/10 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/88">
                Status Colors
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200">
                  Green
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-200">
                  Yellow
                </span>
                <span className="rounded-full border border-rose-400/30 bg-rose-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-rose-200">
                  Red
                </span>
              </div>
            </div>

            <Button size="sm" variant="secondary" className="w-full" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        ) : (
          <div className="relative mt-8 space-y-5">
            <div className="rounded-[1.5rem] border border-white/20 bg-white/10 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/88">
                {isLanding ? "Visitor Mode" : "Guest Mode"}
              </p>
              <p className="mt-2 text-sm text-orange-50/82">
                {isLanding
                  ? "Understand the workflow before you create an account."
                  : "Protected routes redirect here until the user is authenticated."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="sm" variant="secondary">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-orange-300/40 bg-[linear-gradient(180deg,#f97316_0%,#ea580c_100%)] px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-white/95">
            PED AERIAL
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/16"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen ? (
          <div className="mb-6 lg:hidden">
            {shellBody}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{shellBody}</aside>
          <main className="min-w-0 rounded-[2rem] border border-white/45 bg-white/52 p-4 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
