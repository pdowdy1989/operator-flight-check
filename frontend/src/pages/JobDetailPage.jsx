import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import { Tabs } from '../components/ui/Tabs';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatusTimeline } from '../components/features/StatusTimeline';
import { InsuranceDetailsCard } from '../components/features/InsuranceDetailsCard';
import { MissionCard } from '../components/features/MissionCard';
import { DocumentGrid } from '../components/features/DocumentGrid';
import { DocumentUploader } from '../components/features/DocumentUploader';
import { InspectionReportForm } from '../components/features/InspectionReportForm';
import { InvoiceEditor } from '../components/features/InvoiceEditor';
import { getJob } from '../services/jobsService';
import { getMissionsForJob, createMission } from '../services/missionsService';
import { getJobDocuments } from '../services/documentsService';
import { getReport } from '../services/inspectionReportsService';
import { getInvoiceByJob } from '../services/invoicesService';
import { useToast } from '../context/ToastContext';
import './JobDetailPage.css';

export default function JobDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [missions, setMissions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [report, setReport] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = async () => {
    try {
      const [jobRes, missionsRes, docsRes] = await Promise.all([
        getJob(id),
        getMissionsForJob(id),
        getJobDocuments(id),
      ]);
      setJob(jobRes.data);
      setMissions(missionsRes.data);
      setDocuments(docsRes.data);

      if (jobRes.data.jobType === 'INSURANCE_INSPECTION') {
        try { const r = await getReport(id); setReport(r.data); } catch {}
      }
      try { const inv = await getInvoiceByJob(id); setInvoice(inv.data); } catch {}
    } catch {
      showToast('Failed to load job', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleAddMission = async () => {
    const dateStr = prompt('Flight date (YYYY-MM-DD):');
    if (!dateStr) return;
    try {
      await createMission({ jobId: id, flightDate: dateStr });
      await fetchMissions();
      showToast('Mission added', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add mission', 'error');
    }
  };

  const fetchMissions = async () => {
    const res = await getMissionsForJob(id);
    setMissions(res.data);
  };

  if (loading) return <PageShell title="Job Detail" loading />;
  if (!job) return <PageShell title="Job Not Found"><p>Job not found.</p></PageShell>;

  const isInsurance = job.jobType === 'INSURANCE_INSPECTION';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'missions', label: 'Missions', badge: missions.length },
    { id: 'documents', label: 'Documents', badge: documents.length },
    ...(isInsurance ? [{ id: 'report', label: 'Report' }] : []),
    { id: 'invoice', label: 'Invoice' },
  ];

  return (
    <PageShell title={job.title}>
      <div className="job-detail__meta">
        <StatusBadge status={job.status} />
        <span className="job-detail__client">👤 {job.clientName}</span>
        <span className="job-detail__type">{job.jobType?.replace(/_/g, ' ')}</span>
        {job.siteAddress && <span className="job-detail__addr">📍 {job.siteAddress}</span>}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="job-detail__overview">
          <StatusTimeline currentStatus={job.status} />
          {job.description && <p className="job-detail__desc">{job.description}</p>}
          {isInsurance && <InsuranceDetailsCard details={job.insuranceDetails} />}
          <div className="job-detail__info-grid">
            {job.scheduledDate && (
              <div className="job-detail__info-field">
                <span className="job-detail__info-label">Scheduled</span>
                <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}
            {job.estimatedDuration && (
              <div className="job-detail__info-field">
                <span className="job-detail__info-label">Est. Duration</span>
                <span>{job.estimatedDuration} min</span>
              </div>
            )}
            {job.priority && (
              <div className="job-detail__info-field">
                <span className="job-detail__info-label">Priority</span>
                <span>{job.priority}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="job-detail__tab-content">
          <div className="job-detail__tab-header">
            <h3>Flights</h3>
            <button className="job-detail__add-btn" onClick={handleAddMission}>+ Add Flight</button>
          </div>
          {missions.length === 0 ? (
            <p className="job-detail__empty">No flights logged yet.</p>
          ) : (
            <div className="job-detail__mission-list">
              {missions.map((m) => (
                <MissionCard key={m.id} mission={m} onComplete={null} onDelete={null} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="job-detail__tab-content">
          <div className="job-detail__tab-header">
            <h3>Documents & Files</h3>
          </div>
          <DocumentUploader jobId={id} onUploaded={() => { getJobDocuments(id).then(r => setDocuments(r.data)); }} />
          <div className="job-detail__doc-section">
            <DocumentGrid documents={documents} onRefresh={fetchAll} />
          </div>
        </div>
      )}

      {activeTab === 'report' && isInsurance && (
        <div className="job-detail__tab-content">
          <h3>Inspection Report</h3>
          <InspectionReportForm jobId={id} existingReport={report} onSaved={fetchAll} />
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="job-detail__tab-content">
          <h3>Invoice</h3>
          <InvoiceEditor jobId={id} existingInvoice={invoice} onSaved={fetchAll} />
        </div>
      )}
    </PageShell>
  );
}
