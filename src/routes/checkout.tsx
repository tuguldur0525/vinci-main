import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createWireCheckout } from "@/lib/wire.functions";
import { useCart } from "@/lib/cart";
import { formatMnt } from "@/lib/brand";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vinci Shoes" },
      {
        name: "description",
        content: "Complete your Vinci order with delivery in Ulaanbaatar and across Mongolia.",
      },
      { property: "og:title", content: "Checkout — Vinci Shoes" },
      { property: "og:description", content: "Complete your Vinci order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const DELIVERY_FEE = 5000;

function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [payment, setPayment] = useState<"cod" | "wire">("cod");
  const startWire = useServerFn(createWireCheckout);
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    notes: "",
  });

  const total = subtotal + (lines.length ? DELIVERY_FEE : 0);
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lines.length) return;
    if (
      !form.customer_name.trim() ||
      !form.phone.trim() ||
      !form.district.trim() ||
      !form.address.trim()
    ) {
      toast.error("Please complete your name, phone, district / khoroo, and address.");
      return;
    }
    setSubmitting(true);
    try {
      const orderId = crypto.randomUUID();
      const { error } = await supabase.rpc("place_order", {
        p_order_id: orderId,
        p_user_id: user?.id ?? null,
        p_customer_name: form.customer_name,
        p_phone: form.phone,
        p_email: form.email || null,
        p_address: form.address,
        p_district: form.district || null,
        p_notes: form.notes || null,
        p_subtotal: subtotal,
        p_delivery_fee: DELIVERY_FEE,
        p_total: total,
        p_payment_method: payment,
        p_items: lines.map((l) => ({
          product_id: l.productId,
          product_name: l.name,
          image_url: l.image,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
          price: l.price,
        })),
      });
      if (error) throw error;

      if (payment === "wire") {
        const res = await startWire({
          data: { orderId, returnUrl: `${window.location.origin}/account` },
        });
        clear();
        if (res.url) {
          window.location.href = res.url;
          return;
        }
      }

      clear();
      setDone(orderId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't place your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <span className="eyebrow text-primary">Order received</span>
        <h1 className="mt-4 font-display text-5xl">Thank you.</h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Your order reference is{" "}
          <span className="text-foreground">#{done.slice(0, 8).toUpperCase()}</span>. Our team will
          call you shortly to confirm delivery. Payment is on delivery or by bank transfer.
        </p>
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="eyebrow mt-10 bg-primary px-10 py-4 text-primary-foreground"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="font-display text-5xl">Your bag is empty.</h1>
        <Link
          to="/shop"
          className="eyebrow mt-10 inline-block bg-primary px-10 py-4 text-primary-foreground"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-display text-5xl md:text-6xl">Checkout</h1>

      <div className="mt-10 grid gap-14 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="space-y-5">
          <p className="eyebrow text-muted-foreground">Delivery details</p>
          <Field
            label="Full name"
            required
            value={form.customer_name}
            onChange={set("customer_name")}
          />
          <Field label="Phone" required value={form.phone} onChange={set("phone")} />
          <Field label="Email (optional)" type="email" value={form.email} onChange={set("email")} />
          <Field
            label="District / khoroo"
            required
            value={form.district}
            onChange={set("district")}
          />
          <Field label="Address" required value={form.address} onChange={set("address")} />
          <div>
            <label className="eyebrow text-muted-foreground">Notes</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="pt-2">
            <p className="eyebrow text-muted-foreground">Payment</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "cod", title: "Pay on delivery", note: "Cash or card when we deliver" },
                  { id: "wire", title: "Pay online — Wire", note: "QR code and bank apps" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPayment(opt.id)}
                  className={`border p-4 text-left transition-colors ${
                    payment === opt.id
                      ? "border-primary text-primary"
                      : "border-input hover:border-foreground"
                  }`}
                >
                  <span className="block text-sm">{opt.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{opt.note}</span>
                </button>
              ))}
            </div>
          </div>

          {!user && (
            <p className="text-xs text-muted-foreground">
              Checking out as a guest — no account needed.{" "}
              <Link to="/auth" className="link-underline text-foreground">
                Sign in
              </Link>{" "}
              to track your orders.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="eyebrow w-full bg-primary py-5 text-primary-foreground transition-colors hover:bg-ink disabled:opacity-60"
          >
            {submitting
              ? "Placing order…"
              : payment === "wire"
                ? "Place order & pay"
                : "Place order"}
          </button>
          <p className="text-xs text-muted-foreground">
            Pay on delivery, or online through Wire (QR and Mongolian bank apps). We call every
            order to confirm before dispatch.
          </p>
        </form>

        <aside className="border-t pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <p className="eyebrow text-muted-foreground">Your bag</p>
          <ul className="mt-6 space-y-5">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-4">
                {l.image && <img src={l.image} alt="" className="h-24 w-20 object-cover" />}
                <div className="flex-1 text-sm">
                  <p>{l.name}</p>
                  <p className="text-muted-foreground">
                    {l.color} · {l.size} · ×{l.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatMnt(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-8 space-y-2 border-t pt-6 text-sm">
            <Row label="Subtotal" value={formatMnt(subtotal)} />
            <Row label="Delivery" value={formatMnt(DELIVERY_FEE)} />
            <div className="flex justify-between border-t pt-3 font-display text-2xl">
              <span>Total</span>
              <span>{formatMnt(total)}</span>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="eyebrow text-muted-foreground">{label}</label>
      <input
        {...props}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
