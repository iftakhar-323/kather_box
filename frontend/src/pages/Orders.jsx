import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../api/orders";

const STATUS_FLOW = ["Pending", "Processing", "Packed", "On the Way", "Delivered"];

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
}

function DeliveryTrack({ status, createdAt }) {
  const idx = STATUS_FLOW.indexOf(status);
  const ok = idx >= 0;
  const est = new Date(createdAt);
  est.setDate(est.getDate() + 5);

  return (
    <div className="tracker">
      <div className="est">
        Estimated delivery: <strong>{est.toLocaleDateString()}</strong>
      </div>
      <div className="steps">
        {STATUS_FLOW.map((s, i) => {
          const reached = ok && i <= idx;
          const active = ok && i === idx;
          const cls = active ? "dot active" : reached ? "dot done" : "dot";
          return (
            <div key={s} className="row" style={{ flex: 1, gap: 0 }}>
              <span className={cls}>{reached ? "✓" : i + 1}</span>
              {i < STATUS_FLOW.length - 1 && (
                <span
                  className={"bar" + (i < idx ? " done" : "")}
                  style={{ marginLeft: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="labels">
        {STATUS_FLOW.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>Please log in</h3>
        <p>Sign in to view your orders.</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">📦</div>
        <h3>Loading orders…</h3>
      </div>
    );
  }
  if (error) {
    return (
      <div className="empty">
        <div className="emoji">⚠️</div>
        <h3 style={{ color: "var(--rose)" }}>{error}</h3>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">📭</div>
        <h3>No orders yet</h3>
        <p>Place your first order to see it here.</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("home")}
        >
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <h2 className="mb-16">My Orders</h2>

      <div className="stack gap-12">
        {orders.map((o) => {
          const isOpen = expanded === o.ID;
          const statusClass = `status status-${o.status?.replace(/ /g, "\\ ")}`;
          return (
            <article key={o.ID} className="card card-pad">
              <div
                className="row"
                style={{ flexWrap: "wrap", gap: 12, alignItems: "center" }}
              >
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600 }}>
                    Order #{o.ID}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-400)" }}>
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <span className={statusClass}>{o.status}</span>
                <div
                  style={{
                    fontFamily: "var(--heading)",
                    fontWeight: 700,
                    color: "var(--text-h)",
                    fontSize: 18,
                    minWidth: 90,
                    textAlign: "right",
                  }}
                >
                  ৳{o.total_price.toFixed(2)}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setExpanded(isOpen ? null : o.ID)}
                >
                  {isOpen
                    ? "Hide"
                    : `Items (${o.items?.length || 0})`}
                </button>
              </div>

              {isOpen && (
                <div className="mt-16">
                  <DeliveryTrack status={o.status} createdAt={o.created_at} />
                  <div className="stack gap-8 mt-16">
                    {(o.items || []).map((it) => (
                      <div
                        key={it.id}
                        className="row"
                        style={{
                          justifyContent: "space-between",
                          fontSize: 14,
                          padding: "8px 0",
                          borderTop: "1px solid var(--moss-100)",
                        }}
                      >
                        <span>
                          {emojiFor(it.product?.category)}{" "}
                          {it.product?.name || `Product #${it.product_id}`}
                        </span>
                        <span className="muted">
                          {it.quantity} × ৳{Number(it.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}