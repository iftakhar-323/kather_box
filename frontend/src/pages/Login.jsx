import { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/I18nProvider";

export default function Login({ onSwitch, onSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      onSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || t("auth.loginFailed"));
    }
  };

  return (
    <div className="auth-card">
      <div className="brand">
        <span style={{ fontSize: 24 }}>🌿</span>
        <span>{t("brand.name")}</span>
      </div>
      <p className="subtitle">{t("auth.subtitleLogin")}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="field-label">{t("auth.email")}</label>
          <input
            type="email"
            className="input"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label">{t("auth.password")}</label>
          <div className="input-wrap">
            <input
              type={showPw ? "text" : "password"}
              className="input"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              title={showPw ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg mt-8">
          {t("auth.loginButton")}
        </button>
      </form>

      <p className="auth-foot">
        <span className="muted">{t("auth.noAccount")}</span>{" "}
        <a
          onClick={onSwitch}
          style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
        >
          {t("auth.switchToRegister")}
        </a>
      </p>
    </div>
  );
}