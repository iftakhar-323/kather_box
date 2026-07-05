import { useEffect, useState } from "react";
import {
  getMySubscriptions,
  createSubscription,
  cancelSubscription,
  advanceSubscription,
} from "../api/subscriptions";

const PLANS = [
  { name: "Monthly Plant Box", price: 1200, interval: 30, emoji: "🪴", desc: "A new easy-care plant + care guide every month." },
  { name: "Cactus & Succulent Box", price: 800, interval: 60, emoji: "🌵", desc: "Two drought-tolerant picks every 2 months." },
  { name: "Herbal Kitchen Box", price: 600, interval: 30, emoji: "🌿", desc: "Tulsi, mint, coriander — kitchen windowsill herbs." },
];

export default function Subscriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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
    await cancelSubscription(sub.ID);
    load();
  };

  const advance = async (sub) => {
    await advanceSubscription(sub.ID);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Plant subscriptions 📦</h1>
        <p className="muted">
          Recurring boxes delivered to your door — pause or cancel any time.
        </p>
      </div>

      {msg && <div className="card" style={{ padding: 12, color: "var(--leaf-700)", marginBottom: 12 }}>{msg}</div>}
      {error && <div className="warning">{error}</div>}

      <h2>Available plans</h2>
      <div className="product-grid">
        {PLANS.map((p) => (
          <div key={p.name} className="product-card">
            <div className="image"><span style={{ fontSize: 56 }}>{p.emoji}</span></div>
            <div className="body">
              <h3>{p.name}</h3>
              <p className="desc">{p.desc}</p>
              <div className="row" style={{ alignItems: "center" }}>
                <span className="price">৳{p.price}</span>
                <span className="muted" style={{ fontSize: 13 }}>every {p.interval} days</span>
              </div>
              <button onClick={() => subscribe(p)} className="btn btn-primary btn-block mt-8">
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
            const overdue = s.status === "active" && s.next_delivery < today;
            return (
              <div
                key={s.ID}
                className="row-card"
                style={{
                  borderRadius: 0,
                  borderBottom: "1px solid var(--leaf-100)",
                  alignItems: "center",
                }}
              >
                <div className="row-icon" style={{ background: "linear-gradient(135deg,#e8f1e6,#cfe1cb)" }}>
                  <span style={{ fontSize: 24 }}>📦</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.plan_name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    ৳{s.price} • every {s.interval_days} days
                  </div>
                </div>
                <span
                  className={
                    "status-pill " +
                    (s.status !== "active"
                      ? "status-cancelled"
                      : overdue
                      ? "status-processing"
                      : "status-delivered")
                  }
                >
                  {s.status !== "active" ? s.status : overdue ? "Delivery due" : "Active"}
                </span>
                <div className="muted" style={{ width: 110, textAlign: "right" }}>
                  {s.next_delivery}
                </div>
                {s.status === "active" && (
                  <>
                    <button onClick={() => advance(s)} className="btn btn-secondary btn-sm">
                      Deliver now
                    </button>
                    <button onClick={() => cancel(s)} className="btn btn-danger btn-sm">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}