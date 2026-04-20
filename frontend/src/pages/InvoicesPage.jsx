import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import { getInvoices, updateInvoiceStatus } from '../services/invoicesService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './InvoicesPage.css';

const STATUSES = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
const STATUS_COLORS = { DRAFT: '#6b7280', SENT: '#3b82f6', PAID: '#22c55e', OVERDUE: '#ef4444', CANCELLED: '#6b7280' };

export default function InvoicesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchInvoices = () => getInvoices().then((response) => setInvoices(response.data)).finally(() => setLoading(false));
  useEffect(() => { fetchInvoices(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      await fetchInvoices();
      showToast('Invoice updated', 'success');
    } catch {
      showToast('Failed to update invoice', 'error');
    }
  };

  const filtered = filter === 'ALL' ? invoices : invoices.filter((invoice) => invoice.status === filter);
  const canEditStatus = ['PILOT', 'ADMIN'].includes(user?.role);

  return (
    <PageShell title="Invoices" loading={loading}>
      <div className="invoices-page__filters">
        {STATUSES.map((status) => (
          <button key={status} className={`invoices-page__filter${filter === status ? ' invoices-page__filter--active' : ''}`} onClick={() => setFilter(status)}>
            {status}
          </button>
        ))}
      </div>
      <div className="invoices-page__list">
        {filtered.length === 0 && <p className="invoices-page__empty">No invoices found.</p>}
        {filtered.map((invoice) => (
          <div key={invoice.id} className="invoice-row">
            <div className="invoice-row__left">
              <div className="invoice-row__number">{invoice.invoiceNumber}</div>
              <div className="invoice-row__job">{invoice.jobTitle}</div>
              <div className="invoice-row__client">{invoice.clientName}</div>
            </div>
            <div className="invoice-row__right">
              <div className="invoice-row__amount">${parseFloat(invoice.totalAmount).toFixed(2)}</div>
              <span className="invoice-row__status" style={{ color: STATUS_COLORS[invoice.status] }}>
                {invoice.status}
              </span>
              {invoice.dueDate && <div className="invoice-row__due">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>}
              {canEditStatus && invoice.status === 'SENT' && (
                <button className="invoice-row__mark-paid" onClick={() => handleStatusChange(invoice.id, 'PAID')}>
                  Mark Paid
                </button>
              )}
              {canEditStatus && invoice.status === 'DRAFT' && (
                <button className="invoice-row__mark-paid" onClick={() => handleStatusChange(invoice.id, 'SENT')}>
                  Send
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
