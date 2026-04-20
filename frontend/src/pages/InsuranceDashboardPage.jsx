import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import { JobCard } from '../components/features/JobCard';
import { getDashboard } from '../services/dashboardService';
import { getJobs } from '../services/jobsService';

export default function InsuranceDashboardPage() {
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
    <PageShell title="Company Dashboard" loading={loading}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <StatCard icon="Open" value={stats?.openClaimCount ?? stats?.openRequestCount ?? '—'} label="Open Claims" accent />
        <StatCard icon="Review" value={stats?.pendingReviewCount ?? '—'} label="Reports to Review" />
        <StatCard icon="Closed" value={stats?.closedClaimCount ?? stats?.completedInspectionCount ?? '—'} label="Closed Claims" />
      </div>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>All Inspections</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {jobs.filter((job) => job.jobType === 'INSURANCE_INSPECTION').map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </PageShell>
  );
}
