import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Palette, Save } from "lucide-react";

export default function AdminAppearance() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const setMutation = trpc.settings.set.useMutation({
    onSuccess: () => { toast.success("Setting saved"); utils.settings.get.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const save = (key: string, value: string) => setMutation.mutate({ key, value });

  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSub, setHeroSub] = useState("");
  const [founderBio, setFounderBio] = useState("");

  // Populate form once settings load
  const loaded = !!settings;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--iy-text-primary)" }}>Appearance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--iy-text-muted)" }}>
          Adjust brand-level settings. Changes apply to the public storefront immediately.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--iy-text-muted)" }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Hero content */}
          <section className="rounded-xl p-6" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
            <h2 className="font-semibold text-sm mb-5 flex items-center gap-2" style={{ color: "var(--iy-text-primary)" }}>
              <Palette className="w-4 h-4" aria-hidden /> Hero Content
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--iy-text-secondary)" }}>Headline</Label>
                <Input
                  defaultValue={settings?.hero_headline ?? ""}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="Practical software. Built to work."
                  className="bg-transparent"
                  style={{ borderColor: "var(--iy-border)" }}
                />
                <Button size="sm" className="mt-2 btn-active gap-1.5" onClick={() => save("hero_headline", heroHeadline || (settings?.hero_headline ?? ""))} disabled={setMutation.isPending}>
                  <Save className="w-3.5 h-3.5" />Save
                </Button>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--iy-text-secondary)" }}>Subheadline</Label>
                <Input
                  defaultValue={settings?.hero_subheadline ?? ""}
                  onChange={(e) => setHeroSub(e.target.value)}
                  placeholder="Professional digital tools…"
                  className="bg-transparent"
                  style={{ borderColor: "var(--iy-border)" }}
                />
                <Button size="sm" className="mt-2 btn-active gap-1.5" onClick={() => save("hero_subheadline", heroSub || (settings?.hero_subheadline ?? ""))} disabled={setMutation.isPending}>
                  <Save className="w-3.5 h-3.5" />Save
                </Button>
              </div>
            </div>
          </section>

          {/* Founder */}
          <section className="rounded-xl p-6" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
            <h2 className="font-semibold text-sm mb-5" style={{ color: "var(--iy-text-primary)" }}>Founder Section</h2>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--iy-text-secondary)" }}>Founder Bio</Label>
              <Textarea
                defaultValue={settings?.founder_bio ?? ""}
                onChange={(e) => setFounderBio(e.target.value)}
                className="bg-transparent min-h-[80px]"
                style={{ borderColor: "var(--iy-border)" }}
              />
              <Button size="sm" className="mt-2 btn-active gap-1.5" onClick={() => save("founder_bio", founderBio || (settings?.founder_bio ?? ""))} disabled={setMutation.isPending}>
                <Save className="w-3.5 h-3.5" />Save
              </Button>
            </div>
          </section>

          {/* Default theme */}
          <section className="rounded-xl p-6" style={{ background: "var(--iy-surface)", border: "1px solid var(--iy-border)" }}>
            <h2 className="font-semibold text-sm mb-5" style={{ color: "var(--iy-text-primary)" }}>Default Theme</h2>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--iy-text-secondary)" }}>Visitor default (visitors can always override)</Label>
              <Select
                defaultValue={settings?.default_theme ?? "system"}
                onValueChange={(v) => save("default_theme", v)}
              >
                <SelectTrigger className="w-48 bg-transparent" style={{ borderColor: "var(--iy-border)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Follow system</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

