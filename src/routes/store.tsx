import { createFileRoute } from "@tanstack/react-router";
import { brandImages } from "@/lib/brand";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Vinci Store — Tara Center 2F, Ulaanbaatar" },
      {
        name: "description",
        content:
          "Visit the Vinci Shoes boutique at Tara Center 2F, Ulaanbaatar. Opening hours, phone and directions.",
      },
      { property: "og:title", content: "Vinci Store — Tara Center 2F, Ulaanbaatar" },
      { property: "og:description", content: "Visit the Vinci boutique in Ulaanbaatar." },
    ],
  }),
  component: Store,
});

const HOURS = [
  ["Monday — Friday", "10:00 — 20:00"],
  ["Saturday", "10:00 — 20:00"],
  ["Sunday", "11:00 — 19:00"],
];

function Store() {
  return (
    <>
      <section className="relative">
        <img
          src={brandImages.storeInterior}
          alt="Interior of the Vinci boutique with red tiled walls and blue accents"
          className="h-[60vh] w-full object-cover"
        />
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <span className="eyebrow text-primary">Come and see</span>
          <h1 className="mt-3 font-display text-5xl md:text-7xl">Vinci Store</h1>
          <p className="mt-6 font-display text-2xl">
            Tara Center, 2F
            <br />
            B-218a, Ulaanbaatar, Mongolia
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=Tara+Center+Ulaanbaatar"
              target="_blank"
              rel="noreferrer"
              className="eyebrow bg-primary px-8 py-4 text-primary-foreground transition-colors hover:bg-ink"
            >
              Open in maps
            </a>
            <a
              href="tel:+97699000000"
              className="eyebrow border border-input px-8 py-4 transition-colors hover:bg-accent"
            >
              Call the store
            </a>
          </div>
        </div>

        <div className="border-t pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          <p className="eyebrow text-muted-foreground">Opening hours</p>
          <ul className="mt-5 space-y-3 text-sm">
            {HOURS.map(([day, time]) => (
              <li key={day} className="flex justify-between border-b pb-3">
                <span>{day}</span>
                <span className="text-muted-foreground">{time}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-12 text-muted-foreground">Find us online</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="https://instagram.com/vinci_shoes" target="_blank" rel="noreferrer" className="link-underline">
                Instagram — @vinci_shoes
              </a>
            </li>
            <li>
              <a href="https://facebook.com/vinci" target="_blank" rel="noreferrer" className="link-underline">
                Facebook — Vinci
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
