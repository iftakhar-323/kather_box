import { useState } from "react";
import { resetPassword } from "../api/auth";

// =====================================================================
// ResetPassword.jsx
// Step 2 of the reset flow: user enters the 6-digit code + new password.
// =====================================================================

export default function ResetPassword({ prefillEmail, prefillToken, onDone, onSwitchToLogin }) {
  const [token, setToken] = useState(prefillToken || "");
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) return setErr("Password must be at least 6 characters");
    if (password !== confirm) return setErr("Passwords don't match");
    setBusy(true);
    try {
      await resetPassword(token.trim(), password);
      onDone();
    } catch (e2) {
      setErr(e2.response?.data?.error || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset password</h2>
        <p className="auth-sub">
          Enter the 6-digit code from your email and your new password.
        </p>

        <form onSubmit={submit} className="auth-form">
          <label className="profile-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="profile-field">
            <span>6-digit reset code</span>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="123456"
              autoFocus
              className="reset-code-input"
            />
          </label>

          <label className="profile-field">
            <span>New password</span>
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
            <span>Confirm new password</span>
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
            {busy ? "Resetting…" : "Reset password"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSwitchToLogin}>
            Back to login
          </button>
        </form>
      </div>
    </section>
  );
}