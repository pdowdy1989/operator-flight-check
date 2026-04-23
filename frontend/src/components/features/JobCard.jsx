import { CalendarDays, ChevronRight, FileText, MapPin, Radar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";
import "./JobCard.css";

const JOB_TYPE_LABELS = {
  INSURANCE_INSPECTION: "Insurance Inspection",
  ROOF_SURVEY: "Roof Survey",
  REAL_ESTATE: "Real Estate",
  MAPPING: "Mapping",
  CONSTRUCTION: "Construction",
  OTHER: "Other",
};

const PRIORITY_LABELS = {
  LOW: "Low priority",
  NORMAL: "Normal priority",
  HIGH: "High priority",
  URGENT: "Urgent priority",
};

function formatDate(value) {
  if (!value) return "Schedule pending";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JobCard({ job }) {
  const navigate = useNavigate();
  const priority = job.priority && job.priority !== "NORMAL" ? PRIORITY_LABELS[job.priority] : null;

  return (
    <button
      type="button"
      className="job-card glass-card"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div className="job-card__glow" aria-hidden="true" />
      <div className="job-card__header">
        <div className="job-card__heading">
          <div className="job-card__eyebrow">
            <Radar size={14} />
            <span>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
          </div>
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__client">{job.clientName || "Unassigned client"}</p>
        </div>
        <div className="job-card__header-right">
          <StatusBadge status={job.status} />
          <span className="job-card__jump" aria-hidden="true">
            <ChevronRight size={18} />
          </span>
        </div>
      </div>

      <div className="job-card__meta">
        <span className="job-card__chip">
          <CalendarDays size={14} />
          {formatDate(job.scheduledDate)}
        </span>
        <span className="job-card__chip">
          <FileText size={14} />
          {job.documentCount ?? 0} file{job.documentCount === 1 ? "" : "s"}
        </span>
        {priority ? (
          <span className="job-card__chip job-card__chip--priority">
            <Sparkles size={14} />
            {priority}
          </span>
        ) : null}
      </div>

      {job.siteAddress ? (
        <div className="job-card__address">
          <MapPin size={15} />
          <span>{job.siteAddress}</span>
        </div>
      ) : null}
    </button>
  );
}
