import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/catalog";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Vinci Shoes" },
      {
        name: "description",
        content: "Explore Vinci collections by shape: heels, pumps, boots, flats and sandals.",
      },
      { property: "og:title", content: "Collections — Vinci Shoes" },
      { property: "og:description", content: "Vinci women's footwear, collection by collection." },
    ],
  }),
  component: Collections,
});

function Collections() {
  const categories = useQuery(categoriesQuery);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <header className="border-b pb-8">
        <span className="eyebrow text-primary">Curated</span>
        <h1 className="mt-3 font-display text-5xl md:text-7xl">Collections</h1>
      </header>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/92 px-5 py-4">
              <span className="font-display text-2xl">{c.name}</span>
              <span className="eyebrow text-primary">Shop</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
