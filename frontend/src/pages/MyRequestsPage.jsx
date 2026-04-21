import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import StatusPill from '../components/features/StatusPill';
import jobRequestsService from '../services/jobRequestsService';
import './MyRequestsPage.css';

const TABS = ['Pending', 'Accepted', 'History'];

function filterRequests(requests, tab) {
  if (tab === 'Pending') return requests.filter(r => r.status === 'PENDING');
  if (tab === 'Accepted') return requests.filter(r => r.status === 'ACCEPTED');
  return requests.filter(r => ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(r.status));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');

  useEffect(() => {
    jobRequestsService.getMyRequests()
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = filterRequests(requests, activeTab);

  return (
    <PageShell
      title="My Requests"
      actions={
        <Link to="/request-work" className="mr-new-btn">
          + New Request
        </Link>
      }
      loading={loading}
    >
      <div className="mr-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            className={`mr-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="mr-tab-count">
              {filterRequests(requests, tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mr-list">
        {visible.length === 0 ? (
          <div className="mr-empty">
            <p>No {activeTab.toLowerCase()} requests.</p>
            {activeTab === 'Pending' && (
              <Link to="/request-work" className="mr-cta-link">Submit your first request →</Link>
            )}
          </div>
        ) : (
          visible.map(req => (
            <button
              key={req.id}
              type="button"
              className="mr-card"
              onClick={() => navigate(`/my-requests/${req.id}`)}
            >
              <div className="mr-card__top">
                <div className="mr-card__address">{req.siteAddress || 'No address'}</div>
                <StatusPill status={req.status} />
              </div>
              <div className="mr-card__meta">
                <span>Submitted: {formatDate(req.createdAt)}</span>
                {req.finalAmount != null && (
                  <span className="mr-card__amount">${Number(req.finalAmount).toFixed(2)}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </PageShell>
  );
}
