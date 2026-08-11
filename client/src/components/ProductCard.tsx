import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, Star } from "lucide-react";

type Product = {
  id: number;
  slug: string;
  name: string;
  tagline?: string | null;
  shortDescription?: string | null;
  status: string;
  isFeatured: boolean;
  currency: string;
  basePrice?: string | null;
  discountType: string;
  discountValue?: string | null;
  platform?: string | null;
  iconUrl?: string | null;
};

function formatPrice(currency: string, price?: string | null): string {
  if (!price) return "Free";
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
  return `${sym}${parseFloat(price).toFixed(2)}`;
}

function calcDiscountedPrice(basePrice: string, discountType: string, discountValue?: string | null): string | null {
  if (!discountValue || discountType === "none") return null;
  const base = parseFloat(basePrice);
  const val = parseFloat(discountValue);
  if (discountType === "percentage") return (base * (1 - val / 100)).toFixed(2);
  if (discountType === "fixed") return Math.max(0, base - val).toFixed(2);
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const isComingSoon = product.status === "coming_soon";
  const discounted = product.basePrice
    ? calcDiscountedPrice(product.basePrice, product.discountType, product.discountValue)
    : null;

  return (
    <Link href={`/products/${product.slug}`}>
      <article
        className="group relative card-hover cursor-pointer h-full flex flex-col rounded-xl overflow-hidden"
        style={{
          background: "var(--iy-surface)",
          border: "1px solid var(--iy-border)",
          boxShadow: "var(--iy-shadow-sm)",
        }}
        aria-label={`${product.name}${isComingSoon ? " — Coming Soon" : ""}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") (e.currentTarget as HTMLElement).click(); }}
      >
        {/* Top accent line */}
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--iy-border-accent), transparent)" }} aria-hidden />

        <div className="p-5 pb-3 flex-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: "var(--iy-surface-raised)", border: "1px solid var(--iy-border)" }}
            >
              {product.iconUrl ? (
                <img src={product.iconUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="font-serif font-bold text-lg" style={{ color: "var(--iy-accent)" }} aria-hidden>
                  {product.name[0]}
                </span>
              )}
            </div>

            {/* Badges — color + icon + text for accessibility */}
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Product status">
              {product.isFeatured && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--iy-accent-subtle)", color: "var(--iy-accent)", border: "1px solid var(--iy-border-accent)" }}
                  role="listitem"
                >
                  <Star className="w-2.5 h-2.5 fill-current" aria-hidden /> Featured
                </span>
              )}
              {isComingSoon ? (
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--iy-surface-overlay)", color: "var(--iy-text-secondary)", border: "1px solid var(--iy-border)" }}
                  role="listitem"
                  aria-label="Coming Soon"
                >
                  <Clock className="w-2.5 h-2.5" aria-hidden /> Coming Soon
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "oklch(from var(--iy-success) l c h / 0.12)", color: "var(--iy-success)", border: "1px solid oklch(from var(--iy-success) l c h / 0.25)" }}
                  role="listitem"
                  aria-label="Available"
                >
                  <CheckCircle className="w-2.5 h-2.5" aria-hidden /> Available
                </span>
              )}
            </div>
          </div>

          <h3
            className="font-semibold text-base leading-snug mb-1.5 transition-colors"
            style={{ color: "var(--iy-text-primary)" }}
          >
            {product.name}
          </h3>
          {product.tagline && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--iy-text-secondary)" }}>
              {product.tagline}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--iy-border)" }}>
          <div>
            {isComingSoon ? (
              <span className="text-sm font-medium" style={{ color: "var(--iy-text-muted)" }}>Coming Soon</span>
            ) : product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold" style={{ color: "var(--iy-text-primary)" }}>
                  {formatPrice(product.currency, discounted ?? product.basePrice)}
                </span>
                {discounted && (
                  <span className="text-xs line-through" style={{ color: "var(--iy-text-muted)" }}>
                    {formatPrice(product.currency, product.basePrice)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm" style={{ color: "var(--iy-text-muted)" }}>Free</span>
            )}
            {product.platform && (
              <p className="text-[10px] mt-0.5" style={{ color: "var(--iy-text-muted)" }}>{product.platform}</p>
            )}
          </div>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            style={{ color: "var(--iy-text-muted)" }}
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}
