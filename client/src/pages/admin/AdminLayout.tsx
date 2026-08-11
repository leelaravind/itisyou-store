import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { BarChart3, LayoutDashboard, LogOut, MessageSquare, Package, Settings, ShieldAlert } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location] = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Sign in required</h1>
        <p className="text-muted-foreground text-sm mb-6">You must be signed in to access the admin area.</p>
        <Button className="btn-active" onClick={() => startLogin()}>Sign in</Button>
      </div>
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-6">You do not have permission to access this area.</p>
        <Link href="/"><Button variant="outline" className="bg-transparent">Go home</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border/50 bg-card/50 flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-border/50">
          <Link href="/">
            <span className="font-serif font-bold text-lg text-gradient cursor-pointer">ITISYOU</span>
          </Link>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-widest">Admin</p>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">{user?.name?.[0] ?? "A"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground justify-start" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" />Sign out
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
