import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import { JobCard } from '../components/features/JobCard';
import { getDashboard } from '../services/dashboardService';
import { getJobs } from '../services/jobsService';
import './PilotDashboardPage.css';

export default function PilotDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getJobs()])
      .then(([dashRes, jobsRes]) => {
        setStats(dashRes.data);
        setJobs(jobsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="My Jobs" loading={loading}>
      <div className="pilot-dash__stats">
        <StatCard icon="Total" value={stats?.totalMissionCount ?? jobs.length} label="Total Missions" accent />
        <StatCard icon="Done" value={stats?.completedMissionCount ?? jobs.filter((job) => ['COMPLETED', 'DELIVERED'].includes(job.status)).length} label="Completed" />
        <StatCard icon="Soon" value={stats?.upcomingFlightCount ?? '—'} label="Upcoming Flights" />
        <StatCard icon="Cash" value={stats?.revenueTotal != null ? `$${Number(stats.revenueTotal).toFixed(0)}` : '—'} label="Revenue" />
      </div>

      <div className="pilot-dash__header">
        <h2 className="pilot-dash__section-title">Jobs</h2>
        <button className="pilot-dash__new-btn" onClick={() => navigate('/jobs/new')}>
          + New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="pilot-dash__empty">
          <p>No jobs yet. Create your first job to get started.</p>
          <button className="pilot-dash__new-btn" onClick={() => navigate('/jobs/new')}>
            + Create Job
          </button>
        </div>
      ) : (
        <div className="pilot-dash__job-grid">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </PageShell>
  );
}
