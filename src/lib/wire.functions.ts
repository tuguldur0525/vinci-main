import { createServerFn } from "@tanstack/react-start";

/**
 * Creates a Wire (wire.mn) PaymentIntent + hosted checkout session for an
 * existing order and returns the hosted checkout URL.
 */
export const createWireCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string; returnUrl: string }) => {
    if (!data?.orderId || typeof data.orderId !== "string") throw new Error("orderId is required");
    if (!data?.returnUrl || !/^https?:\/\//.test(data.returnUrl)) throw new Error("Invalid return URL");
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["WIRE_API_KEY"];
    if (!apiKey) throw new Error("Wire is not configured yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,total,payment_status,customer_name")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");
    if (order.payment_status === "paid") return { url: null, alreadyPaid: true as const };

    const base = "https://api.wire.mn/v1";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const intentRes = await fetch(`${base}/payment_intents`, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": `order_${order.id}` },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100), // MNT minor units
        currency: "MNT",
        description: `Vinci Shoes order ${order.id.slice(0, 8).toUpperCase()}`,
        metadata: { order_id: order.id },
      }),
    });
    if (!intentRes.ok) {
      console.error("wire payment_intent failed", intentRes.status, await intentRes.text());
      throw new Error("We couldn't start the payment. Please try again or pay on delivery.");
    }
    const intent = (await intentRes.json()) as { id: string };

    const sessionRes = await fetch(`${base}/checkout/sessions`, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": `session_${order.id}` },
      body: JSON.stringify({
        payment_intent: intent.id,
        success_url: data.returnUrl,
        cancel_url: data.returnUrl,
      }),
    });
    if (!sessionRes.ok) {
      console.error("wire checkout session failed", sessionRes.status, await sessionRes.text());
      throw new Error("We couldn't open the payment page. Please try again.");
    }
    const session = (await sessionRes.json()) as { url?: string; token?: string };
    const url = session.url ?? (session.token ? `https://pay.wire.mn/c/${session.token}` : null);
    if (!url) throw new Error("Payment page unavailable.");

    await supabaseAdmin
      .from("orders")
      .update({ wire_payment_intent_id: intent.id, payment_method: "wire" })
      .eq("id", order.id);

    return { url, alreadyPaid: false as const };
  });
