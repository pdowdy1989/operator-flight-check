// PageWrapper — standard page container with consistent padding
// Accounts for the bottom tab bar on mobile and sidebar on tablet/desktop
export default function PageWrapper({ children, title, subtitle, action, className = "" }) {
  return (
    <div className={`min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#fff7ed_38%,#f8fafc_100%)] pb-20 md:pb-0 md:pl-20 lg:pl-56 ${className}`}>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-8">
        {(title || action) && (
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
              )}
              {subtitle && (
                <p className="text-text-secondary mt-1">{subtitle}</p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
