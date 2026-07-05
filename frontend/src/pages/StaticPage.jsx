import { useState } from "react";

// =====================================================================
// StaticPage.jsx — Sprint A
// One reusable component for the 7 trust/legal pages:
//   About, Contact, FAQ, Privacy Policy, Terms & Conditions,
//   Shipping Policy, Refund Policy
// =====================================================================

const CONTENT = {
  about: {
    title: "About KatherBox",
    intro: "Hand-curated indoor plants, subscriptions, expert consultations and corporate gifting — grown with love in Dhaka.",
    sections: [
      { h: "Our story", p: "KatherBox began as a small stall at Dhanmondi Lake. Today we ship 200+ plant species to homes and offices across Bangladesh, supported by a growing team of horticulturists, designers and engineers." },
      { h: "What we believe", p: "Plants change rooms — and rooms change people. Every plant we sell is nursery-fresh, ethically sourced, and backed by our 7-day plant guarantee." },
      { h: "By the numbers", p: "1,100+ plant SKUs · 4.9★ from 8,200 reviews · 24-hour delivery in Dhaka · 7-day plant guarantee · 95% plastic-free packaging." },
      { h: "Sustainability", p: "We use compostable coir pots, kraft sleeves, and zero air-freight. 1% of every order funds urban greening projects in Dhaka schools." },
    ],
  },
  contact: {
    title: "Contact us",
    intro: "We respond to every message within 24 hours, Mon–Sat.",
    sections: [
      { h: "Email", p: "hello@katherbox.com · support@katherbox.com" },
      { h: "Phone & WhatsApp", p: "+880 1700 000 000 (10am–8pm BST)" },
      { h: "Studio", p: "House 12, Road 7, Dhanmondi, Dhaka 1205, Bangladesh" },
      { h: "Press & partnerships", p: "press@katherbox.com" },
      { h: "Send a message", p: "Use the form below and we'll route your note to the right person." },
    ],
    form: true,
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Quick answers to the questions we hear most.",
    sections: [
      {
        h: "How do I care for my plant?",
        p: "Every plant ships with a species-specific care card. You can also browse the Care tab in the navbar — your dashboard auto-generates a watering, fertilizing and repotting schedule for every plant you buy.",
      },
      {
        h: "Do you ship outside Dhaka?",
        p: "Yes — same-day inside Dhaka (order by 4pm); 2-3 days to major cities like Chittagong, Sylhet, Khulna; 4-5 days nationwide.",
      },
      {
        h: "What if my plant arrives unhealthy?",
        p: "Send a photo within 48 hours and we'll either replace it from the next batch or refund 100%. No paperwork, no forms.",
      },
      {
        h: "Can I cancel my subscription?",
        p: "Anytime — pause, skip a month, change frequency, or cancel from the Boxes tab. No commitment.",
      },
      {
        h: "Do you offer corporate gifting?",
        p: "Yes — visit the Corporate tab for bulk pricing, branded sleeves, employee gift requests, and invoice billing.",
      },
      {
        h: "Are you on social media?",
        p: "Yes — Instagram @katherbox, Facebook /katherbox, TikTok @katherbox. Plant care videos every week.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Effective July 5, 2026. Plain-English summary + full policy below.",
    sections: [
      { h: "Short version", p: "We collect only the data we need to ship plants, send reminders, and improve our service. We never sell your data. You can delete everything from My Account → Delete Account." },
      { h: "What we collect", p: "Account info (name, email, phone), shipping addresses, order history, plant care logs, and basic analytics (page views, anonymous IDs)." },
      { h: "Why we need it", p: "To fulfill orders, send watering reminders, ship boxes, run the points program, and prevent fraud." },
      { h: "Who we share with", p: "Couriers (just name/phone/address for the boxes they deliver), payment processors (PCI scope, never see raw cards), and no one else." },
      { h: "Your rights", p: "View, edit, export, or delete your data any time from My Account → Edit Profile, or email privacy@katherbox.com." },
      { h: "Cookies", p: "We use first-party cookies for session/auth only. No third-party trackers." },
      { h: "Changes", p: "We email every user before any material change takes effect." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "By using katherbox.com you agree to these terms.",
    sections: [
      { h: "Eligibility", p: "You must be 18+ or have a parent/guardian make purchases on your behalf." },
      { h: "Account", p: "Keep your password safe — you're responsible for activity on your account. Lost a password? Use the Forgot Password link on the login page." },
      { h: "Pricing", p: "All prices include VAT. Delivery fees are calculated at checkout." },
      { h: "Cancellations & refunds", p: "See our Refund Policy — most unfulfilled orders can be cancelled within 12 hours of placement." },
      { h: "Plant health guarantee", p: "Plants are living things. We guarantee delivery health for 7 days. After that we provide ongoing care support." },
      { h: "Subscriptions", p: "Recurring boxes are billed at signup and then monthly until paused or cancelled. Skip a month anytime." },
      { h: "Limitation of liability", p: "KatherBox is not liable for plant damage caused by neglect, environmental factors outside our care guides, or unauthorized repottings." },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    intro: "Fast, careful, plastic-free.",
    sections: [
      { h: "Inside Dhaka", p: "Same-day delivery if you order before 4pm BST. Standard delivery is next-day. Free above ৳1,500." },
      { h: "Major cities", p: "2–3 working days to Chittagong, Sylhet, Khulna, Rajshahi, Barisal, Rangpur." },
      { h: "Nationwide", p: "4–5 working days. We work with Sundarbans Courier and Steadfast." },
      { h: "Packaging", p: "Compostable coir pots, kraft sleeves, shredded paper padding. Plants travel in vented boxes with humidity gel." },
      { h: "Heat & monsoon handling", p: "Summer orders get insulated sleeves + gel packs. Monsoon orders get extra drainage ventilation." },
      { h: "Tracking", p: "Every order gets an SMS + email tracking link once shipped." },
      { h: "Failed delivery", p: "If we're unable to reach you after 2 attempts, the box returns to our studio for free re-delivery scheduling." },
    ],
  },
  refund: {
    title: "Refund Policy",
    intro: "We want you to love every plant.",
    sections: [
      { h: "Plant health guarantee (7 days)", p: "If a plant arrives damaged, diseased or dies within 7 days, send a photo within 48 hours of noticing and we'll either send a replacement at our cost or refund 100% — your choice." },
      { h: "Wrong / damaged item", p: "Email a photo within 48 hours of delivery. We cover return shipping." },
      { h: "Changed your mind", p: "Non-plant items (pots, accessories, subscriptions not yet started) can be returned within 14 days in original condition. Buyer pays return shipping." },
      { h: "Subscriptions", p: "Cancel anytime. Already-shipped boxes are non-refundable; future boxes are fully refundable until they're packed." },
      { h: "Processing time", p: "Approved refunds are processed within 5 business days back to the original payment method." },
      { h: "How to start", p: "Email refunds@katherbox.com with your order number + a photo. We respond within 24 hours." },
    ],
  },
};

export default function StaticPage({ slug }) {
  const data = CONTENT[slug];
  if (!data) {
    return (
      <section className="static-page">
        <h1>Page not found</h1>
        <p>That link doesn't exist. Head back to the shop.</p>
      </section>
    );
  }

  return (
    <section className="static-page">
      <header className="static-head">
        <h1>{data.title}</h1>
        <p className="static-intro">{data.intro}</p>
      </header>

      <div className="static-body">
        {data.sections.map((s, i) => (
          <section key={i} className="static-section">
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}

        {data.form && <ContactForm />}
      </div>
    </section>
  );
}

// Simple in-page contact form (no SMTP needed — logs in state only).
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    // In a real app this would POST to a /contact endpoint.
    // We surface success only — no outbound email needed.
    console.log("[Contact form]", form);
    setDone(true);
  };

  if (done) {
    return (
      <section className="static-section">
        <h2>Message sent ✓</h2>
        <p>Thanks {form.name.split(" ")[0]} — we'll reply to <strong>{form.email}</strong> within 24 hours.</p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="contact-form static-section">
      <h2>Send a message</h2>
      <input
        type="text"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <textarea
        rows={5}
        placeholder="How can we help?"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />
      <button className="btn btn-primary">Send message</button>
    </form>
  );
}