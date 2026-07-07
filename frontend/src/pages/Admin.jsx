import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import {
  getAllOrders,
  createAdminOrder,
  updateOrderStatus,
  deleteOrder,
  getAnalytics,
  getAllUsers,
  updateUserRole,
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
import {
  getAnalyticsSummary,
  getTopCustomers,
  getInventoryReport,
  getTrafficReport,
  getCategoryRevenue,
} from "../api/analytics";
import { exportProductsCSV, importProductsCSV } from "../api/csv";
import { exportBackup, importBackup } from "../api/backup";
import {
  getBlogPosts,
  createBlogPost,
  deleteBlogPost,
  getBlogCategories,
} from "../api/blog";
import { listProductReviews, deleteReview as adminDeleteReview } from "../api/reviews";
import {
  listCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../api/categories";
import { useToast } from "../components/Toast";

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
        <button
          role="tab"
          className={"tab" + (tab === "blog" ? " is-active" : "")}
          onClick={() => setTab("blog")}
        >
          📚 Blog
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "csv" ? " is-active" : "")}
          onClick={() => setTab("csv")}
        >
          ⇋ CSV
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "backup" ? " is-active" : "")}
          onClick={() => setTab("backup")}
        >
          💾 Backup
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "roles" ? " is-active" : "")}
          onClick={() => setTab("roles")}
        >
          👥 Roles
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "returns" ? " is-active" : "")}
          onClick={() => setTab("returns")}
        >
          ↩ Returns
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "reviews" ? " is-active" : "")}
          onClick={() => setTab("reviews")}
        >
          ★ Reviews
        </button>
        <button
          role="tab"
          className={"tab" + (tab === "categories" ? " is-active" : "")}
          onClick={() => setTab("categories")}
        >
          🗂 Categories
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
      {tab === "blog" && <BlogCMS />}
      {tab === "csv" && <CSVTools />}
      {tab === "backup" && <BackupTools />}
      {tab === "roles" && <RolesAdmin />}
      {tab === "returns" && <ReturnsAdmin />}
      {tab === "reviews" && <ReviewsAdmin />}
      {tab === "categories" && <CategoriesAdmin />}
    </div>
  );
}

// ============ Blog CMS Tab ============
function BlogCMS() {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    slug: "",
    category_id: "",
    cover_emoji: "🌿",
    excerpt: "",
    read_min: 3,
    status: "published",
  });
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getBlogPosts(), getBlogCategories()])
      .then(([p, c]) => {
        setPosts(p.data?.posts || p.data?.items || []);
        setCats(c.data?.categories || c.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createBlogPost({
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        read_min: Number(form.read_min) || 3,
      });
      toast.ok("Post published");
      setShowForm(false);
      setForm({
        title: "",
        body: "",
        slug: "",
        category_id: "",
        cover_emoji: "🌿",
        excerpt: "",
        read_min: 3,
        status: "published",
      });
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteBlogPost(id);
      toast.ok("Deleted");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div>
      <div className="row mb-16">
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "➕ New post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card card-pad-lg mb-16">
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input"
              placeholder="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              style={{ flex: 2 }}
            />
            <input
              className="input"
              placeholder="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
          <textarea
            className="input mt-8"
            rows={5}
            placeholder="Body (markdown-ish) *"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
            style={{ resize: "vertical" }}
          />
          <input
            className="input mt-8"
            placeholder="Short excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
          <div className="row mt-8" style={{ gap: 8 }}>
            <select
              className="input"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              style={{ flex: 1 }}
            >
              <option value="">— category —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              value={form.cover_emoji}
              onChange={(e) => setForm({ ...form, cover_emoji: e.target.value })}
              maxLength={4}
              style={{ width: 80 }}
              placeholder="🌿"
            />
            <input
              className="input"
              type="number"
              min="1"
              value={form.read_min}
              onChange={(e) => setForm({ ...form, read_min: e.target.value })}
              style={{ width: 110 }}
            />
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ width: 140 }}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <button className="btn btn-primary mt-8" disabled={busy}>
            {busy ? "Saving…" : "Publish"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="muted">Loading…</div>
      ) : (
        <div className="table">
          {posts.length === 0 ? (
            <div className="muted">No posts yet.</div>
          ) : (
            posts.map((p) => (
              <div
                key={p.id ?? p.ID}
                className="row-card"
                style={{ borderRadius: 0, borderBottom: "1px solid var(--leaf-100)" }}
              >
                <span style={{ fontSize: 28 }}>{p.cover_emoji || "🌿"}</span>
                <div style={{ flex: 1 }}>
                  <strong>{p.title}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {p.category_name || "—"} · {p.status}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id ?? p.ID)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============ CSV Tools Tab ============
function CSVTools() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    setBusy(true);
    try {
      const blob = await exportProductsCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.ok("CSV downloaded");
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await importProductsCSV(file);
      toast.ok("Products imported — reload admin to see updates");
    } catch (e) {
      toast.err(e?.response?.data?.error || "Import failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="card card-pad-lg" style={{ maxWidth: 540 }}>
      <h3 style={{ marginTop: 0 }}>CSV import / export</h3>
      <p className="muted">
        Bulk-update products by exporting current stock, editing in any
        spreadsheet, then importing back.
      </p>
      <div className="row gap-8 mt-16" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-secondary" disabled={busy} onClick={onExport}>
          ⬇ Export products.csv
        </button>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          ⬆ Import CSV
        </button>
        <input
          type="file"
          accept=".csv"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={onImport}
        />
      </div>
    </div>
  );
}

// ============ Backup Tools Tab ============
function BackupTools() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onBackup = async () => {
    setBusy(true);
    try {
      const blob = await exportBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `katherbox-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      toast.ok("Backup downloaded");
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Restore from this backup? Existing data may be overwritten.")) {
      e.target.value = "";
      return;
    }
    setBusy(true);
    try {
      await importBackup(file);
      toast.ok("Backup restored — refresh to see changes");
    } catch (e) {
      toast.err(e?.response?.data?.error || "Restore failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="card card-pad-lg" style={{ maxWidth: 540 }}>
      <h3 style={{ marginTop: 0 }}>Backup &amp; restore</h3>
      <p className="muted">
        Download a full JSON snapshot of all data, or restore from a previous
        backup. Store backups offline for safety.
      </p>
      <div className="row gap-8 mt-16" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-secondary" disabled={busy} onClick={onBackup}>
          💾 Download backup
        </button>
        <button
          className="btn btn-danger"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          ⬆ Restore from JSON
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={onRestore}
        />
      </div>
    </div>
  );
}

// ============ Roles Tab ============
function RolesAdmin() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    getAllUsers()
      .then((r) => {
        setUsers(r.data?.items || r.data?.users || []);
        setLoading(false);
      })
      .catch((e) => {
        toast.err(e?.response?.data?.error || "Failed to load users");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const onRoleChange = async (u, role) => {
    try {
      await updateUserRole(u.id ?? u.ID, role);
      toast.ok(`${u.name} → ${role}`);
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  const filtered = users.filter((u) =>
    !search ||
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="input mb-16"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 360 }}
      />
      {loading ? (
        <div className="muted">Loading…</div>
      ) : (
        <div className="table">
          {filtered.length === 0 ? (
            <div className="muted">No users.</div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id ?? u.ID}
                className="row-card"
                style={{
                  borderRadius: 0,
                  borderBottom: "1px solid var(--leaf-100)",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "var(--leaf-100)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {(u.name || "?").charAt(0).toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{u.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {u.email}
                  </div>
                </div>
                <select
                  className="input"
                  value={u.role || "customer"}
                  onChange={(e) => onRoleChange(u, e.target.value)}
                  style={{ width: 160 }}
                >
                  <option value="customer">customer</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============ Returns Admin Tab ============
function ReturnsAdmin() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("returns");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    import("../api/orderExt").then((m) =>
      m.getReturns().then((r) => {
        const d = r.data;
        setRows(Array.isArray(d) ? d : d?.returns || d?.items || []);
        setLoading(false);
      })
    );
  };

  useEffect(load, []);

  const onUpdate = async (id, status) => {
    const m = await import("../api/orderExt");
    try {
      await m.updateReturnStatus(id, status);
      toast.ok(`${status}`);
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    }
  };

  if (loading) return <div className="muted">Loading…</div>;

  return (
    <div>
      <p className="muted">
        Approve, reject, or refund incoming return / refund / exchange requests.
      </p>
      {rows.length === 0 ? (
        <div className="muted">No pending requests.</div>
      ) : (
        <div className="table">
          {rows.map((r) => (
            <div
              key={r.id ?? r.ID}
              className="card card-pad mb-8"
            >
              <div className="row">
                <strong>
                  #{r.order_id ?? r.ID} · {r.type || "return"}
                </strong>
                <span className="tag tag-leaf">{r.status}</span>
              </div>
              <p style={{ margin: "6px 0" }}>{r.reason || r.details}</p>
              <div className="row" style={{ gap: 6, marginTop: 6 }}>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => onUpdate(r.id ?? r.ID, "approved")}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger btn-xs"
                  onClick={() => onUpdate(r.id ?? r.ID, "rejected")}
                >
                  Reject
                </button>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => onUpdate(r.id ?? r.ID, "refunded")}
                >
                  Mark refunded
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
      setRows(Array.isArray(data) ? data : data?.items || []);
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
        <div className="trow" key={r.id ?? r.ID}>
          <div>{r.user_email || `#${r.user_id}`}</div>
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
              <button className="btn btn-sm btn-primary" onClick={() => onComplete(r.id ?? r.ID)}>
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
      setRows(Array.isArray(data) ? data : data?.items || []);
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
        <div className="trow" key={s.id ?? s.ID}>
          <div>{s.user_email || `#${s.user_id}`}</div>
          <div>{s.plan_name || s.plan || "-"}</div>
          <div>every {s.interval_days}d</div>
          <div>{s.next_delivery || "-"}</div>
          <div>
            <span className={"pill " + (s.status === "active" ? "pill-active" : "pill-cancel")}>
              {s.status || "—"}
            </span>
          </div>
          <div>
            {s.status === "active" && (
              <button className="btn btn-sm btn-danger" onClick={() => onCancel(s.id ?? s.ID)}>
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
      setRows(Array.isArray(data) ? data : data?.items || []);
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
        <div>Expert</div>
        <div>Topic</div>
        <div>Date</div>
        <div>Status</div>
        <div></div>
      </div>
      {rows.map((c) => (
        <div className="trow" key={c.id ?? c.ID}>
          <div>{c.user_email || `#${c.user_id}`}</div>
          <div>{c.expert_name || "-"}</div>
          <div>{c.topic || "-"}</div>
          <div>{c.scheduled_at || c.preferred_date || "-"}</div>
          <div>
            <span className={"pill " + (c.status || "pending").toLowerCase().replace(/\s+/g, "-")}>
              {c.status || "—"}
            </span>
          </div>
          <div className="row gap">
            {c.status !== "Confirmed" && c.status !== "confirmed" && c.status !== "completed" && (
              <button className="btn btn-sm btn-primary" onClick={() => onConfirm(c.id ?? c.ID)}>
                Confirm
              </button>
            )}
            {c.status !== "Cancelled" && c.status !== "cancelled" && (
              <button className="btn btn-sm btn-danger" onClick={() => onCancel(c.id ?? c.ID)}>
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
      setRows(Array.isArray(data) ? data : data?.items || []);
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
      {rows.map((q) => {
        const status = (q.status || "pending").toLowerCase();
        let recipients = [];
        try { recipients = JSON.parse(q.recipients || "[]"); } catch (_) {}
        return (
          <div className="card" key={q.id ?? q.ID}>
            <div className="row spread">
              <div>
                <strong>{q.company_name || "(no company)"}</strong> — {q.contact_name || q.contact_email || q.user_email || `#${q.user_id}`}
              </div>
              <div>
                <span className={"pill " + status}>
                  {q.status}
                </span>
              </div>
            </div>
            <div className="muted small">
              {recipients.length} recipients · ৳{q.budget_per_gift || 0}/gift · total ৳{q.total_estimate || 0}
            </div>
            <div className="small">{q.message || <span className="muted">No message</span>}</div>
            <div className="small">
              <em>Admin notes:</em> {q.admin_notes || <span className="muted">none</span>}
            </div>
            <div className="row gap" style={{ marginTop: 8 }}>
              <input
                className="input"
                placeholder="Notes (optional)"
                value={notes[q.id ?? q.ID] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [q.id ?? q.ID]: e.target.value }))}
              />
              {status === "pending" && (
                <>
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(q.id ?? q.ID, "quoted")}>
                    Mark Quoted
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => updateStatus(q.id ?? q.ID, "cancelled")}>
                    Reject
                  </button>
                </>
              )}
              {status === "quoted" && (
                <>
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(q.id ?? q.ID, "accepted")}>
                    Accept
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(q.id ?? q.ID, "delivered")}>
                    Mark Delivered
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
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
      .then((res) => setProducts(res.data?.items || []))
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const userById = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(u.id ?? u.ID, u));
    return m;
  }, [users]);

  const load = () => {
    setLoading(true);
    Promise.all([getAllOrders(), getAllUsers().catch(() => ({ data: { items: [] } }))])
      .then(([ordersRes, usersRes]) => {
        setOrders(ordersRes.data || []);
        // /api/admin/users returns { items: [...] }; some endpoints return a bare array.
        const u = usersRes.data;
        setUsers(Array.isArray(u) ? u : u?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
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
    if (!window.confirm(`Delete order #${order.ID}? Stock will be restored.`)) return;
    try {
      await deleteOrder(order.ID);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete order");
    }
  };

  const userLabel = (uid) => {
    const u = userById.get(uid);
    if (!u) return `User #${uid}`;
    return `${u.name} (${u.email})`;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      if (String(o.ID).includes(q)) return true;
      if (String(o.user_id).includes(q)) return true;
      if (userLabel(o.user_id).toLowerCase().includes(q)) return true;
      if (o.status?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [orders, search, statusFilter, users]);

  return (
    <div>
      <div className="row mt-16 mb-16 gap-8" style={{ flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Order
        </button>
        <input
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Search by #id, user, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          style={{ maxWidth: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="spacer" />
        <span className="muted" style={{ fontSize: 13 }}>
          {filtered.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading && (
        <div className="empty">
          <div className="emoji">📋</div>
          <h3>Loading orders…</h3>
        </div>
      )}
      {error && <div className="warning">{error}</div>}

      {showForm && (
        <OrderForm
          users={users}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

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
              {filtered.map((o) => (
                <tr key={o.ID}>
                  <td style={{ fontWeight: 600 }}>#{o.ID}</td>
                  <td>{userLabel(o.user_id)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="stack gap-4">
                      {(o.items || []).map((it) => (
                        <div key={it.id ?? it.ID} style={{ fontSize: 13 }}>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty" style={{ padding: 24 }}>
                      <div className="emoji">📭</div>
                      <h3>No orders match your filters</h3>
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

// ============ New Order (admin) modal ============
function OrderForm({ users, onClose, onSaved }) {
  const firstId = users[0]?.id ?? users[0]?.ID;
  const [userId, setUserId] = useState(firstId ? String(firstId) : "");
  const [status, setStatus] = useState("Pending");
  const [giftWrap, setGiftWrap] = useState(false);
  const [productOpts, setProductOpts] = useState([]);
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Pull product catalog so admin can pick items.
  useEffect(() => {
    API.get("/products/?limit=200&sort=newest")
      .then((res) => setProductOpts(res.data?.items || []))
      .catch(() => setProductOpts([]));
  }, []);

  // If users list loads after the form mounts, default the picker to the first one.
  useEffect(() => {
    if (!userId && users.length) {
      const first = users[0];
      setUserId(String(first.id ?? first.ID));
    }
  }, [users, userId]);

  const updateLine = (i, patch) =>
    setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const addLine = () =>
    setLines([...lines, { product_id: "", quantity: 1 }]);

  const removeLine = (i) =>
    setLines(lines.length > 1 ? lines.filter((_, idx) => idx !== i) : lines);

  const computedTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const p = productOpts.find((x) => String(x.ID) === String(l.product_id));
      const price = p ? Number(p.price) : 0;
      const qty = Number(l.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [lines, productOpts]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("Please pick a user.");
      return;
    }
    const cleaned = lines
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
      }))
      .filter((l) => l.product_id > 0 && l.quantity > 0);
    if (cleaned.length === 0) {
      setError("Add at least one product line with a quantity.");
      return;
    }

    setBusy(true);
    try {
      await createAdminOrder({
        user_id: Number(userId),
        status,
        gift_wrap: giftWrap,
        items: cleaned,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create order");
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
        style={{ maxWidth: 640 }}
      >
        <h3>New Order</h3>
        <p className="form-note mb-16">
          Place an order on behalf of a user (e.g. phone / WhatsApp orders).
          Stock is decremented automatically.
        </p>

        <div className="auth-form">
          <div>
            <label className="field-label">Customer</label>
            <select
              className="select"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            >
              <option value="">— Select a user —</option>
              {users.map((u) => (
                <option key={u.id ?? u.ID} value={u.id ?? u.ID}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="row gap-12">
            <div style={{ flex: 1 }}>
              <label className="field-label">Status</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "end" }}>
              <label
                className="row gap-8"
                style={{ padding: "10px 0", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                />
                <span>🎀 Gift wrap (+৳50)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="field-label">Items</label>
            <div className="stack gap-8">
              {lines.map((l, i) => (
                <div key={i} className="row gap-8" style={{ alignItems: "center" }}>
                  <select
                    className="select"
                    style={{ flex: 1 }}
                    value={l.product_id}
                    onChange={(e) => updateLine(i, { product_id: e.target.value })}
                    required
                  >
                    <option value="">— Pick a product —</option>
                    {productOpts.map((p) => (
                      <option key={p.ID} value={p.ID}>
                        {p.name} — ৳{Number(p.price).toLocaleString()} (stock {p.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    style={{ width: 80 }}
                    value={l.quantity}
                    onChange={(e) => updateLine(i, { quantity: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    title="Remove line"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-8"
              onClick={addLine}
            >
              + Add line
            </button>
          </div>

          <div
            className="row"
            style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
          >
            <span className="muted">Estimated total</span>
            <span className="spacer" />
            <strong>৳{computedTotal.toLocaleString()}</strong>
            {giftWrap && <span className="muted"> (+৳50 wrap)</span>}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="row gap-8 mt-8">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <span className="spacer" />
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Creating…" : "Create order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
// ============ Dashboard Tab ============
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalytics().catch(() => ({ data: {} })),
      getAnalyticsSummary(days).catch(() => ({ data: null })),
      getTopCustomers(10).catch(() => ({ data: [] })),
      getInventoryReport().catch(() => ({ data: { low_stock: [] } })),
      getTrafficReport(days).catch(() => ({ data: { traffic: [] } })),
      getCategoryRevenue().catch(() => ({ data: [] })),
    ])
      .then(([s, sum, tc, inv, tr, cat]) => {
        setStats(s.data || {});
        setSummary(sum.data);
        // top-customers returns bare array
        setTopCustomers(Array.isArray(tc.data) ? tc.data : tc.data?.items || []);
        // inventory returns { low_stock: [...] }
        setInventory(Array.isArray(inv.data) ? inv.data : inv.data?.low_stock || inv.data?.items || []);
        // traffic returns { traffic: [...] }
        setTraffic(Array.isArray(tr.data) ? tr.data : tr.data?.traffic || tr.data?.series || []);
        // categories returns bare array
        setCategories(Array.isArray(cat.data) ? cat.data : cat.data?.items || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message);
        setLoading(false);
      });
  }, [days]);

  if (loading) return <div className="empty"><div className="emoji">📊</div><h3>Loading analytics…</h3></div>;
  if (error) return <div className="warning">{error}</div>;
  if (!stats) return <div className="empty"><div className="emoji">📊</div><h3>No analytics yet</h3><p>Sales and traffic data will appear once you have orders.</p></div>;

  const tiles = [
    { label: "Total revenue", value: `৳${Number(stats.revenue || 0).toFixed(2)}`, emoji: "💰" },
    { label: "Total orders", value: stats.total_orders, emoji: "📦" },
    { label: "Customers", value: stats.total_users, emoji: "👥" },
    { label: "Products", value: stats.total_products, emoji: "🌿" },
    { label: "Open reminders", value: stats.total_reminders, emoji: "⏰" },
  ];

  // ── 14-day traffic sparkline ──
  const trafficMax = Math.max(1, ...traffic.map((t) => t.page_views || t.views || 0));
  const last14 = traffic.slice(-14);
  const sparkW = 100;
  const sparkH = 36;
  const sparkPts = last14
    .map((t, i) => {
      const x = (i / Math.max(1, last14.length - 1)) * sparkW;
      const v = (t.page_views || t.views || 0) / trafficMax;
      const y = sparkH - v * sparkH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // ── Category pie (svg) ──
  const totalCat = categories.reduce((s, c) => s + Number(c.revenue || 0), 0) || 1;
  let pieAcc = 0;
  const palette = ["#5e8b56", "#d2a56b", "#7caea4", "#b08268", "#9bbc7e", "#c79968"];
  const pieSize = 140;
  const pieR = 60;
  const pieCx = pieSize / 2;
  const pieCy = pieSize / 2;
  const pieArcs = categories.map((c, i) => {
    const frac = Number(c.revenue || 0) / totalCat;
    const startA = pieAcc * Math.PI * 2 - Math.PI / 2;
    pieAcc += frac;
    const endA = pieAcc * Math.PI * 2 - Math.PI / 2;
    const x1 = pieCx + pieR * Math.cos(startA);
    const y1 = pieCy + pieR * Math.sin(startA);
    const x2 = pieCx + pieR * Math.cos(endA);
    const y2 = pieCy + pieR * Math.sin(endA);
    const large = frac > 0.5 ? 1 : 0;
    return {
      d: `M ${pieCx} ${pieCy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${pieR} ${pieR} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
      color: palette[i % palette.length],
      label: c.category,
      revenue: c.revenue,
      pct: (frac * 100).toFixed(0),
    };
  });

  return (
    <div>
      <div className="row mb-16" style={{ gap: 8, alignItems: "center" }}>
        <label className="muted">Window:</label>
        <select
          className="input"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ width: 140 }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

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

      {summary && (
        <div className="row mt-16" style={{ alignItems: "stretch", gap: 12 }}>
          <div className="card" style={{ flex: 1, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>📈 Traffic sparkline ({days}d)</h3>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              {last14.length === 0
                ? "No traffic logged yet"
                : `${last14.reduce((s, t) => s + (t.page_views || t.views || 0), 0)} page views in last 14 logged days`}
            </div>
            {last14.length > 0 ? (
              <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
                <polyline
                  points={sparkPts}
                  fill="none"
                  stroke="var(--leaf-600, #5e8b56)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {last14.map((t, i) => {
                  const x = (i / Math.max(1, last14.length - 1)) * sparkW;
                  const v = (t.page_views || t.views || 0) / trafficMax;
                  const y = sparkH - v * sparkH;
                  return <circle key={i} cx={x} cy={y} r="1.6" fill="#5e8b56" />;
                })}
              </svg>
            ) : (
              <div className="muted" style={{ height: sparkH, display: "flex", alignItems: "center" }}>
                No data
              </div>
            )}
          </div>

          <div className="card" style={{ flex: 1, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>🥧 Revenue by category</h3>
            {categories.length === 0 ? (
              <p className="muted">No sales yet.</p>
            ) : (
              <div className="row" style={{ alignItems: "center", gap: 16 }}>
                <svg width={pieSize} height={pieSize} viewBox={`0 0 ${pieSize} ${pieSize}`}>
                  {pieArcs.map((a, i) => (
                    <path key={i} d={a.d} fill={a.color}>
                      <title>{`${a.label}: ৳${Number(a.revenue).toFixed(0)} (${a.pct}%)`}</title>
                    </path>
                  ))}
                  <circle cx={pieCx} cy={pieCy} r={pieR * 0.55} fill="white" />
                </svg>
                <div style={{ flex: 1 }}>
                  {pieArcs.map((a, i) => (
                    <div key={i} className="row" style={{ fontSize: 13, padding: "3px 0" }}>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          background: a.color,
                          borderRadius: 3,
                          display: "inline-block",
                          marginRight: 6,
                        }}
                      />
                      <span style={{ flex: 1 }}>{a.label}</span>
                      <span className="muted">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="row mt-16" style={{ alignItems: "stretch", gap: 12, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 280, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>🏆 Top-selling products</h3>
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

        <div className="card" style={{ flex: 1, minWidth: 280, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>👑 Top customers</h3>
          {topCustomers.length === 0 ? (
            <p className="muted">No buyers yet.</p>
          ) : (
            topCustomers.map((u, i) => (
              <div
                key={u.user_id || u.email}
                className="row"
                style={{ padding: "6px 0", borderBottom: "1px solid var(--leaf-100)" }}
              >
                <span style={{ width: 24, color: "var(--leaf-700)", fontWeight: 700 }}>#{i + 1}</span>
                <span style={{ flex: 1 }}>{u.name || u.email}</span>
                <span className="muted">{u.orders ?? u.order_count ?? 0} orders</span>
                <span style={{ minWidth: 80, textAlign: "right", fontWeight: 600 }}>
                  ৳{Number(u.spent || u.total_spent || u.total_spend || 0).toFixed(0)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>⚠️ Low stock</h3>
          {inventory.length === 0 ? (
            <p className="muted">All products healthy.</p>
          ) : (
            inventory.slice(0, 8).map((p) => (
              <div
                key={p.ID || p.id}
                className="row"
                style={{ padding: "6px 0", borderBottom: "1px solid var(--leaf-100)" }}
              >
                <span style={{ flex: 1 }}>{p.name}</span>
                <span
                  style={{
                    color: p.stock === 0 ? "var(--rose)" : "var(--warning)",
                    fontWeight: 700,
                  }}
                >
                  {p.stock} left
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card mt-16" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>📦 Orders by status</h3>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          {(stats.orders_by_status || []).length === 0 && <p className="muted">No orders yet.</p>}
          {(stats.orders_by_status || []).map((s) => (
            <span key={s.status} className="status-pill" style={{ fontSize: 14 }}>
              {s.status} <strong>· {s.count}</strong>
            </span>
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

// ============ Reviews Admin Tab ============
function ReviewsAdmin() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [hint, setHint] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  const load = () => {
    if (!productId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listProductReviews(productId)
      .then((res) => {
        const data = res.data || {};
        setRows(data.reviews || []);
        setHint(`${data.count || 0} reviews · avg ${Number(data.avg || 0).toFixed(2)}`);
        setLoading(false);
      })
      .catch((err) => {
        toast.err(err?.response?.data?.error || "Failed to load");
        setLoading(false);
      });
  };

  // Auto-pick the first product on mount so the tab isn't empty by default.
  useEffect(() => {
    if (autoFilled) return;
    API.get("/products/?limit=1")
      .then((res) => {
        const first = (res.data?.items || [])[0] || (res.data?.products || [])[0];
        const pid = first?.id ?? first?.ID;
        if (pid) {
          setProductId(String(pid));
          setAutoFilled(true);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoFilled) return; // wait for autofill
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, autoFilled]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminDeleteReview(id);
      toast.ok("Deleted");
      load();
    } catch (e) {
      toast.err(e?.response?.data?.error || "Failed");
    }
  };

  return (
    <div>
      <div className="row mb-16" style={{ gap: 8, alignItems: "center" }}>
        <input
          className="input"
          type="number"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{ width: 160 }}
        />
        <button className="btn btn-secondary" onClick={load} disabled={!productId}>
          Load
        </button>
        {hint && <span className="muted">{hint}</span>}
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : !productId ? (
        <div className="muted">Enter a product ID to view its reviews.</div>
      ) : rows.length === 0 ? (
        <div className="muted">No reviews for this product.</div>
      ) : (
        <div className="table">
          <div className="thead">
            <div>User</div>
            <div>Rating</div>
            <div>Comment</div>
            <div>Date</div>
            <div></div>
          </div>
          {rows.map((r) => (
            <div className="trow" key={r.id ?? r.ID}>
              <div>{r.user_name || `#${r.user_id}`}</div>
              <div>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              <div style={{ maxWidth: 340 }}>{r.comment || <span className="muted">—</span>}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(r.created_at).toLocaleDateString()}
              </div>
              <div>
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(r.id ?? r.ID)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Categories Admin Tab ============
function CategoriesAdmin() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", parent: "", icon: "🌿", position: 0, active: true });

  const load = () => {
    setLoading(true);
    listCategories()
      .then((res) => {
        setRows(res.data || []);
        setLoading(false);
      })
      .catch((e) => {
        toast.err(e?.response?.data?.error || "Failed to load");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", parent: "", icon: "🌿", position: rows.length, active: true });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      parent: c.parent || "",
      icon: c.icon || "🌿",
      position: c.position || 0,
      active: !!c.active,
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent: form.parent,
        icon: form.icon,
        position: Number(form.position) || 0,
        active: !!form.active,
      };
      if (editing) {
        await adminUpdateCategory(editing.id ?? editing.ID, payload);
        toast.ok("Category updated");
      } else {
        await adminCreateCategory(payload);
        toast.ok("Category created");
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.err(err?.response?.data?.error || err.message);
    }
  };

  const onDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminDeleteCategory(c.id ?? c.ID);
      toast.ok("Deleted");
      load();
    } catch (err) {
      toast.err(err?.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <div className="row mb-16">
        <button className="btn btn-primary" onClick={openNew}>
          + New category
        </button>
        <span className="spacer" />
        <span className="muted" style={{ fontSize: 13 }}>
          {rows.length} categor{rows.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card card-pad-lg mb-16">
          <h3 style={{ marginTop: 0 }}>{editing ? "Edit category" : "New category"}</h3>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ flex: 2, minWidth: 180 }}
            />
            <input
              className="input"
              placeholder="slug (auto if blank)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={{ flex: 1, minWidth: 140 }}
            />
            <input
              className="input"
              placeholder="parent slug (optional)"
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              style={{ flex: 1, minWidth: 160 }}
            />
            <input
              className="input"
              placeholder="🌿"
              maxLength={4}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              style={{ width: 80 }}
            />
            <input
              className="input"
              type="number"
              min="0"
              placeholder="pos"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              style={{ width: 90 }}
            />
            <label className="row" style={{ gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>
          <div className="row mt-8" style={{ gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              {editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="muted">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="muted">No categories yet. Click "New category" to add one.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Pos</th>
                <th>Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id ?? c.ID}>
                  <td style={{ fontSize: 22 }}>{c.icon || "📁"}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><code>{c.slug}</code></td>
                  <td>{c.parent || <span className="muted">—</span>}</td>
                  <td>{c.position}</td>
                  <td>
                    {c.active ? (
                      <span className="pill pill-active">Active</span>
                    ) : (
                      <span className="pill pill-cancel">Off</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: 6 }} onClick={() => onDelete(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
