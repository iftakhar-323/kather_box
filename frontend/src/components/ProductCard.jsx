import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../api/cart";
import { addToWishlist } from "../api/wishlist";
import { CompareStore, SaveForLaterStore } from "../utils/kb";

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
}

export default function ProductCard({ product, onQuickView }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | loading | added | error
  const [heart, setHeart] = useState("idle");   // idle | saved
  const [inCompare, setInCompare] = useState(CompareStore.has(product.ID));
  const [inSaved, setInSaved] = useState(SaveForLaterStore.has(product.ID));

  // Refresh toggle state when other components change the lists
  useEffect(() => {
    const refresh = () => {
      setInCompare(CompareStore.has(product.ID));
      setInSaved(SaveForLaterStore.has(product.ID));
    };
    window.addEventListener("kb:compare-changed", refresh);
    window.addEventListener("kb:save-changed", refresh);
    return () => {
      window.removeEventListener("kb:compare-changed", refresh);
      window.removeEventListener("kb:save-changed", refresh);
    };
  }, [product.ID]);

  const handleAdd = async () => {
    if (!user) {
      const goLogin = window.confirm(
        "You need to log in to add items to your cart. Go to login?"
      );
      if (goLogin) window.__katherboxSetView?.("login");
      return;
    }
    try {
      setStatus("loading");
      await addToCart(product.ID, 1);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const buttonLabel =
    status === "loading"
      ? "Adding…"
      : status === "added"
      ? "Added ✓"
      : status === "error"
      ? "Failed"
      : product.stock === 0
      ? "Out of stock"
      : "Add to cart";

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      const goLogin = window.confirm("Log in to save items?");
      if (goLogin) window.__katherboxSetView?.("login");
      return;
    }
    try {
      await addToWishlist(product.ID);
      setHeart("saved");
      setTimeout(() => setHeart("idle"), 1500);
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not save");
    }
  };

  const stockClass =
    product.stock === 0 ? "out" : product.stock < 5 ? "low" : "";

  const toggleCompare = (e) => {
    e.stopPropagation();
    const r = CompareStore.toggle(product);
    if (r === "full") {
      window.alert("You can compare up to 4 products. Remove one first.");
      return;
    }
    setInCompare(r);
    window.dispatchEvent(new Event("kb:compare-changed"));
  };
  const toggleSaved = (e) => {
    e.stopPropagation();
    if (SaveForLaterStore.has(product.ID)) {
      SaveForLaterStore.remove(product.ID);
      setInSaved(false);
    } else {
      SaveForLaterStore.add(product);
      setInSaved(true);
    }
    window.dispatchEvent(new Event("kb:save-changed"));
  };

  return (
    <article className="product-card">
      <div
        className="image"
        onClick={() => window.__katherboxSetView?.(`product-${product.ID}`)}
        title="View details"
      >
        {emojiFor(product.category)}
      </div>

      {/* hover overlay buttons */}
      <div className="pc-overlay" aria-label="Quick actions">
        <button
          className={inCompare ? "is-active" : ""}
          onClick={toggleCompare}
          title={inCompare ? "Remove from compare" : "Add to compare"}
          aria-label="Compare"
        >
          ⚖
        </button>
        <button
          className={inSaved ? "is-active" : ""}
          onClick={toggleSaved}
          title={inSaved ? "Remove from saved-for-later" : "Save for later"}
          aria-label="Save for later"
        >
          🔖
        </button>
        {onQuickView && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product.ID); }}
            title="Quick view"
            aria-label="Quick view"
          >
            👁
          </button>
        )}
        {!onQuickView && (
          <button
            onClick={(e) => { e.stopPropagation(); window.__katherboxOpenQuickView?.(product.ID); }}
            title="Quick view"
            aria-label="Quick view"
          >
            👁
          </button>
        )}
      </div>

      <div className="body">
        <span className="category">{product.category}</span>
        <h3
          className="name"
          onClick={() => window.__katherboxSetView?.(`product-${product.ID}`)}
        >
          {product.name}
        </h3>

        <div className="price">৳{Number(product.price).toLocaleString()}</div>

        <div className={`stock ${stockClass}`}>
          {product.stock > 0 ? (
            <>
              <span className="stock-dot" />
              <span>
                {product.stock < 5
                  ? `Only ${product.stock} left in stock`
                  : `In stock · ${product.stock} available`}
              </span>
            </>
          ) : (
            <>
              <span className="stock-dot" />
              <span>Out of stock</span>
            </>
          )}
        </div>

        <div className="actions">
          <button
            onClick={handleWishlist}
            className="btn btn-secondary btn-sm btn-block"
            style={{
              color: heart === "saved" ? "var(--rose)" : undefined,
              borderColor: heart === "saved" ? "var(--rose-lt)" : undefined,
            }}
          >
            {heart === "saved" ? "Saved ♥" : "♡ Save"}
          </button>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || status === "loading"}
            className={
              "btn btn-block " +
              (status === "added" ? "btn-primary" : "btn-primary")
            }
            style={{
              background: status === "added" ? "var(--success)" : undefined,
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
}