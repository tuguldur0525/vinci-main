import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { formatMnt } from "@/lib/brand";

export function CartDrawer() {
  const { isOpen, close, lines, setQuantity, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
            role="dialog"
            aria-label="Shopping bag"
          >
            <header className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="eyebrow">Shopping bag</h2>
              <button onClick={close} aria-label="Close bag" className="p-1">
                <X className="h-4 w-4" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-2xl">Your bag is empty</p>
                <p className="text-sm text-muted-foreground">
                  Every Vinci pair begins with a single step.
                </p>
                <Link
                  to="/shop"
                  onClick={close}
                  className="eyebrow border border-foreground px-6 py-3 transition-colors hover:bg-foreground hover:text-background"
                >
                  Shop all
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {lines.map((line) => (
                    <div key={line.key} className="flex gap-4 border-b py-5 last:border-0">
                      {line.image && (
                        <img
                          src={line.image}
                          alt={line.name}
                          loading="lazy"
                          className="h-28 w-24 shrink-0 bg-bone object-cover"
                        />
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <Link
                            to="/products/$slug"
                            params={{ slug: line.slug }}
                            onClick={close}
                            className="text-sm font-medium"
                          >
                            {line.name}
                          </Link>
                          <button
                            onClick={() => remove(line.key)}
                            aria-label={`Remove ${line.name}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.color} · Size {line.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border">
                            <button
                              className="px-2 py-1"
                              aria-label="Decrease quantity"
                              onClick={() => setQuantity(line.key, line.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{line.quantity}</span>
                            <button
                              className="px-2 py-1"
                              aria-label="Increase quantity"
                              onClick={() => setQuantity(line.key, line.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm">{formatMnt(line.price * line.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="border-t px-6 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="eyebrow">Subtotal</span>
                    <span className="font-display text-xl">{formatMnt(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Delivery calculated at checkout.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={close}
                    className="eyebrow mt-4 block bg-primary px-6 py-4 text-center text-primary-foreground transition-colors hover:bg-ink"
                  >
                    Checkout
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
