import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalytics() {
  const { data, isLoading } = trpc.analytics.summary.useQuery();

  const chartData = data?.topProducts?.map(p => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
    views: p.viewCount,
    clicks: p.buyClickCount,
  })) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">First-party privacy-conscious analytics</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Products", value: data?.summary.totalProducts ?? 0 },
            { label: "Total Users", value: data?.summary.totalUsers ?? 0 },
            { label: "Page Views", value: data?.summary.totalViews ?? 0 },
            { label: "Buy Clicks", value: data?.summary.totalBuyClicks ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border/60 rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-6 text-sm">Product Performance</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.008 260)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} />
              <Tooltip
                contentStyle={{ background: "oklch(0.11 0.008 260)", border: "1px solid oklch(0.2 0.008 260)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "oklch(0.96 0.005 260)" }}
              />
              <Bar dataKey="views" fill="oklch(0.78 0.12 55)" radius={[4,4,0,0]} name="Views" />
              <Bar dataKey="clicks" fill="oklch(0.65 0.15 200)" radius={[4,4,0,0]} name="Buy Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

