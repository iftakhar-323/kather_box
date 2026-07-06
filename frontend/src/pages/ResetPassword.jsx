import { useState } from "react";
import { resetPassword } from "../api/auth";
import { useTranslation } from "../i18n/I18nProvider";

// =====================================================================
// ResetPassword.jsx
// Step 2 of the reset flow: user enters the 6-digit code + new password.
// =====================================================================

export default function ResetPassword({ prefillEmail, prefillToken, onDone, onSwitchToLogin }) {
  const { t } = useTranslation();
  const [token, setToken] = useState(prefillToken || "");
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) return setErr(t("forgotFlow.resetTooShort"));
    if (password !== confirm) return setErr(t("forgotFlow.resetMismatch"));
    setBusy(true);
    try {
      await resetPassword(token.trim(), password);
      onDone();
    } catch (e2) {
      setErr(e2.response?.data?.error || t("forgotFlow.resetFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{t("forgotFlow.resetTitle")}</h2>
        <p className="auth-sub">{t("forgotFlow.resetSub")}</p>

        <form onSubmit={submit} className="auth-form">
          <label className="profile-field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="profile-field">
            <span>{t("forgotFlow.resetCodeLabel")}</span>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder={t("forgotFlow.resetCodePlaceholder")}
              autoFocus
              className="reset-code-input"
            />
          </label>

          <label className="profile-field">
            <span>{t("forgotFlow.resetNewPassword")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="profile-field">
            <span>{t("forgotFlow.resetConfirm")}</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </label>

          {err && <div className="auth-err">{err}</div>}

          <button className="btn btn-primary" disabled={busy}>
            {busy ? t("forgotFlow.resetting") : t("forgotFlow.resetSubmit")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSwitchToLogin}>
            {t("forgotFlow.forgotBackToLogin")}
          </button>
        </form>
      </div>
    </section>
  );
}