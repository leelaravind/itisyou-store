import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, EyeOff, Trash2, MessageSquare } from "lucide-react";

export default function AdminReviews() {
  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.reviews.adminList.useQuery({});
  const updateStatus = trpc.reviews.updateStatus.useMutation({
    onSuccess: () => { toast.success("Review updated"); utils.reviews.adminList.invalidate({}); },
    onError: e => toast.error(e.message),
  });
  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => { toast.success("Review deleted"); utils.reviews.adminList.invalidate({}); },
    onError: e => toast.error(e.message),
  });

  const statusColor = (s: string) => ({
    approved: "bg-emerald-500/15 text-emerald-400",
    pending: "bg-yellow-500/15 text-yellow-400",
    rejected: "bg-red-500/15 text-red-400",
    hidden: "bg-secondary text-muted-foreground",
  }[s] ?? "bg-secondary text-muted-foreground");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate customer reviews</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card border border-border/60 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-medium text-sm text-foreground">{r.reviewerName ?? "Anonymous"}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>{r.status}</span>
                    <span className="text-[10px] text-muted-foreground">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                    <span className="text-[10px] text-muted-foreground/60">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.title && <p className="font-semibold text-sm text-foreground mb-1">{r.title}</p>}
                  {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {r.status !== "approved" && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => updateStatus.mutate({ id: r.id, status: "approved" })}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {r.status !== "rejected" && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {r.status !== "hidden" && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => updateStatus.mutate({ id: r.id, status: "hidden" })}>
                      <EyeOff className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => {
                    if (confirm("Delete this review?")) deleteReview.mutate({ id: r.id });
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        </div>
      )}
    </div>
  );
}
