import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { useCart } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  LogOut,
  ShoppingBag,
  Heart,
  Shield,
  Package,
  ChevronRight,
  User,
  MapPin,
  Instagram,
  Mail,
  Sparkles,
  HelpCircle,
  Pencil
} from "lucide-react";
import { toast } from "sonner";
import { useSeo } from "@/lib/seo";
import { AddressManager } from "@/components/account/AddressManager";

export default function Account() {
  const { user, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { profile, saveProfile } = useProfile();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const openDrawer = useCart((s) => s.openDrawer);

  useSeo({
    title: "My Account — PRIORA by KP",
    description: "Manage your profile, shipping addresses, and track your orders.",
    canonicalPath: "/account",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      pincode: profile.pincode ?? "",
    });
  }, [profile]);

  const { data: rawOrders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("id, status, created_at, subtotal").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const orderCount = rawOrders?.length ?? 0;

  async function onSave() {
    setSaving(true);
    const { error } = await saveProfile(form);
    setSaving(false);
    if (error) {
      toast.error("Could not save profile: " + error.message);
    } else {
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    }
  }

  const input = "w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent";

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-secondary/80 rounded-xl" />
          <div className="h-3 w-52 bg-secondary/60 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-secondary/60 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="h-24 bg-secondary/60 rounded-2xl" />
        <div className="h-24 bg-secondary/60 rounded-2xl" />
        <div className="h-24 bg-secondary/60 rounded-2xl" />
      </div>
      <div className="h-5 w-32 bg-secondary/60 rounded-lg mb-3" />
      <div className="glass-card rounded-2xl p-4 mb-8 space-y-3">
        <div className="h-11 bg-secondary/60 rounded-xl" />
        <div className="h-11 bg-secondary/60 rounded-xl" />
        <div className="h-20 bg-secondary/60 rounded-xl" />
        <div className="h-10 w-28 bg-accent/40 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-10">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl">
            {user ? `Hi, ${profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Friend"}` : "My Account"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {user ? user?.email : "Manage your orders, wishlist, saved addresses, and store offers."}
          </p>
        </div>
        {user ? (
          <button
            onClick={async () => {
              localStorage.removeItem("priora_master_admin");
              await supabase.auth.signOut();
              toast.success("Signed out");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer w-fit"
          >
            <LogOut size={14} /> Sign out
          </button>
        ) : (
          <Link
            to="/auth?next=/account"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity shadow-xs w-fit"
          >
            <User size={14} /> Sign In / Register
          </Link>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          to="/yourorders"
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all text-center group cursor-pointer shadow-xs"
        >
          <div className="size-10 rounded-full bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <Package size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block text-foreground">Your Orders</span>
            <span className="text-[10px] text-muted-foreground font-mono">{orderCount} {orderCount === 1 ? "order" : "orders"}</span>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all text-center group cursor-pointer shadow-xs"
        >
          <div className="size-10 rounded-full bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <Heart size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block text-foreground">Wishlist</span>
            <span className="text-[10px] text-muted-foreground">Saved pieces</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={openDrawer}
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all text-center group cursor-pointer shadow-xs"
        >
          <div className="size-10 rounded-full bg-accent/15 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block text-foreground">Bag</span>
            <span className="text-[10px] text-muted-foreground">Checkout cart</span>
          </div>
        </button>
      </div>

      {/* Admin Panel Quick Banner */}
      {isAdmin && (
        <Link to="/admin" className="flex items-center gap-3 glass-card rounded-2xl p-4 mb-6 border border-accent/40 hover:bg-accent/5 transition-colors">
          <Shield className="text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Manage products, orders, banners</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      {/* Dedicated Orders Link Box */}
      <Link
        to="/yourorders"
        className="glass-card rounded-2xl p-5 mb-8 border border-accent/30 bg-gradient-to-r from-card to-accent/5 flex items-center justify-between gap-4 hover:border-accent/60 transition-all group shadow-xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform shrink-0">
            <Package size={22} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-foreground">View & Track Your Orders</h3>
            <p className="text-xs text-muted-foreground">
              Check live India Post consignment status, tracking numbers, and delivery timelines.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform shrink-0">
          View All <ChevronRight size={15} />
        </span>
      </Link>

      {/* Profile Information & Address Manager */}
      {user ? (
        <>
          <h2 className="font-serif text-xl mb-3 flex items-center gap-2">
            <User size={18} className="text-accent" />
            <span>Profile Information</span>
          </h2>

          {!isEditingProfile ? (
            /* DEFAULT VIEW MODE */
            <div className="glass-card rounded-2xl p-5 mb-8 border border-border/70 bg-secondary/15 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-serif font-semibold text-base text-foreground">Your Personal Details</h3>
                  <p className="text-xs text-muted-foreground">Information associated with your Priora account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/60 bg-secondary/70 hover:bg-accent/15 hover:text-accent hover:border-accent/40 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-3.5 bg-secondary/40 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">Full Name</span>
                  <span className="text-sm font-semibold text-foreground block">
                    {profile?.full_name || user?.user_metadata?.full_name || <span className="text-muted-foreground italic font-normal">Not set</span>}
                  </span>
                </div>

                <div className="p-3.5 bg-secondary/40 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">Phone Number</span>
                  <span className="text-sm font-semibold text-foreground block font-mono">
                    {profile?.phone || <span className="text-muted-foreground italic font-normal font-sans">Not set</span>}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 bg-secondary/40 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">Registered Email</span>
                  <span className="text-sm font-medium text-foreground block">
                    {user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <div className="glass-card rounded-2xl p-5 mb-8 border border-accent/40 bg-secondary/20 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-serif font-semibold text-base text-foreground">Edit Profile Information</h3>
                  <p className="text-xs text-muted-foreground">Update your full name and phone number.</p>
                </div>
                <span className="text-[11px] bg-accent/15 text-accent font-semibold px-2.5 py-0.5 rounded-full border border-accent/30">
                  Editing
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1">Full Name</label>
                  <input
                    className={input}
                    placeholder=""
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1">Phone Number</label>
                  <input
                    className={input}
                    placeholder=""
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs uppercase tracking-widest disabled:opacity-60 font-semibold cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (profile) {
                      setForm({
                        full_name: profile.full_name ?? "",
                        phone: profile.phone ?? "",
                        address: profile.address ?? "",
                        city: profile.city ?? "",
                        state: profile.state ?? "",
                        pincode: profile.pincode ?? "",
                      });
                    }
                    setIsEditingProfile(false);
                  }}
                  className="border border-border px-5 py-2.5 rounded-full text-xs uppercase tracking-widest hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saved Addresses Management */}
          <div className="mb-8">
            <AddressManager mode="manage" />
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl p-6 mb-8 text-center space-y-3 border border-border/80 bg-secondary/20">
          <div className="size-12 rounded-full bg-accent/15 flex items-center justify-center text-accent mx-auto">
            <User size={22} />
          </div>
          <h3 className="font-serif font-bold text-lg text-foreground">Sign In to Your Priora Account</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Save your delivery addresses for 1-click checkout, save your favorite pieces to wishlist, and view order consignment updates.
          </p>
          <div className="pt-2">
            <Link
              to="/auth?next=/account"
              className="inline-block bg-accent text-accent-foreground px-7 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              Sign In or Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Jewellery Care Guide */}
      <div className="mb-8 glass-card rounded-2xl p-5 border border-border/70 bg-secondary/15 space-y-3">
        <h2 className="font-serif text-lg flex items-center gap-2 text-foreground font-semibold">
          <Sparkles size={18} className="text-accent" />
          <span>Jewellery Care & Longevity Guide</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Keep your handcrafted Priora jewellery looking brand new with these simple daily care tips:
        </p>
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-secondary/40 rounded-xl border border-border/40 text-xs">
            <span className="font-bold text-foreground block mb-1">💧 Keep Dry & Fresh</span>
            <span className="text-muted-foreground">Apply perfumes, cosmetics, and hairsprays before putting on your jewellery.</span>
          </div>
          <div className="p-3 bg-secondary/40 rounded-xl border border-border/40 text-xs">
            <span className="font-bold text-foreground block mb-1">🛡️ Safe Storage</span>
            <span className="text-muted-foreground">Store each piece individually in the provided satin pouch to prevent scratches.</span>
          </div>
          <div className="p-3 bg-secondary/40 rounded-xl border border-border/40 text-xs">
            <span className="font-bold text-foreground block mb-1">✨ Soft Wipe</span>
            <span className="text-muted-foreground">Gently wipe with a soft dry microfiber cloth after wearing to maintain lasting shine.</span>
          </div>
        </div>
      </div>

      {/* Direct Instagram & Customer Care Support */}
      <div className="mb-8 glass-card rounded-2xl p-5 border border-border/70 bg-gradient-to-r from-secondary/30 via-pink-500/5 to-accent/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
            <Instagram size={18} className="text-[#e1306c]" />
            <span>Need Help with Custom Sizing or Orders?</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Our artisan concierge team is here to assist with any questions about sizes, tracking, or styling.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://ig.me/m/priorabykp"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Instagram size={15} />
            <span>Instagram Support</span>
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&to=priorabykp@gmail.com&su=Priora%20Customer%20Support%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              if (isMobile) {
                window.location.href = "mailto:priorabykp@gmail.com?subject=Priora%20Customer%20Support%20Inquiry";
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary hover:text-accent transition-colors border border-border/60"
          >
            <Mail size={14} />
            <span>Email Us</span>
          </a>
        </div>
      </div>

      {/* Master Sign Out */}
      <button
        onClick={async () => {
          localStorage.removeItem("priora_master_admin");
          await supabase.auth.signOut();
          window.location.href = "/auth";
        }}
        className="mt-4 flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors"
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}



