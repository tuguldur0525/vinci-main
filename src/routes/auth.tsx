import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/useAuth";
import { Flower } from "@/components/Flower";
import { formatMnt } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Vinci Shoes" },
      {
        name: "description",
        content: "Sign in to your Vinci account to track orders and save favourites.",
      },
      { property: "og:title", content: "Sign in — Vinci Shoes" },
      { property: "og:description", content: "Access your Vinci account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/account" });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  }

  async function trackOrder(e: React.FormEvent) {
    e.preventDefault();
    setTrackingBusy(true);
    setTrackedOrder(null);
    setTrackingError("");

    const reference = orderReference.trim().replace(/^#/, "");
    if (!/^[a-f\d]{8}$/i.test(reference)) {
      setTrackingError("Enter the 8-character order number from your confirmation.");
      setTrackingBusy(false);
      return;
    }

    const { data, error } = await supabase.rpc("track_order", { order_reference: reference });
    if (error || !data?.[0]) {
      setTrackingError("We couldn't find that order. Check the number and try again.");
    } else {
      setTrackedOrder(data[0]);
    }
    setTrackingBusy(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24">
      <Flower className="h-8 w-8 text-primary" />
      <h1 className="mt-6 font-display text-4xl">
        {mode === "signin" ? "Welcome back" : "Create an account"}
      </h1>

      <form onSubmit={submit} className="mt-10 w-full space-y-4">
        {mode === "signup" && (
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="eyebrow w-full bg-primary py-4 text-primary-foreground transition-colors hover:bg-ink disabled:opacity-60"
        >
          {mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={google}
        className="eyebrow mt-3 w-full border border-input py-4 transition-colors hover:bg-accent"
      >
        Continue with Google
      </button>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="link-underline mt-8 text-sm text-muted-foreground"
      >
        {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
      </button>

      <div className="mt-16 w-full border-t pt-10">
        <span className="eyebrow text-primary">Guest access</span>
        <h2 className="mt-3 font-display text-3xl">Track your order</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Enter the order number from your confirmation. No sign in required.
        </p>

        <form onSubmit={trackOrder} className="mt-6 space-y-3">
          <label htmlFor="order-reference" className="sr-only">
            Order number
          </label>
          <input
            id="order-reference"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={9}
            placeholder="#B449A986"
            value={orderReference}
            onChange={(e) => setOrderReference(e.target.value.toUpperCase())}
            className="w-full border border-input bg-background px-4 py-3 text-sm uppercase outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={trackingBusy}
            className="eyebrow w-full border border-primary py-4 text-primary transition-colors hover:bg-accent disabled:opacity-60"
          >
            {trackingBusy ? "Searching…" : "Track order"}
          </button>
        </form>

        {trackingError && <p className="mt-4 text-sm text-destructive">{trackingError}</p>}
        {trackedOrder && (
          <div className="mt-6 border border-input bg-secondary p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="eyebrow">{trackedOrder.order_reference}</span>
              <span className="eyebrow text-primary">{trackedOrder.status}</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Placed{" "}
              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                new Date(trackedOrder.created_at),
              )}
            </p>
            <div className="mt-4 flex justify-between border-t pt-4 text-sm">
              <span>
                {trackedOrder.item_count} {trackedOrder.item_count === 1 ? "item" : "items"}
              </span>
              <span className="font-medium">{formatMnt(trackedOrder.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type TrackedOrder = {
  order_reference: string;
  status: string;
  created_at: string;
  total: number;
  item_count: number;
};
