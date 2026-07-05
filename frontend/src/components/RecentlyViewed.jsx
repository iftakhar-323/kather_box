import { useEffect, useState } from "react";
import { RecentStore, fmtBDT } from "../utils/kb";

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(RecentStore.list());

    const refresh = () => setItems(RecentStore.list());
    window.addEventListener("kb:recent-changed", refresh);
    return () => window.removeEventListener("kb:recent-changed", refresh);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="recent-strip" aria-label="Recently viewed">
      <div className="recent-strip-head">
        <h3>🕘 Recently viewed</h3>
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => {
            RecentStore.clear();
            window.dispatchEvent(new Event("kb:recent-changed"));
          }}
          title="Clear history"
        >
          Clear
        </button>
      </div>
      <div className="recent-strip-row">
        {items.map((p) => (
          <div
            key={p.ID}
            className="recent-tile"
            onClick={() => window.__katherboxSetView?.(`product-${p.ID}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                window.__katherboxSetView?.(`product-${p.ID}`);
            }}
          >
            <span className="thumb" aria-hidden="true">{p.emoji || "🌿"}</span>
            <span className="nm">{p.name}</span>
            <span className="pr">{fmtBDT(p.price)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
