import { useEffect, useRef } from "react";
import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Package, Shield, Zap } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { data: categories } = trpc.products.categories.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const { isAuthenticated } = useAuth();
  const pageRef = useScrollReveal();

  const heroHeadline = settings?.hero_headline ?? "Practical software. Built to work.";
  const heroSub = settings?.hero_subheadline ?? "Professional digital tools for creators, editors and finance teams — offline, private, and built to last.";
  const founderBio = settings?.founder_bio ?? "ITISYOU was founded by Neela Aravind Karlapudi with a focus on building practical, high-quality software tools that solve real problems for professionals.";

  // Split headline for gradient on last word
  const words = heroHeadline.split(" ");
  const lastWord = words.pop();
  const firstPart = words.join(" ");

  return (
    <StorefrontLayout>
      <div ref={pageRef as any}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
          {/* Ambient orbs */}
          <div className="orb w-[600px] h-[400px] top-[-100px] left-1/2 -translate-x-1/2" style={{ background: "radial-gradient(ellipse, var(--iy-accent-subtle) 0%, transparent 70%)" }} aria-hidden />
          <div className="orb w-[300px] h-[300px] bottom-0 right-[-50px]" style={{ background: "radial-gradient(ellipse, oklch(from var(--iy-accent-2) l c h / 0.08) 0%, transparent 70%)" }} aria-hidden />

          <div className="container relative text-center">
            <div className="reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ border: "1px solid var(--iy-border-accent)", background: "var(--iy-accent-subtle)", color: "var(--iy-accent)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--iy-accent)" }} aria-hidden />
              Digital products for professionals
            </div>

            <h1 className="reveal stagger-1 font-serif font-bold">
              <span style={{ color: "var(--iy-text-primary)" }}>{firstPart} </span>
              <span className="text-gradient">{lastWord}</span>
            </h1>

            <p className="reveal stagger-2 mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--iy-text-secondary)" }}>
              {heroSub}
            </p>

            <div className="reveal stagger-3 mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="btn-active gap-2 font-semibold px-8 shadow-iy-md">
                  Browse Products <ArrowRight className="w-4 h-4" aria-hidden />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-active gap-2 font-medium px-8"
                  style={{ background: "transparent", borderColor: "var(--iy-border-strong)", color: "var(--iy-text-secondary)" }}
                  onClick={() => startLogin()}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* ── Value props ──────────────────────────────────────── */}
        <section className="py-14" style={{ borderTop: "1px solid var(--iy-border)", borderBottom: "1px solid var(--iy-border)", background: "var(--iy-surface)" }}>
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Offline & Private", desc: "Your data never leaves your machine. No cloud, no tracking.", delay: "stagger-1" },
                { icon: Zap, title: "Built for Professionals", desc: "Precision tools designed around real-world workflows.", delay: "stagger-2" },
                { icon: Package, title: "One-time Purchase", desc: "Pay once, own it forever. No subscriptions.", delay: "stagger-3" },
              ].map(({ icon: Icon, title, desc, delay }) => (
                <div key={title} className={`reveal ${delay} flex gap-4 items-start`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--iy-accent-subtle)", border: "1px solid var(--iy-border-accent)" }}
                    aria-hidden
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--iy-accent)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--iy-text-primary)" }}>{title}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--iy-text-secondary)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────────── */}
        {featured && featured.length > 0 && (
          <section className="py-20">
            <div className="container">
              <div className="reveal flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--iy-accent)" }}>Featured</p>
                  <h2 className="font-serif font-bold" style={{ color: "var(--iy-text-primary)" }}>Flagship Products</h2>
                </div>
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="gap-1.5 btn-active" style={{ color: "var(--iy-text-muted)" }}>
                    View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((p, i) => (
                  <div key={p.id} className={`reveal stagger-${Math.min(i + 1, 6)}`}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Categories ───────────────────────────────────────── */}
        {categories && categories.length > 0 && (
          <section className="py-14" style={{ borderTop: "1px solid var(--iy-border)", borderBottom: "1px solid var(--iy-border)", background: "var(--iy-surface)" }}>
            <div className="container">
              <p className="reveal text-xs font-semibold uppercase tracking-widest mb-8 text-center" style={{ color: "var(--iy-text-muted)" }}>
                Browse by category
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((cat, i) => (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                    <span
                      className={`reveal stagger-${Math.min(i + 1, 6)} px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer btn-active`}
                      style={{
                        border: "1px solid var(--iy-border)",
                        background: "var(--iy-surface-raised)",
                        color: "var(--iy-text-secondary)",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--iy-border-accent)"; (e.currentTarget as HTMLElement).style.color = "var(--iy-accent)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--iy-border)"; (e.currentTarget as HTMLElement).style.color = "var(--iy-text-secondary)"; }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Founder ──────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container max-w-3xl text-center">
            <p className="reveal text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--iy-accent)" }}>About ITISYOU</p>
            <h2 className="reveal stagger-1 font-serif font-bold" style={{ color: "var(--iy-text-primary)" }}>Built with purpose</h2>
            <p className="reveal stagger-2 mt-6 leading-relaxed text-base" style={{ color: "var(--iy-text-secondary)" }}>
              {founderBio}
            </p>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
