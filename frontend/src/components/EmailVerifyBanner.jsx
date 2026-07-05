import { useState } from "react";
import { sendVerification, verifyEmail } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function EmailVerifyBanner({ user }) {
  const { login } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  if (!user || user.email_verified) return null;

  const request = async () => {
    setBusy(true);
    setInfo("");
    setError("");
    try {
      const res = await sendVerification();
      setOpen(true);
      setInfo(res.data?.message || "Token generated. Check the backend console.");
      if (res.data?.dev_only_token) setToken(res.data.dev_only_token);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyEmail(token);
      // refresh user in context + localStorage
      const updated = { ...user, email_verified: true };
      localStorage.setItem("user", JSON.stringify(updated));
      login(updated, localStorage.getItem("token"));
      setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: "linear-gradient(90deg, #fef3c7, #fde68a)",
          borderBottom: "1px solid #fbbf24",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 14,
        }}
      >
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span>
          Your email <strong>{user.email}</strong> isn't verified yet.
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={request} disabled={busy} className="btn btn-primary btn-sm">
          {busy ? "…" : "Verify now"}
        </button>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <form onSubmit={submit} className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Verify your email</h3>
            <p className="form-note mb-16">
              A 6-digit code has been printed to the backend console.
              Paste it here to confirm ownership of {user.email}.
            </p>
            <div className="auth-form">
              <div>
                <label className="field-label">Verification token</label>
                <input
                  className="input"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="6-digit code"
                />
              </div>
              {info && (
                <p className="form-note" style={{ color: "var(--success)" }}>
                  {info}
                </p>
              )}
              {error && <p className="form-error">{error}</p>}
              <div className="row gap-8 mt-8">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <span className="spacer" />
                <button type="submit" disabled={busy} className="btn btn-primary">
                  {busy ? "Verifying…" : "Verify email"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}