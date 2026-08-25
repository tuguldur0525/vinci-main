import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { brandImages } from "@/lib/brand";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Flower } from "@/components/Flower";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vinci Shoes — Walk with Intention" },
      {
        name: "description",
        content:
          "Premium Mongolian women's footwear. Heels, pumps, boots and flats, designed to make every step unforgettable.",
      },
      { property: "og:title", content: "Vinci Shoes — Walk with Intention" },
      {
        property: "og:description",
        content: "Premium Mongolian women's footwear from Ulaanbaatar.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = useQuery(productsQuery());
  const categories = useQuery(categoriesQuery);

  const featuredList = (featured.data ?? []).filter((p) => p.featured).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] w-full overflow-hidden bg-ink">
        <img
          src={brandImages.campaignRedHeels}
          alt="Vinci burgundy leather pumps photographed against a deep blue backdrop"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-[1600px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-ink-foreground"
          >
            <span className="eyebrow flex items-center gap-3 text-ink-foreground/70">
              <Flower className="h-4 w-4" /> Autumn / Winter
            </span>
            <h1 className="mt-6 font-display text-6xl leading-[0.95] md:text-8xl">
              Walk with
              <br />
              intention.
            </h1>
            <p className="mt-6 max-w-md text-sm text-ink-foreground/75 md:text-base">
              Premium women's footwear, designed to make every step unforgettable.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="eyebrow bg-primary px-8 py-4 text-primary-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                Shop new arrivals
              </Link>
              <Link
                to="/collections"
                className="eyebrow border border-ink-foreground/40 px-8 py-4 transition-colors hover:bg-ink-foreground hover:text-ink"
              >
                Explore collection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">New season</span>
            <h2 className="mt-3 font-display text-5xl md:text-6xl">Made to be noticed.</h2>
          </div>
          <Link to="/shop" className="eyebrow link-underline self-start">
            View all shoes
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {featured.isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
              </div>
            ))}
          {featuredList.map((p, i) => (
            <div key={p.id} className={i % 2 === 1 ? "lg:pt-16" : undefined}>
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL BAND */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div>
            <span className="eyebrow text-primary-foreground/70">The house of Vinci</span>
            <h2 className="mt-4 font-display text-5xl leading-tight md:text-7xl">
              A Mongolian
              <br />
              idea of elegance.
            </h2>
            <p className="mt-6 max-w-md text-sm text-primary-foreground/80">
              Every pair is chosen for line, balance and finish — shoes made for women who decide
              where they are going.
            </p>
            <Link
              to="/about"
              className="eyebrow mt-10 inline-block border border-primary-foreground/50 px-8 py-4 transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              Our story
            </Link>
          </div>
          <img
            src={brandImages.campaignMirror}
            alt="Model in the Vinci store wearing black patent heels"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <span className="eyebrow text-primary">Shop by shape</span>
        <h2 className="mt-3 font-display text-5xl md:text-6xl">The categories.</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="group relative block overflow-hidden bg-bone"
            >
              {c.image_url && (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
              )}
              <span className="eyebrow absolute bottom-0 left-0 right-0 bg-background/90 py-3 text-center">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-bone">
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-28">
          <img
            src={brandImages.campaignWhite}
            alt="Vinci customer seated in the store wearing black pumps"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div>
            <span className="eyebrow text-primary">Vinci women</span>
            <h2 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
              Worn by women
              <br />
              with intention.
            </h2>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              From the Tara Center boutique to evenings across Ulaanbaatar — our shoes are chosen,
              worn and lived in.
            </p>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-primary">Follow Vinci</span>
            <h2 className="mt-3 font-display text-5xl md:text-6xl">@vinci_shoes</h2>
          </div>
          <a
            href="https://instagram.com/vinci_shoes"
            target="_blank"
            rel="noreferrer"
            className="eyebrow link-underline self-start"
          >
            Follow us on Instagram
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            brandImages.storeInterior,
            brandImages.campaignMirror,
            brandImages.campaignWhite,
            brandImages.campaignRedHeels,
          ].map((src) => (
            <a
              key={src}
              href="https://instagram.com/vinci_shoes"
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden bg-bone"
            >
              <img
                src={src}
                alt="Vinci Shoes on Instagram"
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
