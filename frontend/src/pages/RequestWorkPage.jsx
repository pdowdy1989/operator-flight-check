import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import RateCardPicker from '../components/features/RateCardPicker';
import BudgetOverrideField from '../components/features/BudgetOverrideField';
import InsuranceFieldsAccordion from '../components/features/InsuranceFieldsAccordion';
import serviceCatalogService from '../services/serviceCatalogService';
import jobRequestsService from '../services/jobRequestsService';
import './RequestWorkPage.css';

const RECURRENCE_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
];

function getDiscountPercent(totalQty) {
  if (totalQty >= 4) return 15;
  if (totalQty === 3) return 10;
  if (totalQty === 2) return 5;
  return 0;
}

export default function RequestWorkPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Form state
  const [selectedItems, setSelectedItems] = useState([]);
  const [siteAddress, setSiteAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('');
  const [notes, setNotes] = useState('');
  const [proposedBudget, setProposedBudget] = useState(null);
  const [insuranceFields, setInsuranceFields] = useState({});

  useEffect(() => {
    serviceCatalogService.getActiveCatalog()
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const totalQty = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const discountPct = getDiscountPercent(totalQty);
  const rateCardTotal = selectedItems.reduce((sum, item) => {
    const svc = services.find(s => s.id === item.serviceId);
    return sum + (svc ? svc.basePrice * item.quantity : 0);
  }, 0);
  const savings = rateCardTotal * discountPct / 100;
  const finalAmount = rateCardTotal - savings;

  const handleInsuranceChange = (field, value) => {
    setInsuranceFields(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (selectedItems.length === 0) errs.items = 'Please select at least one service.';
    if (!siteAddress.trim()) errs.siteAddress = 'Site address is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});
    setError(null);
    setSubmitting(true);

    const payload = {
      lineItems: selectedItems.map(i => ({ serviceCatalogId: i.serviceId, quantity: i.quantity })),
      siteAddress: siteAddress.trim(),
      siteLat: null,
      siteLon: null,
      requestedDate: preferredDate || null,
      requestedTime: preferredTime ? `${preferredTime}:00` : null,
      isRecurring,
      recurrencePattern: isRecurring && recurrencePattern ? recurrencePattern : null,
      notes: notes.trim() || null,
      proposedBudget: proposedBudget ? Number(proposedBudget) : null,
      claimNumber: insuranceFields.claimNumber || null,
      policyNumber: insuranceFields.policyNumber || null,
      insuranceCompanyName: insuranceFields.insuranceCompanyName || null,
      adjusterName: insuranceFields.adjusterName || null,
      adjusterEmail: insuranceFields.adjusterEmail || null,
      adjusterPhone: insuranceFields.adjusterPhone || null,
      lossDate: insuranceFields.lossDate || null,
      lossType: insuranceFields.lossType || null,
      propertyType: insuranceFields.propertyType || null,
      inspectionScope: insuranceFields.inspectionScope || null,
    };

    try {
      const result = await jobRequestsService.submitRequest(payload);
      navigate(`/my-requests/${result.id}`, { state: { successMessage: 'Request submitted successfully!' } });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Request New Work" subtitle="Select services and provide job details">
      {loading ? (
        <div className="rw-loading">Loading services...</div>
      ) : (
        <form className="rw-form" onSubmit={handleSubmit}>
          {/* Section 1: Services */}
          <section className="rw-section">
            <h2 className="rw-section__title">1. Select Services</h2>
            {validationErrors.items && <p className="rw-error">{validationErrors.items}</p>}
            <RateCardPicker
              availableServices={services}
              selectedItems={selectedItems}
              onChange={setSelectedItems}
            />
          </section>

          {/* Section 2: Job Details */}
          <section className="rw-section">
            <h2 className="rw-section__title">2. Job Details</h2>
            <div className="rw-fields-grid">
              <div className="rw-field rw-field--full">
                <label htmlFor="siteAddress">Site Address *</label>
                <input
                  id="siteAddress"
                  type="text"
                  value={siteAddress}
                  onChange={e => setSiteAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                />
                {validationErrors.siteAddress && <p className="rw-error">{validationErrors.siteAddress}</p>}
              </div>
              <div className="rw-field">
                <label htmlFor="preferredDate">Preferred Date</label>
                <input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                />
              </div>
              <div className="rw-field">
                <label htmlFor="preferredTime">Preferred Time</label>
                <input
                  id="preferredTime"
                  type="time"
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                />
              </div>
              <div className="rw-field rw-field--checkbox">
                <label className="rw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                  />
                  <span>Recurring job</span>
                </label>
              </div>
              {isRecurring && (
                <div className="rw-field">
                  <label htmlFor="recurrencePattern">Recurrence Pattern</label>
                  <select
                    id="recurrencePattern"
                    value={recurrencePattern}
                    onChange={e => setRecurrencePattern(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {RECURRENCE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="rw-field rw-field--full">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional details about the job..."
                />
              </div>
            </div>
          </section>

          {/* Section 3: Insurance Details */}
          <section className="rw-section">
            <h2 className="rw-section__title">3. Insurance Details</h2>
            <InsuranceFieldsAccordion
              values={insuranceFields}
              onChange={handleInsuranceChange}
            />
          </section>

          {/* Section 4: Pricing */}
          {selectedItems.length > 0 && (
            <section className="rw-section">
              <h2 className="rw-section__title">4. Pricing Summary</h2>
              <div className="rw-pricing-summary">
                <div className="rw-pricing-row">
                  <span>Rate card total:</span>
                  <span>${rateCardTotal.toFixed(2)}</span>
                </div>
                <div className="rw-pricing-row rw-pricing-row--discount">
                  <span>Multi-job discount ({discountPct}%):</span>
                  <span>−${savings.toFixed(2)}</span>
                </div>
                <div className="rw-pricing-row rw-pricing-row--total">
                  <span>Estimated total:</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
                <div className="rw-budget-field">
                  <BudgetOverrideField
                    totalQuantity={totalQty}
                    finalAmount={finalAmount}
                    value={proposedBudget}
                    onChange={setProposedBudget}
                  />
                </div>
              </div>
            </section>
          )}

          {error && <div className="rw-submit-error">{error}</div>}

          <div className="rw-actions">
            <button
              type="button"
              className="rw-btn rw-btn--secondary"
              onClick={() => navigate('/my-requests')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rw-btn rw-btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
