export type CheckoutPaymentMethod = "wire" | "cod";
export type OrderStatus = "created" | "paid" | "failed" | "cancelled";

export function shouldClearCartAfterOrder({
  paymentMethod,
  orderStatus,
}: {
  paymentMethod: CheckoutPaymentMethod;
  orderStatus: OrderStatus;
}) {
  if (paymentMethod === "wire") {
    return orderStatus === "paid";
  }

  return orderStatus === "created";
}
