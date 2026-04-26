import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobCard } from "../components/features/JobCard";
import { StatCard } from "../components/ui/StatCard";
import JobsMap from "../components/features/JobsMap";
import PageShell from "../components/ui/PageShell";
import { getDashboard } from "../services/dashboardService";
import { getJobs } from "../services/jobsService";
import jobRequestsService from "../services/jobRequestsService";
import "./PilotDashboardPage.css";

function formatTotal(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PilotDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  function refreshJobs() {
    return getJobs().then((jobsRes) => setJobs(jobsRes.data));
  }

  function loadPendingRequests() {
    jobRequestsService.getAllRequests()
      .then((requests) => {
        setPendingRequests(Array.isArray(requests) ? requests.filter((req) => req.status === "PENDING") : []);
      })
      .catch(() => setPendingRequests([]));
  }

  useEffect(() => {
    Promise.all([getDashboard(), getJobs()])
      .then(([dashRes, jobsRes]) => {
        setStats(dashRes.data);
        setJobs(jobsRes.data);
      })
      .finally(() => setLoading(false));
    loadPendingRequests();
  }, []);

  async function handleAccept(requestId) {
    try {
      await jobRequestsService.decide(requestId, "ACCEPT");
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
      await refreshJobs();
    } catch (err) {
      console.error("Accept failed:", err);
      alert("Failed to accept request. Check console.");
    }
  }

  async function handleDecline(requestId) {
    try {
      await jobRequestsService.decide(requestId, "REJECT");
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error("Decline failed:", err);
      alert("Failed to decline request. Check console.");
    }
  }

  return (
    <PageShell
      title="Flight Control"
      subtitle="Track active jobs, upcoming launches, and revenue signals from one glassy mission board."
      loading={loading}
    >
      {pendingRequests.length > 0 && (
        <div className="pending-requests-banner">
          <div className="banner-header">
            <span className="banner-title">
              {pendingRequests.length} Pending Request{pendingRequests.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="banner-list">
            {pendingRequests.map((req) => (
              <div key={req.id} className="banner-row">
                <div className="banner-info">
                  <div className="banner-address">{req.siteAddress || "No address provided"}</div>
                  <div className="banner-total">${formatTotal(req.finalAmount ?? req.rateCardTotal ?? 0)}</div>
                </div>
                <div className="banner-actions">
                  <button type="button" onClick={() => handleAccept(req.id)} className="btn-accept">
                    Accept
                  </button>
                  <button type="button" onClick={() => handleDecline(req.id)} className="btn-decline">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pilot-dash__stats">
        <StatCard icon="Total" value={stats?.totalMissionCount ?? jobs.length} label="Total Missions" accent />
        <StatCard
          icon="Done"
          value={stats?.completedMissionCount ?? jobs.filter((job) => ["COMPLETED", "DELIVERED"].includes(job.status)).length}
          label="Completed"
        />
        <StatCard icon="Soon" value={stats?.upcomingFlightCount ?? "-"} label="Upcoming Flights" />
        <StatCard icon="Cash" value={stats?.revenueTotal != null ? `$${Number(stats.revenueTotal).toFixed(0)}` : "-"} label="Revenue" />
      </div>

      <div className="pilot-dash__hero">
        <JobsMap jobs={jobs} />
      </div>

      <div className="pilot-dash__header">
        <h2 className="pilot-dash__section-title">Jobs</h2>
        <button className="pilot-dash__new-btn" onClick={() => navigate("/jobs/new")}>
          + New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="pilot-dash__empty glass-card">
          <p>No jobs yet. Create your first job to get started.</p>
          <button className="pilot-dash__new-btn" onClick={() => navigate("/jobs/new")}>
            + Create Job
          </button>
        </div>
      ) : (
        <div className="pilot-dash__job-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
