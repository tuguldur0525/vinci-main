import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Flower } from "@/components/Flower";

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative overflow-hidden bg-ink text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <Flower className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-primary/40" />

      <div className="relative mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
          <div>
            <p className="font-display text-4xl italic">Vinci</p>
            <p className="mt-4 max-w-xs text-sm text-ink-foreground/60">
              Premium Mongolian women's footwear. Tara Center 2F, Ulaanbaatar.
            </p>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Shop</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/shop" className="link-underline">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop" className="link-underline">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/collections" className="link-underline">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">House</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/about" className="link-underline">
                  About Vinci
                </Link>
              </li>
              <li>
                <Link to="/store" className="link-underline">
                  Store
                </Link>
              </li>
              <li>
                <Link to="/store" className="link-underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="link-underline">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="link-underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Stay in the world of Vinci</p>
            <form
              className="mt-5 flex border-b border-ink-foreground/30"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) {
                  toast.error("Please enter a valid email address.");
                  return;
                }
                setEmail("");
                toast.success("Thank you — you're on the list.");
              }}
            >
              <label htmlFor="newsletter" className="sr-only">
                Your email
              </label>
              <input
                id="newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-foreground/40"
              />
              <button
                type="submit"
                className="eyebrow px-2 text-ink-foreground/80 hover:text-ink-foreground"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-8 flex gap-6 text-sm">
              <a
                href="https://instagram.com/vinci_shoes"
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/Vinciofficial"
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Vinci Shoes. Ulaanbaatar, Mongolia.</p>
          <Link to="/admin" className="link-underline">
            Store admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
