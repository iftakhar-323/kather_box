import { useState } from "react";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/I18nProvider";

export default function Register({ onSwitch, onSuccess }) {
  const { t } = useTranslation();
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
      setError(err.response?.data?.error || t("auth.registerFailed"));
    }
  };

  return (
    <div className="auth-card">
      <div className="brand">
        <span style={{ fontSize: 24 }}>🌿</span>
        <span>{t("brand.name")}</span>
      </div>
      <p className="subtitle">{t("auth.subtitleRegister")}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="field-label">{t("auth.name")}</label>
          <input
            type="text"
            className="input"
            placeholder={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
          <input
            type="password"
            className="input"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block btn-lg mt-8">
          {t("auth.registerButton")}
        </button>
      </form>

      <p className="auth-foot">
        <span className="muted">{t("auth.haveAccount")}</span>{" "}
        <a
          onClick={onSwitch}
          style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
        >
          {t("auth.switchToLogin")}
        </a>
      </p>
    </div>
  );
}