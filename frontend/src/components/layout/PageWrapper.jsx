import WorkspaceHeader from "./WorkspaceHeader";

export default function PageWrapper({ children, title, subtitle, action, className = "", headerItems }) {
  return (
    <div
      className={`min-h-screen ${className}`}
      style={{
        background:
          "radial-gradient(circle at top right, rgba(0, 150, 255, 0.07), transparent 18%), radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.07), transparent 18%), var(--bg-base)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-5 lg:px-6">
        <WorkspaceHeader items={headerItems} />

        {(title || action) ? (
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              {title ? <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1> : null}
              {subtitle ? <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</p> : null}
            </div>
            {action ? <div className="flex-shrink-0">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
