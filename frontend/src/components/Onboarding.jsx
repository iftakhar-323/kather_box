import { useEffect, useState } from "react";
import { OnbStore } from "../utils/kb";

const STEPS = [
  {
    emoji: "🌿",
    title: "Welcome to KatherBox",
    body: "Hand-curated plants, handcrafted planters and gentle care essentials — delivered in Dhaka and beyond.",
  },
  {
    emoji: "🔍",
    title: "Find your perfect plant",
    body: "Filter by category, price, indoor/outdoor and even gift occasion. Try clicking the filter chips on the shop page.",
  },
  {
    emoji: "🛒",
    title: "Smooth checkout",
    body: "Apply coupons (try WELCOME10), redeem Green Points, and unlock free shipping over ৳1500.",
  },
  {
    emoji: "🌱",
    title: "Care that keeps going",
    body: "Track orders, set care reminders, and earn Green Points on every purchase. Tap the bell to see updates.",
  },
];

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!OnbStore.done()) {
      // Wait one paint so the app can settle
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    OnbStore.markDone();
    setOpen(false);
  };
  const next = () => {
    if (step === STEPS.length - 1) close();
    else setStep((s) => s + 1);
  };

  if (!open) return null;
  const s = STEPS[step];

  return (
    <div className="onb-overlay" role="dialog" aria-modal="true">
      <div className="onb-card">
        <div className="emoji" aria-hidden="true">{s.emoji}</div>
        <h2>{s.title}</h2>
        <p>{s.body}</p>
        <div className="onb-dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={i === step ? "is-on" : ""} />
          ))}
        </div>
        <div className="onb-actions">
          <button className="btn btn-ghost btn-sm" onClick={close}>
            Skip
          </button>
          <button className="btn btn-primary btn-sm" onClick={next}>
            {step === STEPS.length - 1 ? "Start shopping ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
