import { useState } from "react";
import API from "../api/axios";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-card">
      <div className="brand">
        <span style={{ fontSize: 24 }}>🌿</span>
        <span>KatherBox</span>
      </div>
      <p className="subtitle">Welcome back — sign in to your account.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg mt-8">
          Sign in
        </button>
      </form>

      <p className="auth-foot">
        <ForgotPasswordLink />
        <br />
        <span className="muted">New to KatherBox?</span>{" "}
        <a
          onClick={onSwitch}
          style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
        >
          Create an account
        </a>
      </p>
    </div>
  );
}

function ForgotPasswordLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        style={{ color: "var(--primary)", cursor: "pointer", fontSize: 13 }}
        onClick={() => setOpen(true)}
      >
        Forgot password?
      </a>

      {open && <ForgotPasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPw, setNewPw] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = request, 2 = reset

  const requestReset = async (e) => {
    e.preventDefault();
    setInfo("");
    setError("");
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setInfo(res.data.message || "If that email exists, a token was generated.");
      if (res.data.dev_only_token) setToken(res.data.dev_only_token);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Could not request reset");
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setInfo("");
    setError("");
    try {
      const res = await API.post("/auth/reset-password", {
        token,
        new_password: newPw,
      });
      setInfo(res.data.message || "Password reset — you can log in now.");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reset your password</h3>
        <p className="form-note mb-16">
          We'll generate a token (printed to server console in development).
        </p>

        {step === 1 && (
          <form onSubmit={requestReset} className="auth-form">
            <div>
              <label className="field-label">Account email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            {info && (
              <p className="form-note" style={{ color: "var(--success)" }}>
                {info}
              </p>
            )}
            <div className="row gap-8">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <span className="spacer" />
              <button type="submit" className="btn btn-primary">
                Generate token
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitReset} className="auth-form">
            <div>
              <label className="field-label">Token</label>
              <input
                className="input"
                placeholder="Paste token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">New password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            {info && (
              <p className="form-note" style={{ color: "var(--success)" }}>
                {info}
              </p>
            )}
            <div className="row gap-8">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <span className="spacer" />
              <button type="submit" className="btn btn-primary">
                Reset password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}