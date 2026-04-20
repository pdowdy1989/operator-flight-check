import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import { createJob } from '../services/jobsService';
import { getClients, createClient } from '../services/clientsService';
import { useToast } from '../context/ToastContext';
import './NewJobPage.css';

const JOB_TYPES = [
  { value: 'INSURANCE_INSPECTION', label: 'Insurance Inspection' },
  { value: 'ROOF_SURVEY', label: 'Roof Survey' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'MAPPING', label: 'Mapping' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'OTHER', label: 'Other' },
];

const CLIENT_TYPES = [
  { value: 'COMPANY', label: 'Company' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'BUSINESS', label: 'Business' },
];

export default function NewJobPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clientId: '',
    title: '', description: '', jobType: 'ROOF_SURVEY', priority: 'NORMAL',
    siteAddress: '', scheduledDate: '', estimatedDuration: '',
    notes: '',
    insuranceDetails: {
      claimNumber: '', policyNumber: '', insuranceCompany: '',
      adjusterName: '', adjusterEmail: '', adjusterPhone: '',
      lossType: '', propertyType: '', inspectionScope: '',
    },
  });

  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', company: '', clientType: 'INDIVIDUAL' });
  const [creatingClient, setCreatingClient] = useState(false);

  useEffect(() => {
    getClients().then((r) => setClients(r.data)).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setIns = (key) => (e) => setForm((f) => ({ ...f, insuranceDetails: { ...f.insuranceDetails, [key]: e.target.value } }));

  const handleCreateClient = async () => {
    setCreatingClient(true);
    try {
      const res = await createClient(newClient);
      setClients((prev) => [...prev, res.data]);
      setForm((f) => ({ ...f, clientId: res.data.id }));
      setNewClient({ name: '', email: '', phone: '', company: '', clientType: 'INDIVIDUAL' });
      showToast('Client created', 'success');
    } catch {
      showToast('Failed to create client', 'error');
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration) : null,
        scheduledDate: form.scheduledDate || null,
        insuranceDetails: form.jobType === 'INSURANCE_INSPECTION' ? form.insuranceDetails : null,
      };
      const res = await createJob(payload);
      showToast('Job created!', 'success');
      navigate(`/jobs/${res.data.id}`);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create job', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="New Job">
      <div className="new-job__steps">
        {['Client', 'Details', form.jobType === 'INSURANCE_INSPECTION' ? 'Insurance' : null, 'Review']
          .filter(Boolean)
          .map((label, i) => (
            <div key={label} className={`new-job__step${step === i + 1 ? ' new-job__step--active' : step > i + 1 ? ' new-job__step--done' : ''}`}>
              <span className="new-job__step-num">{i + 1}</span> {label}
            </div>
          ))}
      </div>

      {step === 1 && (
        <div className="new-job__section">
          <h3>Select or Create Client</h3>
          <select value={form.clientId} onChange={set('clientId')} className="new-job__select">
            <option value="">— Select existing client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.clientType?.replace(/_/g, ' ')})</option>
            ))}
          </select>
          <div className="new-job__divider">or create new</div>
          <div className="new-job__grid">
            <input placeholder="Name *" value={newClient.name} onChange={(e) => setNewClient((n) => ({ ...n, name: e.target.value }))} className="new-job__input" />
            <input placeholder="Email" value={newClient.email} onChange={(e) => setNewClient((n) => ({ ...n, email: e.target.value }))} className="new-job__input" />
            <input placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient((n) => ({ ...n, phone: e.target.value }))} className="new-job__input" />
            <input placeholder="Company" value={newClient.company} onChange={(e) => setNewClient((n) => ({ ...n, company: e.target.value }))} className="new-job__input" />
            <select value={newClient.clientType} onChange={(e) => setNewClient((n) => ({ ...n, clientType: e.target.value }))} className="new-job__select">
              {CLIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <button className="new-job__btn" onClick={handleCreateClient} disabled={!newClient.name || creatingClient}>
            {creatingClient ? 'Creating…' : 'Create Client'}
          </button>
          <div className="new-job__nav">
            <span />
            <button className="new-job__btn new-job__btn--primary" onClick={() => setStep(2)} disabled={!form.clientId}>
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="new-job__section">
          <h3>Job Details</h3>
          <div className="new-job__grid">
            <input placeholder="Job title *" value={form.title} onChange={set('title')} className="new-job__input new-job__input--full" />
            <select value={form.jobType} onChange={set('jobType')} className="new-job__select">
              {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.priority} onChange={set('priority')} className="new-job__select">
              {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Site address *" value={form.siteAddress} onChange={set('siteAddress')} className="new-job__input new-job__input--full" />
            <input type="date" value={form.scheduledDate} onChange={set('scheduledDate')} className="new-job__input" />
            <input type="number" placeholder="Est. duration (min)" value={form.estimatedDuration} onChange={set('estimatedDuration')} className="new-job__input" />
            <textarea placeholder="Description" value={form.description} onChange={set('description')} rows={3} className="new-job__input new-job__input--full" />
          </div>
          <div className="new-job__nav">
            <button className="new-job__btn" onClick={() => setStep(1)}>← Back</button>
            <button className="new-job__btn new-job__btn--primary" onClick={() => setStep(form.jobType === 'INSURANCE_INSPECTION' ? 3 : 4)} disabled={!form.title || !form.siteAddress}>
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 3 && form.jobType === 'INSURANCE_INSPECTION' && (
        <div className="new-job__section">
          <h3>Insurance Details</h3>
          <div className="new-job__grid">
            <input placeholder="Claim # *" value={form.insuranceDetails.claimNumber} onChange={setIns('claimNumber')} className="new-job__input" />
            <input placeholder="Policy #" value={form.insuranceDetails.policyNumber} onChange={setIns('policyNumber')} className="new-job__input" />
            <input placeholder="Insurance Company *" value={form.insuranceDetails.insuranceCompany} onChange={setIns('insuranceCompany')} className="new-job__input new-job__input--full" />
            <input placeholder="Adjuster Name" value={form.insuranceDetails.adjusterName} onChange={setIns('adjusterName')} className="new-job__input" />
            <input placeholder="Adjuster Email" value={form.insuranceDetails.adjusterEmail} onChange={setIns('adjusterEmail')} className="new-job__input" />
            <input placeholder="Adjuster Phone" value={form.insuranceDetails.adjusterPhone} onChange={setIns('adjusterPhone')} className="new-job__input" />
            <select value={form.insuranceDetails.lossType} onChange={setIns('lossType')} className="new-job__select">
              <option value="">Loss Type</option>
              {['STORM','FIRE','WATER','WIND','HAIL','VANDALISM','OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.insuranceDetails.propertyType} onChange={setIns('propertyType')} className="new-job__select">
              <option value="">Property Type</option>
              {['RESIDENTIAL','COMMERCIAL','INDUSTRIAL','AGRICULTURAL'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea placeholder="Inspection scope" value={form.insuranceDetails.inspectionScope} onChange={setIns('inspectionScope')} rows={3} className="new-job__input new-job__input--full" />
          </div>
          <div className="new-job__nav">
            <button className="new-job__btn" onClick={() => setStep(2)}>← Back</button>
            <button className="new-job__btn new-job__btn--primary" onClick={() => setStep(4)} disabled={!form.insuranceDetails.claimNumber || !form.insuranceDetails.insuranceCompany}>
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="new-job__section">
          <h3>Review & Submit</h3>
          <div className="new-job__review">
            <div><strong>Client:</strong> {clients.find((c) => c.id === form.clientId)?.name}</div>
            <div><strong>Title:</strong> {form.title}</div>
            <div><strong>Type:</strong> {form.jobType?.replace(/_/g, ' ')}</div>
            <div><strong>Address:</strong> {form.siteAddress}</div>
            {form.scheduledDate && <div><strong>Scheduled:</strong> {form.scheduledDate}</div>}
            {form.jobType === 'INSURANCE_INSPECTION' && (
              <div><strong>Claim #:</strong> {form.insuranceDetails.claimNumber}</div>
            )}
          </div>
          <div className="new-job__nav">
            <button className="new-job__btn" onClick={() => setStep(form.jobType === 'INSURANCE_INSPECTION' ? 3 : 2)}>← Back</button>
            <button className="new-job__btn new-job__btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating…' : 'Create Job'}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
