import test from "node:test";
import assert from "node:assert/strict";

import { shouldDisplayTrackedOrder } from "./order-tracking.ts";

test("keeps active non-completed orders visible", () => {
  assert.equal(shouldDisplayTrackedOrder("new"), true);
  assert.equal(shouldDisplayTrackedOrder("processing"), true);
  assert.equal(shouldDisplayTrackedOrder("completed"), false);
});
