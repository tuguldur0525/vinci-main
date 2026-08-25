import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vinci Shoes" },
      {
        name: "description",
        content: "How Vinci Shoes collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Vinci Shoes" },
      { property: "og:description", content: "How Vinci handles your data." },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    t: "What we collect",
    d: "Your name, phone number, delivery address and — if you create an account — your email address. We store the contents of your orders so we can fulfil and support them.",
  },
  {
    t: "How we use it",
    d: "To confirm, deliver and support your orders, and to answer enquiries. With your consent, to send occasional news about new collections. We never sell your data.",
  },
  {
    t: "Who can see it",
    d: "Vinci staff who handle orders, and the courier delivering your parcel. Our website and database are operated on secured infrastructure with restricted access.",
  },
  {
    t: "Your choices",
    d: "You can request a copy of your data, ask us to correct it, or ask us to delete your account and order history — except records we must keep for accounting.",
  },
  {
    t: "Contact",
    d: "Write to us on Instagram @vinci_shoes or visit the store at Tara Center 2F, Ulaanbaatar.",
  },
];

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <span className="eyebrow text-primary">Legal</span>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Privacy Policy</h1>
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
