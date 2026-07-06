import { useState } from "react";
import { forgotPassword } from "../api/auth";
import { useTranslation } from "../i18n/I18nProvider";

// =====================================================================
// ForgotPassword.jsx
// Step 1 of the reset flow: user enters email, backend generates a
// 6-digit token (logged to server console in dev). We surface it here
// in dev mode so the user can use it on the next screen without
// needing email infrastructure.
// =====================================================================

export default function ForgotPassword({ onSwitchToLogin, onSwitchToReset }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await forgotPassword(email.trim());
      setSent(true);
      // dev_only_token is returned by backend so the user can continue the flow
      // without email infrastructure. In production this would be hidden.
      if (res.data?.dev_only_token) {
        setDevToken(res.data.dev_only_token);
      }
    } catch (e2) {
      setErr(e2.response?.data?.error || t("forgotFlow.forgotGenericError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{t("forgotFlow.forgotTitle")}</h2>
        <p className="auth-sub">{t("forgotFlow.forgotSub")}</p>

        {sent ? (
          <div className="forgot-sent">
            <div className="forgot-check">✓</div>
            <p>{t("forgotFlow.forgotSent", { email })}</p>
            {devToken && (
              <div className="forgot-devbox">
                <strong>{t("forgotFlow.forgotDevTokenLabel")}</strong>{" "}
                <code className="forgot-token">{devToken}</code>
                <p className="forgot-devhint">{t("forgotFlow.forgotDevHint")}</p>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => onSwitchToReset(email, devToken)}
            >
              {t("forgotFlow.forgotEnterCode")}
            </button>
            <button className="btn btn-ghost" onClick={onSwitchToLogin}>
              {t("forgotFlow.forgotBackToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label className="profile-field">
              <span>{t("auth.email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                autoFocus
              />
            </label>
            {err && <div className="auth-err">{err}</div>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? t("forgotFlow.forgotSending") : t("forgotFlow.forgotSubmit")}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onSwitchToLogin}
            >
              {t("forgotFlow.forgotBackToLogin")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}