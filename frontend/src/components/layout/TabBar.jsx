import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  {
    to: "/dashboard",
    label: "Map",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    to: "/weather",
    label: "Weather",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
      </svg>
    ),
  },
  {
    to: "/profiles",
    label: "Aircraft",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    to: "/check",
    label: "Check",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/missions",
    label: "Log",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

// Bottom tab bar for mobile, left sidebar for tablet/desktop
export default function TabBar() {
  const location = useLocation();

  return (
    <>
      {/* Mobile: bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffedd5_100%)] shadow-tab-bar md:hidden"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around h-16 px-1">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className={`mx-0.5 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-colors ${
                  active ? "bg-orange-200/70" : ""
                }`}
              >
                <span
                  className={`transition-colors ${
                    active ? "text-brand-orange" : "text-amber-700/70"
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    active ? "text-brand-orange" : "text-amber-700/70"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Tablet/Desktop: left sidebar */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-20 border-r border-orange-300/50 bg-[linear-gradient(180deg,#9a3412_0%,#ea580c_46%,#fb923c_100%)] text-white shadow-[10px_0_40px_rgba(194,65,12,0.16)] lg:w-56"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="border-b border-white/20 px-4 py-5">
          <span className="font-bold text-sm tracking-tight text-white lg:text-base">
            <span className="lg:hidden">PA</span>
            <span className="hidden lg:inline">PED AERIAL</span>
          </span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 p-2 flex-1">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                  active
                    ? "bg-orange-200 text-orange-950 shadow-[0_14px_28px_rgba(124,45,18,0.18)]"
                    : "text-orange-50/92 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="hidden lg:inline text-sm">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
