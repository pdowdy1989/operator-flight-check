import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import StatusPill from '../components/features/StatusPill';
import jobRequestsService from '../services/jobRequestsService';
import { getInvoiceByJob, downloadInvoicePdf } from '../services/invoicesService';
import agreementsService from '../services/agreementsService';
import paymentsService from '../services/paymentsService';
import { getJobDeliverables } from '../services/documentsService';
import './RequestDetailPage.css';

const TABS = ['Overview', 'Invoice', 'Agreement', 'Deliverables'];

const TIMELINE_STEPS = ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'DELIVERED'];
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api').replace(/\/+$/, '');
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${FILE_BASE_URL}${normalizedPath}`;
}

function getDeliverableUrl(doc) {
  if (doc?.downloadUrl) return getFileUrl(doc.downloadUrl);
  if (doc?.filePath) return getFileUrl(doc.filePath);
  return `${API_BASE_URL}/documents/${doc.id}/download`;
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

export default function RequestDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [successMessage] = useState(location.state?.successMessage || null);

  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    jobRequestsService.getRequest(id)
      .then(data => setRequest(data))
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [id]);

  const isAccepted = request?.status === 'ACCEPTED';

  useEffect(() => {
    if (activeTab === 'Invoice' && isAccepted && request?.createdJobId && !invoice) {
      setInvoiceLoading(true);
      getInvoiceByJob(request.createdJobId)
        .then(res => setInvoice(res.data || res))
        .catch(() => setInvoice(null))
        .finally(() => setInvoiceLoading(false));
    }
  }, [activeTab, isAccepted, request]);

  useEffect(() => {
    if (activeTab === 'Agreement' && isAccepted && request?.createdJobId && !agreement) {
      setAgreementLoading(true);
      agreementsService.getAgreementByJob(request.createdJobId)
        .then(data => setAgreement(data))
        .catch(() => setAgreement(null))
        .finally(() => setAgreementLoading(false));
    }
  }, [activeTab, isAccepted, request]);

  useEffect(() => {
    if (activeTab === 'Deliverables' && isAccepted && request?.createdJobId && deliverables.length === 0) {
      setDeliverablesLoading(true);
      getJobDeliverables(request.createdJobId)
        .then(res => setDeliverables(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDeliverables([]))
        .finally(() => setDeliverablesLoading(false));
    }
  }, [activeTab, isAccepted, request]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this request?')) return;
    setCancelling(true);
    setActionError(null);
    try {
      await jobRequestsService.cancelRequest(id);
      setRequest(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    try {
      const blob = await downloadInvoicePdf(invoice.id);
      openBlob(blob, `invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
    } catch {
      setActionError('Failed to download invoice PDF.');
    }
  };

  const handlePay = async () => {
    if (!invoice) return;
    setActionError(null);
    try {
      const result = await paymentsService.createCheckoutSession(invoice.id);
      if (result.url) window.location.href = result.url;
    } catch {
      setActionError('Failed to start payment session.');
    }
  };

  const handleDownloadAgreement = async () => {
    if (!agreement) return;
    try {
      const blob = await agreementsService.downloadAgreementPdf(agreement.id);
      openBlob(blob, `agreement-${agreement.agreementNumber || agreement.id}.pdf`);
    } catch {
      setActionError('Failed to download agreement PDF.');
    }
  };

  const getTimelineStepIndex = () => {
    if (!request) return -1;
    if (request.status === 'REJECTED' || request.status === 'CANCELLED') return -1;
    const map = {
      PENDING: 0,
      ACCEPTED: 1,
      SCHEDULED: 2,
      IN_PROGRESS: 3,
      DELIVERED: 4,
      COMPLETED: 4,
    };
    return map[request.status] ?? 0;
  };

  const currentStep = getTimelineStepIndex();

  return (
    <PageShell
      title={request ? `Request — ${request.siteAddress || id}` : 'Request Detail'}
      loading={loading}
    >
      {successMessage && (
        <div className="rd-success-banner">{successMessage}</div>
      )}

      {request && (
        <>
          <div className="rd-status-row">
            <StatusPill status={request.status} />
            {request.status === 'PENDING' && (
              <button
                type="button"
                className="rd-cancel-btn"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </button>
            )}
          </div>

          {actionError && <div className="rd-error">{actionError}</div>}

          <div className="rd-tabs">
            {TABS.map(tab => {
              const locked = ['Invoice', 'Agreement', 'Deliverables'].includes(tab) && !isAccepted;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`rd-tab ${activeTab === tab ? 'active' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => !locked && setActiveTab(tab)}
                  title={locked ? 'Available once request is accepted' : undefined}
                >
                  {tab}
                  {locked && <span className="rd-tab-lock">🔒</span>}
                </button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="rd-overview">
              {/* Timeline */}
              {currentStep >= 0 && (
                <div className="rd-timeline">
                  {TIMELINE_STEPS.map((step, i) => (
                    <div key={step} className={`rd-timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                      <div className="rd-timeline-dot" />
                      <div className="rd-timeline-label">{step.replace(/_/g, ' ')}</div>
                      {i < TIMELINE_STEPS.length - 1 && <div className="rd-timeline-line" />}
                    </div>
                  ))}
                </div>
              )}
              {(request.status === 'REJECTED' || request.status === 'CANCELLED') && (
                <div className={`rd-status-notice rd-status-notice--${request.status === 'REJECTED' ? 'rejected' : 'cancelled'}`}>
                  This request was {request.status.toLowerCase()}.
                  {request.decisionNotes && <span> Reason: {request.decisionNotes}</span>}
                </div>
              )}

              <div className="rd-details-grid">
                <div className="rd-detail">
                  <span className="rd-detail__label">Site Address</span>
                  <span className="rd-detail__value">{request.siteAddress || '—'}</span>
                </div>
                <div className="rd-detail">
                  <span className="rd-detail__label">Submitted</span>
                  <span className="rd-detail__value">{formatDate(request.createdAt)}</span>
                </div>
                <div className="rd-detail">
                  <span className="rd-detail__label">Requested Date</span>
                  <span className="rd-detail__value">{formatDate(request.requestedDate)}</span>
                </div>
                <div className="rd-detail">
                  <span className="rd-detail__label">Requested Time</span>
                  <span className="rd-detail__value">{request.requestedTime || '—'}</span>
                </div>
                <div className="rd-detail">
                  <span className="rd-detail__label">Recurring</span>
                  <span className="rd-detail__value">{request.isRecurring ? (request.recurrencePattern || 'Yes') : 'No'}</span>
                </div>
                {request.finalAmount != null && (
                  <div className="rd-detail">
                    <span className="rd-detail__label">Estimated Total</span>
                    <span className="rd-detail__value rd-detail__value--highlight">${Number(request.finalAmount).toFixed(2)}</span>
                  </div>
                )}
                {request.notes && (
                  <div className="rd-detail rd-detail--full">
                    <span className="rd-detail__label">Notes</span>
                    <span className="rd-detail__value">{request.notes}</span>
                  </div>
                )}
              </div>

              {request.lineItems && request.lineItems.length > 0 && (
                <div className="rd-line-items">
                  <h3 className="rd-section-title">Services Requested</h3>
                  <table className="rd-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.lineItems.map((item, i) => (
                        <tr key={i}>
                          <td>{item.serviceName || item.serviceCatalogId}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice != null ? `$${Number(item.unitPrice).toFixed(2)}` : '—'}</td>
                          <td>{item.subtotal != null ? `$${Number(item.subtotal).toFixed(2)}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'Invoice' && isAccepted && (
            <div className="rd-tab-panel">
              {invoiceLoading ? (
                <p className="rd-loading-text">Loading invoice...</p>
              ) : invoice ? (
                <div className="rd-invoice-card">
                  <div className="rd-details-grid">
                    <div className="rd-detail">
                      <span className="rd-detail__label">Invoice #</span>
                      <span className="rd-detail__value">{invoice.invoiceNumber || invoice.id}</span>
                    </div>
                    <div className="rd-detail">
                      <span className="rd-detail__label">Status</span>
                      <span className="rd-detail__value"><StatusPill status={invoice.status} /></span>
                    </div>
                    <div className="rd-detail">
                      <span className="rd-detail__label">Amount</span>
                      <span className="rd-detail__value rd-detail__value--highlight">
                        ${Number(invoice.totalAmount || invoice.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="rd-detail">
                      <span className="rd-detail__label">Due Date</span>
                      <span className="rd-detail__value">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                  <div className="rd-actions">
                    <button type="button" className="rd-btn rd-btn--secondary" onClick={handleDownloadInvoice}>
                      Download PDF
                    </button>
                    {invoice.status !== 'PAID' && (
                      <button type="button" className="rd-btn rd-btn--primary" onClick={handlePay}>
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rd-empty-text">No invoice found for this request.</p>
              )}
            </div>
          )}

          {/* Agreement Tab */}
          {activeTab === 'Agreement' && isAccepted && (
            <div className="rd-tab-panel">
              {agreementLoading ? (
                <p className="rd-loading-text">Loading agreement...</p>
              ) : agreement ? (
                <div className="rd-agreement-card">
                  <div className="rd-details-grid">
                    <div className="rd-detail">
                      <span className="rd-detail__label">Agreement #</span>
                      <span className="rd-detail__value">{agreement.agreementNumber || agreement.id}</span>
                    </div>
                    <div className="rd-detail">
                      <span className="rd-detail__label">Status</span>
                      <span className="rd-detail__value"><StatusPill status={agreement.status} /></span>
                    </div>
                  </div>
                  <div className="rd-actions">
                    <button type="button" className="rd-btn rd-btn--secondary" onClick={handleDownloadAgreement}>
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rd-empty-text">No agreement found for this request.</p>
              )}
            </div>
          )}

          {/* Deliverables Tab */}
          {activeTab === 'Deliverables' && isAccepted && (
            <div className="rd-tab-panel">
              {deliverablesLoading ? (
                <p className="rd-loading-text">Loading deliverables...</p>
              ) : deliverables.length === 0 ? (
                <p className="rd-empty-text">No deliverables yet.</p>
              ) : (
                <div className="rd-deliverables-grid">
                  {deliverables.map(doc => (
                    <a
                      key={doc.id}
                      href={getDeliverableUrl(doc)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rd-doc-card"
                    >
                      <div className="rd-doc-card__name">{doc.fileName || doc.name}</div>
                      <div className="rd-doc-card__type">{doc.fileType || doc.contentType || 'File'}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !request && (
        <div className="rd-not-found">
          <p>Request not found.</p>
          <button type="button" className="rd-btn rd-btn--secondary" onClick={() => navigate('/my-requests')}>
            Back to My Requests
          </button>
        </div>
      )}
    </PageShell>
  );
}
