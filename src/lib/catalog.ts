import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

export type Variant = {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock_quantity: number;
};

export type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
  color: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  material: string | null;
  care: string | null;
  featured: boolean;
  new_arrival: boolean;
  active: boolean;
  created_at: string;
  product_images: ProductImage[];
  product_variants: Variant[];
  categories?: { name: string; slug: string } | null;
};

const PRODUCT_SELECT =
  "*, product_images(id,image_url,sort_order,color), product_variants(id,product_id,color,size,stock_quantity), categories(name,slug)";

export function sortedImages(product: Pick<Product, "product_images">) {
  return [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export function primaryImage(product: Pick<Product, "product_images">) {
  return sortedImages(product)[0]?.image_url ?? null;
}

export function imagesForColor(
  product: Pick<Product, "product_images">,
  color: string | null,
) {
  const all = sortedImages(product);
  if (!color) return all;
  const matched = all.filter((i) => (i.color ?? "").toLowerCase() === color.toLowerCase());
  return matched.length ? matched : all;
}

export function stockForColor(product: Pick<Product, "product_variants">, color: string) {
  return (product.product_variants ?? [])
    .filter((v) => v.color === color)
    .reduce((s, v) => s + v.stock_quantity, 0);
}

export function colorsOf(product: Pick<Product, "product_variants">) {
  return Array.from(new Set((product.product_variants ?? []).map((v) => v.color)));
}

export function sizesOf(product: Pick<Product, "product_variants">) {
  return Array.from(new Set((product.product_variants ?? []).map((v) => v.size))).sort();
}

export function effectivePrice(product: Pick<Product, "price" | "sale_price">) {
  return Number(product.sale_price ?? product.price);
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const productsQuery = (filters?: { categorySlug?: string; newOnly?: boolean }) =>
  queryOptions({
    queryKey: ["products", filters ?? {}],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (filters?.newOnly) q = q.eq("new_arrival", true);
      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as Product[];
      if (filters?.categorySlug) {
        rows = rows.filter((p) => p.categories?.slug === filters.categorySlug);
      }
      return rows;
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
});

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  district: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    image_url: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
    price: number;
  }[];
};

export const ordersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Order[];
  },
});
