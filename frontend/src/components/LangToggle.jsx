import { LangStore } from "../i18n/LangStore";
import { useTranslation } from "../i18n/I18nProvider";

// Tiny dropdown that swaps between English and Bangla.
// Uses the I18n provider so the rest of the app re-renders.
export default function LangToggle() {
  const { lang, toggle } = useTranslation();
  const next = lang === "en" ? "bn" : "en";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm lang-toggle"
      onClick={toggle}
      title={`${LangStore.label(lang)} → ${LangStore.label(next)}`}
      aria-label={`Switch language, current ${LangStore.label(lang)}`}
    >
      <span style={{ marginRight: 6 }}>{LangStore.flag(lang)}</span>
      <span>{LangStore.label(lang)}</span>
    </button>
  );
}
