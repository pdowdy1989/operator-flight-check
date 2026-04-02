import { useEffect, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { missionsService } from "../services/missionsService";
import { clientsService } from "../services/clientsService";
import { droneProfilesService } from "../services/droneProfilesService";
import { formatDate } from "../utils/formatters";

const EMPTY_FORM = {
  title: "",
  description: "",
  clientId: "",
  droneProfileId: "",
  locationLabel: "",
  locationAddress: "",
  missionDate: "",
  status: "PLANNED",
  flyScore: "",
  weatherSummary: "",
  durationHours: "",
  notes: "",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    try {
      const [missionPage, clientRows, profileRows] = await Promise.all([
        missionsService.getAll(),
        clientsService.getAll(),
        droneProfilesService.getAll(),
      ]);
      setMissions(missionPage.content ?? []);
      setClients(clientRows);
      setProfiles(profileRows);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load missions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (mission) => {
    setEditing(mission);
    setForm({
      title: mission.title || "",
      description: mission.description || "",
      clientId: mission.clientId || "",
      droneProfileId: mission.droneProfileId || "",
      locationLabel: mission.locationLabel || "",
      locationAddress: mission.locationAddress || "",
      missionDate: mission.missionDate || "",
      status: mission.status || "PLANNED",
      flyScore: mission.flyScore ?? "",
      weatherSummary: mission.weatherSummary || "",
      durationHours: mission.durationHours ?? "",
      notes: mission.notes || "",
    });
    setModalOpen(true);
  };

  const saveMission = async () => {
    setSaving(true);
    const payload = {
      ...form,
      clientId: form.clientId || null,
      droneProfileId: form.droneProfileId || null,
      flyScore: form.flyScore === "" ? null : Number(form.flyScore),
      durationHours: form.durationHours === "" ? null : Number(form.durationHours),
    };
    try {
      if (editing) {
        await missionsService.update(editing.id, payload);
      } else {
        await missionsService.create(payload);
      }
      setModalOpen(false);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to save mission.");
    } finally {
      setSaving(false);
    }
  };

  const removeMission = async (mission) => {
    if (!window.confirm(`Delete ${mission.title}?`)) return;
    try {
      await missionsService.remove(mission.id);
      await loadPage();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to delete mission.");
    }
  };

  return (
    <PageWrapper title="Missions" subtitle="Plan work, track status, and tie flights back to clients and aircraft." action={<Button size="sm" onClick={openCreate}>Add mission</Button>}>
      {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      <div className="grid gap-4">
        {loading ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">Loading missions...</div> : null}
        {!loading && !missions.length ? <div className="rounded-2xl border t-surface p-6 text-sm t-text-dim">No missions yet.</div> : null}
        {!loading && missions.map((mission) => (
          <Card key={mission.id} className="p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{mission.title}</h2>
                  <span className="rounded-full bg-ped-orange/10 px-3 py-1 text-xs font-semibold text-orange-300">{mission.status}</span>
                </div>
                <p className="mt-2 text-sm t-text-dim">{mission.clientName || "No client linked"}{mission.droneProfileName ? ` · ${mission.droneProfileName}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm t-text-dim">
                  <span>{formatDate(mission.missionDate)}</span>
                  <span>{mission.locationLabel || mission.locationAddress || "No location"}</span>
                  <span>Score {mission.flyScore ?? "--"}</span>
                  <span>{mission.durationHours ? `${mission.durationHours}h` : "No duration"}</span>
                </div>
                {mission.weatherSummary ? <p className="mt-3 text-sm text-slate-300">{mission.weatherSummary}</p> : null}
                {mission.notes ? <p className="mt-2 text-sm t-text-dim">{mission.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(mission)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => removeMission(mission)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit mission" : "Add mission"} primaryAction={saveMission} primaryLabel={saving ? "Saving..." : "Save mission"} primaryDisabled={saving || !form.title.trim() || !form.missionDate} size="lg">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <Input label="Mission date" type="date" value={form.missionDate} onChange={(e) => setForm((prev) => ({ ...prev, missionDate: e.target.value }))} required />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Client</label>
            <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={form.clientId} onChange={(e) => setForm((prev) => ({ ...prev, clientId: e.target.value }))}>
              <option value="">No client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Aircraft</label>
            <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={form.droneProfileId} onChange={(e) => setForm((prev) => ({ ...prev, droneProfileId: e.target.value }))}>
              <option value="">No aircraft</option>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Location label" value={form.locationLabel} onChange={(e) => setForm((prev) => ({ ...prev, locationLabel: e.target.value }))} />
          <Input label="Location address" value={form.locationAddress} onChange={(e) => setForm((prev) => ({ ...prev, locationAddress: e.target.value }))} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">Status</label>
            <select className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="PLANNED">Planned</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <Input label="Fly score" type="number" value={form.flyScore} onChange={(e) => setForm((prev) => ({ ...prev, flyScore: e.target.value }))} />
          <Input label="Duration (hours)" type="number" value={form.durationHours} onChange={(e) => setForm((prev) => ({ ...prev, durationHours: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Description</label>
          <textarea className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Weather summary</label>
          <textarea className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={form.weatherSummary} onChange={(e) => setForm((prev) => ({ ...prev, weatherSummary: e.target.value }))} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-200">Notes</label>
          <textarea className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none focus:ring-2 focus:ring-ped-orange/30" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </div>
      </Modal>
    </PageWrapper>
  );
}
