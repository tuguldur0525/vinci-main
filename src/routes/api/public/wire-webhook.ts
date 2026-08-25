import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function verify(signatureHeader: string | null, body: string, secret: string) {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  ) as { t?: string; v1?: string };
  if (!parts.t || !parts.v1) return false;
  // Reject anything older than 5 minutes.
  const ts = Number(parts.t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${body}`).digest("hex");
  const a = Buffer.from(parts.v1);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/wire-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WIRE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        const signature =
          request.headers.get("WirePayment-Signature") ??
          request.headers.get("wirepayment-signature");
        if (!verify(signature, body, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { type?: string; data?: { object?: { id?: string } } };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const intentId = event.data?.object?.id;
        if (!intentId) return new Response("ok");

        const status =
          event.type === "payment_intent.succeeded"
            ? "paid"
            : event.type === "payment_intent.canceled" || event.type === "payment_intent.failed"
              ? "failed"
              : null;
        if (!status) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: status,
            ...(status === "paid" ? { status: "confirmed" as const } : {}),
          })
          .eq("wire_payment_intent_id", intentId);

        return new Response("ok");
      },
    },
  },
});
