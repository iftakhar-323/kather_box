import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getWishlist,
  removeFromWishlist,
} from "../api/wishlist";
import { addToCart } from "../api/cart";

function emojiFor(category, subcategory) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  if (category === "decor") {
    if (subcategory === "decor") return "🏺";
    return "🪵";
  }
  return "🪴";
}

function fmtBDT(n) {
  return "৳" + Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function stockBadge(stock) {
  if (stock === 0) return { tone: "out", text: "Out of stock", icon: "🚫" };
  if (stock <= 3) return { tone: "low", text: `Only ${stock} left`, icon: "⚠️" };
  return { tone: "ok", text: "In stock", icon: "✓" };
}

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (tone, msg) => {
    setToast({ tone, msg });
    setTimeout(() => setToast(null), 2400);
  };

  const load = () => {
    setLoading(true);
    getWishlist()
      .then((res) => setItems(res.data || []))
      .catch(() => showToast("err", "Failed to load wishlist"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalValue = useMemo(
    () => items.reduce((sum, it) => sum + (it.Product?.price || 0), 0),
    [items]
  );

  if (!user) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🔒</div>
        <h3>Please log in</h3>
        <p>Sign in to view your wishlist.</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("login")}
        >
          Log in
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">❤️</div>
        <h3>Loading your wishlist…</h3>
      </div>
    );
  }

  const remove = (it) => {
    setConfirm({
      title: "Remove from wishlist?",
      body: `${it.Product?.name || "This item"} will be removed from your saved items.`,
      danger: true,
      confirmText: "Remove",
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBusyId(it.ID);
          await removeFromWishlist(it.ID);
          load();
          showToast("ok", "Removed");
        } catch {
          showToast("err", "Could not remove");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const moveToCart = async (it) => {
    if (!it.Product) return;
    if (it.Product.stock === 0) {
      showToast("err", `${it.Product.name} is out of stock.`);
      return;
    }
    try {
      setBusyId(it.ID);
      await addToCart(it.Product.ID, 1);
      await removeFromWishlist(it.ID);
      showToast("ok", `${it.Product.name} moved to cart`);
      load();
    } catch (err) {
      const msg =
        err.response?.data?.error || "Could not add to cart. Try again.";
      showToast("err", msg);
    } finally {
      setBusyId(null);
    }
  };

  const moveAllToCart = () => {
    const available = items.filter((it) => it.Product && it.Product.stock > 0);
    if (available.length === 0) {
      showToast("err", "Nothing available to move.");
      return;
    }
    setConfirm({
      title: "Move all to cart?",
      body: `${available.length} item${available.length === 1 ? "" : "s"} will be added to your cart.`,
      danger: false,
      confirmText: `Move ${available.length} to cart`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          setBulkBusy(true);
          let okCount = 0;
          let failCount = 0;
          for (const it of available) {
            try {
              await addToCart(it.Product.ID, 1);
              await removeFromWishlist(it.ID);
              okCount++;
            } catch {
              failCount++;
            }
          }
          if (okCount > 0) showToast("ok", `${okCount} item${okCount === 1 ? "" : "s"} moved to cart`);
          if (failCount > 0) showToast("err", `${failCount} failed`);
          load();
        } finally {
          setBulkBusy(false);
        }
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="empty" style={{ marginTop: 64 }}>
        <div className="emoji">🍃</div>
        <h3>Nothing saved yet</h3>
        <p>Tap the heart on any product to save it for later.</p>
        <button
          className="btn btn-primary mt-16"
          onClick={() => window.__katherboxSetView?.("home")}
        >
          Browse the shop
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ maxWidth: 920 }}>
      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>My Wishlist</h2>
          <div className="cart-subhead">
            {items.length} {items.length === 1 ? "item" : "items"} • worth {fmtBDT(totalValue)}
          </div>
        </div>
        <button
          onClick={moveAllToCart}
          disabled={bulkBusy}
          className="btn btn-primary btn-sm"
        >
          {bulkBusy ? "Moving…" : "🛒 Move all to cart"}
        </button>
      </div>

      {/* Items */}
      <div className="stack gap-12 cart-items">
        {items.map((it) => {
          const p = it.Product;
          if (!p) return null;
          const isBusy = busyId === it.ID;
          const badge = stockBadge(p.stock);
          return (
            <article
              key={it.ID}
              className={`cart-item ${isBusy ? "is-busy" : ""}`}
            >
              <div className="cart-item-icon">
                {emojiFor(p.category, p.subcategory)}
              </div>

              <div className="cart-item-body">
                <div className="cart-item-name">{p.name}</div>
                <div className="cart-item-sub">
                  <span className="cart-item-subcat">
                    {(p.subcategory || p.category || "").replace(/_/g, " ")}
                  </span>
                  <span className={`cart-stock cart-stock-${badge.tone}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>
                <div className="cart-item-price">{fmtBDT(p.price)}</div>
              </div>

              <div className="cart-item-controls">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => moveToCart(it)}
                  disabled={isBusy || p.stock === 0}
                  title={p.stock === 0 ? "Out of stock" : "Move to cart"}
                >
                  {p.stock === 0 ? "Sold out" : "🛒 Move"}
                </button>
                <button
                  className="cart-item-remove"
                  onClick={() => remove(it)}
                  disabled={isBusy}
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="cart-modal-backdrop" onClick={() => setConfirm(null)}>
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="cart-modal-title">{confirm.title}</h3>
            <p className="cart-modal-body">{confirm.body}</p>
            <div className="row gap-8" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className={"btn " + (confirm.danger ? "btn-danger" : "btn-primary")}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`cart-toast cart-toast-${toast.tone}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}