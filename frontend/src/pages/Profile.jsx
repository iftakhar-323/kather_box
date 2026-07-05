import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  changePassword,
  deleteAccount,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/auth";

// =====================================================================
// Profile.jsx — Sprint A
// One page, four tabs:
//   1. Edit Profile    (name, phone, address)
//   2. Change Password (current + new)
//   3. Address Book    (CRUD with default toggle)
//   4. Delete Account  (irreversible, password confirmation)
// =====================================================================

const TABS = [
  { key: "profile",  label: "Edit Profile" },
  { key: "password", label: "Password" },
  { key: "addresses", label: "Addresses" },
  { key: "danger",   label: "Delete Account" },
];

export default function Profile({ onExit }) {
  const { user, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <section className="profile-page">
      <header className="profile-head">
        <div>
          <h1 className="profile-title">My Account</h1>
          <p className="profile-sub">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        {onExit && (
          <button className="btn btn-secondary btn-sm" onClick={onExit}>
            ← Back to shop
          </button>
        )}
      </header>

      <nav className="profile-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={"profile-tab" + (tab === t.key ? " is-active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className={`profile-toast profile-toast-${toast.type}`}>
          {toast.text}
        </div>
      )}

      {tab === "profile" && <EditProfileTab onSaved={showToast} />}
      {tab === "password" && <ChangePasswordTab onSaved={showToast} />}
      {tab === "addresses" && <AddressBookTab onSaved={showToast} />}
      {tab === "danger" && (
        <DeleteAccountTab
          onDeleted={() => {
            logout();
            if (onExit) onExit();
          }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </section>
  );
}

// =====================================================================
// Tab 1 — Edit Profile
// =====================================================================
function EditProfileTab({ onSaved }) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      onSaved("Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      onSaved("Profile updated ✓");
    } catch (err) {
      onSaved(err.response?.data?.error || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>Edit Profile</h3>
      <p className="profile-hint">
        Email and role can't be changed from here. Contact support if you need
        to change your email.
      </p>

      <label className="profile-field">
        <span>Name</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      <label className="profile-field">
        <span>Phone</span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+880 1XXX XXX XXX"
        />
      </label>

      <label className="profile-field">
        <span>Address (legacy / quick)</span>
        <textarea
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Optional — for the full address book, see the Addresses tab."
        />
      </label>

      <div className="profile-actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 2 — Change Password
// =====================================================================
function ChangePasswordTab({ onSaved }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) return onSaved("New password must be ≥ 6 chars", "error");
    if (form.next !== form.confirm) return onSaved("Passwords don't match", "error");
    setSaving(true);
    try {
      await changePassword({
        current_password: form.current,
        new_password: form.next,
      });
      onSaved("Password changed ✓");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      onSaved(err.response?.data?.error || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>Change Password</h3>
      <p className="profile-hint">You'll stay logged in on this device.</p>

      <label className="profile-field">
        <span>Current password</span>
        <input
          type="password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
          required
          autoComplete="current-password"
        />
      </label>

      <label className="profile-field">
        <span>New password</span>
        <input
          type="password"
          value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>

      <label className="profile-field">
        <span>Confirm new password</span>
        <input
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>

      <div className="profile-actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 3 — Address Book
// =====================================================================
const blankAddress = {
  label: "Home",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal_code: "",
  country: "Bangladesh",
  is_default: false,
};

function AddressBookTab({ onSaved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | {id, ...}

  const reload = async () => {
    setLoading(true);
    try {
      const res = await listAddresses();
      setItems(res.data.items || []);
    } catch (e) {
      onSaved("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const save = async (form) => {
    try {
      if (editing === "new") {
        await createAddress(form);
        onSaved("Address added ✓");
      } else {
        await updateAddress(editing.id, form);
        onSaved("Address updated ✓");
      }
      setEditing(null);
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || "Save failed", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      onSaved("Address deleted");
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || "Delete failed", "error");
    }
  };

  const makeDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      onSaved("Default address updated");
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || "Failed", "error");
    }
  };

  if (editing) {
    return (
      <AddressForm
        initial={editing === "new" ? blankAddress : editing}
        onCancel={() => setEditing(null)}
        onSubmit={save}
      />
    );
  }

  return (
    <div className="profile-card">
      <div className="profile-card-head">
        <h3>Address Book</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
          + Add address
        </button>
      </div>

      {loading ? (
        <p className="profile-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="profile-empty">
          No addresses yet — add one for faster checkout.
        </p>
      ) : (
        <ul className="addr-list">
          {items.map((a) => (
            <li key={a.ID} className={"addr-row" + (a.is_default ? " is-default" : "")}>
              <div className="addr-main">
                <div className="addr-line1">
                  <span className="addr-label">{a.label}</span>
                  {a.is_default && <span className="addr-default-badge">DEFAULT</span>}
                </div>
                <div className="addr-line2">{a.recipient} · {a.phone}</div>
                <div className="addr-line3">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}
                  {a.region ? `, ${a.region}` : ""}{a.postal_code ? ` ${a.postal_code}` : ""}
                  , {a.country}
                </div>
              </div>
              <div className="addr-actions">
                {!a.is_default && (
                  <button className="btn btn-ghost btn-xs" onClick={() => makeDefault(a.ID)}>
                    Make default
                  </button>
                )}
                <button className="btn btn-ghost btn-xs" onClick={() => setEditing(a)}>
                  Edit
                </button>
                <button className="btn btn-ghost btn-xs btn-danger-text" onClick={() => remove(a.ID)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    ...blankAddress,
    ...initial,
  });
  const submit = (e) => {
    e.preventDefault();
    if (!form.recipient || !form.phone || !form.line1 || !form.city) {
      alert("Recipient, phone, address line 1, and city are required");
      return;
    }
    onSubmit(form);
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>{initial?.ID ? "Edit address" : "New address"}</h3>

      <div className="profile-grid-2">
        <label className="profile-field">
          <span>Label</span>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Home, Office, Mom's…"
          />
        </label>
        <label className="profile-field">
          <span>Country</span>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </label>
        <label className="profile-field">
          <span>Recipient name *</span>
          <input
            type="text"
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            required
          />
        </label>
        <label className="profile-field">
          <span>Phone *</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </label>
        <label className="profile-field profile-grid-full">
          <span>Address line 1 *</span>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            placeholder="House / Road / Street"
            required
          />
        </label>
        <label className="profile-field profile-grid-full">
          <span>Address line 2</span>
          <input
            type="text"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            placeholder="Apartment / Floor (optional)"
          />
        </label>
        <label className="profile-field">
          <span>City *</span>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </label>
        <label className="profile-field">
          <span>Region / Division</span>
          <input
            type="text"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </label>
        <label className="profile-field">
          <span>Postal code</span>
          <input
            type="text"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          />
        </label>
        <label className="profile-field profile-check">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
          />
          <span>Make this my default address</span>
        </label>
      </div>

      <div className="profile-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary">Save address</button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 4 — Delete Account
// =====================================================================
function DeleteAccountTab({ onDeleted, onError }) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      return onError('Type DELETE (all caps) to confirm.');
    }
    if (!password) return onError("Enter your password.");
    setBusy(true);
    try {
      await deleteAccount(password);
      onDeleted();
    } catch (err) {
      onError(err.response?.data?.error || "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="profile-card profile-card-danger" onSubmit={submit}>
      <h3>Delete account</h3>
      <p className="profile-hint">
        This permanently removes your account, cart, wishlist, orders, addresses,
        notifications, and reminders. This cannot be undone.
      </p>

      <label className="profile-field">
        <span>Your password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <label className="profile-field">
        <span>Type <code>DELETE</code> to confirm</span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          required
        />
      </label>

      <div className="profile-actions">
        <button className="btn btn-danger" disabled={busy}>
          {busy ? "Deleting…" : "Permanently delete my account"}
        </button>
      </div>
    </form>
  );
}