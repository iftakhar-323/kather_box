// Lightweight skeleton placeholders, pure CSS no JS animation hooks needed.

export function SkeletonCard() {
  return (
    <div className="skel-card" aria-hidden="true">
      <div className="skel img" />
      <div className="body">
        <div className="skel l1" />
        <div className="skel l2" />
        <div className="skel l3" />
        <div className="skel l4" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="product-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCartRow() {
  return (
    <div className="skel-row cart-item" aria-hidden="true">
      <div className="skel ico" />
      <div className="skel bar" style={{ width: "60%" }} />
      <div className="skel" style={{ width: 80, height: 28, borderRadius: 999 }} />
    </div>
  );
}

export function SkeletonCartList({ count = 3 }) {
  return (
    <div className="stack gap-12 cart-items">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCartRow key={i} />
      ))}
    </div>
  );
}
