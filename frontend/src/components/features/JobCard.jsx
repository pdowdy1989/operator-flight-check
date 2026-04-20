import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import './JobCard.css';

const JOB_TYPE_LABELS = {
  INSURANCE_INSPECTION: 'Insurance Inspection',
  ROOF_SURVEY: 'Roof Survey',
  REAL_ESTATE: 'Real Estate',
  MAPPING: 'Mapping',
  CONSTRUCTION: 'Construction',
  OTHER: 'Other',
};

const PRIORITY_ICONS = { LOW: '⬇', NORMAL: '', HIGH: '⬆', URGENT: '🔴' };

export function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card__header">
        <div>
          <div className="job-card__title">{job.title}</div>
          <div className="job-card__client">{job.clientName}</div>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="job-card__meta">
        <span className="job-card__type">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
        {job.priority && job.priority !== 'NORMAL' && (
          <span className="job-card__priority">{PRIORITY_ICONS[job.priority]} {job.priority}</span>
        )}
        {job.scheduledDate && (
          <span className="job-card__date">📅 {new Date(job.scheduledDate).toLocaleDateString()}</span>
        )}
        <span className="job-card__docs">📎 {job.documentCount ?? 0} files</span>
      </div>
      {job.siteAddress && (
        <div className="job-card__address">📍 {job.siteAddress}</div>
      )}
    </div>
  );
}
