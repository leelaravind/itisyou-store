import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Products() {
  const qs = useSearch();
  const params = new URLSearchParams(qs);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "featured">("newest");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const pageRef = useScrollReveal();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: products, isLoading } = trpc.products.list.useQuery({
    search: debouncedSearch || undefined,
    categorySlug: category || undefined,
    sort,
  });
  const { data: categories } = trpc.products.categories.useQuery();

  return (
    <StorefrontLayout>
      <div ref={pageRef as any}>
        {/* Header */}
        <section className="pt-16 pb-10" style={{ borderBottom: "1px solid var(--iy-border)" }}>
          <div className="container">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--iy-accent)" }}>Catalogue</p>
            <h1 className="font-serif font-bold" style={{ color: "var(--iy-text-primary)" }}>All Products</h1>
            <p className="mt-3 max-w-xl" style={{ color: "var(--iy-text-secondary)" }}>
              Professional digital tools built for precision. Browse the full ITISYOU catalogue.
            </p>
          </div>
        </section>

        {/* Filters — sticky */}
        <section
          className="py-4 sticky top-16 z-30"
          style={{ borderBottom: "1px solid var(--iy-border)", background: "color-mix(in oklch, var(--iy-bg) 90%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          aria-label="Filter and sort products"
        >
          <div className="container flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--iy-text-muted)" }} aria-hidden />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                style={{ background: "var(--iy-surface)", borderColor: "var(--iy-border)", color: "var(--iy-text-primary)" }}
                aria-label="Search products"
              />
            </div>
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="w-44" style={{ background: "var(--iy-surface)", borderColor: "var(--iy-border)" }} aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-40" style={{ background: "var(--iy-surface)", borderColor: "var(--iy-border)" }} aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="featured">Featured first</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Grid */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "var(--iy-surface)" }} aria-hidden />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list" aria-label="Products">
                {products.map((p, i) => (
                  <div key={p.id} className={`reveal stagger-${Math.min(i + 1, 6)}`} role="listitem">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-lg" style={{ color: "var(--iy-text-muted)" }}>No products found.</p>
                {(search || category) && (
                  <Button variant="ghost" className="mt-4" onClick={() => { setSearch(""); setCategory(""); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}

