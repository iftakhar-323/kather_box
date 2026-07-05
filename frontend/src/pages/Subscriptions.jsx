import { useEffect, useState } from "react";
import {
  getMySubscriptions,
  createSubscription,
  cancelSubscription,
  advanceSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  listSubscriptionDeliveries,
} from "../api/subscriptions";
import { useToast } from "../components/Toast";

const PLANS = [
  {
    name: "Monthly Plant Box",
    price: 1200,
    interval: 30,
    emoji: "🪴",
    desc: "A new easy-care plant + care guide every month.",
  },
  {
    name: "Cactus & Succulent Box",
    price: 800,
    interval: 60,
    emoji: "🌵",
    desc: "Two drought-tolerant picks every 2 months.",
  },
  {
    name: "Herbal Kitchen Box",
    price: 600,
    interval: 30,
    emoji: "🌿",
    desc: "Tulsi, mint, coriander — kitchen windowsill herbs.",
  },
];

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

export default function Subscriptions() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [historyOf, setHistoryOf] = useState(null); // subscription id

  const load = () => {
    setLoading(true);
    getMySubscriptions()
      .then((r) => setList(r.data || []))
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const subscribe = async (plan) => {
    setMsg("");
    setError("");
    try {
      await createSubscription({
        plan_name: plan.name,
        interval_days: plan.interval,
        price: plan.price,
      });
      setMsg(`✓ Subscribed to ${plan.name}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  const cancel = async (sub) => {
    if (!window.confirm(`Cancel "${sub.plan_name}"?`)) return;
    try {
      await cancelSubscription(sub.ID);
      toast.ok("Subscription cancelled");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const advance = async (sub) => {
    try {
      await advanceSubscription(sub.ID);
      toast.ok("Delivery marked as sent");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const pause = async (sub) => {
    try {
      await pauseSubscription(sub.ID);
      toast.ok("Subscription paused");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const resume = async (sub) => {
    try {
      await resumeSubscription(sub.ID);
      toast.ok("Subscription resumed");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const renew = async (sub) => {
    try {
      await renewSubscription(sub.ID);
      toast.ok("Renewed — back on the active list");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Plant subscriptions 📦</h1>
        <p className="muted">
          Recurring boxes delivered to your door — pause, resume or cancel any
          time.
        </p>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            padding: 12,
            color: "var(--leaf-700)",
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}
      {error && <div className="warning">{error}</div>}

      <h2>Available plans</h2>
      <div className="product-grid">
        {PLANS.map((p) => (
          <div key={p.name} className="product-card">
            <div className="image">
              <span style={{ fontSize: 56 }}>{p.emoji}</span>
            </div>
            <div className="body">
              <h3>{p.name}</h3>
              <p className="desc">{p.desc}</p>
              <div className="row" style={{ alignItems: "center" }}>
                <span className="price">৳{p.price}</span>
                <span className="muted" style={{ fontSize: 13 }}>
                  every {p.interval} days
                </span>
              </div>
              <button
                onClick={() => subscribe(p)}
                className="btn btn-primary btn-block mt-8"
              >
                Subscribe
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 32 }}>Your subscriptions</h2>
      {loading && <div className="empty">Loading…</div>}
      {!loading && list.length === 0 && (
        <div className="empty">
          <div className="emoji">📭</div>
          <h3>No active subscriptions</h3>
          <p>Pick a plan above to get started.</p>
        </div>
      )}
      {!loading && list.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          {list.map((s) => {
            const overdue =
              s.status === "active" &&
              s.next_delivery &&
              new Date(s.next_delivery) < new Date();
            const pillCls =
              s.status !== "active"
                ? "status-cancelled"
                : overdue
                ? "status-processing"
                : "status-delivered";
            const pillTxt =
              s.status !== "active" ? s.status : overdue ? "Delivery due" : "Active";
            return (
              <div
                key={s.ID}
                className="row-card"
                style={{
                  borderRadius: 0,
                  borderBottom: "1px solid var(--leaf-100)",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div
                  className="row-icon"
                  style={{
                    background: "linear-gradient(135deg,#e8f1e6,#cfe1cb)",
                  }}
                >
                  <span style={{ fontSize: 24 }}>📦</span>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600 }}>{s.plan_name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    ৳{s.price} • every {s.interval_days} days
                    {s.paused_at ? ` • paused ${fmtDate(s.paused_at)}` : ""}
                  </div>
                </div>
                <span className={"status-pill " + pillCls}>{pillTxt}</span>
                <div
                  className="muted"
                  style={{ width: 110, textAlign: "right" }}
                >
                  {s.next_delivery
                    ? `Next: ${fmtDate(s.next_delivery)}`
                    : "—"}
                </div>
                <div
                  className="row"
                  style={{ gap: 6, flexWrap: "wrap" }}
                >
                  {s.status === "active" && (
                    <>
                      <button
                        onClick={() => advance(s)}
                        className="btn btn-secondary btn-sm"
                        title="Manually mark a delivery as sent"
                      >
                        Deliver now
                      </button>
                      <button
                        onClick={() => pause(s)}
                        className="btn btn-ghost btn-sm"
                        title="Pause for one cycle"
                      >
                        ⏸ Pause
                      </button>
                      <button
                        onClick={() => cancel(s)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {s.status === "paused" && (
                    <>
                      <button
                        onClick={() => resume(s)}
                        className="btn btn-primary btn-sm"
                      >
                        ▶ Resume
                      </button>
                      <button
                        onClick={() => renew(s)}
                        className="btn btn-secondary btn-sm"
                        title="Force a renewal now"
                      >
                        🔄 Renew now
                      </button>
                      <button
                        onClick={() => cancel(s)}
                        className="btn btn-danger btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {(s.status === "cancelled" || s.status === "expired") && (
                    <button
                      onClick={() => renew(s)}
                      className="btn btn-primary btn-sm"
                    >
                      🔄 Renew
                    </button>
                  )}
                  <button
                    onClick={() => setHistoryOf(s.ID)}
                    className="btn btn-ghost btn-sm"
                    title="View past deliveries"
                  >
                    📜 History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {historyOf && (
        <DeliveryHistory
          id={historyOf}
          onClose={() => setHistoryOf(null)}
        />
      )}
    </div>
  );
}

function DeliveryHistory({ id, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listSubscriptionDeliveries(id)
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div
      className="modal-bg"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        className="card card-pad-lg"
        style={{ width: 480, maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row" style={{ alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>📜 Delivery history</h3>
          <span className="spacer" />
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            ✕
          </button>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No deliveries yet.</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            {items.map((d) => (
              <div
                key={d.id}
                className="row"
                style={{
                  borderBottom: "1px solid var(--leaf-100)",
                  padding: "8px 0",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 18 }}>📦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{fmtDate(d.delivered_at)}</div>
                  {d.note && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      {d.note}
                    </div>
                  )}
                </div>
                <span
                  className={
                    "status-pill " +
                    (d.status === "delivered"
                      ? "status-delivered"
                      : d.status === "skipped"
                      ? "status-cancelled"
                      : "status-processing")
                  }
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}