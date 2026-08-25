import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Vinci Shoes" },
      {
        name: "description",
        content:
          "Vinci delivery times and fees across Mongolia, plus our 14-day exchange and return policy.",
      },
      { property: "og:title", content: "Shipping & Returns — Vinci Shoes" },
      { property: "og:description", content: "Delivery and returns at Vinci Shoes." },
    ],
  }),
  component: ShippingReturns,
});

const SECTIONS = [
  {
    t: "Delivery in Ulaanbaatar",
    d: "₮ 5,000 flat fee, delivered within 1–2 working days. Our team calls to confirm your order and agree a delivery window before dispatch.",
  },
  {
    t: "Countryside delivery",
    d: "3–5 working days via our partner courier. Fees are quoted on the confirmation call and depend on the destination aimag.",
  },
  {
    t: "Collection in store",
    d: "Free. Choose collection during the confirmation call and pick up at Tara Center 2F during opening hours.",
  },
  {
    t: "Exchanges",
    d: "Within 14 days of delivery, unworn, in original box, with the receipt. Size exchanges are free once per order, subject to availability.",
  },
  {
    t: "Returns & refunds",
    d: "Full-price items may be returned within 14 days for a refund to the original payment method. Sale items are exchange-only.",
  },
  {
    t: "Faults",
    d: "If a shoe develops a manufacturing fault within 3 months, bring it to the store. We repair or replace at no cost.",
  },
];

function ShippingReturns() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <span className="eyebrow text-primary">Customer care</span>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Shipping &amp; Returns</h1>
      <div className="mt-12 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.t} className="border-t pt-8">
            <h2 className="font-display text-2xl">{s.t}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
