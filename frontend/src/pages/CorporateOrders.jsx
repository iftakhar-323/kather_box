import { useEffect, useState } from "react";
import {
  getCorporateOrders,
  createCorporateOrder,
  updateCorporateOrderStatus,
  requestBranding,
} from "../api/corporateOrders";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function fmtBDT(n) {
  return `৳${Number(n || 0).toLocaleString("en-IN")}`;
}

const STATUS_FLOW = [
  "pending",
  "reviewing",
  "approved",
  "in_production",
  "delivered",
  "rejected",
];

export default function CorporateOrders() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [active, setActive] = useState(null);

  // form
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState(20);
  const [budget, setBudget] = useState(20000);
  const [notes, setNotes] = useState("");
  const [branding, setBranding] = useState("");
  const [itemsText, setItemsText] = useState(""); // "product_id:qty,product_id:qty"

  const load = () => {
    setLoading(true);
    getCorporateOrders()
      .then((r) => {
        setOrders(r.data?.orders || r.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const parseItems = (txt) =>
    txt
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [pid, qty] = s.split(":").map((x) => x.trim());
        return { product_id: Number(pid), quantity: Number(qty || 1) };
      })
      .filter((x) => x.product_id > 0);

  const onSubmit = async (e) => {
    e.preventDefault();
    const items = parseItems(itemsText);
    if (items.length === 0) {
      toast.err("Add at least one product (id:qty)");
      return;
    }
    try {
      await createCorporateOrder({
        company_name: company,
        quantity: Number(quantity),
        budget: Number(budget),
        notes,
        branding_needs: branding,
        items,
      });
      toast.ok("Order submitted — we'll review within 24h");
      setShowForm(false);
      setCompany("");
      setItemsText("");
      setNotes("");
      setBranding("");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onUpdateStatus = async (id, status) => {
    try {
      await updateCorporateOrderStatus(id, status);
      toast.ok(`Status → ${status}`);
      load();
      if (active?.id === id) {
        const r = await getCorporateOrders();
        setActive(
          (r.data?.orders || r.data?.items || []).find((o) => o.id === id) || null
        );
      }
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const onBranding = async (id) => {
    const text = window.prompt("Describe your custom branding needs");
    if (!text) return;
    try {
      await requestBranding(id, { description: text });
      toast.ok("Branding request sent");
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>🏢 Corporate Orders</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Bulk gifting with custom branding, approval workflow and dedicated
        account manager.
      </p>

      <div className="row mb-16">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "➕ New bulk order"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>New corporate order</h3>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="field-label">Company name</label>
              <input
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div style={{ width: 120 }}>
              <label className="field-label">Quantity</label>
              <input
                className="input"
                type="number"
                min="5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div style={{ width: 160 }}>
              <label className="field-label">Budget (৳)</label>
              <input
                className="input"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <label className="field-label mt-8">Items (product_id:qty, …)</label>
          <input
            className="input"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder="e.g. 1:10, 5:8, 12:2"
            required
          />
          <label className="field-label mt-8">Notes</label>
          <textarea
            className="input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label className="field-label mt-8">Branding needs (optional)</label>
          <textarea
            className="input"
            rows={2}
            value={branding}
            onChange={(e) => setBranding(e.target.value)}
            placeholder="Logo placement, custom ribbon, etc."
          />
          <button className="btn btn-primary mt-8">Submit for review</button>
        </form>
      )}

      {loading ? (
        <div className="empty">
          <div className="emoji">⏳</div>
          <h3>Loading…</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="emoji">📦</div>
          <h3>No corporate orders yet</h3>
        </div>
      ) : (
        <div>
          {orders.map((o) => (
            <div
              key={o.id}
              className="card card-pad"
              style={{ marginBottom: 8, cursor: "pointer" }}
              onClick={() => setActive(o)}
            >
              <div className="row">
                <strong>{o.company_name || `Order #${o.id}`}</strong>
                <span className="tag tag-leaf">{o.status}</span>
                <span className="spacer" />
                <span className="muted">
                  {o.quantity} pcs · {fmtBDT(o.budget)}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Submitted {new Date(o.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setActive(null)}
        >
          <div
            className="card card-pad-lg"
            style={{ maxWidth: 560, width: "90%", maxHeight: "85vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {active.company_name || `Order #${active.id}`}
            </h2>
            <p className="muted">Status: <strong>{active.status}</strong></p>
            <p>Quantity: {active.quantity} pcs</p>
            <p>Budget: {fmtBDT(active.budget)}</p>
            {active.notes && <p>Notes: {active.notes}</p>}
            {active.branding_needs && (
              <p>Branding: {active.branding_needs}</p>
            )}

            {isAdmin && (
              <>
                <h4>Update status</h4>
                <div className="row gap-4" style={{ flexWrap: "wrap" }}>
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      className={
                        "btn btn-xs " +
                        (s === active.status ? "btn-primary" : "btn-secondary")
                      }
                      onClick={() => onUpdateStatus(active.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isAdmin && active.status === "approved" && (
              <button
                className="btn btn-secondary btn-sm mt-8"
                onClick={() => onBranding(active.id)}
              >
                🎨 Add branding request
              </button>
            )}

            <button
              className="btn btn-ghost btn-sm mt-8"
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
