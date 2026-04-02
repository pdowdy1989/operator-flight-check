import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { clientsService } from "../services/clientsService";
import { invoicesService } from "../services/invoicesService";
import { missionsService } from "../services/missionsService";
import { paymentsService } from "../services/paymentsService";
import { formatCurrency, formatDate } from "../utils/formatters";

const EMPTY_INVOICE = {
  clientId: "",
  issueDate: "",
  dueDate: "",
  notes: "",
  lineItems: [{ description: "", quantity: "1", unitPrice: "0", missionId: "" }],
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE);
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentDate: "", method: "BANK_TRANSFER", referenceNote: "" });

  const loadPage = async () => {
    setLoading(true);
    try {
      const [invoicePage, clientRows, missionPage] = await Promise.all([
        invoicesService.getAll(),
        clientsService.getAll(),
        missionsService.getAll(),
      ]);
      setInvoices(invoicePage.content ?? []);
      setClients(clientRows);
      setMissions(missionPage.content ?? []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setInvoiceForm({
      ...EMPTY_INVOICE,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
    setInvoiceModalOpen(true);
  };

  const openEdit = (invoice) => {
    setEditing(invoice);
    setInvoiceForm({
      clientId: invoice.clientId || "",
      issueDate: invoice.issueDate || "",
      dueDate: invoice.dueDate || "",
      notes: invoice.notes || "",
      lineItems: invoice.lineItems?.length
        ? invoice.lineItems.map((item) => ({
            description: item.description || "",
            quantity: String(item.quantity ?? "1"),
            unitPrice: String(item.unitPrice ?? "0"),
            missionId: item.missionId || "",
          }))
        : EMPTY_INVOICE.lineItems,
    });
    setInvoiceModalOpen(true);
  };

  const addLineItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: "1", unitPrice: "0", missionId: "" }],
    }));
  };

  const updateLineItem = (index, key, value) => {
    setInvoiceForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const removeLineItem = (index) => {
    setInvoiceForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const invoiceTotal = useMemo(
    () => invoiceForm.lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0),
    [invoiceForm.lineItems]
  );

  const saveInvoice = async () => {
    setSaving(true);
    const payload = {
      clientId: invoiceForm.clientId,
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      notes: invoiceForm.notes,
      lineItems: invoiceForm.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        missionId: item.missionId || null,
      })),
    };
    try {
      if (editing) {
        await invoicesService.update(editing.id, payload);
      } else {
        await invoicesService.create(payload);
      }
      setInvoiceModalOpen(false);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save invoice.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (invoice, status) => {
    try {
      await invoicesService.updateStatus(invoice.id, status);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to update invoice status.");
    }
  };

  const deleteInvoice = async (invoice) => {
    if (!window.confirm(`Delete ${invoice.invoiceNumber}?`)) return;
    try {
      await invoicesService.remove(invoice.id);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to delete invoice.");
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceDue ? String(invoice.balanceDue) : "",
      paymentDate: new Date().toISOString().slice(0, 10),
      method: "BANK_TRANSFER",
      referenceNote: "",
    });
    setPaymentModalOpen(true);
  };

  const savePayment = async () => {
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      await paymentsService.create({
        invoiceId: selectedInvoice.id,
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        method: paymentForm.method,
        referenceNote: paymentForm.referenceNote,
      });
      setPaymentModalOpen(false);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const nextStatus = (invoice) => {
    if (invoice.status === "DRAFT") return "SENT";
    if (invoice.status === "SENT") return "PAID";
    return null;
  };

  return (
    <PageWrapper title="Invoices" subtitle="Create billing records, track balance due, and record incoming payments." action={<Button size="sm" onClick={openCreate}>Add invoice</Button>}>
      {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      <div className="grid gap-4">
        {loading ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">Loading invoices...</div> : null}
        {!loading && !invoices.length ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">No invoices yet.</div> : null}
        {!loading && invoices.map((invoice) => (
          <Card key={invoice.id} className="p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{invoice.invoiceNumber}</h2>
                  <span className="rounded-full bg-ped-orange/10 px-3 py-1 text-xs font-semibold text-orange-300">{invoice.status}</span>
                </div>
                <p className="mt-2 text-sm t-text-dim">{invoice.clientName || "No client"}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm t-text-dim">
                  <span>Issued {formatDate(invoice.issueDate)}</span>
                  <span>Due {formatDate(invoice.dueDate)}</span>
                  <span>Total {formatCurrency(invoice.totalAmount)}</span>
                  <span>Balance {formatCurrency(invoice.balanceDue)}</span>
                </div>
                {invoice.lineItems?.length ? (
                  <div className="mt-4 space-y-2">
                    {invoice.lineItems.map((item, index) => (
                      <div key={`${invoice.id}-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{item.description}</p>
                            <p className="mt-1 t-text-dim">{item.missionTitle || "General billing line"}</p>
                          </div>
                          <p className="font-semibold text-white">{formatCurrency(item.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {invoice.status === "DRAFT" ? <Button size="sm" variant="secondary" onClick={() => openEdit(invoice)}>Edit</Button> : null}
                {nextStatus(invoice) ? <Button size="sm" variant="secondary" onClick={() => updateStatus(invoice, nextStatus(invoice))}>Mark {nextStatus(invoice)}</Button> : null}
                {invoice.balanceDue > 0 ? <Button size="sm" onClick={() => openPaymentModal(invoice)}>Record payment</Button> : null}
                {invoice.status === "DRAFT" ? <Button size="sm" variant="ghost" onClick={() => deleteInvoice(invoice)}>Delete</Button> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title={editing ? "Edit invoice" : "Add invoice"} primaryAction={saveInvoice} primaryLabel={saving ? "Saving..." : "Save invoice"} primaryDisabled={saving || !invoiceForm.clientId || !invoiceForm.lineItems.length} size="lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Client</label>
            <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={invoiceForm.clientId} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, clientId: e.target.value }))}>
              <option value="">Select client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <Input label="Issue date" type="date" value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, issueDate: e.target.value }))} />
          <Input label="Due date" type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Notes</label>
          <textarea className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={invoiceForm.notes} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </div>
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Line items</p>
            <Button size="sm" variant="secondary" onClick={addLineItem}>Add line</Button>
          </div>
          <div className="space-y-4">
            {invoiceForm.lineItems.map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Input label="Description" value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} className="md:col-span-2" />
                  <Input label="Quantity" type="number" value={item.quantity} onChange={(e) => updateLineItem(index, "quantity", e.target.value)} />
                  <Input label="Unit price" type="number" value={item.unitPrice} onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)} />
                </div>
                <div className="mt-4 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-slate-200">Mission link</label>
                    <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={item.missionId} onChange={(e) => updateLineItem(index, "missionId", e.target.value)}>
                      <option value="">No linked mission</option>
                      {missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title}</option>)}
                    </select>
                  </div>
                  {invoiceForm.lineItems.length > 1 ? <Button size="sm" variant="ghost" onClick={() => removeLineItem(index)}>Remove</Button> : null}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-right text-sm font-semibold text-white">Invoice total {formatCurrency(invoiceTotal)}</p>
        </div>
      </Modal>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={`Record payment${selectedInvoice ? ` for ${selectedInvoice.invoiceNumber}` : ""}`} primaryAction={savePayment} primaryLabel={saving ? "Saving..." : "Record payment"} primaryDisabled={saving || !paymentForm.amount} size="md">
        <div className="space-y-4">
          <Input label="Amount" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))} />
          <Input label="Payment date" type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Method</label>
            <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={paymentForm.method} onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value }))}>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Input label="Reference note" value={paymentForm.referenceNote} onChange={(e) => setPaymentForm((prev) => ({ ...prev, referenceNote: e.target.value }))} />
        </div>
      </Modal>
    </PageWrapper>
  );
}
