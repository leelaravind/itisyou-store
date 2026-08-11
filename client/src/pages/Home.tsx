import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Package, Shield, Zap } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { data: categories } = trpc.products.categories.useQuery();
  const { isAuthenticated } = useAuth();

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Digital products for professionals
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            <span className="text-foreground">Practical software.</span>
            <br />
            <span className="text-gradient">Built to work.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional digital tools for creators, editors and finance teams —
            offline, private, and built to last.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="btn-active gap-2 font-semibold px-8">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="btn-active gap-2 font-medium px-8 bg-transparent border-border hover:bg-secondary" onClick={() => startLogin()}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Offline & Private", desc: "Your data never leaves your machine. No cloud, no tracking." },
              { icon: Zap, title: "Built for Professionals", desc: "Precision tools designed around real-world workflows." },
              { icon: Package, title: "One-time Purchase", desc: "Pay once, own it forever. No subscriptions." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Featured</p>
                <h2 className="font-serif text-3xl font-bold text-foreground">Flagship Products</h2>
              </div>
              <Link href="/products">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-card/20 border-y border-border/40">
          <div className="container">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8 text-center">Browse by category</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                  <span className="px-4 py-2 rounded-full border border-border/60 bg-secondary text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Founder section */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">About ITISYOU</p>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Built with purpose</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            ITISYOU was founded by <strong className="text-foreground font-semibold">Neela Aravind Karlapudi</strong> with a focus on building practical, high-quality software tools that solve real problems for professionals. Every product is designed to work offline, respect your privacy, and deliver genuine value.
          </p>
        </div>
      </section>
    </StorefrontLayout>
  );
}

