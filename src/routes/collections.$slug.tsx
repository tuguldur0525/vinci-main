import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const title = `${params.slug.replace(/-/g, " ")} — Vinci Shoes`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Shop the Vinci ${params.slug.replace(/-/g, " ")} collection — premium women's footwear from Ulaanbaatar.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `The Vinci ${params.slug.replace(/-/g, " ")} collection.`,
        },
      ],
    };
  },
  component: Collection,
});

function Collection() {
  const { slug } = Route.useParams();
  const products = useQuery(productsQuery({ categorySlug: slug }));
  const categories = useQuery(categoriesQuery);
  const category = (categories.data ?? []).find((c) => c.slug === slug);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <nav className="eyebrow text-muted-foreground">
        <Link to="/collections" className="link-underline">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category?.name ?? slug}</span>
      </nav>

      <header className="mt-4 border-b pb-8">
        <h1 className="font-display text-5xl capitalize md:text-7xl">
          {category?.name ?? slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {products.isLoading ? "Loading…" : `${products.data?.length ?? 0} styles`}
        </p>
      </header>

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
        {products.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="mt-4 h-4 w-2/3" />
            </div>
          ))}
        {(products.data ?? []).map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>

      {!products.isLoading && (products.data?.length ?? 0) === 0 && (
        <p className="py-24 text-center font-display text-2xl">
          This collection is being restocked.
        </p>
      )}
    </div>
  );
}
