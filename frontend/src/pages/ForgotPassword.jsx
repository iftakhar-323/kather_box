import { useState } from "react";
import { forgotPassword } from "../api/auth";

// =====================================================================
// ForgotPassword.jsx
// Step 1 of the reset flow: user enters email, backend generates a
// 6-digit token (logged to server console in dev). We surface it here
// in dev mode so the user can use it on the next screen without
// needing email infrastructure.
// =====================================================================

export default function ForgotPassword({ onSwitchToLogin, onSwitchToReset }) {
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
      setErr(e2.response?.data?.error || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot password</h2>
        <p className="auth-sub">
          Enter your email and we'll generate a 6-digit reset code.
        </p>

        {sent ? (
          <div className="forgot-sent">
            <div className="forgot-check">✓</div>
            <p>If <strong>{email}</strong> is registered, a reset code has been generated.</p>
            {devToken && (
              <div className="forgot-devbox">
                <strong>Dev mode token:</strong>{" "}
                <code className="forgot-token">{devToken}</code>
                <p className="forgot-devhint">
                  (In production this would arrive by email. For now it's also in the server console.)
                </p>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => onSwitchToReset(email, devToken)}
            >
              Enter code & set new password →
            </button>
            <button className="btn btn-ghost" onClick={onSwitchToLogin}>
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label className="profile-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </label>
            {err && <div className="auth-err">{err}</div>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending…" : "Send reset code"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onSwitchToLogin}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </section>
  );
}