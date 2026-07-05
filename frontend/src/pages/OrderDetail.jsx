import { useEffect, useState } from "react";
import {
  getOrderTimeline,
  requestReturn,
  requestRefund,
  requestExchange,
  openInvoice,
  openReceipt,
  getEstimatedDelivery,
} from "../api/orderExt";
import { useToast } from "../components/Toast";

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

const TIMELINE_ICONS = {
  placed: "📝",
  confirmed: "✓",
  packed: "📦",
  shipped: "🚚",
  out_for_delivery: "🛵",
  delivered: "🎉",
  cancelled: "❌",
  returned: "↩️",
  refunded: "💸",
  exchanged: "🔄",
  note: "📌",
  return_requested: "↩️",
  return_approved: "✅",
  return_rejected: "⛔",
  return_completed: "🎁",
};

export default function OrderDetail({ order, onBack }) {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [est, setEst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null); // 'return' | 'refund' | 'exchange'
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getOrderTimeline(order.id), getEstimatedDelivery(order.id).catch(() => ({ data: null }))])
      .then(([tl, ed]) => {
        setEvents(tl.data || []);
        setEst(ed.data || null);
        setLoading(false);
      })
      .catch((e) => {
        toast.err(e?.response?.data?.error || e.message);
        setLoading(false);
      });
  };

  useEffect(load, [order.id]);

  const onViewInvoice = () => {
    openInvoice(order.id)
      .then(() => toast.ok("Invoice opened — press Ctrl/Cmd+P to save as PDF"))
      .catch(() => toast.err("Could not open invoice"));
  };
  const onViewReceipt = () => {
    openReceipt(order.id)
      .then(() => toast.ok("Receipt opened"))
      .catch(() => toast.err("Could not open receipt"));
  };

  const onSubmitAction = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.err("Please add a reason");
      return;
    }
    setBusy(true);
    try {
      const fn = {
        return: requestReturn,
        refund: requestRefund,
        exchange: requestExchange,
      }[action];
      await fn(order.id, { reason: reason.trim(), notes: details });
      toast.ok(
        `${action[0].toUpperCase() + action.slice(1)} request sent`
      );
      setAction(null);
      setReason("");
      setDetails("");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const statusColor = {
    Pending: "tag-bark",
    Processing: "tag-info",
    Packed: "tag-info",
    "On the Way": "tag-info",
    Delivered: "tag-leaf",
    Cancelled: "tag-rose",
  }[order.status] || "tag-bark";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <button onClick={onBack} className="btn btn-ghost mb-16">
        ← Back to orders
      </button>

      <div
        className="row gap-8"
        style={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <h1 style={{ margin: 0 }}>Order #{order.id}</h1>
        <span className={"tag " + statusColor}>{order.status}</span>
      </div>
      <p className="muted">
        Placed {fmtDate(order.created_at)} · Total ৳
        {Number(order.total_price || 0).toLocaleString()}
      </p>

      <div className="row gap-8 mb-16" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={onViewInvoice}>
          🧾 View / print invoice
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onViewReceipt}>
          🧾 View receipt
        </button>
        <span className="spacer" />
        {order.status === "Delivered" && (
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setAction("return")}
            >
              ↩️ Return
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setAction("refund")}
            >
              💸 Refund
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setAction("exchange")}
            >
              🔄 Exchange
            </button>
          </>
        )}
      </div>

      {action && (
        <form onSubmit={onSubmitAction} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>
            {action[0].toUpperCase() + action.slice(1)} request
          </h3>
          <label className="field-label">Reason *</label>
          <input
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Damaged on arrival"
          />
          <label className="field-label mt-8">Details (optional)</label>
          <textarea
            className="input"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row mt-8" style={{ gap: 8 }}>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAction(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {est && (
        <div className="card card-pad-lg mb-16" style={{ background: "var(--leaf-50)" }}>
          <h3 style={{ marginTop: 0 }}>📦 Estimated delivery</h3>
          {est.status === "delivered" ? (
            <p>
              ✅ Delivered on <strong>{est.delivered_at}</strong>
            </p>
          ) : est.status === "cancelled" ? (
            <p>❌ Order cancelled — no delivery expected.</p>
          ) : (
            <>
              <p style={{ margin: "4px 0" }}>
                Between{" "}
                <strong>{est.earliest}</strong> and{" "}
                <strong>{est.latest}</strong>
              </p>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                {est.shipped_at
                  ? `Shipped on ${est.shipped_at} · ${est.business_days} business day transit`
                  : `${est.business_days} business day transit (Dhaka 2d · major cities 4d · remote 7d)`}
              </p>
              {est.note && (
                <p className="muted" style={{ margin: "8px 0 0", fontSize: 12 }}>
                  {est.note}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <h2>📍 Timeline</h2>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : events.length === 0 ? (
        <p className="muted">No events yet.</p>
      ) : (
        <div
          style={{
            borderLeft: "2px solid var(--leaf-200)",
            marginLeft: 12,
            paddingLeft: 16,
          }}
        >
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                position: "relative",
                marginBottom: 16,
                paddingLeft: 4,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -28,
                  top: 0,
                  width: 28,
                  textAlign: "center",
                  fontSize: 20,
                }}
              >
                {TIMELINE_ICONS[ev.event] || "•"}
              </span>
              <strong style={{ textTransform: "capitalize" }}>
                {ev.event.replace(/_/g, " ")}
              </strong>
              {ev.note && <p style={{ margin: "4px 0" }}>{ev.note}</p>}
              <div className="muted" style={{ fontSize: 12 }}>
                {fmtDate(ev.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
