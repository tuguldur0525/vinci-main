import { createFileRoute } from "@tanstack/react-router";
import { Wire, SIGNATURE_HEADER } from "@buildry-wire/wire";

export const Route = createFileRoute("/api/public/wire-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WIRE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        let event: { id: string; type: string; data: Record<string, unknown> };
        try {
          const signature = request.headers.get(SIGNATURE_HEADER);
          if (!signature) return new Response("Invalid signature", { status: 401 });
          event = new Wire("webhook-verification").webhooks.verify(body, signature, secret);
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = event.data as { id?: string; object?: { id?: string } };
        const intentId = payload.id ?? payload.object?.id;
        if (!intentId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        if (event.type === "payment_intent.succeeded") {
          const { error } = await supabaseAdmin.rpc("complete_wire_order", {
            p_event_id: event.id,
            p_payment_intent_id: intentId,
          });
          if (error) throw error;
        } else if (
          event.type === "payment_intent.canceled" ||
          event.type === "payment_intent.failed"
        ) {
          const { error } = await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed" })
            .eq("wire_payment_intent_id", intentId)
            .neq("payment_status", "paid");
          if (error) throw error;
        }

        return new Response("ok");
      },
    },
  },
});
