import { useEffect, useState } from "react";
import { getProduct } from "../api/products";
import { addToCart } from "../api/cart";
import { addToWishlist } from "../api/wishlist";
import { useAuth } from "../context/AuthContext";
import { fmtBDT, emojiFor } from "../utils/kb";
import { useToast } from "./Toast";

export default function QuickView({ productId, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fetch full product
  useEffect(() => {
    let alive = true;
    if (productId == null) {
      setLoading(true);
      return () => { alive = false; };
    }
    setLoading(true);
    setProduct(null);
    getProduct(productId)
      .then((res) => {
        if (alive) {
          setProduct(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [productId]);

  const handleAdd = async () => {
    if (!user) { onClose(); window.__katherboxSetView?.("login"); return; }
    try {
      setAdding(true);
      await addToCart(product.ID, 1);
      toast.ok(`Added ${product.name} to cart`);
      onClose();
    } catch (e) {
      toast.err("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWish = async () => {
    if (!user) { onClose(); window.__katherboxSetView?.("login"); return; }
    try {
      await addToWishlist(product.ID);
      toast.ok("Saved to wishlist ♥");
    } catch (e) {
      toast.err("Could not save");
    }
  };

  if (productId == null) return null;
  return (
    <div className="qv-overlay" onClick={onClose}>
      <div className="qv-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {loading || !product ? (
          <>
            <div className="qv-thumb skel" style={{ borderRadius: "var(--radius)" }} />
            <div className="qv-body">
              <div className="skel" style={{ height: 18, width: "70%", marginBottom: 8 }} />
              <div className="skel" style={{ height: 24, width: "40%", margin: "8px 0" }} />
              <div className="skel" style={{ height: 60, width: "100%" }} />
            </div>
          </>
        ) : (
          <>
            <div className="qv-thumb" aria-hidden="true">{emojiFor(product)}</div>
            <div className="qv-body">
              <h3>{product.name}</h3>
              <div className="muted" style={{ fontSize: 12 }}>
                {(product.subcategory || product.category || "").replace(/_/g, " ")}
                {product.indoor_outdoor ? ` • ${product.indoor_outdoor}` : ""}
              </div>
              <div className="pr">{fmtBDT(product.price)}</div>
              <div className="desc">{product.description || "No description provided."}</div>
              <div className="qv-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAdd}
                  disabled={adding || product.stock === 0}
                >
                  {product.stock === 0 ? "Out of stock" : adding ? "Adding…" : "🛒 Add to cart"}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleWish}>
                  ♥ Save
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    onClose();
                    window.__katherboxSetView?.(`product-${product.ID}`);
                  }}
                >
                  Full details →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
