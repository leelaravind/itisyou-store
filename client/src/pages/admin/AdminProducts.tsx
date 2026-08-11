import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, Plus, Trash2, Upload, Image } from "lucide-react";
import { useRef } from "react";

type ProductForm = {
  id?: number; slug: string; name: string; tagline: string; shortDescription: string;
  description: string; features: string; useCases: string; systemRequirements: string;
  version: string; platform: string; status: "available" | "coming_soon" | "hidden";
  isFeatured: boolean; currency: string; basePrice: string; discountType: "none" | "percentage" | "fixed";
  discountValue: string; externalCheckoutUrl: string; supportUrl: string; refundPolicy: string;
  metaTitle: string; metaDescription: string;
  iconUrl: string;
};

const empty: ProductForm = {
  slug: "", name: "", tagline: "", shortDescription: "", description: "",
  features: "", useCases: "", systemRequirements: "", version: "", platform: "",
  status: "available", isFeatured: false, currency: "GBP", basePrice: "",
  discountType: "none", discountValue: "", externalCheckoutUrl: "", supportUrl: "",
  refundPolicy: "", metaTitle: "", metaDescription: "", iconUrl: "",
};

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(empty);
  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.adminList.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Product created"); setOpen(false); utils.products.adminList.invalidate(); },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { toast.success("Product updated"); setOpen(false); utils.products.adminList.invalidate(); },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success("Product deleted"); utils.products.adminList.invalidate(); },
    onError: e => toast.error(e.message),
  });

  const set = (k: keyof ProductForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      id: p.id, slug: p.slug, name: p.name, tagline: p.tagline ?? "", shortDescription: p.shortDescription ?? "",
      description: p.description ?? "", features: p.features ?? "", useCases: p.useCases ?? "",
      systemRequirements: p.systemRequirements ?? "", version: p.version ?? "", platform: p.platform ?? "",
      status: p.status, isFeatured: p.isFeatured, currency: p.currency, basePrice: p.basePrice ?? "",
      discountType: p.discountType, discountValue: p.discountValue ?? "", externalCheckoutUrl: p.externalCheckoutUrl ?? "",
      supportUrl: p.supportUrl ?? "", refundPolicy: p.refundPolicy ?? "", metaTitle: p.metaTitle ?? "", metaDescription: p.metaDescription ?? "", iconUrl: p.iconUrl ?? "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.slug || !form.name) { toast.error("Slug and name are required"); return; }
    if (form.id) {
      updateMutation.mutate({ ...form, id: form.id, basePrice: form.basePrice || undefined, discountValue: form.discountValue || undefined });
    } else {
      createMutation.mutate({ ...form, basePrice: form.basePrice || undefined, discountValue: form.discountValue || undefined });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = trpc.products.uploadImage.useMutation({
    onSuccess: (data) => { toast.success("Image uploaded"); set("iconUrl", data.url); },
    onError: (e) => toast.error(e.message),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form.id) { toast.error("Save the product first before uploading an image."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadImageMutation.mutate({ productId: form.id!, base64, filename: file.name, mimeType: file.type, altText: form.name });
    };
    reader.readAsDataURL(file);
  };

  const statusColor = (s: string) => s === "available" ? "bg-emerald-500/15 text-emerald-400" : s === "coming_soon" ? "bg-secondary text-muted-foreground" : "bg-red-500/15 text-red-400";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalogue</p>
        </div>
        <Button className="btn-active gap-2" onClick={openNew}><Plus className="w-4 h-4" />Add Product</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Price</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map(p => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>{p.status.replace("_"," ")}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                    {p.basePrice ? `${p.currency === "GBP" ? "£" : "$"}${parseFloat(p.basePrice).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEdit(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate({ id: p.id });
                      }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif">{form.id ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div><Label className="text-xs mb-1.5 block">Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} className="bg-secondary border-border/60" /></div>
              <div><Label className="text-xs mb-1.5 block">Slug *</Label><Input value={form.slug} onChange={e => set("slug", e.target.value)} className="bg-secondary border-border/60" /></div>
            </div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Tagline</Label><Input value={form.tagline} onChange={e => set("tagline", e.target.value)} className="bg-secondary border-border/60" /></div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Short Description</Label><Textarea value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} className="bg-secondary border-border/60 min-h-[70px]" /></div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Full Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} className="bg-secondary border-border/60 min-h-[100px]" /></div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Features (JSON array)</Label><Textarea value={form.features} onChange={e => set("features", e.target.value)} className="bg-secondary border-border/60 min-h-[70px] font-mono text-xs" placeholder='["Feature 1","Feature 2"]' /></div>
            <div><Label className="text-xs mb-1.5 block">Platform</Label><Input value={form.platform} onChange={e => set("platform", e.target.value)} className="bg-secondary border-border/60" /></div>
            <div><Label className="text-xs mb-1.5 block">Version</Label><Input value={form.version} onChange={e => set("version", e.target.value)} className="bg-secondary border-border/60" /></div>
            <div>
              <Label className="text-xs mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="bg-secondary border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} id="featured" />
              <Label htmlFor="featured" className="text-sm cursor-pointer">Featured</Label>
            </div>
            <div><Label className="text-xs mb-1.5 block">Base Price</Label><Input value={form.basePrice} onChange={e => set("basePrice", e.target.value)} placeholder="19.99" className="bg-secondary border-border/60" /></div>
            <div>
              <Label className="text-xs mb-1.5 block">Currency</Label>
              <Select value={form.currency} onValueChange={v => set("currency", v)}>
                <SelectTrigger className="bg-secondary border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Discount Type</Label>
              <Select value={form.discountType} onValueChange={v => set("discountType", v)}>
                <SelectTrigger className="bg-secondary border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No discount</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.discountType !== "none" && (
              <div><Label className="text-xs mb-1.5 block">Discount Value</Label><Input value={form.discountValue} onChange={e => set("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "10" : "5.00"} className="bg-secondary border-border/60" /></div>
            )}
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">External Checkout URL</Label><Input value={form.externalCheckoutUrl} onChange={e => set("externalCheckoutUrl", e.target.value)} placeholder="https://checkout.lemonsqueezy.com/..." className="bg-secondary border-border/60" /></div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Support URL</Label><Input value={form.supportUrl} onChange={e => set("supportUrl", e.target.value)} className="bg-secondary border-border/60" /></div>
            <div className="sm:col-span-2"><Label className="text-xs mb-1.5 block">Refund Policy</Label><Textarea value={form.refundPolicy} onChange={e => set("refundPolicy", e.target.value)} className="bg-secondary border-border/60 min-h-[70px]" /></div>
            <div><Label className="text-xs mb-1.5 block">Meta Title</Label><Input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} className="bg-secondary border-border/60" /></div>
            <div><Label className="text-xs mb-1.5 block">Meta Description</Label><Input value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)} className="bg-secondary border-border/60" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="btn-active" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving…" : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
