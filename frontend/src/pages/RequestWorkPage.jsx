import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import AddressFields from '../components/ui/AddressFields';
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

const initialRequestState = {
  selectedItems: [],
  siteAddress: '',
  preferredDate: '',
  preferredTime: '',
  isRecurring: false,
  recurrencePattern: '',
  notes: '',
  proposedBudget: null,
  insuranceFields: {},
  submitting: false,
  error: null,
  validationErrors: {},
};

function requestReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return { ...state, [action.field]: action.value };
    case 'INSURANCE_FIELD_CHANGE':
      return {
        ...state,
        insuranceFields: { ...state.insuranceFields, [action.field]: action.value },
      };
    case 'VALIDATION_ERROR':
      return { ...state, validationErrors: action.errors };
    case 'SUBMIT_START':
      return { ...state, submitting: true, error: null, validationErrors: {} };
    case 'SUBMIT_SUCCESS':
      return { ...state, submitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, error: action.message };
    case 'RESET':
      return initialRequestState;
    default:
      return state;
  }
}

export default function RequestWorkPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestState, dispatch] = useReducer(requestReducer, initialRequestState);
  const {
    selectedItems,
    siteAddress,
    preferredDate,
    preferredTime,
    isRecurring,
    recurrencePattern,
    notes,
    proposedBudget,
    insuranceFields,
    submitting,
    error,
    validationErrors,
  } = requestState;

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
    dispatch({ type: 'INSURANCE_FIELD_CHANGE', field, value });
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
      dispatch({ type: 'VALIDATION_ERROR', errors: errs });
      return;
    }
    dispatch({ type: 'SUBMIT_START' });

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
      dispatch({ type: 'SUBMIT_SUCCESS' });
      navigate(`/my-requests/${result.id}`, { state: { successMessage: 'Request submitted successfully!' } });
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        message: err?.response?.data?.message || err?.message || 'Failed to submit request. Please try again.',
      });
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
              onChange={value => dispatch({ type: 'FIELD_CHANGE', field: 'selectedItems', value })}
            />
          </section>

          {/* Section 2: Job Details */}
          <section className="rw-section">
            <h2 className="rw-section__title">2. Job Details</h2>
            <div className="rw-fields-grid">
              <div className="rw-field rw-field--full">
                <label>Site Address *</label>
                <AddressFields
                  required
                  onChange={value => dispatch({ type: 'FIELD_CHANGE', field: 'siteAddress', value })}
                  error={validationErrors.siteAddress}
                />
              </div>
              <div className="rw-field">
                <label htmlFor="preferredDate">Preferred Date</label>
                <input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={e => dispatch({ type: 'FIELD_CHANGE', field: 'preferredDate', value: e.target.value })}
                />
              </div>
              <div className="rw-field">
                <label htmlFor="preferredTime">Preferred Time</label>
                <input
                  id="preferredTime"
                  type="time"
                  value={preferredTime}
                  onChange={e => dispatch({ type: 'FIELD_CHANGE', field: 'preferredTime', value: e.target.value })}
                />
              </div>
              <div className="rw-field rw-field--checkbox">
                <label className="rw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={e => dispatch({ type: 'FIELD_CHANGE', field: 'isRecurring', value: e.target.checked })}
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
                    onChange={e => dispatch({ type: 'FIELD_CHANGE', field: 'recurrencePattern', value: e.target.value })}
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
                  onChange={e => dispatch({ type: 'FIELD_CHANGE', field: 'notes', value: e.target.value })}
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
                    onChange={value => dispatch({ type: 'FIELD_CHANGE', field: 'proposedBudget', value })}
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
