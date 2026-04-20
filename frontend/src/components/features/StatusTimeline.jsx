import './StatusTimeline.css';

const JOB_STATUSES = ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
const STATUS_LABELS = {
  REQUESTED: 'Requested', ACCEPTED: 'Accepted', SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export function StatusTimeline({ currentStatus }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="status-timeline status-timeline--cancelled">
        <span>❌ Job Cancelled</span>
      </div>
    );
  }

  const currentIdx = JOB_STATUSES.indexOf(currentStatus);

  return (
    <div className="status-timeline">
      {JOB_STATUSES.map((status, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={status} className={`status-step${done ? ' status-step--done' : ''}${active ? ' status-step--active' : ''}`}>
            <div className="status-step__dot">
              {done ? '✓' : active ? '●' : '○'}
            </div>
            <span className="status-step__label">{STATUS_LABELS[status]}</span>
            {i < JOB_STATUSES.length - 1 && <div className="status-step__line" />}
          </div>
        );
      })}
    </div>
  );
}
