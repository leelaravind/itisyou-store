import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--iy-bg)", color: "var(--iy-text-primary)" }}>
      {/* Navigation */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          borderBottom: scrolled ? `1px solid var(--iy-border)` : "1px solid transparent",
          backgroundColor: scrolled ? "color-mix(in oklch, var(--iy-bg) 85%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <span
              className="font-serif font-bold text-xl tracking-tight text-gradient cursor-pointer select-none"
              aria-label="ITISYOU — Home"
            >
              ITISYOU
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link href="/products">
              <span
                className="text-sm font-medium transition-colors cursor-pointer"
                style={{ color: location === "/products" ? "var(--iy-accent)" : "var(--iy-text-secondary)" }}
                aria-current={location === "/products" ? "page" : undefined}
              >
                Products
              </span>
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors btn-active"
              style={{ color: "var(--iy-text-muted)", backgroundColor: "transparent" }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 btn-active" style={{ color: "var(--iy-text-muted)" }}>
                      <LayoutDashboard className="w-4 h-4" aria-hidden />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="gap-2 btn-active" style={{ color: "var(--iy-text-muted)" }} onClick={logout}>
                  <LogOut className="w-4 h-4" aria-hidden />
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" className="btn-active font-semibold" onClick={() => startLogin()}>
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center btn-active"
              style={{ color: "var(--iy-text-muted)" }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center btn-active"
              style={{ color: "var(--iy-text-muted)" }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="md:hidden px-6 py-5 flex flex-col gap-4"
            style={{ borderTop: `1px solid var(--iy-border)`, backgroundColor: "var(--iy-surface)" }}
          >
            <Link href="/products">
              <span className="text-sm font-medium cursor-pointer" style={{ color: "var(--iy-text-primary)" }} onClick={() => setMobileOpen(false)}>
                Products
              </span>
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <span className="text-sm cursor-pointer" style={{ color: "var(--iy-text-secondary)" }} onClick={() => setMobileOpen(false)}>
                      Admin Dashboard
                    </span>
                  </Link>
                )}
                <button
                  className="text-sm text-left"
                  style={{ color: "var(--iy-text-secondary)" }}
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                className="text-sm font-semibold text-left"
                style={{ color: "var(--iy-accent)" }}
                onClick={() => { startLogin(); setMobileOpen(false); }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1" id="main-content">{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid var(--iy-border)`, backgroundColor: "var(--iy-surface)" }} className="mt-24">
        <div className="container py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <span className="font-serif font-bold text-lg text-gradient">ITISYOU</span>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--iy-text-secondary)" }}>
                Practical digital products built for professionals who demand precision.
              </p>
              <p className="mt-4 text-xs" style={{ color: "var(--iy-text-muted)" }}>
                Founded by Neela Aravind Karlapudi
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--iy-text-muted)" }}>Products</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/products"><span className="text-sm cursor-pointer transition-colors hover:underline" style={{ color: "var(--iy-text-secondary)" }}>All Products</span></Link>
                <Link href="/products/preflightqc"><span className="text-sm cursor-pointer transition-colors hover:underline" style={{ color: "var(--iy-text-secondary)" }}>PreflightQC</span></Link>
                <Link href="/products/bank-statement-format-studio"><span className="text-sm cursor-pointer transition-colors hover:underline" style={{ color: "var(--iy-text-secondary)" }}>Bank Statement Format Studio</span></Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--iy-text-muted)" }}>Support</p>
              <div className="flex flex-col gap-2.5">
                <a href="https://support.itisyou.app" target="_blank" rel="noopener noreferrer" className="text-sm transition-colors hover:underline" style={{ color: "var(--iy-text-secondary)" }}>Support</a>
                <span className="text-sm" style={{ color: "var(--iy-text-secondary)" }}>30-day refund policy</span>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid var(--iy-border)` }}>
            <p className="text-xs" style={{ color: "var(--iy-text-muted)" }}>© {new Date().getFullYear()} ITISYOU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

