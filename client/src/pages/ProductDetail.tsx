import { useParams, Link } from "wouter";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  ArrowLeft, ArrowUpRight, Check, CheckCircle, ChevronRight,
  Clock, ExternalLink, Monitor, Package, Star,
} from "lucide-react";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`Rating: ${value} out of 5 stars`}>
      {[1,2,3,4,5].map((i) => (
        <button
          key={i}
          type="button"
          role={onChange ? "radio" : undefined}
          aria-checked={onChange ? i === value : undefined}
          aria-label={`${i} star${i !== 1 ? "s" : ""}`}
          onClick={() => onChange?.(i)}
          className="transition-colors"
          style={{ color: i <= value ? "var(--iy-accent)" : "var(--iy-border-strong)", cursor: onChange ? "pointer" : "default", background: "none", border: "none", padding: "2px" }}
        >
          <Star className="w-4 h-4 fill-current" aria-hidden />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const utils = trpc.useUtils();
  const pageRef = useScrollReveal();

  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const { data: reviewData } = trpc.reviews.forProduct.useQuery({ productId: product?.id ?? 0 }, { enabled: !!product?.id });
  const trackBuy = trpc.products.trackBuyClick.useMutation();
  const submitReview = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      toast.success("Review submitted! It will appear after moderation.");
      setReviewTitle(""); setReviewBody(""); setRating(5);
      utils.reviews.forProduct.invalidate({ productId: product?.id });
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return (
    <StorefrontLayout>
      <div className="container py-16 max-w-4xl" aria-busy="true" aria-label="Loading product">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-8" style={{ background: "var(--iy-surface)" }} />
        <div className="h-64 w-full rounded-xl animate-pulse" style={{ background: "var(--iy-surface)" }} />
      </div>
    </StorefrontLayout>
  );

  if (error || !product) return (
    <StorefrontLayout>
      <div className="container py-24 text-center">
        <p className="text-lg" style={{ color: "var(--iy-text-muted)" }}>Product not found.</p>
        <Link href="/products">
          <Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="w-4 h-4" aria-hidden />Back to products</Button>
        </Link>
      </div>
    </StorefrontLayout>
  );

  const isComingSoon = product.status === "coming_soon";
  const features: string[] = product.features ? JSON.parse(product.features) : [];
  const useCases: string[] = product.useCases ? JSON.parse(product.useCases) : [];
  const currSym = product.currency === "GBP" ? "£" : product.currency === "USD" ? "$" : "€";

  return (
    <StorefrontLayout>
      <div className="container max-w-5xl py-10" ref={pageRef as any}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: "var(--iy-text-muted)" }} aria-label="Breadcrumb">
          <Link href="/"><span className="hover:underline cursor-pointer transition-colors" style={{ color: "var(--iy-text-muted)" }}>Home</span></Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <Link href="/products"><span className="hover:underline cursor-pointer transition-colors" style={{ color: "var(--iy-text-muted)" }}>Products</span></Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <span style={{ color: "var(--iy-text-primary)" }} aria-current="page">{product.name}</span>
        </nav>

        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "var(--iy-surface-raised)", border: "1px solid var(--iy-border)" }}>
                {product.iconUrl ? (
                  <img src={product.iconUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="font-serif font-bold text-2xl" style={{ color: "var(--iy-accent)" }} aria-hidden>{product.name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-1.5">
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "var(--iy-surface-overlay)", color: "var(--iy-text-secondary)", border: "1px solid var(--iy-border)" }}>
                      <Clock className="w-3 h-3" aria-hidden /> Coming Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "oklch(from var(--iy-success) l c h / 0.12)", color: "var(--iy-success)", border: "1px solid oklch(from var(--iy-success) l c h / 0.25)" }}>
                      <CheckCircle className="w-3 h-3" aria-hidden /> Available
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "var(--iy-accent-subtle)", color: "var(--iy-accent)", border: "1px solid var(--iy-border-accent)" }}>
                      <Star className="w-3 h-3 fill-current" aria-hidden /> Featured
                    </span>
                  )}
                </div>
                <h1 className="font-serif font-bold" style={{ color: "var(--iy-text-primary)" }}>{product.name}</h1>
              </div>
            </div>
            {product.tagline && <p className="text-lg leading-relaxed mb-3" style={{ color: "var(--iy-text-secondary)" }}>{product.tagline}</p>}
            {product.shortDescription && <p className="text-sm leading-relaxed" style={{ color: "var(--iy-text-muted)" }}>{product.shortDescription}</p>}
          </div>

          {/* Buy card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)", boxShadow: "var(--iy-shadow-md)" }}>
              <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, var(--iy-border-accent), transparent)" }} aria-hidden />
              {isComingSoon ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold" style={{ color: "var(--iy-text-primary)" }}>Coming Soon</p>
                  <p className="text-sm mt-2" style={{ color: "var(--iy-text-muted)" }}>This product is not yet available.</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    {product.basePrice ? (
                      <p className="text-3xl font-bold" style={{ color: "var(--iy-text-primary)" }}>{currSym}{parseFloat(product.basePrice).toFixed(2)}</p>
                    ) : (
                      <p className="text-3xl font-bold" style={{ color: "var(--iy-text-primary)" }}>Free</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--iy-text-muted)" }}>One-time purchase · {product.currency}</p>
                  </div>
                  {product.externalCheckoutUrl ? (
                    <a href={product.externalCheckoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuy.mutate({ productId: product.id })}>
                      <Button className="w-full btn-active gap-2 font-semibold" size="lg" aria-label={`Buy ${product.name} — opens external checkout`}>
                        Buy Now <ExternalLink className="w-4 h-4" aria-hidden />
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full btn-active gap-2 font-semibold" size="lg" disabled aria-label="Checkout link coming soon">
                      Checkout link coming soon
                    </Button>
                  )}
                  <p className="text-[11px] text-center mt-3" style={{ color: "var(--iy-text-muted)" }}>
                    You will be redirected to our secure external checkout.
                  </p>
                </>
              )}
              <Separator className="my-5" style={{ background: "var(--iy-border)" }} />
              <dl className="flex flex-col gap-2.5">
                {product.platform && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--iy-text-muted)" }}>
                    <Monitor className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                    <dt className="sr-only">Platform</dt><dd>{product.platform}</dd>
                  </div>
                )}
                {product.version && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--iy-text-muted)" }}>
                    <Package className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                    <dt className="sr-only">Version</dt><dd>Version {product.version}</dd>
                  </div>
                )}
                {product.supportUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--iy-text-muted)" }} aria-hidden />
                    <a href={product.supportUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--iy-accent)" }}>Support</a>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {product.images && product.images.length > 0 && (
          <section className="mb-14 reveal" aria-label="Product screenshots">
            <h2 className="font-semibold text-xl mb-5" style={{ color: "var(--iy-text-primary)" }}>Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.images.map((img) => (
                <img key={img.id} src={img.url} alt={img.altText ?? `${product.name} screenshot`} className="rounded-xl w-full object-cover" style={{ border: "1px solid var(--iy-border)" }} loading="lazy" />
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {product.description && (
          <section className="mb-14 reveal">
            <h2 className="font-semibold text-xl mb-4" style={{ color: "var(--iy-text-primary)" }}>Overview</h2>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--iy-text-secondary)" }}>{product.description}</div>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="mb-14 reveal">
            <h2 className="font-semibold text-xl mb-5" style={{ color: "var(--iy-text-primary)" }}>Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Product features">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--iy-success)" }} aria-hidden />
                  <span className="text-sm" style={{ color: "var(--iy-text-secondary)" }}>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Use cases */}
        {useCases.length > 0 && (
          <section className="mb-14 reveal">
            <h2 className="font-semibold text-xl mb-5" style={{ color: "var(--iy-text-primary)" }}>Use Cases</h2>
            <ul className="flex flex-col gap-2">
              {useCases.map((u, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "var(--iy-text-secondary)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--iy-accent)" }} aria-hidden />
                  {u}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* System requirements */}
        {product.systemRequirements && (
          <section className="mb-14 reveal">
            <h2 className="font-semibold text-xl mb-4" style={{ color: "var(--iy-text-primary)" }}>System Requirements</h2>
            <div className="rounded-xl px-5 py-4 text-sm" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)", color: "var(--iy-text-secondary)" }}>
              {product.systemRequirements}
            </div>
          </section>
        )}

        {/* Refund policy */}
        {product.refundPolicy && (
          <section className="mb-14 reveal">
            <h2 className="font-semibold text-xl mb-4" style={{ color: "var(--iy-text-primary)" }}>Refund Policy</h2>
            <div className="rounded-xl px-5 py-4 text-sm" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)", color: "var(--iy-text-secondary)" }}>
              {product.refundPolicy}
            </div>
          </section>
        )}

        <Separator className="my-12" style={{ background: "var(--iy-border)" }} />

        {/* Reviews */}
        <section className="reveal" aria-label="Customer reviews">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif font-bold text-2xl" style={{ color: "var(--iy-text-primary)" }}>Reviews</h2>
              {reviewData?.summary && reviewData.summary.count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={Math.round(reviewData.summary.average)} />
                  <span className="text-sm" style={{ color: "var(--iy-text-muted)" }}>
                    {reviewData.summary.average.toFixed(1)} · {reviewData.summary.count} review{reviewData.summary.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {reviewData?.reviews && reviewData.reviews.length > 0 ? (
            <div className="flex flex-col gap-5 mb-10">
              {reviewData.reviews.map((r) => (
                <article key={r.id} className="rounded-xl p-5" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--iy-text-primary)" }}>{r.reviewerName ?? "Anonymous"}</p>
                      <time className="text-[11px]" style={{ color: "var(--iy-text-muted)" }} dateTime={new Date(r.createdAt).toISOString()}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  {r.title && <p className="font-semibold text-sm mb-1" style={{ color: "var(--iy-text-primary)" }}>{r.title}</p>}
                  {r.body && <p className="text-sm leading-relaxed" style={{ color: "var(--iy-text-secondary)" }}>{r.body}</p>}
                  {r.adminReply && (
                    <div className="mt-4 pl-4" style={{ borderLeft: "2px solid var(--iy-border-accent)" }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: "var(--iy-accent)" }}>ITISYOU replied:</p>
                      <p className="text-xs" style={{ color: "var(--iy-text-secondary)" }}>{r.adminReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm mb-10" style={{ color: "var(--iy-text-muted)" }}>No reviews yet. Be the first to review this product.</p>
          )}

          {/* Submit review */}
          {!isComingSoon && (
            <div className="rounded-2xl p-6" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
              <h3 className="font-semibold mb-5" style={{ color: "var(--iy-text-primary)" }}>Write a Review</h3>
              {isAuthenticated ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitReview.mutate({ productId: product.id, rating, title: reviewTitle || undefined, body: reviewBody || undefined });
                  }}
                  className="flex flex-col gap-4"
                  aria-label="Submit a review"
                >
                  <div>
                    <label className="text-xs mb-2 block" style={{ color: "var(--iy-text-secondary)" }}>Your rating</label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <Input
                    placeholder="Review title (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    style={{ background: "var(--iy-surface-overlay)", borderColor: "var(--iy-border)" }}
                    aria-label="Review title"
                  />
                  <Textarea
                    placeholder="Share your experience…"
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    className="min-h-[100px]"
                    style={{ background: "var(--iy-surface-overlay)", borderColor: "var(--iy-border)" }}
                    aria-label="Review body"
                  />
                  <Button type="submit" className="btn-active w-fit" disabled={submitReview.isPending}>
                    {submitReview.isPending ? "Submitting…" : "Submit Review"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm mb-4" style={{ color: "var(--iy-text-muted)" }}>Sign in to leave a review.</p>
                  <Button className="btn-active" onClick={() => startLogin()}>Sign in</Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </StorefrontLayout>
  );
}
