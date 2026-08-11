import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import StorefrontLayout from "@/components/StorefrontLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const qs = useSearch();
  const params = new URLSearchParams(qs);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "featured">("newest");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

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
      {/* Header */}
      <section className="pt-16 pb-10 border-b border-border/40">
        <div className="container">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Catalogue</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">All Products</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Professional digital tools built for precision. Browse the full ITISYOU catalogue.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border/40 bg-card/20 sticky top-16 z-30 backdrop-blur-xl">
        <div className="container flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border/60 focus:border-primary/50"
            />
          </div>
          <Select value={category || "all"} onValueChange={v => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 bg-secondary border-border/60">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map(c => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={v => setSort(v as any)}>
            <SelectTrigger className="w-44 bg-secondary border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="featured">Featured first</SelectItem>
              <SelectItem value="price_asc">Price: Low to high</SelectItem>
              <SelectItem value="price_desc">Price: High to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <Skeleton key={i} className="h-52 rounded-xl bg-card" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">No products found.</p>
              {(search || category) && (
                <Button variant="ghost" className="mt-4" onClick={() => { setSearch(""); setCategory(""); }}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </StorefrontLayout>
  );
}
