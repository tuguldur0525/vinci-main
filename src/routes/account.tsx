import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { formatMnt } from "@/lib/brand";
import type { Order } from "@/lib/catalog";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Vinci Shoes" },
      { name: "description", content: "View your Vinci orders and account details." },
      { property: "og:title", content: "My account — Vinci Shoes" },
      { property: "og:description", content: "Your Vinci orders and details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-16 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-8">
        <div>
          <span className="eyebrow text-primary">My account</span>
          <h1 className="mt-3 font-display text-5xl">{user?.email ?? ""}</h1>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Link to="/admin" className="eyebrow border border-input px-6 py-3">
              Admin
            </Link>
          )}
          <button onClick={() => signOut()} className="eyebrow border border-input px-6 py-3">
            Sign out
          </button>
        </div>
      </div>

      <h2 className="mt-12 font-display text-3xl">Orders</h2>
      {orders.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {!orders.isLoading && (orders.data?.length ?? 0) === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">You haven't placed an order yet.</p>
      )}

      <ul className="mt-6 space-y-5">
        {(orders.data ?? []).map((o) => (
          <li key={o.id} className="border p-6">
            <div className="flex flex-wrap justify-between gap-3">
              <span className="eyebrow">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="eyebrow text-primary">{o.status}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {o.order_items.map((i) => (
                <li key={i.id}>
                  {i.product_name} — {i.color} · {i.size} · ×{i.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-display text-2xl">{formatMnt(o.total)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
