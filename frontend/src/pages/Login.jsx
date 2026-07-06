import { useState } from "react";
import API from "../api/axios";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n/I18nProvider";

export default function Login({ onSwitch, onSuccess, onGoToForgot }) {
  const { t } = useTranslation();
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
          {t("auth.loginButton")}
        </button>
      </form>

      <p className="auth-foot">
        <ForgotPasswordLink onGoToForgot={onGoToForgot} />
        <br />
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

function ForgotPasswordLink({ onGoToForgot }) {
  const { t } = useTranslation();
  // If parent provides a router-style navigation, use the dedicated page.
  // Otherwise fall back to the original in-page modal (preserves existing UX).
  if (onGoToForgot) {
    return (
      <a
        style={{ color: "var(--primary)", cursor: "pointer", fontSize: 13 }}
        onClick={(e) => {
          e.preventDefault();
          onGoToForgot();
        }}
      >
        {t("auth.forgotPassword")}
      </a>
    );
  }
  const [open, setOpen] = useState(false);
  return (
    <>
      <a
        style={{ color: "var(--primary)", cursor: "pointer", fontSize: 13 }}
        onClick={() => setOpen(true)}
      >
        {t("auth.forgotPassword")}
      </a>

      {open && <ForgotPasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ForgotPasswordModal({ onClose }) {
  const { t } = useTranslation();
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
      setInfo(res.data.message || t("auth.forgotSent"));
      if (res.data.dev_only_token) setToken(res.data.dev_only_token);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || t("auth.forgotRequestFailed"));
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
      setInfo(res.data.message || t("auth.forgotDone"));
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.error || t("auth.forgotResetFailed"));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t("auth.forgotTitle")}</h3>
        <p className="form-note mb-16">{t("auth.forgotSubtitle")}</p>

        {step === 1 && (
          <form onSubmit={requestReset} className="auth-form">
            <div>
              <label className="field-label">{t("auth.forgotAccountEmail")}</label>
              <input
                type="email"
                className="input"
                placeholder={t("auth.emailPlaceholder")}
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
                {t("actions.cancel")}
              </button>
              <span className="spacer" />
              <button type="submit" className="btn btn-primary">
                {t("auth.forgotGenerate")}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitReset} className="auth-form">
            <div>
              <label className="field-label">{t("auth.forgotTokenLabel")}</label>
              <input
                className="input"
                placeholder={t("auth.forgotTokenPlaceholder")}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">{t("auth.forgotNewPassword")}</label>
              <input
                type="password"
                className="input"
                placeholder={t("auth.passwordPlaceholder")}
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
                {t("actions.cancel")}
              </button>
              <span className="spacer" />
              <button type="submit" className="btn btn-primary">
                {t("auth.forgotReset")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}