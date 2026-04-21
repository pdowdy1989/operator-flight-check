import './BudgetOverrideField.css';

export default function BudgetOverrideField({ totalQuantity, finalAmount, value, onChange }) {
  const enabled = totalQuantity >= 5;
  const lowerBound = finalAmount * 0.75;
  const upperBound = finalAmount * 1.25;
  const isValid = value == null || value === '' || (Number(value) >= lowerBound && Number(value) <= upperBound);

  return (
    <div className={`budget-override-field ${!enabled ? 'disabled' : ''}`}>
      <label>Proposed Budget (optional)</label>
      {!enabled ? (
        <div className="budget-locked">
          <input type="number" disabled placeholder="$0.00" />
          <p className="budget-hint locked">Budget proposals unlock at 5+ jobs</p>
        </div>
      ) : (
        <div className="budget-active">
          <input
            type="number"
            min="0"
            step="0.01"
            value={value ?? ''}
            onChange={e => onChange(e.target.value || null)}
            placeholder={`~$${finalAmount.toFixed(2)}`}
          />
          {value != null && value !== '' && (
            <p className={`budget-hint ${isValid ? 'valid' : 'invalid'}`}>
              {isValid
                ? `Within range ($${lowerBound.toFixed(2)} – $${upperBound.toFixed(2)})`
                : `Must be within 25% of $${finalAmount.toFixed(2)} ($${lowerBound.toFixed(2)} – $${upperBound.toFixed(2)})`
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}
