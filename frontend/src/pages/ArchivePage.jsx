import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import StatusPill from '../components/features/StatusPill';
import jobRequestsService from '../services/jobRequestsService';
import { downloadInvoicePdf, getInvoiceByJob } from '../services/invoicesService';
import agreementsService from '../services/agreementsService';
import './ArchivePage.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function ArchivePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    jobRequestsService.getMyRequests()
      .then(data => setRequests(Array.isArray(data) ? data.filter(r => r.status === 'ACCEPTED') : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = async (req) => {
    setError(null);
    setDownloadingId(`inv-${req.id}`);
    try {
      const invRes = await getInvoiceByJob(req.createdJobId);
      const inv = invRes.data || invRes;
      const blob = await downloadInvoicePdf(inv.id);
      openBlob(blob, `invoice-${inv.invoiceNumber || inv.id}.pdf`);
    } catch {
      setError('Failed to download invoice.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAgreement = async (req) => {
    setError(null);
    setDownloadingId(`agr-${req.id}`);
    try {
      const agreement = await agreementsService.getAgreementByJob(req.createdJobId);
      const blob = await agreementsService.downloadAgreementPdf(agreement.id);
      openBlob(blob, `agreement-${agreement.agreementNumber || agreement.id}.pdf`);
    } catch {
      setError('Failed to download agreement.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PageShell title="Archive" subtitle="Completed and accepted jobs">
      {error && <div className="arch-error">{error}</div>}
      {loading ? (
        <div className="arch-loading">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="arch-empty">
          <p>No archived jobs yet. Accepted requests will appear here.</p>
        </div>
      ) : (
        <div className="arch-list">
          {requests.map(req => (
            <div key={req.id} className="arch-card">
              <div className="arch-card__header">
                <div className="arch-card__address">{req.siteAddress || 'No address'}</div>
                <StatusPill status={req.status} />
              </div>
              <div className="arch-card__meta">
                <span>Submitted: {formatDate(req.createdAt)}</span>
                {req.finalAmount != null && (
                  <span className="arch-card__amount">${Number(req.finalAmount).toFixed(2)}</span>
                )}
              </div>
              <div className="arch-card__actions">
                {req.createdJobId && (
                  <>
                    <button
                      type="button"
                      className="arch-btn"
                      onClick={() => handleDownloadInvoice(req)}
                      disabled={downloadingId === `inv-${req.id}`}
                    >
                      {downloadingId === `inv-${req.id}` ? 'Downloading...' : 'Download Invoice'}
                    </button>
                    <button
                      type="button"
                      className="arch-btn"
                      onClick={() => handleDownloadAgreement(req)}
                      disabled={downloadingId === `agr-${req.id}`}
                    >
                      {downloadingId === `agr-${req.id}` ? 'Downloading...' : 'Download Agreement'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
