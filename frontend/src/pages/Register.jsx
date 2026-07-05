import { useState } from "react";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitch, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await registerUser({ name, email, password });
      login(res.data.user, res.data.token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-card">
      <div className="brand">
        <span style={{ fontSize: 24 }}>🌿</span>
        <span>KatherBox</span>
      </div>
      <p className="subtitle">Create an account and start growing.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="field-label">Full name</label>
          <input
            type="text"
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg mt-8">
          Create account
        </button>
      </form>

      <p className="auth-foot">
        <span className="muted">Already a member?</span>{" "}
        <a
          onClick={onSwitch}
          style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}