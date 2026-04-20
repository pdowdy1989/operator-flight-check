import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { getDrones, createDrone, deleteDrone } from '../services/dronesService';
import { useToast } from '../context/ToastContext';
import './DronesPage.css';

export default function DronesPage() {
  const { showToast } = useToast();
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', manufacturer: '', model: '', serialNumber: '', faaRegistration: '', weightGrams: '', maxWindMph: 20, maxGustMph: 25 });
  const [saving, setSaving] = useState(false);

  const fetch = () => getDrones().then((r) => setDrones(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createDrone({ ...form, weightGrams: form.weightGrams ? parseInt(form.weightGrams) : null, maxWindMph: parseInt(form.maxWindMph), maxGustMph: parseInt(form.maxGustMph) });
      await fetch();
      setShowForm(false);
      setForm({ name: '', manufacturer: '', model: '', serialNumber: '', faaRegistration: '', weightGrams: '', maxWindMph: 20, maxGustMph: 25 });
      showToast('Drone profile created', 'success');
    } catch { showToast('Failed to create drone', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this drone profile?')) return;
    try { await deleteDrone(id); await fetch(); showToast('Drone deleted', 'success'); }
    catch { showToast('Failed to delete drone', 'error'); }
  };

  return (
    <PageShell title="Drone Fleet" loading={loading}>
      <div className="drones-page__header">
        <span>{drones.length} aircraft</span>
        <button className="drones-page__btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Drone'}
        </button>
      </div>

      {showForm && (
        <div className="drones-page__form">
          <div className="drones-page__grid">
            <input placeholder="Name *" value={form.name} onChange={set('name')} />
            <input placeholder="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} />
            <input placeholder="Model" value={form.model} onChange={set('model')} />
            <input placeholder="Serial Number" value={form.serialNumber} onChange={set('serialNumber')} />
            <input placeholder="FAA Registration" value={form.faaRegistration} onChange={set('faaRegistration')} />
            <input type="number" placeholder="Weight (grams)" value={form.weightGrams} onChange={set('weightGrams')} />
            <input type="number" placeholder="Max Wind (mph)" value={form.maxWindMph} onChange={set('maxWindMph')} />
            <input type="number" placeholder="Max Gust (mph)" value={form.maxGustMph} onChange={set('maxGustMph')} />
          </div>
          <button onClick={handleCreate} disabled={!form.name || saving} className="drones-page__save-btn">
            {saving ? 'Saving…' : 'Add Drone'}
          </button>
        </div>
      )}

      <div className="drones-page__list">
        {drones.map((d) => (
          <div key={d.id} className={`drone-card${d.active ? '' : ' drone-card--inactive'}`}>
            <div className="drone-card__header">
              <div>
                <div className="drone-card__name">🚁 {d.name}</div>
                <div className="drone-card__model">{d.manufacturer} {d.model}</div>
              </div>
              {!d.active && <span className="drone-card__inactive">Inactive</span>}
            </div>
            <div className="drone-card__meta">
              {d.faaRegistration && <span>FAA: {d.faaRegistration}</span>}
              {d.serialNumber && <span>S/N: {d.serialNumber}</span>}
              {d.weightGrams && <span>⚖ {(d.weightGrams / 1000).toFixed(2)} kg</span>}
              <span>💨 Max {d.maxWindMph} mph wind / {d.maxGustMph} mph gust</span>
            </div>
            <button className="drone-card__delete" onClick={() => handleDelete(d.id)}>Delete</button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
