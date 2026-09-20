import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/settings";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Truck,
  Copy,
  ExternalLink,
  AlertTriangle,
  Clock,
  Check,
  BellOff,
  RotateCcw,
  Ban,
  Edit3,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  extractOrderTracking,
  encodeOrderNotesWithTracking,
  calculateDispatchAlert,
  DEFAULT_TRACKING_URL,
  OrderTrackingInfo,
  isOrderTrashed,
  getTrashDaysRemaining,
  shouldAutoPurgeTrashOrder,
  parseOrderMetaNotes,
} from "@/lib/orderTracking";

const statuses = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

const STATUS_TONE: Record<string, string> = {
  new: "bg-accent/20 text-accent",
  confirmed: "bg-amber-500/15 text-amber-700",
  shipped: "bg-sky-500/15 text-sky-700",
  delivered: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-destructive/15 text-destructive",
};

const CANCEL_REASONS = [
  "Customer requested cancellation",
  "Out of stock / Production quality defect",
  "Incorrect delivery address / uncontactable",
  "Payment unverified / duplicate order",
  "Custom Reason",
];

function OrderTrackingManager({ order, onUpdated }: { order: any; onUpdated: () => void }) {
  const currentTracking = extractOrderTracking(order);
  const alertInfo = calculateDispatchAlert(order, currentTracking);

  const [mode, setMode] = useState<"direct" | "sms_only" | "pending_dispatch">(currentTracking.mode);
  const [articleNumber, setArticleNumber] = useState<string>(currentTracking.articleNumber || "");
  const [trackingUrl, setTrackingUrl] = useState<string>(currentTracking.trackingUrl || DEFAULT_TRACKING_URL);
  const [customDelayMessage, setCustomDelayMessage] = useState<string>(currentTracking.customDelayMessage || "");
  const [isSaving, setIsSaving] = useState(false);

  // Toggle 1: Article Number & Website Link
  const handleToggleDirect = (checked: boolean) => {
    if (checked) {
      setMode("direct");
      if (!trackingUrl) setTrackingUrl(DEFAULT_TRACKING_URL);
    } else {
      setMode("pending_dispatch");
    }
  };

  // Toggle 2: Shipped via India Post (SMS Tracking Mode)
  const handleToggleSms = (checked: boolean) => {
    if (checked) {
      setMode("sms_only");
    } else {
      setMode("pending_dispatch");
    }
  };

  const handleSaveTracking = async () => {
    if (mode === "direct" && !articleNumber.trim()) {
      toast.error("Please enter the India Post Article Number (Consignment No.)");
      return;
    }

    setIsSaving(true);
    try {
      const updatedTracking: OrderTrackingInfo = {
        ...currentTracking,
        carrier: "India Post",
        articleNumber: mode === "direct" ? articleNumber.trim() : "",
        trackingUrl: mode === "direct" ? (trackingUrl.trim() || DEFAULT_TRACKING_URL) : DEFAULT_TRACKING_URL,
        mode,
        dispatchedAt: mode !== "pending_dispatch" ? (currentTracking.dispatchedAt || new Date().toISOString()) : undefined,
        dismissedAlert: currentTracking.dismissedAlert,
        customDelayMessage: customDelayMessage.trim() || undefined,
      };

      const updatedNotes = encodeOrderNotesWithTracking(order.notes, updatedTracking);
      const newStatus = (mode !== "pending_dispatch" && (order.status === "new" || order.status === "confirmed"))
        ? "shipped"
        : order.status;

      const { error } = await supabase
        .from("orders")
        .update({
          notes: updatedNotes,
          status: newStatus,
        })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Delivery & Tracking settings updated successfully");
      onUpdated();
    } catch (err: any) {
      toast.error("Failed to save tracking: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissAlert = async () => {
    try {
      const updatedTracking: OrderTrackingInfo = {
        ...currentTracking,
        dismissedAlert: true,
      };
      const updatedNotes = encodeOrderNotesWithTracking(order.notes, updatedTracking);
      const { error } = await supabase.from("orders").update({ notes: updatedNotes }).eq("id", order.id);
      if (error) throw error;
      toast.success("Dispatch alert dismissed for Day 1");
      onUpdated();
    } catch (err: any) {
      toast.error("Failed to dismiss alert: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3.5 mt-3 shadow-xs">
      {/* Dispatch Alert Banners */}
      {alertInfo.isAlert && alertInfo.alertType === "delayed" && (
        <div className="bg-destructive/15 border border-destructive/40 text-destructive rounded-lg p-3 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive animate-bounce" />
          <div className="flex-1">
            <p className="font-bold">{alertInfo.message}</p>
            <p className="text-[11px] mt-0.5 opacity-90">
              The standard 2 working days dispatch window has elapsed. Please fulfill the shipment via India Post or update custom delay note below.
            </p>
          </div>
        </div>
      )}

      {alertInfo.isAlert && alertInfo.alertType === "due_today" && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 rounded-lg p-3 flex items-start justify-between gap-2 text-xs">
          <div className="flex items-start gap-2">
            <Clock className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">{alertInfo.message}</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Order has crossed 24 hours. Prepare packaging for India Post dispatch today.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismissAlert}
            className="shrink-0 flex items-center gap-1 text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <BellOff size={12} /> Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-accent" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            India Post Delivery & Tracking
          </h4>
        </div>
        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
          mode === "direct" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
          mode === "sms_only" ? "bg-sky-500/20 text-sky-700 dark:text-sky-400" :
          "bg-secondary text-muted-foreground"
        }`}>
          {mode === "direct" ? "Direct Consignment Active" : mode === "sms_only" ? "SMS Tracking Active" : "Pending Dispatch"}
        </span>
      </div>

      {/* Toggles Container */}
      <div className="space-y-3 bg-secondary/30 rounded-lg p-3 text-xs border border-border/40">
        {/* Toggle 1: Direct Article Number & Website Link */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Add India Post Article Number & Link</p>
            <p className="text-[11px] text-muted-foreground">
              Direct consignment tracking number & indiapost portal link displayed to customer.
            </p>
          </div>
          <Switch
            checked={mode === "direct"}
            onCheckedChange={handleToggleDirect}
          />
        </div>

        {/* Input fields when Toggle 1 is ON */}
        {mode === "direct" && (
          <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-2 pl-1 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                India Post Article Number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. EK123456789IN or CP987654321IN"
                value={articleNumber}
                onChange={(e) => setArticleNumber(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono tracking-wider outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Tracking Portal Website URL
              </label>
              <input
                type="url"
                placeholder="https://www.indiapost.gov.in"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        )}

        {/* Toggle 2: SMS Tracking Mode */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div>
            <p className="font-semibold text-foreground">Shipped via India Post (SMS Tracking Mode)</p>
            <p className="text-[11px] text-muted-foreground">
              Informs customer that they will receive SMS by India Post on their registered number.
            </p>
          </div>
          <Switch
            checked={mode === "sms_only"}
            onCheckedChange={handleToggleSms}
          />
        </div>
      </div>

      {/* Custom Delay / Dispatch Status Message Field */}
      <div className="bg-secondary/20 rounded-lg p-3 border border-border/40 space-y-1.5 text-xs">
        <label className="block font-semibold text-foreground text-[11px]">
          Custom Delay / Dispatch Notice for Customer (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Dispatch is currently running 2 days behind schedule as our master artisans ensure perfection..."
          value={customDelayMessage}
          onChange={(e) => setCustomDelayMessage(e.target.value)}
          className="w-full bg-background border border-border rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-accent resize-none"
        />
        <p className="text-[10px] text-muted-foreground">
          If filled, this message will be shown on the customer's tracking card if their order is delayed.
        </p>
      </div>

      {/* Save tracking configuration button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSaveTracking}
          disabled={isSaving}
          className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isSaving ? "Saving..." : "Save Delivery Settings"}
        </button>
      </div>
    </div>
  );
}

function OrderCancellationEditor({ order, onUpdated }: { order: any; onUpdated: () => void }) {
  const currentTracking = extractOrderTracking(order);
  const [isEditing, setIsEditing] = useState(false);
  const [reason, setReason] = useState(currentTracking.cancelReason || order.cancel_reason || "Customer requested cancellation");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveReason = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsSaving(true);
    try {
      const updatedTracking: OrderTrackingInfo = {
        ...currentTracking,
        cancelReason: reason.trim(),
      };
      const updatedNotes = encodeOrderNotesWithTracking(order.notes, updatedTracking);
      const { error } = await supabase
        .from("orders")
        .update({
          notes: updatedNotes,
          status: "cancelled",
        })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Cancellation reason updated");
      setIsEditing(false);
      onUpdated();
    } catch (err: any) {
      toast.error("Failed to update cancellation reason: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3.5 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-destructive font-bold">
          <Ban size={15} />
          <span>Order Cancelled</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1 text-[11px] text-destructive hover:underline font-semibold cursor-pointer"
        >
          <Edit3 size={12} /> {isEditing ? "Cancel Edit" : "Edit Reason"}
        </button>
      </div>

      {!isEditing ? (
        <p className="text-foreground text-xs leading-relaxed bg-background/50 p-2.5 rounded-lg border border-destructive/20">
          <b>Cancellation Reason:</b> {currentTracking.cancelReason || order.cancel_reason || "Order was cancelled by admin."}
        </p>
      ) : (
        <div className="space-y-2 pt-1 animate-fadeIn">
          <select
            value={CANCEL_REASONS.includes(reason) ? reason : "Custom Reason"}
            onChange={(e) => {
              if (e.target.value !== "Custom Reason") setReason(e.target.value);
            }}
            className="w-full bg-background border border-border rounded-lg p-2 text-xs outline-none cursor-pointer"
          >
            {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            type="text"
            placeholder="Type detailed cancellation reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-destructive"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-muted-foreground rounded-lg hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReason}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground px-4 py-1 rounded-full text-xs font-bold cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Reason"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"orders" | "trash" | "abandoned">("orders");
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("Customer requested cancellation");

  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: carts } = useQuery({
    queryKey: ["admin-abandoned"],
    queryFn: async () =>
      (await supabase.from("abandoned_carts").select("*").eq("recovered", false).order("updated_at", { ascending: false })).data ?? [],
  });

  // Auto-purge trash check on load
  useEffect(() => {
    if (!data) return;
    const purgeExpired = async () => {
      for (const o of data) {
        if (shouldAutoPurgeTrashOrder(o)) {
          console.log(`Auto-purging order ${o.id} after 15 days in trash`);
          await supabase.from("orders").delete().eq("id", o.id);
        }
      }
    };
    purgeExpired();
  }, [data]);

  const upd = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: any }) =>
      (await supabase.from("orders").update({ status }).eq("id", id)).error,
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const handleMoveToTrash = async (order: any) => {
    if (!confirm(`Are you sure you want to move Order #${order.id.slice(0, 8)} to Trash? It will remain in trash for 15 days before permanent deletion.`)) return;

    try {
      const tracking = extractOrderTracking(order);
      const updatedTracking: OrderTrackingInfo = {
        ...tracking,
        trashedAt: new Date().toISOString(),
      };
      const updatedNotes = encodeOrderNotesWithTracking(order.notes, updatedTracking);
      const { error } = await supabase.from("orders").update({ notes: updatedNotes }).eq("id", order.id);
      if (error) throw error;
      toast.success("Order moved to Trash (15 days retention)");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error("Failed to move to trash: " + (err?.message || "Unknown error"));
    }
  };

  const handleRestoreFromTrash = async (order: any) => {
    try {
      const tracking = extractOrderTracking(order);
      const { trashedAt, ...cleanTracking } = tracking;
      const updatedNotes = encodeOrderNotesWithTracking(order.notes, cleanTracking);
      const { error } = await supabase.from("orders").update({ notes: updatedNotes }).eq("id", order.id);
      if (error) throw error;
      toast.success("Order restored from Trash");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error("Failed to restore order: " + (err?.message || "Unknown error"));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Delete this order permanently from existence? This action cannot be undone.")) return;

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order permanently deleted");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalOrderId) return;
    const targetOrder = data?.find((o) => o.id === cancelModalOrderId);
    if (!targetOrder) return;

    try {
      const tracking = extractOrderTracking(targetOrder);
      const updatedTracking: OrderTrackingInfo = {
        ...tracking,
        cancelReason: cancelReasonInput.trim() || "Customer requested cancellation",
      };
      const updatedNotes = encodeOrderNotesWithTracking(targetOrder.notes, updatedTracking);
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          notes: updatedNotes,
        })
        .eq("id", cancelModalOrderId);

      if (error) throw error;
      toast.success("Order marked as cancelled with reason");
      setCancelModalOrderId(null);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error("Failed to cancel order: " + (err?.message || "Unknown error"));
    }
  };

  async function dismissCart(id: string) {
    const { error } = await supabase.from("abandoned_carts").update({ recovered: true }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-abandoned"] });
  }

  const allOrders = data ?? [];
  const activeOrders = allOrders.filter((o) => !isOrderTrashed(o));
  const trashOrders = allOrders.filter((o) => isOrderTrashed(o));

  const term = q.trim().toLowerCase();
  const filteredActiveOrders = activeOrders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) =>
      !term ||
      `${o.contact_name} ${o.phone} ${o.email ?? ""} ${o.id}`.toLowerCase().includes(term),
    );

  const filteredTrashOrders = trashOrders.filter((o) =>
    !term || `${o.contact_name} ${o.phone} ${o.email ?? ""} ${o.id}`.toLowerCase().includes(term),
  );

  const counts = statuses.reduce<Record<string, number>>((a, s) => ({ ...a, [s]: activeOrders.filter((o) => o.status === s).length }), {});
  const chip = "px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest whitespace-nowrap font-semibold transition-colors cursor-pointer";

  return (
    <div>
      <h1 className="font-serif text-3xl mb-1">Orders</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Manage shipments, India Post consignment tracking, cancel reasons, and 15-day trash lifecycle.
      </p>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-4" data-tour="orders-tabs">
        <button
          onClick={() => setTab("orders")}
          className={`${chip} ${tab === "orders" ? "bg-foreground text-background shadow-xs" : "bg-secondary text-foreground/80 hover:bg-secondary/80"}`}
        >
          Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setTab("trash")}
          className={`${chip} ${tab === "trash" ? "bg-destructive text-destructive-foreground shadow-xs" : "bg-secondary text-foreground/80 hover:bg-secondary/80"}`}
        >
          Trash ({trashOrders.length})
        </button>
        <button
          onClick={() => setTab("abandoned")}
          className={`${chip} ${tab === "abandoned" ? "bg-foreground text-background shadow-xs" : "bg-secondary text-foreground/80 hover:bg-secondary/80"}`}
        >
          Left behind ({carts?.length ?? 0})
        </button>
      </div>

      {tab === "orders" && (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide" data-tour="orders-filter">
            <button onClick={() => setFilter("all")} className={`${chip} ${filter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
              All ({activeOrders.length})
            </button>
            {statuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`${chip} ${filter === s ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                {s} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone, email or order id…"
            className="w-full rounded-full border border-border bg-background px-4 py-2 text-xs mb-3 outline-none focus:ring-1 focus:ring-accent"
          />
          {q && (
            <p className="text-[11px] text-muted-foreground mb-2">{filteredActiveOrders.length} matching orders</p>
          )}

          <div className="space-y-3">
            {filteredActiveOrders.map((o) => {
              const isPaid = (o as any).payment_status === "paid";
              const isOnline = (o as any).payment_method === "razorpay";
              const tracking = extractOrderTracking(o);
              const alert = calculateDispatchAlert(o, tracking);
              const items = Array.isArray(o.items) ? o.items : [];
              const meta = parseOrderMetaNotes(o.notes);

              return (
                <div key={o.id} className="glass-card rounded-xl p-3.5 transition-all">
                  <button onClick={() => setOpen(open === o.id ? null : o.id)} className="w-full flex justify-between items-center gap-3 cursor-pointer">
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">#{o.id.slice(0, 8)} — {o.contact_name}</p>
                        {isOnline ? (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700"}`}>
                            💳 {isPaid ? "Online Paid" : "Payment Pending"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            📦 Standard Order
                          </span>
                        )}
                        {o.status !== "cancelled" && alert.isAlert && alert.alertType === "delayed" && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/20 text-destructive animate-pulse">
                            🚨 Delayed Dispatch
                          </span>
                        )}
                        {o.status !== "cancelled" && alert.isAlert && alert.alertType === "due_today" && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                            ⚠️ Due Today
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.created_at).toLocaleString()} · {formatPrice(o.subtotal)}
                      </p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 font-semibold ${STATUS_TONE[o.status] ?? "bg-secondary"}`}>
                      {o.status}
                    </span>
                  </button>

                  {open === o.id && (
                    <div className="mt-3.5 pt-3.5 border-t border-border/50 space-y-3 text-sm animate-fadeIn">
                      {/* Payment Overview */}
                      <div className="grid sm:grid-cols-2 gap-2 bg-secondary/30 p-3 rounded-lg text-xs">
                        <p><b>Payment Method:</b> {isOnline ? "Online (Razorpay)" : "Standard"}</p>
                        <p><b>Payment Status:</b> <span className={`font-bold ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>{((o as any).payment_status || "pending").toUpperCase()}</span></p>
                        {(o as any).razorpay_payment_id && (
                          <p className="sm:col-span-2 font-mono text-[11px] text-muted-foreground">
                            <b>Razorpay Payment ID:</b> {(o as any).razorpay_payment_id}
                          </p>
                        )}
                      </div>

                      {/* Read-only Customer Shipping Details */}
                      <div className="bg-secondary/20 p-3 rounded-lg text-xs space-y-1">
                        <p className="font-bold text-foreground text-[11px] uppercase tracking-wider mb-1">Customer & Delivery Information (Read-Only)</p>
                        <p><b>Customer Name:</b> {o.contact_name}</p>
                        <p><b>Phone:</b> {o.phone}</p>
                        {o.email && <p><b>Email:</b> {o.email}</p>}
                        <p><b>Shipping Address:</b> {o.address}</p>
                        {meta.cleanUserNotes && <p><b>Customer Notes:</b> {meta.cleanUserNotes}</p>}
                      </div>

                      {/* Purchased Items List */}
                      <div className="bg-secondary/20 p-3 rounded-lg text-xs">
                        <p className="font-bold text-foreground text-[11px] uppercase tracking-wider mb-2">Order Items (Read-Only)</p>
                        <ul className="space-y-2">
                          {items.map((it: any, i: number) => (
                            <li key={i} className="flex items-center justify-between text-muted-foreground pb-1.5 border-b border-border/30 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                {it.image && (
                                  <img src={it.image} alt={it.name} className="size-8 object-cover rounded-md border border-border/50" />
                                )}
                                <div>
                                  <p className="font-medium text-foreground">{it.name} × {it.qty}</p>
                                  {it.isFree && <span className="text-[10px] text-accent font-bold">🎁 Free BOGO Gift</span>}
                                </div>
                              </div>
                              <span className="font-semibold text-foreground">
                                {it.isFree ? "FREE (₹0)" : formatPrice((it.price || 0) * (it.qty || 1))}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2.5 pt-2 border-t border-border/40 flex justify-between font-bold text-foreground">
                          <span>Total Amount:</span>
                          <span className="text-accent">{formatPrice(o.subtotal)}</span>
                        </div>
                      </div>

                      {/* Order Cancellation Reason Box or Tracking Manager */}
                      {o.status === "cancelled" ? (
                        <OrderCancellationEditor
                          order={o}
                          onUpdated={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })}
                        />
                      ) : (
                        <OrderTrackingManager
                          order={o}
                          onUpdated={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })}
                        />
                      )}

                      {/* Status Management & Trash Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                        <div className="flex flex-wrap items-center gap-2">
                          {o.status !== "delivered" && o.status !== "cancelled" && (
                            <button
                              onClick={() => upd.mutate({ id: o.id, status: "delivered" })}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <CheckCircle2 size={13} /> Mark Delivered
                            </button>
                          )}
                          {o.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setCancelModalOrderId(o.id);
                                setCancelReasonInput("Customer requested cancellation");
                              }}
                              className="flex items-center gap-1.5 border border-destructive text-destructive hover:bg-destructive/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <XCircle size={13} /> Cancel Order
                            </button>
                          )}
                          <select
                            className="bg-secondary/80 border border-border rounded-full px-3 py-2 text-xs font-medium outline-none cursor-pointer"
                            value={o.status}
                            onChange={(e) => {
                              if (e.target.value === "cancelled") {
                                setCancelModalOrderId(o.id);
                              } else {
                                upd.mutate({ id: o.id, status: e.target.value });
                              }
                            }}
                          >
                            {statuses.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                          </select>
                        </div>

                        {/* Move to Trash Button */}
                        <button
                          onClick={() => handleMoveToTrash(o)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Move to Trash (15 days retention)"
                        >
                          <Trash2 size={14} /> Move to Trash
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!filteredActiveOrders.length && <p className="text-sm text-muted-foreground py-8 text-center">No orders found.</p>}
          </div>
        </>
      )}

      {/* Trash Tab (15-Day Countdown & Permanent Purge) */}
      {tab === "trash" && (
        <div className="space-y-3">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <p>
              Orders in trash are automatically purged after 15 days. You can restore or permanently delete them below.
            </p>
          </div>

          <div className="space-y-2">
            {filteredTrashOrders.map((o) => {
              const daysRemaining = getTrashDaysRemaining(o);
              const items = Array.isArray(o.items) ? o.items : [];

              return (
                <div key={o.id} className="glass-card rounded-xl p-3.5 border border-destructive/20">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium">#{o.id.slice(0, 8)} — {o.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{o.phone} · {formatPrice(o.subtotal)} · {items.length} item(s)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-destructive/20 text-destructive">
                      ⏳ {daysRemaining} days left in trash
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/40">
                    <button
                      onClick={() => handleRestoreFromTrash(o)}
                      className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <RotateCcw size={13} /> Restore Order
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(o.id)}
                      className="flex items-center gap-1.5 bg-destructive text-destructive-foreground hover:opacity-90 px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-opacity"
                    >
                      <Trash2 size={13} /> Delete Permanently
                    </button>
                  </div>
                </div>
              );
            })}
            {!filteredTrashOrders.length && <p className="text-sm text-muted-foreground py-8 text-center">Trash is empty.</p>}
          </div>
        </div>
      )}

      {/* Abandoned Carts Tab */}
      {tab === "abandoned" && (
        <div className="space-y-2" data-tour="orders-abandoned">
          {(carts ?? []).map((c) => {
            const items = (c.items as any[]) ?? [];
            const names = items.map((i) => `${i.name} × ${i.qty}`).join(", ");
            return (
              <div key={c.id} className="glass-card rounded-xl p-3">
                <p className="text-sm font-medium">{c.contact_name || "Guest shopper"} · {formatPrice(c.subtotal)}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(c.updated_at).toLocaleString()} · {items.length} item(s)
                </p>
                <p className="text-xs text-muted-foreground mb-3">{names}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => dismissCart(c.id)}
                    className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer"
                  >
                    <Trash2 size={13} /> Dismiss
                  </button>
                </div>
              </div>
            );
          })}
          {!carts?.length && <p className="text-sm text-muted-foreground py-8 text-center">No abandoned bags right now.</p>}
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-destructive font-serif text-lg font-bold">
              <Ban size={20} />
              <span>Cancel Order Reason</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Please specify the cancellation reason. This will be shown directly to the customer on their account tracking card.
            </p>

            <div className="space-y-2">
              <select
                value={CANCEL_REASONS.includes(cancelReasonInput) ? cancelReasonInput : "Custom Reason"}
                onChange={(e) => {
                  if (e.target.value !== "Custom Reason") setCancelReasonInput(e.target.value);
                }}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs outline-none cursor-pointer"
              >
                {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>

              <textarea
                rows={3}
                placeholder="Type or customize reason for customer..."
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-destructive resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 py-2 text-xs text-muted-foreground hover:bg-secondary rounded-full cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="bg-destructive text-destructive-foreground px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


