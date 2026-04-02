import { useEffect, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { clientsService } from "../services/clientsService";
import { formatDate } from "../utils/formatters";

const EMPTY_FORM = { name: "", email: "", company: "", phone: "", billingAddress: "", notes: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadClients = async (searchValue = "") => {
    setLoading(true);
    try {
      const response = searchValue.trim()
        ? await clientsService.search(searchValue.trim())
        : await clientsService.getAll();
      setClients(response);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.name || "",
      email: client.email || "",
      company: client.company || "",
      phone: client.phone || "",
      billingAddress: client.billingAddress || "",
      notes: client.notes || "",
    });
    setModalOpen(true);
  };

  const saveClient = async () => {
    setSaving(true);
    try {
      if (editing) {
        await clientsService.update(editing.id, form);
      } else {
        await clientsService.create(form);
      }
      setModalOpen(false);
      await loadClients(query);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save client.");
    } finally {
      setSaving(false);
    }
  };

  const removeClient = async (client) => {
    if (!window.confirm(`Delete ${client.name}?`)) return;
    try {
      await clientsService.remove(client.id);
      await loadClients(query);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to delete client.");
    }
  };

  return (
    <PageWrapper title="Clients" subtitle="Manage the companies and contacts you invoice and fly for." action={<Button size="sm" onClick={openCreate}>Add client</Button>}>
      {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input label="Search clients" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or company" className="flex-1" />
          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={() => loadClients(query)}>Search</Button>
            <Button variant="ghost" onClick={() => { setQuery(""); loadClients(""); }}>Clear</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {loading ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">Loading clients...</div> : null}
        {!loading && !clients.length ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">No clients found.</div> : null}
        {!loading && clients.map((client) => (
          <Card key={client.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{client.name}</h2>
                <p className="mt-1 text-sm t-text-dim">{client.company || "Independent client"}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm t-text-dim">
                  <span>{client.email || "No email"}</span>
                  <span>{client.phone || "No phone"}</span>
                  <span>Added {formatDate(client.createdAt)}</span>
                </div>
                {client.billingAddress ? <p className="mt-3 text-sm text-slate-300">{client.billingAddress}</p> : null}
                {client.notes ? <p className="mt-2 text-sm t-text-dim">{client.notes}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{client.missionCount} missions</span>
                <span className="rounded-full bg-ped-orange/10 px-3 py-1 text-xs font-semibold text-orange-300">{client.invoiceCount} invoices</span>
                <Button size="sm" variant="secondary" onClick={() => openEdit(client)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => removeClient(client)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit client" : "Add client"} primaryAction={saveClient} primaryLabel={saving ? "Saving..." : "Save client"} primaryDisabled={saving || !form.name.trim()} size="lg">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <Input label="Company" value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Billing address</label>
          <textarea className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={form.billingAddress} onChange={(e) => setForm((prev) => ({ ...prev, billingAddress: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Notes</label>
          <textarea className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </div>
      </Modal>
    </PageWrapper>
  );
}
