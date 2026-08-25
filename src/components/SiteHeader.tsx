import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { Wordmark } from "@/components/Flower";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "New Arrivals", to: "/shop", search: { new: true } as const },
  { label: "Shoes", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "About Vinci", to: "/about" },
  { label: "Store", to: "/store" },
];

export function SiteHeader() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-shadow",
          scrolled ? "border-border shadow-[0_1px_0_0_var(--border)]" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
          <button
            className="-ml-1 p-1 md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden flex-1 items-center gap-8 md:flex">
            {NAV.slice(0, 3).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="eyebrow link-underline text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/"
            aria-label="Vinci Shoes home"
            className="md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Wordmark className="text-primary" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5">
            <nav className="hidden items-center gap-8 lg:flex">
              {NAV.slice(3).map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="eyebrow link-underline text-foreground/80 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link to="/shop" aria-label="Search shoes" className="hidden p-1 sm:block">
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/auth" aria-label="Account" className="hidden p-1 sm:block">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button
              onClick={open}
              aria-label={`Shopping bag, ${count} items`}
              className="relative p-1"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <Wordmark className="text-primary" />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-5 pt-6">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b py-5 font-display text-3xl"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="eyebrow mt-8 text-muted-foreground"
              >
                Account
              </Link>
              <Link
                to="/track-order"
                onClick={() => setMenuOpen(false)}
                className="eyebrow mt-5 text-muted-foreground"
              >
                Track order
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
