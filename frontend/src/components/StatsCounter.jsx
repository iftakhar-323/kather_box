import { useEffect, useRef, useState } from "react";

// Animated stat counter — purely visual, increments when scrolled into view.
// Numbers are static placeholders; replace with real data when backend exposes metrics.

const STATS = [
  { num: 1102, suffix: "+", label: "Plants sold" },
  { num: 4.9,  decimals: 1, label: "Customer rating", icon: "★" },
  { num: 24, suffix: "hr", label: "Same-day dispatch" },
  { num: 7,    label: "Day plant guarantee" },
];

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      });
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
}

function Stat({ num, decimals = 0, label, suffix = "", icon }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1100;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const pct = Math.min(1, (t - start) / duration);
      // ease out cubic
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(num * eased);
      if (pct < 1) raf = requestAnimationFrame(tick);
      else setVal(num);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();

  return (
    <div className="stat" ref={ref}>
      <div className="num">
        {icon ? <span style={{ fontSize: "0.7em", marginRight: 4 }}>{icon}</span> : null}
        {display}{suffix}
      </div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <section className="kb-stats" aria-label="KatherBox stats">
      {STATS.map((s, i) => (
        <Stat key={i} {...s} />
      ))}
    </section>
  );
}
