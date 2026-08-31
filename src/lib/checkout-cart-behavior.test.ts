import test from "node:test";
import assert from "node:assert/strict";

import { shouldClearCartAfterOrder } from "./checkout-cart-behavior.ts";

test("keeps cart when a Wire checkout is started but not yet completed", () => {
  assert.equal(
    shouldClearCartAfterOrder({ paymentMethod: "wire", orderStatus: "created" }),
    false,
  );
});

test("clears cart after a cod order is placed", () => {
  assert.equal(
    shouldClearCartAfterOrder({ paymentMethod: "cod", orderStatus: "created" }),
    true,
  );
});

test("clears cart after successful Wire payment is confirmed", () => {
  assert.equal(
    shouldClearCartAfterOrder({ paymentMethod: "wire", orderStatus: "paid" }),
    true,
  );
});
