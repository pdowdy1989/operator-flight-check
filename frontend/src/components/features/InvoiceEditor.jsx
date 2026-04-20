import { useState } from 'react';
import { createInvoice } from '../../services/invoicesService';
import { useToast } from '../../context/ToastContext';
import './InvoiceEditor.css';

export function InvoiceEditor({ jobId, existingInvoice, onSaved }) {
  const { showToast } = useToast();
  const [lineItems, setLineItems] = useState(
    existingInvoice?.lineItems || [{ description: '', quantity: 1, unitPrice: '' }]
  );
  const [taxAmount, setTaxAmount] = useState(existingInvoice?.taxAmount || 0);
  const [dueDate, setDueDate] = useState(existingInvoice?.dueDate || '');
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [saving, setSaving] = useState(false);

  const subtotal = lineItems.reduce((sum, li) => {
    const qty = parseFloat(li.quantity) || 0;
    const price = parseFloat(li.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const total = subtotal + (parseFloat(taxAmount) || 0);

  const addLine = () =>
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: '' }]);

  const removeLine = (i) => setLineItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateLine = (i, key, value) =>
    setLineItems((prev) => prev.map((li, idx) => (idx === i ? { ...li, [key]: value } : li)));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        jobId,
        taxAmount: parseFloat(taxAmount) || 0,
        dueDate: dueDate || null,
        notes,
        lineItems: lineItems.map((li, i) => ({
          description: li.description,
          quantity: parseFloat(li.quantity) || 1,
          unitPrice: parseFloat(li.unitPrice) || 0,
          sortOrder: i,
        })),
      };
      await createInvoice(payload);
      showToast('Invoice created', 'success');
      onSaved?.();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = !!existingInvoice;

  return (
    <div className="inv-editor">
      {existingInvoice && (
        <div className="inv-editor__header">
          <span className="inv-editor__number">{existingInvoice.invoiceNumber}</span>
          <span className={`inv-editor__status inv-editor__status--${existingInvoice.status?.toLowerCase()}`}>
            {existingInvoice.status}
          </span>
        </div>
      )}

      <table className="inv-editor__table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
            {!isReadOnly && <th></th>}
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li, i) => {
            const amt = (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0);
            return (
              <tr key={i}>
                <td>
                  {isReadOnly ? li.description : (
                    <input value={li.description} onChange={(e) => updateLine(i, 'description', e.target.value)} placeholder="Description" />
                  )}
                </td>
                <td>
                  {isReadOnly ? li.quantity : (
                    <input type="number" value={li.quantity} min="0" step="0.5" onChange={(e) => updateLine(i, 'quantity', e.target.value)} />
                  )}
                </td>
                <td>
                  {isReadOnly ? `$${parseFloat(li.unitPrice).toFixed(2)}` : (
                    <input type="number" value={li.unitPrice} min="0" step="0.01" onChange={(e) => updateLine(i, 'unitPrice', e.target.value)} placeholder="0.00" />
                  )}
                </td>
                <td>${amt.toFixed(2)}</td>
                {!isReadOnly && (
                  <td>
                    {lineItems.length > 1 && (
                      <button onClick={() => removeLine(i)} className="inv-editor__rm">✕</button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="inv-editor__subtotal">
            <td colSpan={isReadOnly ? 3 : 4}>Subtotal</td>
            <td>${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={isReadOnly ? 2 : 3}>Tax</td>
            <td>
              {isReadOnly ? `$${parseFloat(taxAmount).toFixed(2)}` : (
                <input type="number" value={taxAmount} min="0" step="0.01" onChange={(e) => setTaxAmount(e.target.value)} />
              )}
            </td>
            <td></td>
          </tr>
          <tr className="inv-editor__total">
            <td colSpan={isReadOnly ? 3 : 4}><strong>Total</strong></td>
            <td><strong>${total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      {!isReadOnly && (
        <>
          <button className="inv-editor__add" onClick={addLine}>+ Add Line Item</button>
          <div className="inv-editor__meta">
            <label>
              Due Date
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label>
              Notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </label>
          </div>
          <button className="inv-editor__save" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating…' : 'Create Invoice'}
          </button>
        </>
      )}
    </div>
  );
}
