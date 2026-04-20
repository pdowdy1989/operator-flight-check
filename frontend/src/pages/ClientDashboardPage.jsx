import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import { JobCard } from '../components/features/JobCard';
import { getDashboard } from '../services/dashboardService';
import { getJobs } from '../services/jobsService';

export default function ClientDashboardPage() {
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

  const delivered = jobs.filter((job) => job.status === 'DELIVERED');

  return (
    <PageShell title="My Projects" loading={loading}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <StatCard icon="Active" value={stats?.activeProjectCount ?? jobs.length} label="Active Projects" accent />
        <StatCard icon="Spent" value={stats?.totalSpent != null ? `$${Number(stats.totalSpent).toFixed(0)}` : '—'} label="Total Spent" />
        <StatCard icon="Files" value={jobs.reduce((sum, job) => sum + (job.documentCount || 0), 0)} label="Total Files" />
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
        {delivered.length} delivered project{delivered.length === 1 ? '' : 's'} with downloadable assets and live status tracking.
      </p>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>My Jobs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </PageShell>
  );
}
