import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  adminProductsQuery,
  categoriesQuery,
  ordersQuery,
  primaryImage,
  sortedImages,
  type Product,
} from "@/lib/catalog";
import { formatMnt } from "@/lib/brand";
import { useAuth } from "@/lib/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Vinci Shoes" },
      { name: "description", content: "Vinci internal dashboard for products, stock and orders." },
      { property: "og:title", content: "Admin — Vinci Shoes" },
      { property: "og:description", content: "Vinci internal dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const STATUSES = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"] as const;
type OrderStatus = (typeof STATUSES)[number];
const ORDER_RANGES = [
  { value: "1-day", label: "1 day", days: 1 },
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 30 },
  { value: "all-time", label: "All time", days: null },
] as const;
type OrderRange = (typeof ORDER_RANGES)[number]["value"];

const SIZES = ["35", "36", "37", "38", "39", "40"];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function localDateKey(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
}

function Admin() {
  const { loading, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [orderRange, setOrderRange] = useState<OrderRange>("week");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const products = useQuery({ ...adminProductsQuery, enabled: isAdmin });
  const orders = useQuery({ ...ordersQuery, enabled: isAdmin });
  const categories = useQuery({ ...categoriesQuery, enabled: isAdmin });

  const refreshProducts = () => {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["product"] });
  };

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("products").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProducts();
      toast.success("Product updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <p className="px-10 py-24 text-sm text-muted-foreground">Loading…</p>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <h1 className="font-display text-4xl">Staff only</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This account doesn't have admin access to the Vinci dashboard.
        </p>
      </div>
    );
  }

  const selectedRange = ORDER_RANGES.find((range) => range.value === orderRange)!;
  const visibleOrders = (orders.data ?? []).filter((order) => {
    if (selectedRange.days === null) return true;
    const start = Date.now() - selectedRange.days * 24 * 60 * 60 * 1000;
    return new Date(order.created_at).getTime() >= start;
  });

  const revenue = visibleOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);

  const revenueByDay = selectedRange.days
    ? Array.from({ length: selectedRange.days }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (selectedRange.days! - 1 - index));
        const dateKey = localDateKey(date);
        const dayRevenue = visibleOrders
          .filter(
            (order) =>
              order.status !== "cancelled" && localDateKey(new Date(order.created_at)) === dateKey,
          )
          .reduce((sum, order) => sum + Number(order.total), 0);

        return {
          label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
          revenue: dayRevenue,
        };
      })
    : [];

  const lowStock = (products.data ?? []).flatMap((p) =>
    p.product_variants.filter((v) => v.stock_quantity <= 2).map((v) => ({ p, v })),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
      <span className="eyebrow text-primary">Dashboard</span>
      <h1 className="mt-3 font-display text-5xl">Vinci admin</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <Stat label="Products" value={String(products.data?.length ?? 0)} />
        <Stat label="Orders" value={String(visibleOrders.length)} />
        <Stat label="Revenue" value={formatMnt(revenue)} />
        <Stat label="Low stock" value={String(lowStock.length)} />
      </div>

      {revenueByDay.length > 1 && (
        <section className="mt-10 border p-6">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow text-muted-foreground">Revenue</p>
              <h2 className="mt-1 font-display text-2xl">Daily revenue</h2>
            </div>
            <span className="text-sm text-muted-foreground">{selectedRange.label}</span>
          </div>
          <ChartContainer config={revenueChartConfig} className="h-64 w-full aspect-auto">
            <BarChart accessibilityLayer data={revenueByDay} margin={{ top: 8, right: 8, left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatMnt(value)}
                width={72}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatMnt(Number(value))} />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={2} />
            </BarChart>
          </ChartContainer>
        </section>
      )}

      <Tabs defaultValue="orders" className="mt-12">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="new">Add product</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
            <p className="eyebrow text-muted-foreground">Order history</p>
            <Select
              value={orderRange}
              onValueChange={(value) => setOrderRange(value as OrderRange)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {visibleOrders.map((o) => (
            <div key={o.id} className="border p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mt-1 py-2 text-xs text-muted-foreground font-bold">
                    {" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(o.created_at))}
                  </p>
                  <p className="eyebrow font-bold ">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="mt-1 text-sm">
                    {o.customer_name} · {o.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {o.district ? `${o.district}, ` : ""}
                    {o.address}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl">{formatMnt(o.total)}</span>
                  <Select
                    value={o.status}
                    onValueChange={(status) =>
                      setStatus.mutate({ id: o.id, status: status as OrderStatus })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {o.order_items.map((i) => (
                  <li key={i.id}>
                    {i.product_name} — {i.color} · {i.size} · ×{i.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!orders.isLoading && visibleOrders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {orderRange === "all-time"
                ? "No orders yet."
                : `No orders in the last ${selectedRange.label.toLowerCase()}.`}
            </p>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-8 space-y-3">
          {(products.data ?? []).map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onToggle={() => toggleActive.mutate({ id: p.id, active: !p.active })}
              onChanged={refreshProducts}
            />
          ))}
          {!products.isLoading && (products.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-8">
          <NewProduct
            categories={(categories.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
            onCreated={refreshProducts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductRow({
  product,
  onToggle,
  onChanged,
}: {
  product: Product;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const stock = product.product_variants.reduce((s, v) => s + v.stock_quantity, 0);
  const img = primaryImage(product);

  const [details, setDetails] = useState({
    name: product.name,
    price: String(product.price),
    sale_price: product.sale_price != null ? String(product.sale_price) : "",
    description: product.description ?? "",
    material: product.material ?? "",
    care: product.care ?? "",
  });
  const [newVariant, setNewVariant] = useState({ color: "", size: "35", stock: "0" });
  const [newImage, setNewImage] = useState({ url: "", color: "" });

  async function run(fn: () => Promise<{ error: { message: string } | null }>, msg: string) {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(msg);
      onChanged();
    }
  }

  return (
    <div className="border">
      <div className="flex items-center gap-5 p-4">
        {img && <img src={img} alt="" className="h-20 w-16 object-cover" />}
        <div className="flex-1">
          <p className="text-sm">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatMnt(Number(product.sale_price ?? product.price))} · {stock} in stock ·{" "}
            {product.product_variants.length} variants
          </p>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "eyebrow border px-5 py-2.5",
            product.active ? "border-primary text-primary" : "text-muted-foreground",
          )}
        >
          {product.active ? "Available" : "Unavailable"}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Edit product"
          className="border p-2.5"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="grid gap-8 border-t p-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="eyebrow text-muted-foreground">Details</p>
            <Input
              label="Name"
              value={details.name}
              onChange={(v) => setDetails({ ...details, name: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price"
                value={details.price}
                onChange={(v) => setDetails({ ...details, price: v })}
              />
              <Input
                label="Sale price"
                value={details.sale_price}
                onChange={(v) => setDetails({ ...details, sale_price: v })}
              />
            </div>
            <Input
              label="Description"
              value={details.description}
              onChange={(v) => setDetails({ ...details, description: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Material"
                value={details.material}
                onChange={(v) => setDetails({ ...details, material: v })}
              />
              <Input
                label="Care"
                value={details.care}
                onChange={(v) => setDetails({ ...details, care: v })}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Toggle
                label="Featured"
                on={product.featured}
                onClick={() =>
                  run(
                    () =>
                      supabase
                        .from("products")
                        .update({ featured: !product.featured })
                        .eq("id", product.id),
                    "Updated.",
                  )
                }
              />
              <Toggle
                label="New arrival"
                on={product.new_arrival}
                onClick={() =>
                  run(
                    () =>
                      supabase
                        .from("products")
                        .update({ new_arrival: !product.new_arrival })
                        .eq("id", product.id),
                    "Updated.",
                  )
                }
              />
            </div>
            <button
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    supabase
                      .from("products")
                      .update({
                        name: details.name,
                        price: Number(details.price) || 0,
                        sale_price: details.sale_price ? Number(details.sale_price) : null,
                        description: details.description || null,
                        material: details.material || null,
                        care: details.care || null,
                      })
                      .eq("id", product.id),
                  "Product saved.",
                )
              }
              className="eyebrow bg-primary px-6 py-3 text-primary-foreground disabled:opacity-60"
            >
              Save details
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="eyebrow text-muted-foreground">Stock by colour &amp; size</p>
              <div className="mt-3 space-y-2">
                {[...product.product_variants]
                  .sort((a, b) => a.color.localeCompare(b.color) || a.size.localeCompare(b.size))
                  .map((v) => (
                    <div key={v.id} className="flex items-center gap-3 text-sm">
                      <span className="w-28 truncate">{v.color}</span>
                      <span className="w-10 text-muted-foreground">{v.size}</span>
                      <input
                        type="number"
                        min={0}
                        defaultValue={v.stock_quantity}
                        onBlur={(e) => {
                          const qty = Number(e.target.value);
                          if (qty === v.stock_quantity) return;
                          run(
                            () =>
                              supabase
                                .from("product_variants")
                                .update({ stock_quantity: qty })
                                .eq("id", v.id),
                            "Stock updated.",
                          );
                        }}
                        className="w-24 border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <button
                        aria-label="Delete variant"
                        onClick={() =>
                          run(
                            () => supabase.from("product_variants").delete().eq("id", v.id),
                            "Variant removed.",
                          )
                        }
                        className="p-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <input
                  placeholder="Colour"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  className="w-32 border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <select
                  value={newVariant.size}
                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                  className="border border-input bg-background px-3 py-2 text-sm"
                >
                  {SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                  className="w-24 border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  disabled={busy || !newVariant.color}
                  onClick={() =>
                    run(async () => {
                      const res = await supabase.from("product_variants").insert({
                        product_id: product.id,
                        color: newVariant.color,
                        size: newVariant.size,
                        stock_quantity: Number(newVariant.stock) || 0,
                      });
                      setNewVariant({ color: "", size: "35", stock: "0" });
                      return res;
                    }, "Variant added.")
                  }
                  className="eyebrow border px-4 py-2.5 disabled:opacity-50"
                >
                  Add variant
                </button>
              </div>
            </div>

            <div>
              <p className="eyebrow text-muted-foreground">Photos (tag a colour to link them)</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {sortedImages(product).map((im) => (
                  <div key={im.id} className="w-24">
                    <img src={im.image_url} alt="" className="aspect-[4/5] w-full object-cover" />
                    <div className="mt-1 flex items-center justify-between">
                      <span className="truncate text-[11px] text-muted-foreground">
                        {im.color ?? "all"}
                      </span>
                      <button
                        aria-label="Delete photo"
                        onClick={() =>
                          run(
                            () => supabase.from("product_images").delete().eq("id", im.id),
                            "Photo removed.",
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <input
                  placeholder="Image URL"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  className="min-w-[200px] flex-1 border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  placeholder="Colour (optional)"
                  value={newImage.color}
                  onChange={(e) => setNewImage({ ...newImage, color: e.target.value })}
                  className="w-40 border border-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  disabled={busy || !newImage.url}
                  onClick={() =>
                    run(async () => {
                      const res = await supabase.from("product_images").insert({
                        product_id: product.id,
                        image_url: newImage.url,
                        color: newImage.color || null,
                        sort_order: product.product_images.length,
                      });
                      setNewImage({ url: "", color: "" });
                      return res;
                    }, "Photo added.")
                  }
                  className="eyebrow border px-4 py-2.5 disabled:opacity-50"
                >
                  Add photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewProduct({
  categories,
  onCreated,
}: {
  categories: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    image_url: "",
    colors: "",
    stock: "5",
  });

  async function create() {
    if (!form.name || !form.price) {
      toast.error("Name and price are required.");
      return;
    }
    setBusy(true);
    try {
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name: form.name,
          slug: `${slugify(form.name)}-${Math.random().toString(36).slice(2, 6)}`,
          price: Number(form.price) || 0,
          description: form.description || null,
          category_id: form.category_id || null,
          active: true,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (form.image_url) {
        const { error: imgError } = await supabase
          .from("product_images")
          .insert({ product_id: product.id, image_url: form.image_url, sort_order: 0 });
        if (imgError) throw imgError;
      }

      const colors = form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (colors.length) {
        const rows = colors.flatMap((color) =>
          SIZES.map((size) => ({
            product_id: product.id,
            color,
            size,
            stock_quantity: Number(form.stock) || 0,
          })),
        );
        const { error: varError } = await supabase.from("product_variants").insert(rows);
        if (varError) throw varError;
      }

      toast.success("Product created.");
      setForm({
        name: "",
        price: "",
        description: "",
        category_id: "",
        image_url: "",
        colors: "",
        stock: "5",
      });
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-3 border p-6">
      <p className="eyebrow text-muted-foreground">New product</p>
      <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Input
        label="Price (₮)"
        value={form.price}
        onChange={(v) => setForm({ ...form, price: v })}
      />
      <Input
        label="Description"
        value={form.description}
        onChange={(v) => setForm({ ...form, description: v })}
      />
      <div>
        <label className="eyebrow text-muted-foreground">Category</label>
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Main image URL"
        value={form.image_url}
        onChange={(v) => setForm({ ...form, image_url: v })}
      />
      <Input
        label="Colours (comma separated)"
        value={form.colors}
        onChange={(v) => setForm({ ...form, colors: v })}
      />
      <Input
        label="Starting stock per size"
        value={form.stock}
        onChange={(v) => setForm({ ...form, stock: v })}
      />
      <button
        disabled={busy}
        onClick={create}
        className="eyebrow w-full bg-primary py-4 text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create product"}
      </button>
      <p className="text-xs text-muted-foreground">
        Sizes 35–40 are created for every colour. Add more photos per colour from the Products tab.
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="eyebrow text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "eyebrow border px-4 py-2.5",
        on ? "border-primary text-primary" : "text-muted-foreground",
      )}
    >
      {label}: {on ? "yes" : "no"}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-6">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}
