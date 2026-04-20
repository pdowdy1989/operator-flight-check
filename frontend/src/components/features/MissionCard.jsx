import './MissionCard.css';

const STATUS_COLORS = {
  PLANNED: 'planned', IN_PROGRESS: 'in-progress', COMPLETED: 'completed', ABORTED: 'aborted',
};

export function MissionCard({ mission, onComplete, onDelete }) {
  const statusClass = STATUS_COLORS[mission.status] || 'planned';
  const date = mission.flightDate ? new Date(mission.flightDate).toLocaleDateString() : '—';

  return (
    <div className="mission-card">
      <div className="mission-card__header">
        <div>
          <div className="mission-card__date">✈ {date}</div>
          {mission.droneName && <div className="mission-card__drone">🚁 {mission.droneName}</div>}
        </div>
        <span className={`mission-card__status mission-card__status--${statusClass}`}>
          {mission.status}
        </span>
      </div>

      {mission.status === 'COMPLETED' && (
        <div className="mission-card__weather">
          {mission.flyScore != null && (
            <span className="mission-card__score">
              Fly Score: <strong>{mission.flyScore}</strong>
            </span>
          )}
          {mission.weatherConditions && <span>{mission.weatherConditions}</span>}
          {mission.weatherWindMph != null && <span>💨 {mission.weatherWindMph} mph</span>}
          {mission.weatherTempF != null && <span>🌡 {mission.weatherTempF}°F</span>}
          {mission.durationMinutes != null && <span>⏱ {mission.durationMinutes} min</span>}
        </div>
      )}

      {mission.notes && <p className="mission-card__notes">{mission.notes}</p>}

      <div className="mission-card__actions">
        {mission.status === 'PLANNED' && onComplete && (
          <button className="mission-card__btn" onClick={() => onComplete(mission)}>
            Mark Complete
          </button>
        )}
        {onDelete && (
          <button className="mission-card__btn mission-card__btn--danger" onClick={() => onDelete(mission)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
