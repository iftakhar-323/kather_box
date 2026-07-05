import { useState } from "react";
import { useCart } from "../context/AuthContext"; // local helper if exists
import { placeGuestOrder } from "../api/shopping";
import { useToast } from "../components/Toast";

export default function GuestCheckout({ cart, onClose, onSuccess }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [postal, setPostal] = useState("");
  const [busy, setBusy] = useState(false);

  const items = (cart?.items || []).map((it) => ({
    product_id: it.product_id || it.ID,
    quantity: it.quantity || it.Qty || 1,
  }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await placeGuestOrder({
        name,
        email,
        phone,
        address,
        city,
        postal_code: postal,
        items,
      });
      toast.ok(`Order #${r.data?.order_id} placed — check your email!`);
      onSuccess?.(r.data?.order_id);
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="muted">
        No account needed. We'll email a receipt and tracking updates to the
        address below.
      </p>
      <form onSubmit={onSubmit}>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            placeholder="Full name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <input
            className="input"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ flex: 1 }}
          />
        </div>
        <input
          className="input mt-8"
          placeholder="Email *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input mt-8"
          placeholder="Street address *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <div className="row mt-8 gap-8">
          <input
            className="input"
            placeholder="City *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            style={{ flex: 2 }}
          />
          <input
            className="input"
            placeholder="Postal code"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div className="row mt-8 gap-8">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <span className="spacer" />
          <button
            className="btn btn-primary"
            disabled={busy || items.length === 0}
          >
            {busy ? "Placing order…" : "Place guest order"}
          </button>
        </div>
      </form>
    </div>
  );
}
