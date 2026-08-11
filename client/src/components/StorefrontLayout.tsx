import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "Products" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <span className="font-serif font-bold text-xl tracking-tight text-gradient cursor-pointer select-none">
              ITISYOU
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}>
                <span className={`text-sm font-medium transition-colors cursor-pointer ${location === l.href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" className="btn-active" onClick={() => startLogin()}>
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}>
                <span className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setMobileOpen(false)}>
                  {l.label}
                </span>
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin"><span className="text-sm text-muted-foreground cursor-pointer" onClick={() => setMobileOpen(false)}>Admin Dashboard</span></Link>
                )}
                <button className="text-sm text-muted-foreground text-left" onClick={() => { logout(); setMobileOpen(false); }}>Sign out</button>
              </>
            ) : (
              <button className="text-sm text-primary font-medium text-left" onClick={() => { startLogin(); setMobileOpen(false); }}>Sign in</button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-24">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="font-serif font-bold text-lg text-gradient">ITISYOU</span>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Practical digital products built for professionals who demand precision.
              </p>
              <p className="mt-4 text-xs text-muted-foreground/70">
                Founded by Neela Aravind Karlapudi
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Products</p>
              <div className="flex flex-col gap-2">
                <Link href="/products"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">All Products</span></Link>
                <Link href="/products/preflightqc"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">PreflightQC</span></Link>
                <Link href="/products/bank-statement-format-studio"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Bank Statement Format Studio</span></Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Support</p>
              <div className="flex flex-col gap-2">
                <a href="https://support.itisyou.app" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
                <span className="text-sm text-muted-foreground">30-day refund policy</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} ITISYOU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
