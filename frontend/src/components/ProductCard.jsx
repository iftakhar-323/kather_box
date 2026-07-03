export default function ProductCard({ product }) {
  return (
    <div style={styles.card}>
      <div style={styles.imagePlaceholder}>
        {product.category === "plant" ? "🌿" : "🪵"}
      </div>
      <h3 style={styles.name}>{product.name}</h3>
      <p style={styles.category}>{product.category}</p>
      <p style={styles.price}>৳{product.price}</p>
      <p style={styles.stock}>
        {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
      </p>
      <button style={styles.button} disabled={product.stock === 0}>
        Add to Cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "16px",
    width: "220px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  imagePlaceholder: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  name: {
    fontSize: "16px",
    margin: "6px 0",
    color: "#2f4f2f",
  },
  category: {
    fontSize: "12px",
    color: "#888",
    textTransform: "capitalize",
  },
  price: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2f6b2f",
    margin: "8px 0",
  },
  stock: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "10px",
  },
  button: {
    background: "#4a7c4a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    width: "100%",
  },
};