import { useEffect, useState } from "react";
import {
  getMyLoyalty,
  getAchievements,
  claimAchievement,
  getRewards,
  redeemReward,
  getReferralCode,
  applyReferral,
} from "../api/loyalty";
// aliases intentionally omitted — using real names above
import { useToast } from "../components/Toast";

function fmt(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

export default function Loyalty() {
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [referral, setReferral] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadAll = () => {
    getMyLoyalty()
      .then((r) => setMe(r.data))
      .catch(() => {});
    getAchievements().then((r) => setAchievements(r.data?.achievements || r.data?.items || []));
    getRewards().then((r) => setRewards(r.data?.rewards || r.data?.items || []));
    getReferralCode().then((r) => setReferral(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onClaim = async (id) => {
    setBusy(true);
    try {
      const r = await claimAchievement(id);
      toast.ok(`Claimed +${r.data?.points || 0} points`);
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onRedeem = async (id) => {
    setBusy(true);
    try {
      const r = await redeemReward(id);
      toast.ok(`Redeemed: ${r.data?.coupon_code || "coupon"}`);
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onApplyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const r = await applyReferral(code.trim());
      toast.ok(`+${r.data?.bonus || 0} bonus points applied`);
      setCode("");
      loadAll();
    } catch (e) {
      toast.err(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!me) {
    return (
      <div className="empty">
        <div className="emoji">🏆</div>
        <h3>Loading your loyalty…</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>🏆 Green Points & Rewards</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Earn points with every purchase, unlock achievements, climb tiers and
        redeem exclusive rewards.
      </p>

      <div
        className="card card-pad-lg"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 16,
          background:
            "linear-gradient(135deg, var(--leaf-100), var(--leaf-50))",
        }}
      >
        <div>
          <div className="muted">Points</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--leaf-700)" }}>
            {fmt(me.points)}
          </div>
        </div>
        <div>
          <div className="muted">Tier</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {me.tier || "🌱 Sapling"}
          </div>
        </div>
        <div>
          <div className="muted">Total spent</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>৳{fmt(me.total_spend)}</div>
        </div>
        <div>
          <div className="muted">Referrals</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{fmt(me.referrals)}</div>
        </div>
      </div>

      <section className="mt-24">
        <h2>🎯 Achievements</h2>
        {achievements.length === 0 && (
          <p className="muted">No achievements available yet.</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          {achievements.map((a) => (
            <div key={a.id} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 28 }}>{a.icon || "🏅"}</div>
              <h4 style={{ margin: "8px 0 4px" }}>{a.name}</h4>
              <p className="muted" style={{ fontSize: 13, minHeight: 36 }}>
                {a.description}
              </p>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="tag tag-leaf">+{a.points} pts</span>
                <span className="spacer" />
                {a.claimed ? (
                  <span className="tag tag-success">✓ Claimed</span>
                ) : (
                  <button
                    className="btn btn-primary btn-xs"
                    disabled={busy || !a.unlocked}
                    onClick={() => onClaim(a.id)}
                  >
                    {a.unlocked ? "Claim" : "Locked"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2>🎁 Rewards</h2>
        {rewards.length === 0 && (
          <p className="muted">No rewards available right now.</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          {rewards.map((r) => (
            <div key={r.id} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 28 }}>{r.icon || "🎟️"}</div>
              <h4 style={{ margin: "8px 0 4px" }}>{r.name}</h4>
              <p className="muted" style={{ fontSize: 13, minHeight: 36 }}>
                {r.description}
              </p>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="tag tag-leaf">{r.points_cost} pts</span>
                <span className="spacer" />
                <button
                  className="btn btn-secondary btn-xs"
                  disabled={busy || (me.points || 0) < r.points_cost}
                  onClick={() => onRedeem(r.id)}
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 card card-pad-lg">
        <h2 style={{ marginTop: 0 }}>👥 Refer a friend</h2>
        <p className="muted">
          Share your code — you both earn bonus points when they place their
          first order.
        </p>
        {referral?.code && (
          <div className="row" style={{ marginTop: 12 }}>
            <code
              style={{
                padding: "8px 12px",
                background: "var(--leaf-50)",
                border: "1px solid var(--leaf-100)",
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {referral.code}
            </code>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                navigator.clipboard
                  .writeText(referral.code)
                  .then(() => toast.ok("Copied to clipboard"))
                  .catch(() => toast.info("Copy failed — try manually"));
              }}
            >
              📋 Copy
            </button>
            <span className="spacer" />
            <span className="muted">Used {referral.uses || 0} times</span>
          </div>
        )}
        <form
          onSubmit={onApplyCode}
          className="row"
          style={{ marginTop: 16, gap: 8 }}
        >
          <input
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Have a friend's code? Paste it here"
            style={{ flex: 1, maxWidth: 320 }}
          />
          <button className="btn btn-primary" disabled={busy}>
            Apply code
          </button>
        </form>
      </section>
    </div>
  );
}
