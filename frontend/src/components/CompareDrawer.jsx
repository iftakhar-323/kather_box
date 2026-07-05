import { useEffect, useState } from "react";
import { CompareStore, fmtBDT } from "../utils/kb";

export default function CompareDrawer({ open, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(CompareStore.list());
    const refresh = () => setItems(CompareStore.list());
    window.addEventListener("kb:compare-changed", refresh);
    return () => window.removeEventListener("kb:compare-changed", refresh);
  }, []);

  if (!open) return null;

  const removeOne = (id) => {
    CompareStore.remove(id);
    setItems(CompareStore.list());
    window.dispatchEvent(new Event("kb:compare-changed"));
  };

  const cheapest = items.length
    ? items.reduce((a, b) => (a.price <= b.price ? a : b))
    : null;
  const bestStock = items.length
    ? items.reduce((a, b) => (a.stock >= b.stock ? a : b))
    : null;

  return (
    <div className="cmp-overlay" onClick={onClose}>
      <div className="cmp-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cmp-head">
          <h3>⚖️ Compare products ({items.length}/4)</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cmp-empty">
            No products to compare yet. Tap the ⚖ icon on any product card to add it here.
          </div>
        ) : (
          <table className="cmp-table">
            <thead>
              <tr>
                <th></th>
                {items.map((p) => (
                  <th key={p.ID}>
                    <div
                      className="pname"
                      onClick={() => {
                        onClose();
                        window.__katherboxSetView?.(`product-${p.ID}`);
                      }}
                    >
                      {p.emoji} {p.name}
                    </div>
                    <button
                      className="btn btn-ghost btn-xs mt-8"
                      onClick={() => removeOne(p.ID)}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Price</th>
                {items.map((p) => (
                  <td
                    key={p.ID}
                    className={cheapest && cheapest.ID === p.ID ? "cmp-best" : ""}
                  >
                    {fmtBDT(p.price)}
                    {cheapest && cheapest.ID === p.ID && "  🏷"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Category</th>
                {items.map((p) => (
                  <td key={p.ID}>{p.category}</td>
                ))}
              </tr>
              <tr>
                <th>Subcategory</th>
                {items.map((p) => (
                  <td key={p.ID}>{(p.subcategory || "—").replace(/_/g, " ")}</td>
                ))}
              </tr>
              <tr>
                <th>Indoor / Outdoor</th>
                {items.map((p) => (
                  <td key={p.ID}>{p.indoor_outdoor || "—"}</td>
                ))}
              </tr>
              <tr>
                <th>Stock</th>
                {items.map((p) => (
                  <td
                    key={p.ID}
                    className={bestStock && bestStock.ID === p.ID ? "cmp-best" : ""}
                  >
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    {bestStock && bestStock.ID === p.ID && "  🌿"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {items.length > 0 && (
          <div className="mt-16" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                CompareStore.clear();
                setItems([]);
                window.dispatchEvent(new Event("kb:compare-changed"));
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CompareBar() {
  const [count, setCount] = useState(CompareStore.list().length);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setCount(CompareStore.list().length);
    window.addEventListener("kb:compare-changed", refresh);
    return () => window.removeEventListener("kb:compare-changed", refresh);
  }, []);

  if (count === 0) return null;

  return (
    <>
      <button
        className="cmp-bar"
        onClick={() => setOpen(true)}
        title="Open compare drawer"
        style={{
          background: "linear-gradient(160deg, var(--leaf-700), var(--leaf-800))",
        }}
      >
        <span>⚖️ Compare</span>
        <span className="chips">
          <span className="chip">{count}/4</span>
        </span>
      </button>
      <CompareDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
