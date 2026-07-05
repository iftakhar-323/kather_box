import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../api/wishlist";
import { addToCart } from "../api/cart";

function emojiFor(category) {
  if (category === "plant") return "🌿";
  if (category === "care") return "🧴";
  return "🪵";
}

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getWishlist()
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    await removeFromWishlist(id);
    load();
  };

  const moveToCart = async (productId, wishlistId) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(wishlistId);
      window.alert("Moved to cart!");
      load();
    } catch (e) {
      window.alert("Could not add to cart. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="empty">
        <div className="emoji">❤️</div>
        <h3>Loading your wishlist…</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <h2 className="mb-16">My Wishlist</h2>

      {items.length === 0 ? (
        <div className="empty">
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
      ) : (
        <div className="stack gap-12">
          {items.map((it) => {
            const p = it.Product;
            if (!p) return null;
            return (
              <div key={it.ID} className="row-card">
                <div className="row-icon">{emojiFor(p.category)}</div>
                <div className="row-meta">
                  <div className="title">{p.name}</div>
                  <div className="sub">
                    {p.subcategory?.replace(/_/g, " ") || p.category}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontWeight: 700,
                      color: "var(--leaf-700)",
                    }}
                  >
                    ৳{Number(p.price).toLocaleString()}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => moveToCart(p.ID, it.ID)}
                >
                  Move to cart
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(it.ID)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}