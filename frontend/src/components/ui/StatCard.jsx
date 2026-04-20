import './StatCard.css';

export function StatCard({ icon, value, label, accent }) {
  return (
    <div className={`stat-card${accent ? ' stat-card--accent' : ''}`}>
      {icon && <span className="stat-card__icon">{icon}</span>}
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
