import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  colorsOf,
  effectivePrice,
  imagesForColor,
  productQuery,
  productsQuery,
  stockForColor,
} from "@/lib/catalog";
import { formatMnt } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — Vinci Shoes`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${name} by Vinci — premium women's footwear, handmade finish, Mongolian sizes 35–40.`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: `${name} by Vinci Shoes.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isError } = useQuery(productQuery(slug));
  const related = useQuery(productsQuery());
  const { add } = useCart();

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [wished, setWished] = useState(false);

  const colors = product ? colorsOf(product) : [];
  const images = product ? imagesForColor(product, color) : [];

  useEffect(() => {
    if (colors.length && !color) {
      const firstInStock = colors.find((c) => stockForColor(product!, c) > 0);
      setColor(firstInStock ?? colors[0] ?? null);
    }
  }, [colors, color, product]);

  // Reset the gallery whenever the colourway changes.
  useEffect(() => {
    setActive(0);
  }, [color]);

  const sizesForColor = useMemo(() => {
    if (!product || !color) return [];
    return product.product_variants
      .filter((v) => v.color === color)
      .sort((a, b) => a.size.localeCompare(b.size));
  }, [product, color]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 md:grid-cols-2 md:px-10">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="font-display text-4xl">We couldn't find that shoe</h1>
        <Link to="/shop" className="eyebrow mt-8 inline-block bg-primary px-8 py-4 text-primary-foreground">
          Back to the collection
        </Link>
      </div>
    );
  }

  const price = effectivePrice(product);
  const onSale = product.sale_price != null;
  const selectedVariant = sizesForColor.find((v) => v.size === size);
  const relatedList = (related.data ?? []).filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-8 md:px-10 md:py-12">
      <nav className="eyebrow text-muted-foreground">
        <Link to="/shop" className="link-underline">Shoes</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        {/* GALLERY */}
        <div>
          <div className="bg-bone">
            <img
              src={images[active]?.image_url}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "w-20 shrink-0 border-2 bg-bone",
                    i === active ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={img.image_url} alt="" className="aspect-[4/5] w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="lg:pt-6">
          {product.new_arrival && <span className="eyebrow text-primary">New arrival</span>}
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg">
            {onSale && (
              <span className="mr-3 text-muted-foreground line-through">
                {formatMnt(product.price)}
              </span>
            )}
            <span className={onSale ? "text-primary" : ""}>{formatMnt(price)}</span>
          </p>
          {product.description && (
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <p className="eyebrow text-muted-foreground">Colour — {color}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((c) => {
                const soldOut = stockForColor(product, c) <= 0;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setSize(null);
                    }}
                    className={cn(
                      "border px-5 py-3 text-sm transition-colors",
                      color === c
                        ? "border-primary text-primary"
                        : "border-input hover:border-foreground",
                      soldOut && "text-muted-foreground/50",
                    )}
                  >
                    {c}
                    {soldOut && <span className="ml-2 text-[10px] uppercase">Sold out</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted-foreground">Size (EU)</p>
              <span className="text-xs text-muted-foreground">Mongolian sizing 35–40</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {sizesForColor.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock_quantity <= 0}
                  onClick={() => setSize(v.size)}
                  className={cn(
                    "border py-3 text-sm transition-colors",
                    size === v.size ? "border-primary text-primary" : "border-input hover:border-foreground",
                    v.stock_quantity <= 0 && "cursor-not-allowed text-muted-foreground/40 line-through",
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock_quantity <= 3 && (
              <p className="mt-2 text-xs text-primary">
                Only {selectedVariant.stock_quantity} left in this size.
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-3 py-3">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="px-3 py-3">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => setWished((w) => !w)}
              aria-label="Add to wishlist"
              className="border p-3.5"
            >
              <Heart className={cn("h-4 w-4", wished && "fill-primary text-primary")} />
            </button>
          </div>

          <button
            onClick={() => {
              if (!color || !size) {
                toast.error("Please choose a colour and size.");
                return;
              }
              add(
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: images[0]?.image_url ?? null,
                  color,
                  size,
                  price,
                },
                qty,
              );
              toast.success(`${product.name} added to your bag.`);
            }}
            className="eyebrow mt-6 w-full bg-primary py-5 text-primary-foreground transition-colors hover:bg-ink"
          >
            Add to bag
          </button>

          <Accordion type="single" collapsible className="mt-10">
            {product.material && (
              <AccordionItem value="materials">
                <AccordionTrigger className="eyebrow">Materials</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {product.material}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.care && (
              <AccordionItem value="care">
                <AccordionTrigger className="eyebrow">Care</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {product.care}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="shipping">
              <AccordionTrigger className="eyebrow">Shipping &amp; returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Delivery within Ulaanbaatar in 1–2 days (₮ 5,000), countryside 3–5 days. Exchanges
                accepted within 14 days, unworn and in original packaging.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {relatedList.length > 0 && (
        <section className="mt-24 border-t pt-16">
          <h2 className="font-display text-4xl">You may also like</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {relatedList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
