import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { DocumentGrid } from '../components/features/DocumentGrid';
import { DocumentUploader } from '../components/features/DocumentUploader';
import { getJobs } from '../services/jobsService';
import { getJobDocuments } from '../services/documentsService';
import './DocumentsPage.css';

const CATEGORIES = ['ALL', 'PRE_INSPECTION', 'AERIAL_PHOTO', 'AERIAL_VIDEO', 'DAMAGE_PHOTO',
  'THERMAL', 'ORTHOMOSAIC', 'INSPECTION_REPORT', 'CLIENT_DOCUMENT', 'INVOICE', 'OTHER'];

export default function DocumentsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJobs().then((r) => {
      setJobs(r.data);
      if (r.data.length > 0) setSelectedJobId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    loadDocuments(selectedJobId);
  }, [selectedJobId]);

  const loadDocuments = (jobId = selectedJobId) => {
    if (!jobId) return;
    setLoading(true);
    getJobDocuments(jobId)
      .then((r) => setDocuments(r.data))
      .finally(() => setLoading(false));
  };

  const filtered = categoryFilter === 'ALL' ? documents : documents.filter((d) => d.category === categoryFilter);

  return (
    <PageShell title="Documents" subtitle="Upload reports, PDFs, invoices, and client deliverables in one workspace." loading={loading}>
      <div className="docs-page__filters">
        <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="docs-page__select">
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <div className="docs-page__cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`docs-page__cat-btn${categoryFilter === c ? ' docs-page__cat-btn--active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c === 'ALL' ? 'All' : c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {selectedJobId ? (
        <section className="docs-page__uploader">
          <div className="docs-page__uploader-header">
            <div>
              <h2>Upload documents</h2>
              <p>Choose the job, set the category to <strong>Client Document</strong> when needed, and enable client visibility for shared files.</p>
            </div>
          </div>
          <DocumentUploader jobId={selectedJobId} onUploaded={() => loadDocuments(selectedJobId)} />
        </section>
      ) : null}

      <DocumentGrid documents={filtered} onRefresh={() => loadDocuments(selectedJobId)} />
    </PageShell>
  );
}
