import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import StatusPill from '../components/features/StatusPill';
import jobRequestsService from '../services/jobRequestsService';
import { getDashboard } from '../services/dashboardService';
import './CompanyDashboardPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard().catch(() => ({ data: null })),
      jobRequestsService.getMyRequests().catch(() => []),
    ]).then(([dashRes, reqData]) => {
      setStats(dashRes?.data || null);
      setRequests(Array.isArray(reqData) ? reqData : []);
    }).finally(() => setLoading(false));
  }, []);

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const accepted = requests.filter(r => r.status === 'ACCEPTED').length;
  const totalSpent = requests
    .filter(r => r.status === 'ACCEPTED' && r.finalAmount)
    .reduce((sum, r) => sum + Number(r.finalAmount), 0);
  const recent = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <PageShell
      title="Company Dashboard"
      subtitle="Overview of your inspection requests"
      loading={loading}
      actions={
        <Link to="/request-work" className="cd-cta-btn">+ Request Inspection</Link>
      }
    >
      <div className="cd-stats-grid">
        <StatCard icon="Pending" value={pending} label="Pending Requests" accent />
        <StatCard icon="Active" value={accepted} label="Active Inspections" />
        <StatCard icon="Spent" value={`$${totalSpent.toFixed(0)}`} label="Total Spent YTD" />
        <StatCard icon="Total" value={requests.length} label="Total Requests" />
      </div>

      <div className="cd-cta-row">
        <Link to="/request-work" className="cd-btn cd-btn--primary">+ Request New Inspection</Link>
        <Link to="/my-requests" className="cd-btn cd-btn--secondary">View My Requests</Link>
      </div>

      <div className="cd-recent">
        <h2 className="cd-section-title">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="cd-empty">No requests yet. <Link to="/request-work" className="cd-link">Submit your first request →</Link></p>
        ) : (
          <div className="cd-recent-list">
            {recent.map(req => (
              <Link key={req.id} to={`/my-requests/${req.id}`} className="cd-recent-item">
                <div className="cd-recent-item__address">{req.siteAddress || 'No address'}</div>
                <div className="cd-recent-item__meta">
                  <span>{formatDate(req.createdAt)}</span>
                  {req.finalAmount != null && <span>${Number(req.finalAmount).toFixed(2)}</span>}
                </div>
                <StatusPill status={req.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
