import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createCorporateQuote, getMyCorporateQuotes } from "../api/corporate";
import { useTranslation } from "../i18n/I18nProvider";

export default function Corporate() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("Happy holidays from our team!");
  const [budgetPerGift, setBudgetPerGift] = useState(1000);
  const [recipients, setRecipients] = useState([{ name: "", address: "" }]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState([]);

  const load = () => {
    getMyCorporateQuotes().then((r) => setQuotes(r.data || []));
  };
  useEffect(load, []);

  const addRow = () => setRecipients([...recipients, { name: "", address: "" }]);
  const removeRow = (i) =>
    setRecipients(recipients.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) => {
    const next = [...recipients];
    next[i] = { ...next[i], [key]: val };
    setRecipients(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await createCorporateQuote({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        message,
        budget_per_gift: parseFloat(budgetPerGift),
        recipients: JSON.stringify(recipients),
      });
      setMsg(t("corporate.submitToast", { id: res.data.ID, email: contactEmail }));
      setCompanyName("");
      setRecipients([{ name: "", address: "" }]);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>{t("corporate.loginHeading")}</h3>
        <p>{t("corporate.loginBody")}</p>
      </div>
    );
  }

  const totalEstimate = (budgetPerGift || 0) * recipients.length;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 6 }}>{t("corporate.head")}</h1>
        <p className="muted">{t("corporate.subhead")}</p>
      </div>

      {msg && <div className="card" style={{ padding: 12, color: "var(--leaf-700)", marginBottom: 12 }}>{msg}</div>}
      {error && <div className="warning">{error}</div>}

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t("corporate.formHeading")}</h3>
        <form className="auth-form" onSubmit={submit}>
          <div className="row gap-12">
            <div style={{ flex: 1 }}>
              <label className="field-label">{t("corporate.companyLabel")}</label>
              <input className="input" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">{t("corporate.contactNameLabel")}</label>
              <input className="input" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
          </div>
          <div className="row gap-12">
            <div style={{ flex: 1 }}>
              <label className="field-label">{t("corporate.emailLabel")}</label>
              <input className="input" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">{t("corporate.phoneLabel")}</label>
              <input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="field-label">{t("corporate.messageLabel")}</label>
            <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <label className="field-label">{t("corporate.budgetLabel")}</label>
            <input className="input" type="number" min="100" value={budgetPerGift} onChange={(e) => setBudgetPerGift(e.target.value)} />
          </div>

          <div>
            <label className="field-label">
              {t("corporate.recipientsLabel", { count: recipients.length })}
            </label>
            {recipients.map((r, i) => (
              <div key={i} className="row gap-8" style={{ marginBottom: 6 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder={t("corporate.recipientNamePlaceholder")}
                  required
                  value={r.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                />
                <input
                  className="input"
                  style={{ flex: 2 }}
                  placeholder={t("corporate.recipientAddressPlaceholder")}
                  required
                  value={r.address}
                  onChange={(e) => updateRow(i, "address", e.target.value)}
                />
                {recipients.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="btn btn-danger btn-sm">
                    {t("corporate.removeRecipient")}
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addRow} className="btn btn-secondary btn-sm mt-8">
              {t("corporate.addRecipient")}
            </button>
          </div>

          <div className="total-row" style={{ marginTop: 12 }}>
            <span>{t("corporate.estimatedTotal")}</span>
            <span>৳{totalEstimate.toFixed(2)}</span>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary mt-8">
            {busy ? t("corporate.submitting") : t("corporate.submitBtn")}
          </button>
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>{t("corporate.pastQuotesHeading")}</h2>
      {quotes.length === 0 && (
        <div className="empty">
          <div className="emoji">📑</div>
          <h3>{t("corporate.noQuotesHeading")}</h3>
        </div>
      )}
      {quotes.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          {quotes.map((q) => (
            <div key={q.ID} className="row-card" style={{ borderRadius: 0, borderBottom: "1px solid var(--leaf-100)" }}>
              <div className="row-icon" style={{ background: "linear-gradient(135deg,#e8f1e6,#cfe1cb)" }}>
                <span style={{ fontSize: 24 }}>🏢</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{q.company_name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {t("corporate.quoteMeta", {
                    id: q.ID,
                    amount: Number(q.total_estimate).toFixed(0),
                  })}
                </div>
              </div>
              <span className={"status-pill " + (q.status === "delivered" ? "status-delivered" : q.status === "cancelled" ? "status-cancelled" : "status-processing")}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}