import { useState } from 'react';
import './InsuranceFieldsAccordion.css';

const LOSS_TYPES = ['STORM', 'FIRE', 'WATER', 'WIND', 'HAIL', 'VANDALISM', 'OTHER'];
const PROPERTY_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'];

export default function InsuranceFieldsAccordion({ values = {}, onChange, errors = {} }) {
  const [open, setOpen] = useState(false);

  const handle = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="insurance-accordion">
      <button
        type="button"
        className="insurance-accordion__header"
        onClick={() => setOpen(o => !o)}
      >
        <span>Insurance claim details (optional)</span>
        <span className={`chevron ${open ? 'open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="insurance-accordion__body">
          <div className="ins-grid">
            <div className="form-group">
              <label>Claim Number</label>
              <input value={values.claimNumber || ''} onChange={handle('claimNumber')} />
            </div>
            <div className="form-group">
              <label>Policy Number</label>
              <input value={values.policyNumber || ''} onChange={handle('policyNumber')} />
            </div>
            <div className="form-group">
              <label>Insurance Company</label>
              <input value={values.insuranceCompanyName || ''} onChange={handle('insuranceCompanyName')} />
            </div>
            <div className="form-group">
              <label>Adjuster Name</label>
              <input value={values.adjusterName || ''} onChange={handle('adjusterName')} />
            </div>
            <div className="form-group">
              <label>Adjuster Email</label>
              <input type="email" value={values.adjusterEmail || ''} onChange={handle('adjusterEmail')} />
            </div>
            <div className="form-group">
              <label>Adjuster Phone</label>
              <input value={values.adjusterPhone || ''} onChange={handle('adjusterPhone')} />
            </div>
            <div className="form-group">
              <label>Loss Date</label>
              <input type="date" value={values.lossDate || ''} onChange={handle('lossDate')} />
            </div>
            <div className="form-group">
              <label>Loss Type</label>
              <select value={values.lossType || ''} onChange={handle('lossType')}>
                <option value="">-- Select --</option>
                {LOSS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Property Type</label>
              <select value={values.propertyType || ''} onChange={handle('propertyType')}>
                <option value="">-- Select --</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Inspection Scope</label>
              <textarea value={values.inspectionScope || ''} onChange={handle('inspectionScope')} rows={3} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
