import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products. Is the backend running?");
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading products...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ color: "#2f4f2f" }}>KatherBox 🌿</h1>
      <p style={{ color: "#666" }}>Nature at your home</p>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.ID} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}