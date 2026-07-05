import { useEffect, useState } from "react";
import {
  listExperts,
  bookConsultation,
  getMyConsultations,
  cancelConsultation,
} from "../api/consultations";

export default function Consultations() {
  const [experts, setExperts] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [topic, setTopic] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");

  const loadAll = () => {
    setLoading(true);
    Promise.all([listExperts(), getMyConsultations()])
      .then(([e, l]) => {
        setExperts(e.data || []);
        setList(l.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || err.message);
        setLoading(false);
      });
  };
  useEffect(loadAll, []);

  const book = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await bookConsultation({
        expert_name: active.name,
        topic,
        scheduled_at: when,
        notes,
      });
      setMsg(`✓ Booked with ${active.name} on ${when}`);
      setActive(null);
      setTopic("");
      setWhen("");
      setNotes("");
      getMyConsultations().then((r) => setList(r.data || []));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const cancel = async (c) => {
    if (!window.confirm("Cancel this booking?")) return;
    await cancelConsultation(c.ID);
    loadAll();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 6 }}>Talk to a plant expert 🌱</h1>
        <p className="muted">Book a one-on-one video session with our horticulturists.</p>
      </div>

      {msg && <div className="card" style={{ padding: 12, color: "var(--leaf-700)" }}>{msg}</div>}
      {error && <div className="warning">{error}</div>}

      <h2>Our experts</h2>
      {loading && <div className="empty">Loading…</div>}
      <div className="product-grid">
        {experts.map((e) => (
          <div key={e.name} className="product-card">
            <div className="image"><span style={{ fontSize: 48 }}>👩‍🌾</span></div>
            <div className="body">
              <h3>{e.name}</h3>
              <p className="desc">{e.specialty}</p>
              <div className="row" style={{ alignItems: "center" }}>
                <span className="price">৳{e.rate}</span>
                <span className="muted" style={{ fontSize: 13 }}>/ session</span>
              </div>
              <button onClick={() => setActive(e)} className="btn btn-primary btn-block mt-8">
                Book session
              </button>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={book}>
            <h3>Book {active.name}</h3>
            <p className="muted">{active.specialty}</p>
            <div className="auth-form">
              <div>
                <label className="field-label">Topic</label>
                <input
                  className="input"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Yellowing leaves on my pothos"
                />
              </div>
              <div>
                <label className="field-label">Date &amp; time</label>
                <input
                  className="input"
                  type="datetime-local"
                  required
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Notes (optional)</label>
                <textarea
                  className="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else the expert should know?"
                />
              </div>
              <div className="row mt-8">
                <button type="button" onClick={() => setActive(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <span className="spacer" />
                <button type="submit" className="btn btn-primary">Confirm booking</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>Your bookings</h2>
      {list.length === 0 && !loading && (
        <div className="empty">
          <div className="emoji">📅</div>
          <h3>No bookings yet</h3>
        </div>
      )}
      {list.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          {list.map((c) => (
            <div
              key={c.ID}
              className="row-card"
              style={{
                borderRadius: 0,
                borderBottom: "1px solid var(--leaf-100)",
                alignItems: "center",
              }}
            >
              <div className="row-icon" style={{ background: "linear-gradient(135deg,#e8f1e6,#cfe1cb)" }}>
                <span style={{ fontSize: 22 }}>📅</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.expert_name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{c.topic}</div>
              </div>
              <span className={"status-pill " + (c.status === "cancelled" ? "status-cancelled" : "status-delivered")}>
                {c.status}
              </span>
              <div className="muted" style={{ width: 170, textAlign: "right" }}>
                {c.scheduled_at?.replace("T", " ")}
              </div>
              {c.status !== "cancelled" && (
                <button onClick={() => cancel(c)} className="btn btn-danger btn-sm">Cancel</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}