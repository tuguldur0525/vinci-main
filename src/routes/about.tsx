import { createFileRoute, Link } from "@tanstack/react-router";
import { brandImages } from "@/lib/brand";
import { Flower } from "@/components/Flower";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vinci — Walk with Intention" },
      {
        name: "description",
        content:
          "The story of Vinci Shoes: a premium Mongolian women's footwear house built on craftsmanship, confidence and individuality.",
      },
      { property: "og:title", content: "About Vinci — Walk with Intention" },
      { property: "og:description", content: "A premium Mongolian women's footwear house." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="relative bg-primary text-ink-foreground">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <div className="relative mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
          <Flower className="h-10 w-10 text-popover" />
          <h1 className="mt-8 font-display text-6xl leading-[0.95] md:text-8xl">
            Vinci
            <br />
            <span className="italic">Walk with intention.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div className="max-w-lg">
          <span className="eyebrow text-primary">The house</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Born in Ulaanbaatar, made for the way women move.
          </h2>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Vinci began with a simple conviction: that a Mongolian woman should not have to choose
              between a shoe that fits her life and a shoe that fits her taste. We build both.
            </p>
            <p>
              Every silhouette is selected for line, balance and finish — a heel height that carries
              you through a working day, a toe shape that sharpens a whole outfit, leathers that
              soften rather than crack in a Mongolian winter.
            </p>
            <p>
              The edelweiss in our mark is the flower that grows where the air is thinnest. It is
              how we think about elegance: quiet, resilient, unmistakably ours.
            </p>
          </div>
        </div>
        <img
          src={brandImages.campaignWhite}
          alt="A Vinci customer inside the Ulaanbaatar boutique"
          loading="lazy"
          className="aspect-[4/5] w-full object-cover"
        />
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 md:grid-cols-3 md:px-10 md:py-28">
          {[
            {
              t: "Craftsmanship",
              d: "Full-grain and patent leathers, leather linings, finished by hand.",
            },
            { t: "Confidence", d: "Heels engineered around balance, so posture comes free." },
            {
              t: "Individuality",
              d: "Small runs, considered colours, never the same shoe as everyone else.",
            },
          ].map((item) => (
            <div key={item.t}>
              <Flower className="h-6 w-6 text-primary-foreground/70" />
              <h3 className="mt-5 font-display text-3xl">{item.t}</h3>
              <p className="mt-3 text-sm text-primary-foreground/80">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 text-center md:px-10 md:py-28">
        <h2 className="font-display text-5xl md:text-6xl">Step into Vinci.</h2>
        <Link
          to="/shop"
          className="eyebrow mt-10 inline-block bg-primary px-10 py-4 text-primary-foreground transition-colors hover:bg-ink"
        >
          Shop the collection
        </Link>
      </section>
    </>
  );
}
