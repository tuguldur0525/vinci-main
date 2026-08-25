import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/cancel")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : "",
  }),
  head: () => ({
    meta: [{ title: "Payment cancelled — Vinci Shoes" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentCancel,
});

function PaymentCancel() {
  const { order } = Route.useSearch();
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <span className="eyebrow text-muted-foreground">Payment cancelled</span>
      <h1 className="mt-4 font-display text-5xl">No payment was taken.</h1>
      <p className="mt-5 text-sm text-muted-foreground">
        Your order remains unpaid. Return to checkout to try again, or choose payment on delivery.
      </p>
      {order && <p className="mt-3 text-sm">Order #{order.slice(0, 8).toUpperCase()}</p>}
      <Link
        to="/checkout"
        className="eyebrow mt-10 inline-block bg-primary px-10 py-4 text-primary-foreground"
      >
        Return to checkout
      </Link>
    </div>
  );
}
