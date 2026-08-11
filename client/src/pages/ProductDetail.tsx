import { useParams, Link } from "wouter";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Check, ChevronRight, Clock,
  ExternalLink, Monitor, Package, Star, StarIcon,
} from "lucide-react";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={`transition-colors ${i <= value ? "text-primary" : "text-muted-foreground/30"} ${onChange ? "hover:text-primary cursor-pointer" : "cursor-default"}`}
        >
          <StarIcon className="w-4 h-4 fill-current" />
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

  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const { data: reviewData } = trpc.reviews.forProduct.useQuery(
    { productId: product?.id ?? 0 },
    { enabled: !!product?.id }
  );
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
      <div className="container py-16 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-8 bg-card" />
        <Skeleton className="h-64 w-full rounded-xl bg-card" />
      </div>
    </StorefrontLayout>
  );

  if (error || !product) return (
    <StorefrontLayout>
      <div className="container py-24 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link href="/products"><Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="w-4 h-4" />Back to products</Button></Link>
      </div>
    </StorefrontLayout>
  );

  const isComingSoon = product.status === "coming_soon";
  const features: string[] = product.features ? JSON.parse(product.features) : [];
  const useCases: string[] = product.useCases ? JSON.parse(product.useCases) : [];
  const currSym = product.currency === "GBP" ? "£" : product.currency === "USD" ? "$" : "€";

  return (
    <StorefrontLayout>
      <div className="container max-w-5xl py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/"><span className="hover:text-foreground transition-colors cursor-pointer">Home</span></Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products"><span className="hover:text-foreground transition-colors cursor-pointer">Products</span></Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.iconUrl ? (
                  <img src={product.iconUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-primary text-2xl">{product.name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-1.5">
                  {isComingSoon ? (
                    <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />Coming Soon</Badge>
                  ) : (
                    <Badge className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Available</Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="text-xs bg-primary/15 text-primary border-primary/20"><Star className="w-3 h-3 mr-1" />Featured</Badge>
                  )}
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">{product.name}</h1>
              </div>
            </div>
            {product.tagline && <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{product.tagline}</p>}
            {product.shortDescription && <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>}
          </div>

          {/* Buy card */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border/60 rounded-2xl p-6 sticky top-24">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" />
              {isComingSoon ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold text-foreground mb-1">Coming Soon</p>
                  <p className="text-sm text-muted-foreground">This product is not yet available.</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    {product.basePrice ? (
                      <p className="text-3xl font-bold text-foreground">{currSym}{parseFloat(product.basePrice).toFixed(2)}</p>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">Free</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">One-time purchase · {product.currency}</p>
                  </div>
                  {product.externalCheckoutUrl ? (
                    <a href={product.externalCheckoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackBuy.mutate({ productId: product.id })}>
                      <Button className="w-full btn-active gap-2 font-semibold" size="lg">
                        Buy Now <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full btn-active gap-2 font-semibold" size="lg" disabled>
                      Checkout link coming soon
                    </Button>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
                    You will be redirected to our secure external checkout.
                  </p>
                </>
              )}
              <Separator className="my-5 bg-border/40" />
              <div className="flex flex-col gap-2.5">
                {product.platform && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Monitor className="w-3.5 h-3.5" />{product.platform}
                  </div>
                )}
                {product.version && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5" />Version {product.version}
                  </div>
                )}
                {product.supportUrl && (
                  <a href={product.supportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />Support
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image gallery */}
        {product.images && product.images.length > 0 && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-5">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.images.map(img => (
                <img key={img.id} src={img.url} alt={img.altText ?? product.name} className="rounded-xl border border-border/60 w-full object-cover" />
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {product.description && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-4 text-xl">Overview</h2>
            <div className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{product.description}</div>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-5 text-xl">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-card/50 border border-border/40 rounded-lg px-4 py-3">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Use cases */}
        {useCases.length > 0 && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-5 text-xl">Use Cases</h2>
            <div className="flex flex-col gap-2">
              {useCases.map((u, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{u}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* System requirements */}
        {product.systemRequirements && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-4 text-xl">System Requirements</h2>
            <div className="bg-card border border-border/40 rounded-xl px-5 py-4 text-sm text-muted-foreground">
              {product.systemRequirements}
            </div>
          </section>
        )}

        {/* Refund policy */}
        {product.refundPolicy && (
          <section className="mb-14">
            <h2 className="font-semibold text-foreground mb-4 text-xl">Refund Policy</h2>
            <div className="bg-card border border-border/40 rounded-xl px-5 py-4 text-sm text-muted-foreground">
              {product.refundPolicy}
            </div>
          </section>
        )}

        <Separator className="my-12 bg-border/40" />

        {/* Reviews */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Reviews</h2>
              {reviewData?.summary && reviewData.summary.count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={Math.round(reviewData.summary.average)} />
                  <span className="text-sm text-muted-foreground">
                    {reviewData.summary.average.toFixed(1)} · {reviewData.summary.count} review{reviewData.summary.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review list */}
          {reviewData?.reviews && reviewData.reviews.length > 0 ? (
            <div className="flex flex-col gap-5 mb-10">
              {reviewData.reviews.map(r => (
                <div key={r.id} className="bg-card border border-border/40 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-medium text-sm text-foreground">{r.reviewerName ?? "Anonymous"}</p>
                      <p className="text-[11px] text-muted-foreground/60">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  {r.title && <p className="font-semibold text-sm text-foreground mb-1">{r.title}</p>}
                  {r.body && <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>}
                  {r.adminReply && (
                    <div className="mt-4 pl-4 border-l-2 border-primary/30">
                      <p className="text-xs font-semibold text-primary mb-1">ITISYOU replied:</p>
                      <p className="text-xs text-muted-foreground">{r.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm mb-10">No reviews yet. Be the first to review this product.</p>
          )}

          {/* Submit review */}
          {!isComingSoon && (
            <div className="bg-card border border-border/40 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-5">Write a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={e => {
                  e.preventDefault();
                  submitReview.mutate({ productId: product.id, rating, title: reviewTitle || undefined, body: reviewBody || undefined });
                }} className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Your rating</p>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <Input placeholder="Review title (optional)" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="bg-secondary border-border/60" />
                  <Textarea placeholder="Share your experience…" value={reviewBody} onChange={e => setReviewBody(e.target.value)} className="bg-secondary border-border/60 min-h-[100px]" />
                  <Button type="submit" className="btn-active w-fit" disabled={submitReview.isPending}>
                    {submitReview.isPending ? "Submitting…" : "Submit Review"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">Sign in to leave a review.</p>
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

