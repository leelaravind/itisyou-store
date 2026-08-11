import { trpc } from "@/lib/trpc";
import { Package, Users, Eye, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = trpc.analytics.summary.useQuery();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your ITISYOU store</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Products" value={data?.summary.totalProducts ?? 0} icon={Package} color="bg-primary/10 text-primary" />
          <StatCard label="Total Users" value={data?.summary.totalUsers ?? 0} icon={Users} color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Page Views" value={data?.summary.totalViews ?? 0} icon={Eye} color="bg-purple-500/10 text-purple-400" />
          <StatCard label="Buy Clicks" value={data?.summary.totalBuyClicks ?? 0} icon={ShoppingCart} color="bg-emerald-500/10 text-emerald-400" />
        </div>
      )}

      {/* Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Top Products by Views</h2>
          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.topProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.status}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-foreground">{p.viewCount}</p>
                    <p className="text-[10px] text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          )}
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Recent Orders</h2>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{o.buyerEmail ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
