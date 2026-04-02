import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { clientPortalService } from "../services/clientPortalService";
import { formatCurrency, formatDate } from "../utils/formatters";

function Metric({ label, value, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/5",
    accent: "border-ped-orange/20 bg-ped-orange/10",
    success: "border-emerald-500/20 bg-emerald-500/10",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function ClientPortalPage() {
  const { token = "" } = useParams();
  const [portal, setPortal] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliverablesLoading, setDeliverablesLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "BANK_TRANSFER",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const loadPortal = async () => {
    setLoading(true);
    try {
      const response = await clientPortalService.getPortal(token);
      setPortal(response);
      setPaymentForm((current) => ({
        ...current,
        amount:
          response?.balanceDue != null ? String(response.balanceDue) : current.amount,
      }));
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to open this client portal."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDeliverables = async () => {
    setDeliverablesLoading(true);
    try {
      const response = await clientPortalService.getDeliverables(token);
      setDeliverables(response);
    } catch (err) {
      if (err?.response?.status === 400 || err?.response?.status === 401) {
        setDeliverables([]);
      } else {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Unable to load deliverables."
        );
      }
    } finally {
      setDeliverablesLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
    loadDeliverables();
  }, [token]);

  const progressTone = useMemo(() => {
    if (portal?.isPaid) {
      return "success";
    }
    if (portal?.progressStep === "DELIVERED") {
      return "accent";
    }
    return "default";
  }, [portal?.isPaid, portal?.progressStep]);

  const processPayment = async () => {
    setSavingPayment(true);
    try {
      const updatedPortal = await clientPortalService.pay(token, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
      });
      setPortal(updatedPortal);
      setPaymentOpen(false);
      await loadDeliverables();
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to process payment."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,107,44,0.16),transparent_20%),linear-gradient(180deg,#111827_0%,#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ped-orange">
              PED AERIAL
            </p>
            <h1 className="mt-3 text-3xl font-black text-white">
              Client project portal
            </h1>
            <p className="mt-2 text-slate-400">
              Review mission status, payment progress, and deliverables from one secure link.
            </p>
          </div>
          <Link to="/">
            <Button variant="secondary" size="sm">
              Back to site
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
            Loading portal...
          </div>
        ) : null}

        {!loading && portal ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric label="Client" value={portal.clientName || "Unknown"} />
              <Metric label="Mission" value={portal.missionTitle || "Unassigned"} />
              <Metric
                label="Progress"
                value={portal.progressStep || portal.status || "Pending"}
                tone={progressTone}
              />
              <Metric
                label="Balance due"
                value={formatCurrency(portal.balanceDue)}
                tone={portal.isPaid ? "success" : "accent"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="p-5" title="Project status">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {portal.status}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Current workflow step: {portal.progressStep}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Mission date
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {portal.missionDate ? formatDate(portal.missionDate) : "Not scheduled"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Payment state
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {portal.isPaid ? "Paid in full" : "Payment pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5" title="Invoice summary">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">Amount due</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(portal.amountDue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">Amount paid</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(portal.amountPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">Balance due</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(portal.balanceDue)}
                      </span>
                    </div>
                  </div>

                  {!portal.isPaid && portal.balanceDue > 0 ? (
                    <Button size="md" onClick={() => setPaymentOpen(true)}>
                      Pay now
                    </Button>
                  ) : (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      Payment complete. Deliverables are ready when the mission is complete.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="p-5" title="Deliverables">
              {deliverablesLoading ? (
                <p className="text-sm t-text-dim">Loading deliverables...</p>
              ) : null}

              {!deliverablesLoading && !deliverables.length ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  Deliverables unlock after the mission is completed and payment is settled.
                </div>
              ) : null}

              {!deliverablesLoading && deliverables.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {deliverables.map((deliverable) => (
                    <a
                      key={deliverable.id}
                      href={deliverable.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-ped-orange/40 hover:bg-ped-orange/5"
                    >
                      <p className="text-sm font-semibold text-white">
                        {deliverable.fileName || "Download file"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {deliverable.fileType}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-ped-orange">
                        Open deliverable
                      </p>
                    </a>
                  ))}
                </div>
              ) : null}
            </Card>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Make a payment"
        primaryAction={processPayment}
        primaryLabel={savingPayment ? "Processing..." : "Submit payment"}
        primaryDisabled={savingPayment || !paymentForm.amount}
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            value={paymentForm.amount}
            onChange={(event) =>
              setPaymentForm((current) => ({
                ...current,
                amount: event.target.value,
              }))
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Payment method
            </label>
            <select
              className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none"
              value={paymentForm.method}
              onChange={(event) =>
                setPaymentForm((current) => ({
                  ...current,
                  method: event.target.value,
                }))
              }
            >
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="CHECK">Check</option>
              <option value="CREDIT_CARD">Credit card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
