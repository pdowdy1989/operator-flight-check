import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import { StatCard } from '../components/ui/StatCard';
import StatusPill from '../components/features/StatusPill';
import jobRequestsService from '../services/jobRequestsService';
import './ClientDashboardPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobRequestsService.getMyRequests()
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const accepted = requests.filter(r => r.status === 'ACCEPTED').length;
  const awaitingPayment = requests.filter(r => r.status === 'ACCEPTED' && r.invoiceStatus && r.invoiceStatus !== 'PAID').length;
  const totalSpent = requests
    .filter(r => r.status === 'ACCEPTED' && r.finalAmount)
    .reduce((sum, r) => sum + Number(r.finalAmount), 0);

  const recent = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <PageShell
      title="My Dashboard"
      subtitle="Overview of your drone inspection requests"
      loading={loading}
      actions={
        <Link to="/request-work" className="cld-cta-btn">+ Request Work</Link>
      }
    >
      <div className="cld-stats-grid">
        <StatCard icon="Pending" value={pending} label="Pending Requests" accent />
        <StatCard icon="Active" value={accepted} label="Active Jobs" />
        <StatCard icon="Pay" value={awaitingPayment || '—'} label="Awaiting Payment" />
        <StatCard icon="Spent" value={`$${totalSpent.toFixed(0)}`} label="Total Spent YTD" />
      </div>

      <div className="cld-cta-row">
        <Link to="/request-work" className="cld-btn cld-btn--primary">+ Request New Work</Link>
        <Link to="/my-requests" className="cld-btn cld-btn--secondary">View My Requests</Link>
      </div>

      <div className="cld-recent">
        <h2 className="cld-section-title">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="cld-empty">
            No requests yet. <Link to="/request-work" className="cld-link">Submit your first request →</Link>
          </p>
        ) : (
          <div className="cld-recent-list">
            {recent.map(req => (
              <Link key={req.id} to={`/my-requests/${req.id}`} className="cld-recent-item">
                <div className="cld-recent-item__address">{req.siteAddress || 'No address'}</div>
                <div className="cld-recent-item__meta">
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
