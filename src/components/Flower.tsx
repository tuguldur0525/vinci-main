import { cn } from "@/lib/utils";

/** Stylised edelweiss mark derived from the Vinci flower symbol. */
export function Flower({ className }: { className?: string }) {
  const petals = Array.from({ length: 9 }, (_, i) => (i * 360) / 9);
  return (
    <svg viewBox="0 0 100 100" className={cn("h-6 w-6", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinejoin="round">
        {petals.map((angle, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="24"
            rx="7.5"
            ry="21"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="6" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="font-display text-2xl italic leading-none tracking-tight">Vinci</span>
      <Flower className="h-3.5 w-3.5 translate-y-[-2px]" />
    </span>
  );
}
