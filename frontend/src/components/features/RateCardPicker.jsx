import './RateCardPicker.css';

function getDiscountPercent(totalQty) {
  if (totalQty >= 4) return 15;
  if (totalQty === 3) return 10;
  if (totalQty === 2) return 5;
  return 0;
}

export default function RateCardPicker({ availableServices = [], selectedItems = [], onChange }) {
  const getSelected = (serviceId) => selectedItems.find(i => i.serviceId === serviceId);

  const updateQty = (serviceId, delta) => {
    const existing = getSelected(serviceId);
    if (!existing) {
      if (delta > 0) onChange([...selectedItems, { serviceId, quantity: 1 }]);
      return;
    }
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      onChange(selectedItems.filter(i => i.serviceId !== serviceId));
    } else {
      onChange(selectedItems.map(i => i.serviceId === serviceId ? { ...i, quantity: newQty } : i));
    }
  };

  const totalQty = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const discountPct = getDiscountPercent(totalQty);

  const rateCardTotal = selectedItems.reduce((sum, item) => {
    const svc = availableServices.find(s => s.id === item.serviceId);
    return sum + (svc ? svc.basePrice * item.quantity : 0);
  }, 0);

  const savings = rateCardTotal * discountPct / 100;
  const finalAmount = rateCardTotal - savings;

  return (
    <div className="rate-card-picker">
      <div className="rate-card-grid">
        {availableServices.map(svc => {
          const sel = getSelected(svc.id);
          return (
            <div key={svc.id} className={`rate-card-item ${sel ? 'selected' : ''}`}>
              <div className="rate-card-item__name">{svc.name}</div>
              {svc.description && <div className="rate-card-item__desc">{svc.description}</div>}
              <div className="rate-card-item__price">${Number(svc.basePrice).toFixed(2)}</div>
              {svc.estimatedDurationMinutes && (
                <div className="rate-card-item__dur">~{svc.estimatedDurationMinutes} min</div>
              )}
              <div className="rate-card-item__controls">
                {sel ? (
                  <>
                    <button type="button" onClick={() => updateQty(svc.id, -1)}>−</button>
                    <span>{sel.quantity}</span>
                    <button type="button" onClick={() => updateQty(svc.id, 1)}>+</button>
                  </>
                ) : (
                  <button type="button" className="add-btn" onClick={() => updateQty(svc.id, 1)}>Add</button>
                )}
              </div>
            </div>
          );
        })}
        {availableServices.length === 0 && (
          <p className="rate-card-empty">No services available.</p>
        )}
      </div>

      {totalQty > 0 && (
        <div className="rate-card-summary">
          <div className="summary-row"><span>Total jobs:</span><span>{totalQty}</span></div>
          <div className="summary-row"><span>Rate card total:</span><span>${rateCardTotal.toFixed(2)}</span></div>
          <div className="summary-row discount">
            <span>Discount ({discountPct}%):</span>
            <span>−${savings.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Final total:</span>
            <span>${finalAmount.toFixed(2)}</span>
          </div>
          <div className="discount-tiers">
            <span>Tiers: 1=0% · 2=5% · 3=10% · 4+=15%</span>
          </div>
        </div>
      )}
    </div>
  );
}
