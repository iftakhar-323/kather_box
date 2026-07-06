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
import { useTranslation } from "../i18n/I18nProvider";

// =====================================================================
// Profile.jsx — Sprint A
// One page, four tabs:
//   1. Edit Profile    (name, phone, address)
//   2. Change Password (current + new)
//   3. Address Book    (CRUD with default toggle)
//   4. Delete Account  (irreversible, password confirmation)
// =====================================================================

export default function Profile({ onExit }) {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [toast, setToast] = useState(null);

  const TABS = [
    { key: "profile",  label: t("profile.tabs.profile") },
    { key: "password", label: t("profile.tabs.password") },
    { key: "addresses", label: t("profile.tabs.addresses") },
    { key: "danger",   label: t("profile.tabs.danger") },
  ];

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <section className="profile-page">
      <header className="profile-head">
        <div>
          <h1 className="profile-title">{t("profile.title")}</h1>
          <p className="profile-sub">
            {t("profile.signedInAs", { email: user?.email })}
          </p>
        </div>
        {onExit && (
          <button className="btn btn-secondary btn-sm" onClick={onExit}>
            {t("profile.backToShop")}
          </button>
        )}
      </header>

      <nav className="profile-tabs" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            className={"profile-tab" + (tab === tb.key ? " is-active" : "")}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
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
  const { t } = useTranslation();
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
      onSaved(t("profile.nameRequired"), "error");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      onSaved(t("profile.savedOk"));
    } catch (err) {
      onSaved(err.response?.data?.error || t("profile.failedUpdate"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>{t("profile.editProfile")}</h3>
      <p className="profile-hint">{t("profile.editHint")}</p>

      <label className="profile-field">
        <span>{t("profile.name")}</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      <label className="profile-field">
        <span>{t("profile.phone")}</span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder={t("profile.phonePlaceholder")}
        />
      </label>

      <label className="profile-field">
        <span>{t("profile.addressLegacy")}</span>
        <textarea
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder={t("profile.addressLegacyHint")}
        />
      </label>

      <div className="profile-actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? t("profile.saving") : t("profile.saveChanges")}
        </button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 2 — Change Password
// =====================================================================
function ChangePasswordTab({ onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) return onSaved(t("profile.passwordTooShort"), "error");
    if (form.next !== form.confirm) return onSaved(t("profile.passwordsMismatch"), "error");
    setSaving(true);
    try {
      await changePassword({
        current_password: form.current,
        new_password: form.next,
      });
      onSaved(t("profile.passwordChanged"));
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      onSaved(err.response?.data?.error || t("profile.passwordChangeFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>{t("profile.changePassword")}</h3>
      <p className="profile-hint">{t("profile.changePasswordHint")}</p>

      <label className="profile-field">
        <span>{t("profile.currentPassword")}</span>
        <input
          type="password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
          required
          autoComplete="current-password"
        />
      </label>

      <label className="profile-field">
        <span>{t("profile.newPassword")}</span>
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
        <span>{t("profile.confirmNewPassword")}</span>
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
          {saving ? t("profile.updating") : t("profile.updatePassword")}
        </button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 3 — Address Book
// =====================================================================
function blankAddress(t) {
  return {
    label: t("profile.labelPlaceholder").split(",")[0] || "Home",
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
}

function AddressBookTab({ onSaved }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | {id, ...}

  const reload = async () => {
    setLoading(true);
    try {
      const res = await listAddresses();
      setItems(res.data.items || []);
    } catch (e) {
      onSaved(t("profile.loadAddressesFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const save = async (form) => {
    try {
      if (editing === "new") {
        await createAddress(form);
        onSaved(t("profile.addressAdded"));
      } else {
        await updateAddress(editing.id, form);
        onSaved(t("profile.addressUpdated"));
      }
      setEditing(null);
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || t("profile.saveFailed"), "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm(t("profile.deleteAddressConfirm"))) return;
    try {
      await deleteAddress(id);
      onSaved(t("profile.addressDeleted"));
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || t("profile.deleteFailed"), "error");
    }
  };

  const makeDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      onSaved(t("profile.defaultUpdated"));
      reload();
    } catch (err) {
      onSaved(err.response?.data?.error || t("profile.failedUpdate"), "error");
    }
  };

  if (editing) {
    return (
      <AddressForm
        initial={editing === "new" ? blankAddress(t) : editing}
        onCancel={() => setEditing(null)}
        onSubmit={save}
      />
    );
  }

  return (
    <div className="profile-card">
      <div className="profile-card-head">
        <h3>{t("profile.addressBook")}</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
          {t("profile.addAddress")}
        </button>
      </div>

      {loading ? (
        <p className="profile-empty">{t("profile.loading")}</p>
      ) : items.length === 0 ? (
        <p className="profile-empty">{t("profile.noAddresses")}</p>
      ) : (
        <ul className="addr-list">
          {items.map((a) => (
            <li key={a.ID} className={"addr-row" + (a.is_default ? " is-default" : "")}>
              <div className="addr-main">
                <div className="addr-line1">
                  <span className="addr-label">{a.label}</span>
                  {a.is_default && <span className="addr-default-badge">{t("profile.defaultBadge")}</span>}
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
                    {t("profile.makeDefault")}
                  </button>
                )}
                <button className="btn btn-ghost btn-xs" onClick={() => setEditing(a)}>
                  {t("profile.edit")}
                </button>
                <button className="btn btn-ghost btn-xs btn-danger-text" onClick={() => remove(a.ID)}>
                  {t("profile.delete")}
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
  const { t } = useTranslation();
  const [form, setForm] = useState({
    ...blankAddress(t),
    ...initial,
  });
  const submit = (e) => {
    e.preventDefault();
    if (!form.recipient || !form.phone || !form.line1 || !form.city) {
      alert(t("profile.requiredFieldsAlert"));
      return;
    }
    onSubmit(form);
  };

  return (
    <form className="profile-card" onSubmit={submit}>
      <h3>{initial?.ID ? t("profile.editAddress") : t("profile.newAddress")}</h3>

      <div className="profile-grid-2">
        <label className="profile-field">
          <span>{t("profile.label")}</span>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={t("profile.labelPlaceholder")}
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.country")}</span>
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.recipientName")}</span>
          <input
            type="text"
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            required
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.phoneRequired")}</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </label>
        <label className="profile-field profile-grid-full">
          <span>{t("profile.addressLine1")}</span>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            placeholder={t("profile.addressLine1Placeholder")}
            required
          />
        </label>
        <label className="profile-field profile-grid-full">
          <span>{t("profile.addressLine2")}</span>
          <input
            type="text"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            placeholder={t("profile.addressLine2Placeholder")}
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.city")}</span>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.region")}</span>
          <input
            type="text"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </label>
        <label className="profile-field">
          <span>{t("profile.postalCode")}</span>
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
          <span>{t("profile.makeDefaultCheckbox")}</span>
        </label>
      </div>

      <div className="profile-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          {t("profile.cancel")}
        </button>
        <button className="btn btn-primary">{t("profile.saveAddress")}</button>
      </div>
    </form>
  );
}

// =====================================================================
// Tab 4 — Delete Account
// =====================================================================
function DeleteAccountTab({ onDeleted, onError }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      return onError(t("profile.typeDeleteRequired"));
    }
    if (!password) return onError(t("profile.passwordRequired"));
    setBusy(true);
    try {
      await deleteAccount(password);
      onDeleted();
    } catch (err) {
      onError(err.response?.data?.error || t("profile.deleteAccountFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="profile-card profile-card-danger" onSubmit={submit}>
      <h3>{t("profile.deleteAccount")}</h3>
      <p className="profile-hint">{t("profile.deleteAccountHint")}</p>

      <label className="profile-field">
        <span>{t("profile.yourPassword")}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <label className="profile-field">
        <span>{t("profile.typeDeleteConfirm")}</span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          required
        />
      </label>

      <div className="profile-actions">
        <button className="btn btn-danger" disabled={busy}>
          {busy ? t("profile.deleting") : t("profile.deleteAccountButton")}
        </button>
      </div>
    </form>
  );
}