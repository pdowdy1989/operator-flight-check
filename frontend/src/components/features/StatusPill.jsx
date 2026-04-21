import './StatusPill.css';

const STATUS_COLORS = {
  // Request statuses
  PENDING: 'amber',
  ACCEPTED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  EXPIRED: 'gray',
  // Invoice statuses
  DRAFT: 'gray',
  SENT: 'amber',
  PAID: 'green',
  OVERDUE: 'red',
  // Job statuses
  REQUESTED: 'amber',
  SCHEDULED: 'blue',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  DELIVERED: 'green',
};

export default function StatusPill({ status }) {
  const color = STATUS_COLORS[status] || 'gray';
  return (
    <span className={`status-pill status-pill--${color}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
