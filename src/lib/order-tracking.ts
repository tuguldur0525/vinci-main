export function shouldDisplayTrackedOrder(status: string) {
  return status !== "completed";
}
