import { useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";

// =====================================================================
// StaticPage.jsx
// One reusable component for the 7 trust/legal pages:
//   About, Contact, FAQ, Privacy Policy, Terms & Conditions,
//   Shipping Policy, Refund Policy
// All content (titles/intro/sections) is sourced from i18n catalogs
// under `staticPages.pages.{slug}` so it can be translated.
// =====================================================================

export default function StaticPage({ slug }) {
  const { t } = useTranslation();
  const data = t(`staticPages.pages.${slug}`);

  if (!data || typeof data !== "object" || !data.title) {
    return (
      <section className="static-page">
        <h1>{t("staticPages.notFoundHeading")}</h1>
        <p>{t("staticPages.notFoundBody")}</p>
      </section>
    );
  }

  return (
    <section className="static-page">
      <header className="static-head">
        <h1>{data.title}</h1>
        <p className="static-intro">{data.intro}</p>
      </header>

      <div className="static-body">
        {(data.sections || []).map((s, i) => (
          <section key={i} className="static-section">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}

        {data.form && <ContactForm />}
      </div>
    </section>
  );
}

// Simple in-page contact form (no SMTP needed — logs in state only).
function ContactForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    // In a real app this would POST to a /contact endpoint.
    // We surface success only — no outbound email needed.
    console.log("[Contact form]", form);
    setDone(true);
  };

  if (done) {
    return (
      <section className="static-section">
        <h2>{t("staticPages.contactFormSentHeading")}</h2>
        <p>
          {t("staticPages.contactFormSentBody", {
            name: form.name.split(" ")[0],
            email: form.email,
          })}
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="contact-form static-section">
      <h2>{t("staticPages.pages.contact.sections.4.h")}</h2>
      <input
        type="text"
        placeholder={t("staticPages.contactFormNamePlaceholder")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder={t("staticPages.contactFormEmailPlaceholder")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <textarea
        rows={5}
        placeholder={t("staticPages.contactFormMessagePlaceholder")}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />
      <button className="btn btn-primary">{t("staticPages.contactFormSubmit")}</button>
    </form>
  );
}