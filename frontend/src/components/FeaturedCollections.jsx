import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { fmtBDT, emojiFor } from "../utils/kb";
import ProductCard from "./ProductCard";

// Curated collections built purely from product data we already have.
// Each rule filters the existing products — no extra API needed.

const COLLECTIONS = [
  {
    title: "🌱 Best under ৳1000",
    sub: "Budget-friendly greenery",
    filter: (p) => Number(p.price) <= 1000 && p.stock > 0,
  },
  {
    title: "🏆 Premium indoor picks",
    sub: "Top of the collection",
    filter: (p) => (p.subcategory === "indoor_plant" || p.category === "plant") && Number(p.price) >= 1500,
  },
  {
    title: "🪴 Low-maintenance heroes",
    sub: "Hardy survivors for any home",
    filter: (p) => p.category === "plant" && p.stock > 0,
  },
  {
    title: "🎁 Gift-ready plant boxes",
    sub: "Pre-curated gifting",
    filter: (p) => p.subcategory === "plant_box",
  },
];

function Row({ title, sub, products, onSelect }) {
  if (products.length === 0) return null;
  return (
    <section className="feat-col" aria-label={title}>
      <h3>{title}</h3>
      <div className="feat-sub">{sub}</div>
      <div className="feat-scroll">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.ID} product={p} onQuickView={onSelect} />
        ))}
      </div>
    </section>
  );
}

export default function FeaturedCollections({ onQuickView }) {
  const [all, setAll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pull up to 120 products once and filter them client-side.
    getProducts({ limit: 120, sort: "newest" })
      .then((res) => {
        setAll(res.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !all) {
    return (
      <section className="feat-col" aria-hidden="true">
        <h3>✨ Featured collections</h3>
        <div className="feat-sub">Loading curated picks…</div>
        <div className="feat-scroll">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skel-card" style={{ width: 200 }}>
              <div className="skel img" />
              <div className="body">
                <div className="skel l1" />
                <div className="skel l2" />
                <div className="skel l3" />
                <div className="skel l4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      {COLLECTIONS.map((c) => (
        <Row
          key={c.title}
          title={c.title}
          sub={c.sub}
          products={all.filter(c.filter)}
          onSelect={onQuickView}
        />
      ))}
    </>
  );
}
