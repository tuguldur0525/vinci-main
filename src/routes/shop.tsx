import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { categoriesQuery, colorsOf, effectivePrice, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Shoes — Vinci Shoes" },
      {
        name: "description",
        content:
          "Browse the full Vinci collection: heels, pumps, boots, flats and sandals in Mongolian sizes 35–40.",
      },
      { property: "og:title", content: "Shop All Shoes — Vinci Shoes" },
      { property: "og:description", content: "The full Vinci women's footwear collection." },
    ],
  }),
  component: Shop,
});

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

function Shop() {
  const products = useQuery(productsQuery());
  const categories = useQuery(categoriesQuery);
  const [category, setCategory] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allColors = useMemo(
    () => Array.from(new Set((products.data ?? []).flatMap((p) => colorsOf(p)))),
    [products.data],
  );

  const visible = useMemo(() => {
    let rows = [...(products.data ?? [])];
    if (category) rows = rows.filter((p) => p.categories?.slug === category);
    if (color) rows = rows.filter((p) => colorsOf(p).includes(color));
    if (sort === "price-asc") rows.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "price-desc") rows.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    return rows;
  }, [products.data, category, color, sort]);

  const filters = (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-muted-foreground">Category</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <button
              onClick={() => setCategory(null)}
              className={cn("link-underline", !category && "text-primary")}
            >
              All shoes
            </button>
          </li>
          {(categories.data ?? []).map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(c.slug)}
                className={cn("link-underline", category === c.slug && "text-primary")}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow text-muted-foreground">Colour</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <button
              onClick={() => setColor(null)}
              className={cn("link-underline", !color && "text-primary")}
            >
              All colours
            </button>
          </li>
          {allColors.map((c) => (
            <li key={c}>
              <button
                onClick={() => setColor(c)}
                className={cn("link-underline", color === c && "text-primary")}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow text-muted-foreground">Sort</p>
        <ul className="mt-4 space-y-2 text-sm">
          {SORTS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSort(s.id)}
                className={cn("link-underline", sort === s.id && "text-primary")}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <header className="border-b pb-8">
        <span className="eyebrow text-primary">The collection</span>
        <h1 className="mt-3 font-display text-5xl md:text-7xl">All shoes</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {products.isLoading ? "Loading…" : `${visible.length} styles`}
        </p>
      </header>

      <div className="mt-8 flex gap-12">
        <aside className="hidden w-56 shrink-0 lg:block">{filters}</aside>

        <div className="flex-1">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="eyebrow mb-6 flex items-center gap-2 border px-4 py-3 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filter &amp; sort
          </button>
          {filtersOpen && <div className="mb-8 border-b pb-8 lg:hidden">{filters}</div>}

          {products.isError && (
            <p className="py-20 text-center text-sm text-muted-foreground">
              We couldn't load the collection. Please refresh and try again.
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {products.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="mt-4 h-4 w-2/3" />
                </div>
              ))}
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>

          {!products.isLoading && visible.length === 0 && (
            <p className="py-24 text-center font-display text-2xl">
              Nothing matches these filters yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
