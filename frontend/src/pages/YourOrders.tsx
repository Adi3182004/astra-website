import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Truck,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Tag,
  Ban,
  Package,
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/settings";
import { useSeo } from "@/lib/seo";
import {
  extractOrderTracking,
  DEFAULT_TRACKING_URL,
  maskPhoneNumber,
  parseOrderMetaNotes
} from "@/lib/orderTracking";

const STATUS_TONE: Record<string, string> = {
  new: "bg-accent/15 border-accent/30 text-accent",
  confirmed: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
  shipped: "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-400",
  delivered: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/15 border-destructive/30 text-destructive",
};

function CustomerOrderTrackingCard({ order }: { order: any }) {
  const tracking = extractOrderTracking(order);
  const [copied, setCopied] = useState(false);

  // 1. Cancelled Order Mode (Never show tracking box if cancelled)
  if (order.status === "cancelled") {
    const cancelReason = tracking.cancelReason || order.cancel_reason || "Cancelled by admin/customer request.";
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-destructive font-semibold">
          <Ban size={16} />
          <span>Order Cancelled</span>
        </div>
        <p className="text-foreground leading-relaxed">
          <span className="font-semibold text-destructive">Cancellation Reason:</span> {cancelReason}
        </p>
        <p className="text-[11px] text-muted-foreground pt-1">
          If you were charged online, the refund will be credited back to your original payment method within 3–5 working days.
        </p>
      </div>
    );
  }

  const createdAt = new Date(order.created_at).getTime();
  const elapsedHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  const elapsedDays = Math.floor(elapsedHours / 24);
  const isDelayed = elapsedHours >= 48 && tracking.mode === "pending_dispatch" && order.status !== "shipped" && order.status !== "delivered";
  const delayDays = Math.max(1, elapsedDays - 1);

  const handleCopy = () => {
    if (!tracking.articleNumber) return;
    navigator.clipboard.writeText(tracking.articleNumber);
    setCopied(true);
    toast.success("India Post Article Number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Direct Mode (Article Number + Website Link)
  if (tracking.mode === "direct" && tracking.articleNumber) {
    const trackUrl = tracking.trackingUrl || DEFAULT_TRACKING_URL;
    return (
      <div className="bg-gradient-to-br from-card/90 to-accent/5 border border-accent/30 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Truck size={15} />
            </div>
            <div>
              <span className="font-serif font-bold text-xs tracking-wider text-foreground">
                Dispatched via India Post
              </span>
              <p className="text-[10px] text-muted-foreground">Consignment tracking available</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            In Transit
          </span>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground font-medium block mb-1">
            Article Number (Consignment No.):
          </span>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2 border border-border/60">
            <span className="font-mono text-xs font-bold text-foreground tracking-widest flex-1 select-all">
              {tracking.articleNumber}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-accent text-accent-foreground px-3 py-1 rounded-md hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Copy Article Number"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Track live location on India Post's official portal:
          </p>
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Track on India Post</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    );
  }

  // 3. SMS Tracking Mode (Masked phone, updated copy)
  if (tracking.mode === "sms_only" || order.status === "shipped") {
    const maskedPhone = maskPhoneNumber(order.phone);
    return (
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Truck size={14} />
          </div>
          <span className="font-semibold text-xs text-sky-950 dark:text-sky-200">
            Shipped via India Post
          </span>
        </div>
        <p className="text-[11px] text-sky-900 dark:text-sky-300 leading-relaxed">
          You will receive SMS by India Post containing live consignment tracking details and real-time transit updates on your registered phone number{" "}
          <strong className="font-mono text-foreground font-bold">{maskedPhone}</strong>.
        </p>
      </div>
    );
  }

  // 4. Delayed Apology Mode (Custom message support)
  if (isDelayed) {
    const defaultDelayText = `Dispatch is currently running ${delayDays} day${delayDays > 1 ? "s" : ""} behind our standard schedule as our master artisans ensure your handcrafted jewellery piece passes our strict quality control. Your parcel will be handed over to India Post shortly.`;
    const messageToShow = tracking.customDelayMessage || defaultDelayText;

    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <Clock size={15} />
          <span className="font-semibold text-xs">Dispatch Status Update</span>
        </div>
        <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          {messageToShow}
        </p>
      </div>
    );
  }

  // 5. Default Initial Pending Mode (< 48h)
  return (
    <div className="bg-secondary/30 rounded-xl p-3.5 space-y-3 border border-border/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles size={14} className="text-accent" />
          <span>Dispatch in Progress</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Standard 2 Working Days</span>
      </div>

      {/* 4-Stage Progress Tracker */}
      <div className="grid grid-cols-4 gap-1 relative pt-1">
        <div className="text-center">
          <div className="h-1.5 w-full bg-accent rounded-full mb-1.5" />
          <p className="text-[9px] font-bold text-accent">Received</p>
        </div>
        <div className="text-center">
          <div className="h-1.5 w-full bg-accent/80 rounded-full mb-1.5 animate-pulse" />
          <p className="text-[9px] font-semibold text-foreground">Inspection</p>
        </div>
        <div className="text-center">
          <div className="h-1.5 w-full bg-secondary/80 rounded-full mb-1.5" />
          <p className="text-[9px] text-muted-foreground">India Post</p>
        </div>
        <div className="text-center">
          <div className="h-1.5 w-full bg-secondary/80 rounded-full mb-1.5" />
          <p className="text-[9px] text-muted-foreground">Delivered</p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center pt-1">
        Your order is received and will be dispatched in 2 working days.
      </p>
    </div>
  );
}

export default function YourOrders() {
  const { user, loading } = useAuth();
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useSeo({
    title: "Your Orders — PRIORA by KP",
    description: "Track your luxury jewellery orders, consignment status, and delivery updates.",
    canonicalPath: "/yourorders",
  });

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  // Filter 6-month retention policy for customer orders
  const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
  const customerOrders = (rawOrders ?? []).filter((o: any) => {
    const orderTime = new Date(o.created_at).getTime();
    return orderTime >= sixMonthsAgo;
  });

  // Search and filter
  const term = searchQuery.trim().toLowerCase();
  const filteredOrders = customerOrders
    .filter((o: any) => statusFilter === "all" || o.status === statusFilter)
    .filter((o: any) => {
      if (!term) return true;
      const idMatch = o.id.toLowerCase().includes(term);
      const itemsMatch = Array.isArray(o.items) && o.items.some((i: any) => i.name?.toLowerCase().includes(term));
      return idMatch || itemsMatch;
    });

  // Expand first order by default
  useEffect(() => {
    if (filteredOrders.length > 0 && Object.keys(expandedOrders).length === 0) {
      setExpandedOrders({ [filteredOrders[0].id]: true });
    }
  }, [filteredOrders]);

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || isLoading) return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 py-8 animate-pulse space-y-4">
      <div className="h-6 w-32 bg-secondary/80 rounded-xl" />
      <div className="h-28 bg-secondary/60 rounded-2xl" />
      <div className="h-28 bg-secondary/60 rounded-2xl" />
      <div className="h-28 bg-secondary/60 rounded-2xl" />
    </div>
  );

  if (!user) return <Navigate to="/auth?next=/yourorders" replace />;

  const visibleOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 4);

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-10">
      {/* Top Header with Back to Account Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 gap-3 flex-wrap">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Account
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl">Your Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track parcels, view consignment status, and review item receipts.
          </p>
        </div>

        <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-secondary/80 text-foreground border border-border/50">
          {customerOrders.length} total {customerOrders.length === 1 ? "order" : "orders"}
        </span>
      </div>

      {/* Search & Filter Bar */}
      {customerOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID or item name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/40 border border-border/70 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            {["all", "new", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-foreground text-background"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders List Accordion */}
      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {visibleOrders.map((o: any) => {
            const orderItems = Array.isArray(o.items) ? o.items : [];
            const isExpanded = !!expandedOrders[o.id];
            const meta = parseOrderMetaNotes(o.notes);
            const isPaid = (o as any).payment_status === "paid" || meta.paidTag;
            const isOnline = (o as any).payment_method === "razorpay" || meta.paymentTag?.toLowerCase().includes("razorpay");
            const paymentId = (o as any).razorpay_payment_id || meta.paidTag;

            return (
              <div
                key={o.id}
                className="glass-card rounded-2xl border border-border/70 overflow-hidden bg-card/70 shadow-sm transition-all duration-200"
              >
                {/* Expandable Order Header */}
                <button
                  onClick={() => toggleOrderExpand(o.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border/40"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-foreground">
                        Order #{o.id.slice(0, 8)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_TONE[o.status] || "bg-secondary"}`}>
                        {o.status || "New"}
                      </span>
                      {isOnline && (
                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700"}`}>
                          💳 {isPaid ? "Prepaid Online" : "Payment Pending"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground break-words">
                      Placed on {new Date(o.created_at).toLocaleDateString()} at {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-serif text-base sm:text-lg font-bold text-accent">
                      {formatPrice(o.subtotal)}
                    </span>
                    <div className="size-7 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {/* Collapsible Order Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 animate-fadeIn">
                    {/* Items List */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Purchased Items
                      </p>
                      {orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-secondary/30 rounded-xl p-3 text-xs border border-border/30">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="size-11 object-cover rounded-lg border border-border/50 shrink-0" />
                            ) : (
                              <div className="size-11 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                                <Package size={18} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{item.name || "Jewellery Item"}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-muted-foreground">Qty: {item.qty || 1}</span>
                                {item.isFree && (
                                  <span className="text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-md">
                                    🎁 Free BOGO Gift
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-foreground shrink-0">
                            {item.isFree ? (
                              <span className="text-accent font-bold">FREE (₹0)</span>
                            ) : (
                              formatPrice((item.price || 0) * (item.qty || 1))
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Box */}
                    <CustomerOrderTrackingCard order={o} />

                    {/* Shipping Address Summary */}
                    {o.address && (
                      <div className="bg-secondary/20 rounded-xl p-3 text-xs space-y-1 border border-border/30">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground mb-0.5">
                          <MapPin size={13} className="text-accent" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="text-foreground font-medium">{o.contact_name} · {maskPhoneNumber(o.phone)}</p>
                        <p className="text-muted-foreground leading-relaxed">{o.address}</p>
                      </div>
                    )}

                    {/* Structured Payment & Offers Summary */}
                    <div className="bg-secondary/20 rounded-xl p-3 text-xs space-y-2 border border-border/30">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard size={13} />
                          <span>Payment Details:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full font-medium ${isPaid ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700"}`}>
                            {isPaid ? "Online Verified" : "Standard Pending"}
                          </span>
                          {paymentId && (
                            <span className="font-mono text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-md">
                              ID: {paymentId}
                            </span>
                          )}
                        </div>
                      </div>

                      {meta.offerTag && (
                        <div className="flex items-center gap-1.5 text-accent font-medium pt-1 border-t border-border/30">
                          <Tag size={12} />
                          <span>Offer Applied: {meta.offerTag}</span>
                        </div>
                      )}

                      {meta.cleanUserNotes && (
                        <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                          <b>Note:</b> {meta.cleanUserNotes}
                        </p>
                      )}
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="text-muted-foreground font-medium">Grand Total Paid:</span>
                      <span className="font-serif text-lg font-bold text-accent">{formatPrice(o.subtotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* "See More Orders" Pagination Toggle */}
          {filteredOrders.length > 4 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline bg-secondary/40 px-5 py-2 rounded-full cursor-pointer transition-colors"
              >
                <span>{showAllOrders ? "Show Less Orders" : `See More Orders (${filteredOrders.length - 4} remaining)`}</span>
                {showAllOrders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filter criteria."
              : "You don't have any recent orders yet."}
          </p>
          <Link to="/shop" className="inline-block bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold cursor-pointer shadow-sm">
            Explore Handcrafted Jewellery
          </Link>
        </div>
      )}
    </div>
  );
}
