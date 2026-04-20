import { useState } from 'react';
import { saveReport, submitReport } from '../../services/inspectionReportsService';
import { useToast } from '../../context/ToastContext';
import './InspectionReportForm.css';

const CONDITIONS = ['GOOD', 'FAIR', 'POOR', 'SEVERE'];
const RATINGS = ['NO_DAMAGE', 'MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS'];
const RATING_LABELS = {
  NO_DAMAGE: 'No Damage', MINOR: 'Minor', MODERATE: 'Moderate', SEVERE: 'Severe', TOTAL_LOSS: 'Total Loss',
};

export function InspectionReportForm({ jobId, existingReport, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    reportDate: existingReport?.reportDate || new Date().toISOString().slice(0, 10),
    propertyCondition: existingReport?.propertyCondition || 'FAIR',
    damageFound: existingReport?.damageFound ?? false,
    damageSummary: existingReport?.damageSummary || '',
    roofCondition: existingReport?.roofCondition || '',
    exteriorCondition: existingReport?.exteriorCondition || '',
    additionalFindings: existingReport?.additionalFindings || '',
    recommendations: existingReport?.recommendations || '',
    pilotSignature: existingReport?.pilotSignature || '',
  });
  const [saving, setSaving] = useState(false);
  const isReadOnly = existingReport?.status === 'SUBMITTED' || existingReport?.status === 'APPROVED';

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReport(jobId, form);
      showToast('Report saved', 'success');
      onSaved?.();
    } catch {
      showToast('Failed to save report', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.pilotSignature) { showToast('Signature required to submit', 'error'); return; }
    setSaving(true);
    try {
      await saveReport(jobId, form);
      await submitReport(jobId);
      showToast('Report submitted for review', 'success');
      onSaved?.();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="report-form">
      {existingReport?.status && (
        <div className={`report-form__status report-form__status--${existingReport.status.toLowerCase()}`}>
          Status: {existingReport.status}
          {existingReport.reviewerNotes && (
            <div className="report-form__reviewer-notes">💬 {existingReport.reviewerNotes}</div>
          )}
        </div>
      )}

      <div className="report-form__grid">
        <label className="report-form__field">
          Report Date
          <input type="date" value={form.reportDate} onChange={set('reportDate')} disabled={isReadOnly} />
        </label>
        <label className="report-form__field">
          Property Condition
          <select value={form.propertyCondition} onChange={set('propertyCondition')} disabled={isReadOnly}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="report-form__field">
          Roof Condition
          <select value={form.roofCondition} onChange={set('roofCondition')} disabled={isReadOnly}>
            <option value="">— Select —</option>
            {RATINGS.map((r) => <option key={r} value={r}>{RATING_LABELS[r]}</option>)}
          </select>
        </label>
        <label className="report-form__field">
          Exterior Condition
          <select value={form.exteriorCondition} onChange={set('exteriorCondition')} disabled={isReadOnly}>
            <option value="">— Select —</option>
            {RATINGS.map((r) => <option key={r} value={r}>{RATING_LABELS[r]}</option>)}
          </select>
        </label>
      </div>

      <label className="report-form__checkbox">
        <input type="checkbox" checked={form.damageFound} onChange={set('damageFound')} disabled={isReadOnly} />
        Damage Found
      </label>

      {form.damageFound && (
        <label className="report-form__field report-form__field--full">
          Damage Summary
          <textarea value={form.damageSummary} onChange={set('damageSummary')} rows={3} disabled={isReadOnly} />
        </label>
      )}

      <label className="report-form__field report-form__field--full">
        Additional Findings
        <textarea value={form.additionalFindings} onChange={set('additionalFindings')} rows={3} disabled={isReadOnly} />
      </label>

      <label className="report-form__field report-form__field--full">
        Recommendations
        <textarea value={form.recommendations} onChange={set('recommendations')} rows={3} disabled={isReadOnly} />
      </label>

      <label className="report-form__field">
        Pilot Signature (type full name)
        <input type="text" value={form.pilotSignature} onChange={set('pilotSignature')} disabled={isReadOnly} placeholder="Your full name" />
      </label>

      {!isReadOnly && (
        <div className="report-form__actions">
          <button className="report-form__btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className="report-form__btn report-form__btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      )}
    </div>
  );
}
