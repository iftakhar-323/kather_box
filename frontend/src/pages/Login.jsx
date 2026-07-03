import { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "#2f4f2f" }}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <p style={{ fontSize: "14px" }}>
        Don't have an account?{" "}
        <span onClick={onSwitch} style={styles.link}>
          Register
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "320px", margin: "60px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    background: "#4a7c4a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    cursor: "pointer",
  },
  link: { color: "#4a7c4a", cursor: "pointer", fontWeight: "bold" },
};