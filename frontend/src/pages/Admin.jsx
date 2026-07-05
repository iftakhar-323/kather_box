import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAnalytics,
  adminListReminders,
  adminCompleteReminder,
  adminListSubscriptions,
  adminCancelSubscription,
  adminListConsultations,
  adminCancelConsultation,
  adminConfirmConsultation,
  adminListCorporate,
  adminUpdateCorporate,
} from "../api/admin";
import { createCoupon } from "../api/coupons";

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Packed",
  "On the Way",
  "Delivered",
];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [authError, setAuthError] = useState(null);

  // Re-verify role against server on mount (fixes stale-JWT-after-promotion bug)
  useEffect(() => {
    let mounted = true;
    API.get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        if (res.data.role !== "admin") {
          setAuthError("Your account is not an admin. Log out and log back in to refresh your role.");
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAuthError("Session expired. Please log in again.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>Please log in</h3>
        <p>Sign in to access the admin panel.</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🚫</div>
        <h3 style={{ color: "var(--rose)" }}>Admin access required</h3>
        <p>
          {authError ||
            "Your account does not have admin privileges. If you were just promoted, please log out and log back in."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-12">Admin Panel</h2>
      <p className="muted">Manage products and orders across the shop.</p>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          className={"tab" + (tab === "dashboard" ? " is-active" : "")}
          onClick={() => setTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "products" ? " is-active" : "")}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "orders" ? " is-active" : "")}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "corporate" ? " is-active" : "")}
          onClick={() => setTab("corporate")}
        >
          Corporate
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "subscriptions" ? " is-active" : "")}
          onClick={() => setTab("subscriptions")}
        >
          Subs
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "consultations" ? " is-active" : "")}
          onClick={() => setTab("consultations")}
        >
          Consults
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "reminders" ? " is-active" : "")}
          onClick={() => setTab("reminders")}
        >
          Reminders
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "coupons" ? " is-active" : "")}
          onClick={() => setTab("coupons")}
        >
          Coupons
        </button>
      </div>

      {authError && <div className="warning">{authError}</div>}

      {tab === "dashboard" && <DashboardTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "corporate" && <AdminCorporateTab />}
      {tab === "subscriptions" && <AdminSubscriptionsTab />}
      {tab === "consultations" && <AdminConsultationsTab />}
      {tab === "reminders" && <AdminRemindersTab />}
      {tab === "coupons" && <CouponsTab />}
    </div>
  );
}

function AdminRemindersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListReminders();
      setRows(data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onComplete = async (id) => {
    try {
      await adminCompleteReminder(id);
      load();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="muted">Loading reminders…</div>;
  if (error) return <div className="warning">{error}</div>;
  if (!rows.length) return <div className="muted">No reminders yet.</div>;

  return (
    <div className="table">
      <div className="thead">
        <div>User</div>
        <div>Product</div>
        <div>Type</div>
        <div>Next Due</div>
        <div>Interval</div>
        <div>Status</div>
        <div></div>
      </div>
      {rows.map((r) => (
        <div className="trow" key={r.id}>
          <div>{r.user_email}</div>
          <div>{r.product_name || `#${r.product_id}`}</div>
          <div>{r.type}</div>
          <div>{r.next_due_date}</div>
          <div>{r.interval_days}d</div>
          <div>
            <span className={"pill " + (r.completed ? "pill-done" : "pill-pending")}>
              {r.completed ? "Done" : "Pending"}
            </span>
          </div>
          <div>
            {!r.completed && (
              <button className="btn btn-sm btn-primary" onClick={() => onComplete(r.id)}>
                Mark done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSubscriptionsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListSubscriptions();
      setRows(data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this subscription?")) return;
    try {
      await adminCancelSubscription(id);
      load();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="muted">Loading subscriptions…</div>;
  if (error) return <div className="warning">{error}</div>;
  if (!rows.length) return <div className="muted">No subscriptions yet.</div>;

  return (
    <div className="table">
      <div className="thead">
        <div>User</div>
        <div>Plan</div>
        <div>Frequency</div>
        <div>Next Delivery</div>
        <div>Status</div>
        <div></div>
      </div>
      {rows.map((s) => (
        <div className="trow" key={s.id}>
          <div>{s.user_email}</div>
          <div>{s.plan}</div>
          <div>every {s.interval_days}d</div>
          <div>{s.next_delivery || "-"}</div>
          <div>
            <span className={"pill " + (s.active ? "pill-active" : "pill-cancel")}>
              {s.active ? "Active" : "Cancelled"}
            </span>
          </div>
          <div>
            {s.active && (
              <button className="btn btn-sm btn-danger" onClick={() => onCancel(s.id)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminConsultationsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListConsultations();
      setRows(data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onConfirm = async (id) => {
    try {
      await adminConfirmConsultation(id);
      load();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed");
    }
  };

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this consultation?")) return;
    try {
      await adminCancelConsultation(id);
      load();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="muted">Loading consultations…</div>;
  if (error) return <div className="warning">{error}</div>;
  if (!rows.length) return <div className="muted">No consultations booked.</div>;

  return (
    <div className="table">
      <div className="thead">
        <div>User</div>
        <div>Topic</div>
        <div>Date</div>
        <div>Status</div>
        <div></div>
      </div>
      {rows.map((c) => (
        <div className="trow" key={c.id}>
          <div>{c.user_email}</div>
          <div>{c.topic}</div>
          <div>{c.preferred_date}</div>
          <div>
            <span className={"pill " + (c.status || "pending").toLowerCase().replace(/\s+/g, "-")}>
              {c.status}
            </span>
          </div>
          <div className="row gap">
            {c.status !== "Confirmed" && (
              <button className="btn btn-sm btn-primary" onClick={() => onConfirm(c.id)}>
                Confirm
              </button>
            )}
            {c.status !== "Cancelled" && (
              <button className="btn btn-sm btn-danger" onClick={() => onCancel(c.id)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminCorporateTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminListCorporate();
      setRows(data || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminUpdateCorporate(id, { status, admin_notes: notes[id] || "" });
      setNotes((n) => ({ ...n, [id]: "" }));
      load();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="muted">Loading corporate quotes…</div>;
  if (error) return <div className="warning">{error}</div>;
  if (!rows.length) return <div className="muted">No corporate quotes yet.</div>;

  return (
    <div className="stack">
      {rows.map((q) => (
        <div className="card" key={q.id}>
          <div className="row spread">
            <div>
              <strong>{q.company_name}</strong> — {q.user_email}
            </div>
            <div>
              <span className={"pill " + (q.status || "pending").toLowerCase()}>
                {q.status}
              </span>
            </div>
          </div>
          <div className="muted small">
            {q.quantity} units · budget ৳{q.budget} · event {q.event_date || "n/a"}
          </div>
          <div className="small">{q.message}</div>
          <div className="small">
            <em>Admin notes:</em> {q.admin_notes || <span className="muted">none</span>}
          </div>
          <div className="row gap" style={{ marginTop: 8 }}>
            <input
              className="input"
              placeholder="Notes (optional)"
              value={notes[q.id] || ""}
              onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
            />
            {q.status === "Pending" && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(q.id, "Quoted")}>
                  Mark Quoted
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => updateStatus(q.id, "Cancelled")}>
                  Reject
                </button>
              </>
            )}
            {q.status === "Quoted" && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(q.id, "Accepted")}>
                  Accept
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(q.id, "Delivered")}>
                  Mark Delivered
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ Products Tab ============
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    API.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/products/${p.ID}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div>
      <div className="row mt-16 mb-16">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + New Product
        </button>
        <span className="spacer" />
        <span className="muted" style={{ fontSize: 13 }}>
          {products.length} product{products.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading && (
        <div className="empty">
          <div className="emoji">🌱</div>
          <h3>Loading products…</h3>
        </div>
      )}
      {error && (
        <div className="warning">Couldn't load products: {error}</div>
      )}

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
        />
      )}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.ID}>
                  <td>#{p.ID}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-h)" }}>
                    {p.name}
                  </td>
                  <td>
                    <span className="tag">{p.category}</span>
                  </td>
                  <td>৳{Number(p.price).toLocaleString()}</td>
                  <td>
                    <span
                      style={{
                        color:
                          p.stock === 0
                            ? "var(--rose)"
                            : p.stock < 5
                            ? "var(--warning)"
                            : "var(--leaf-700)",
                        fontWeight: 700,
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginLeft: 6 }}
                      onClick={() => handleDelete(p)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty" style={{ padding: 24 }}>
                      <div className="emoji">🌱</div>
                      <h3>No products yet</h3>
                      <p>Click “New Product” to add the first one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ Product Form ============
function ProductForm({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "plant");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [description, setDescription] = useState(initial?.description || "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      description,
      image_url: imageUrl,
    };
    try {
      if (isEdit) {
        await API.put(`/products/${initial.ID}`, body);
      } else {
        await API.post("/products/", body);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3>{isEdit ? "Edit Product" : "New Product"}</h3>
        <p className="form-note mb-16">
          {isEdit
            ? "Update this product's details."
            : "Add a new plant or decor item to your shop."}
        </p>

        <div className="auth-form">
          <div>
            <label className="field-label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="plant">plant</option>
              <option value="decor">decor</option>
              <option value="care">care</option>
            </select>
          </div>
          <div className="row gap-12">
            <div style={{ flex: 1 }}>
              <label className="field-label">Price (৳)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Stock</label>
              <input
                className="input"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Image URL</label>
            <input
              className="input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="row gap-8 mt-8">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <span className="spacer" />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
            >
              {busy ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ============ Orders Tab ============
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (order, newStatus) => {
    try {
      await updateOrderStatus(order.ID, newStatus);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const remove = async (order) => {
    if (!window.confirm(`Delete order #${order.ID}?`)) return;
    try {
      await deleteOrder(order.ID);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete order");
    }
  };

  return (
    <div>
      {loading && (
        <div className="empty">
          <div className="emoji">📋</div>
          <h3>Loading orders…</h3>
        </div>
      )}
      {error && <div className="warning">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.ID}>
                  <td style={{ fontWeight: 600 }}>#{o.ID}</td>
                  <td>User #{o.user_id}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="stack gap-4">
                      {(o.items || []).map((it) => (
                        <div key={it.id} style={{ fontSize: 13 }}>
                          {it.product?.name || `#${it.product_id}`}{" "}
                          <span className="muted">× {it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ৳{Number(o.total_price).toFixed(2)}
                  </td>
                  <td>
                    <select
                      className="select"
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value)}
                      style={{ padding: "6px 10px", fontSize: 13 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(o)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty" style={{ padding: 24 }}>
                      <div className="emoji">📭</div>
                      <h3>No orders yet</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// ============ Dashboard Tab ============
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics()
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="empty"><div className="emoji">📊</div><h3>Loading analytics…</h3></div>;
  if (error) return <div className="warning">{error}</div>;
  if (!stats) return null;

  const tiles = [
    { label: "Total revenue", value: `৳${Number(stats.revenue || 0).toFixed(2)}`, emoji: "💰" },
    { label: "Total orders", value: stats.total_orders, emoji: "📦" },
    { label: "Customers", value: stats.total_users, emoji: "👥" },
    { label: "Products", value: stats.total_products, emoji: "🌿" },
    { label: "Open reminders", value: stats.total_reminders, emoji: "⏰" },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 12,
        }}
      >
        {tiles.map((t) => (
          <div key={t.label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{t.emoji}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{t.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{t.value}</div>
          </div>
        ))}
      </div>

      <div className="row mt-24" style={{ alignItems: "stretch" }}>
        <div className="card" style={{ flex: 1, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Top-selling products</h3>
          {(stats.top_products || []).length === 0 && <p className="muted">No sales yet.</p>}
          {(stats.top_products || []).map((p, i) => (
            <div key={p.product_id} className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--leaf-100)" }}>
              <span style={{ width: 24, color: "var(--leaf-700)", fontWeight: 700 }}>#{i + 1}</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span className="muted">{p.sold} sold</span>
              <span style={{ minWidth: 80, textAlign: "right", fontWeight: 600 }}>
                ৳{Number(p.revenue).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        <div className="card" style={{ flex: 1, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Orders by status</h3>
          {(stats.orders_by_status || []).length === 0 && <p className="muted">No orders yet.</p>}
          {(stats.orders_by_status || []).map((s) => (
            <div key={s.status} className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--leaf-100)" }}>
              <span className="status-pill">{s.status}</span>
              <span className="spacer" />
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Coupons Tab ============
function CouponsTab() {
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [minOrderTotal, setMinOrderTotal] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await createCoupon({
        code: code.toUpperCase(),
        discount_percent: parseFloat(discountPercent),
        min_order_total: parseFloat(minOrderTotal),
        expires_at: expiresAt,
        active: true,
      });
      setMsg("✓ Coupon created");
      setCode("");
      setDiscountPercent(10);
      setMinOrderTotal(0);
      setExpiresAt("");
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mt-16" style={{ maxWidth: 480, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Create coupon</h3>
      <form className="auth-form" onSubmit={submit}>
        <div>
          <label className="field-label">Code</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="e.g. SPRING10" />
        </div>
        <div>
          <label className="field-label">Discount %</label>
          <input className="input" type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Minimum order ৳ (0 = none)</label>
          <input className="input" type="number" min="0" value={minOrderTotal} onChange={(e) => setMinOrderTotal(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Expires (YYYY-MM-DD, blank = never)</label>
          <input className="input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Saving…" : "Create coupon"}
        </button>
        {msg && <p style={{ color: msg.startsWith("✓") ? "var(--leaf-700)" : "var(--rose)" }}>{msg}</p>}
      </form>
    </div>
  );
}
