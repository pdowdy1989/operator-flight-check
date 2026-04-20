import "./PageShell.css";

export default function PageShell({ title, subtitle, actions, children, loading }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        <div className="page-header-actions">{actions}</div>
      </div>
      <div className="page-body">
        {loading ? <div className="page-shell__loading">Loading…</div> : children}
      </div>
    </div>
  );
}
