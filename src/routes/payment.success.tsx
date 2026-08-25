import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : "",
  }),
  head: () => ({
    meta: [{ title: "Payment received — Vinci Shoes" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { order } = Route.useSearch();
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <span className="eyebrow text-primary">Payment received</span>
      <h1 className="mt-4 font-display text-5xl">Thank you.</h1>
      <p className="mt-5 text-sm text-muted-foreground">
        Your payment is being verified. We will update your order when Wire confirms it.
      </p>
      {order && <p className="mt-3 text-sm">Order #{order.slice(0, 8).toUpperCase()}</p>}
      <Link
        to="/shop"
        className="eyebrow mt-10 inline-block bg-primary px-10 py-4 text-primary-foreground"
      >
        Continue shopping
      </Link>
    </div>
  );
}
