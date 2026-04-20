import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { getClients, createClient, deleteClient } from '../services/clientsService';
import { useToast } from '../context/ToastContext';
import './ClientsPage.css';

const TYPE_LABELS = { COMPANY: 'Company', INDIVIDUAL: 'Individual', BUSINESS: 'Business' };
const TYPE_COLORS = { COMPANY: '#3b82f6', INDIVIDUAL: '#22c55e', BUSINESS: '#f59e0b' };

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', clientType: 'INDIVIDUAL', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => getClients().then((r) => setClients(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createClient(form);
      await fetch();
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', company: '', clientType: 'INDIVIDUAL', address: '', notes: '' });
      showToast('Client created', 'success');
    } catch { showToast('Failed to create client', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    try { await deleteClient(id); await fetch(); showToast('Client deleted', 'success'); }
    catch { showToast('Failed to delete client', 'error'); }
  };

  return (
    <PageShell title="Clients" loading={loading}>
      <div className="clients-page__header">
        <span>{clients.length} clients</span>
        <button className="clients-page__btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Client'}
        </button>
      </div>

      {showForm && (
        <div className="clients-page__form">
          <div className="clients-page__grid">
            <input placeholder="Name *" value={form.name} onChange={set('name')} />
            <input placeholder="Email" value={form.email} onChange={set('email')} />
            <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
            <input placeholder="Company" value={form.company} onChange={set('company')} />
            <select value={form.clientType} onChange={set('clientType')}>
              <option value="INDIVIDUAL">Individual</option>
              <option value="COMPANY">Company</option>
              <option value="BUSINESS">Business</option>
            </select>
            <input placeholder="Address" value={form.address} onChange={set('address')} />
          </div>
          <button onClick={handleCreate} disabled={!form.name || saving} className="clients-page__save-btn">
            {saving ? 'Saving…' : 'Create Client'}
          </button>
        </div>
      )}

      <div className="clients-page__list">
        {clients.map((c) => (
          <div key={c.id} className="client-card">
            <div className="client-card__header">
              <div>
                <div className="client-card__name">{c.name}</div>
                {c.company && <div className="client-card__company">{c.company}</div>}
              </div>
              <span className="client-card__type" style={{ color: TYPE_COLORS[c.clientType] }}>
                {TYPE_LABELS[c.clientType]}
              </span>
            </div>
            <div className="client-card__meta">
              {c.email && <span>✉ {c.email}</span>}
              {c.phone && <span>📞 {c.phone}</span>}
              {c.address && <span>📍 {c.address}</span>}
            </div>
            <button className="client-card__delete" onClick={() => handleDelete(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
