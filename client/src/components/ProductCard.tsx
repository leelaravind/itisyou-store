import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Star } from "lucide-react";

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
  const discounted = product.basePrice ? calcDiscountedPrice(product.basePrice, product.discountType, product.discountValue) : null;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group relative bg-card border border-border/60 rounded-xl overflow-hidden card-hover cursor-pointer h-full flex flex-col">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Icon / placeholder */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/60">
              {product.iconUrl ? (
                <img src={product.iconUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif font-bold text-primary text-lg">{product.name[0]}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.isFeatured && (
                <Badge className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary border-primary/20 font-medium">
                  <Star className="w-2.5 h-2.5 mr-1" />Featured
                </Badge>
              )}
              {isComingSoon && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
                  <Clock className="w-2.5 h-2.5 mr-1" />Coming Soon
                </Badge>
              )}
            </div>
          </div>

          <h3 className="mt-4 font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.tagline && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{product.tagline}</p>
          )}
        </div>

        <div className="flex-1" />

        <div className="px-6 pb-6 pt-2 flex items-center justify-between">
          <div>
            {isComingSoon ? (
              <span className="text-sm text-muted-foreground font-medium">Coming Soon</span>
            ) : product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-foreground">
                  {formatPrice(product.currency, discounted ?? product.basePrice)}
                </span>
                {discounted && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.currency, product.basePrice)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Free</span>
            )}
            {product.platform && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{product.platform}</p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
