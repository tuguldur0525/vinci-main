import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { formatMnt } from "@/lib/brand";
import { colorsOf, effectivePrice, primaryImage, sortedImages, type Product } from "@/lib/catalog";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const images = sortedImages(product);
  const image = primaryImage(product);
  const hoverImage = images[1]?.image_url;
  const colors = colorsOf(product);
  const onSale = product.sale_price != null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative overflow-hidden bg-bone">
          {image && (
            <img
              src={image}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          )}
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              loading="lazy"
              aria-hidden="true"
              className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-0 top-0 flex flex-col items-start gap-1 p-3">
            {product.new_arrival && (
              <span className="eyebrow bg-background px-2 py-1 text-foreground">New</span>
            )}
            {onSale && (
              <span className="eyebrow bg-primary px-2 py-1 text-primary-foreground">Sale</span>
            )}
          </div>
          <span className="eyebrow pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 bg-background/95 py-3 text-center opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Quick view
          </span>
        </div>
        <div className="pt-4">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="mt-1 text-sm">
            {onSale && (
              <span className="mr-2 text-muted-foreground line-through">
                {formatMnt(product.price)}
              </span>
            )}
            <span className={onSale ? "text-primary" : ""}>{formatMnt(effectivePrice(product))}</span>
          </p>
          {colors.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{colors.join(" · ")}</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
