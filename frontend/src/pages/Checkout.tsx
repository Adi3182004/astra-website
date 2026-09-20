import { useCart, cartSubtotal } from "@/lib/store";
import { useSiteSettings, formatPrice } from "@/lib/settings";
import { useSeo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCartStockGuard } from "@/hooks/useCartStockGuard";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { DiscountOffersSection } from "@/components/cart/DiscountOffersSection";
import {
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from "@/lib/razorpay";
import {
  useAddressStore,
  SavedAddress,
  AddressLabel,
  formatFullAddress,
} from "@/lib/addressStore";
import { calculateCartOfferDiscount, splitCartItemsForBOGO } from "@/lib/offers";
import { Wordmark } from "@/components/brand/Wordmark";
import { OrderTrackingParallaxCard } from "@/components/ui/order-tracking-parallax-card";
import {
  placeStockReservation,
  releaseStockReservation,
  decrementInventoryStock,
} from "@/lib/cartStockReservation";
import {
  Sparkles,
  User,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Tag,
  Truck,
  Shield,
  Lock,
  CheckCircle2,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Edit2,
  Trash2,
  Building,
  Navigation,
  Compass,
  Plus,
  Home,
  Briefcase,
  MoreHorizontal,
  BookmarkCheck,
  AlertCircle,
  RotateCcw,
  Copy,
  Printer,
  Package,
  Calendar,
  Clock,
  ShieldCheck,
  Mail,
  Instagram,
} from "lucide-react";

const step1Schema = z.object({
  contact_name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(7, "Please enter a valid phone number (min 7 digits)").max(20),
  email: z.string().trim().email("Please enter a valid email address for order invoice & tracking").max(200),
  flat_building: z.string().trim().min(2, "Please enter Flat, House No. or Building Name").max(200),
  street_landmark: z.string().trim().min(2, "Please enter Street, Road or Landmark").max(200),
  area_locality: z.string().trim().min(2, "Please enter Area or Locality").max(200),
  city: z.string().trim().min(2, "Please enter your City").max(100),
  state: z.string().trim().min(2, "Please enter your State").max(100),
  pincode: z.string().trim().min(5, "Please enter a valid 6-digit Pincode").max(10),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export interface CompletedOrderData {
  orderId: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  items: Array<{
    productId?: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
    isFree?: boolean;
    totalPrice?: number;
  }>;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  appliedOfferCode?: string;
  paymentId?: string;
  createdAt?: string;
}

type CheckoutStep = "shipping" | "payment";

export default function Checkout() {
  const { items, clear, appliedOffer } = useCart();
  const openDrawer = useCart((s) => s.openDrawer);
  const { data: settings } = useSiteSettings();
  const { user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const { hasUnavailable, unavailable } = useCartStockGuard();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Multi-address store
  const savedAddresses = useAddressStore((s) => s.addresses);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);
  const selectAddress = useAddressStore((s) => s.selectAddress);
  const syncFromProfile = useAddressStore((s) => s.syncFromProfile);

  const userSavedAddresses = user
    ? savedAddresses.filter((a) => a.userId === user.id || !a.userId)
    : savedAddresses;

  useSeo({
    title: "Checkout — PRIORA by KP",
    description: "Complete your order with free insured shipping and secure online payment.",
    canonicalPath: "/checkout",
  });

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState<AddressLabel>("Home");
  const [saveToBook, setSaveToBook] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderData | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const isPreviewSuccess = searchParams.get("preview") === "success" || searchParams.get("success") === "1";
  const orderIdParam = searchParams.get("order_id");

  const [form, setForm] = useState({
    contact_name: profile?.full_name || user?.user_metadata?.full_name || "",
    phone: profile?.phone || user?.phone || user?.user_metadata?.phone || "",
    email: user?.email || profile?.email || "",
    flat_building: "",
    street_landmark: "",
    area_locality: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const rawSubtotal = cartSubtotal(items);
  const offerResult = calculateCartOfferDiscount(
    items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.qty })),
    appliedOffer
  );
  const splitItems = splitCartItemsForBOGO(items, appliedOffer);
  const finalTotal = Math.max(0, rawSubtotal - offerResult.discountAmount);
  const totalItemCount = items.reduce((s, i) => s + i.qty, 0);

  // Sync profile data to address store on mount
  useEffect(() => {
    if (profile?.id) {
      syncFromProfile(profile, user?.email);
    }
  }, [profile?.id, profile?.address, profile?.full_name, profile?.phone, user?.email]);

  // If order_id is in URL and completedOrder not set yet, fetch from Supabase
  useEffect(() => {
    if (orderIdParam && !completedOrder) {
      supabase
        .from("orders")
        .select("*")
        .eq("id", orderIdParam)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setCompletedOrder({
              orderId: data.id,
              contact_name: data.contact_name || "Customer",
              phone: data.phone || "",
              email: data.email || "",
              address: data.address || "",
              notes: data.notes || "",
              items: Array.isArray(data.items)
                ? data.items.map((i: any) => ({
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    qty: i.qty,
                    image: i.image,
                    isFree: !!i.isFree,
                    totalPrice: i.price * i.qty,
                  }))
                : [],
              subtotal: data.subtotal || 0,
              discountAmount: 0,
              finalTotal: data.subtotal || 0,
              paymentId: "Verified Razorpay Online",
              createdAt: data.created_at,
            });
          }
        });
    }
  }, [orderIdParam, completedOrder]);

  const initialLoadedRef = useRef(false);

  // Auto pre-fill contact credentials on mount or when profile loads (only if fields are currently empty, never overwriting user typing)
  useEffect(() => {
    const credName = profile?.full_name || user?.user_metadata?.full_name || "";
    const credPhone = profile?.phone || user?.phone || user?.user_metadata?.phone || "";
    const credEmail = user?.email || profile?.email || "";

    setForm((f) => ({
      ...f,
      contact_name: f.contact_name ? f.contact_name : credName,
      phone: f.phone ? f.phone : credPhone,
      email: f.email ? f.email : credEmail,
    }));
  }, [profile?.full_name, profile?.phone, profile?.email, user?.email, user?.phone, user?.user_metadata]);

  // Initial populate from selected/default saved address on mount or when switching selected address ID
  useEffect(() => {
    if (isAddingNewAddress || editingAddressId) return;

    if (userSavedAddresses.length > 0) {
      const active =
        userSavedAddresses.find((a) => a.id === selectedAddressId) ||
        userSavedAddresses.find((a) => a.is_default) ||
        userSavedAddresses[0];

      if (active && (!initialLoadedRef.current || selectedAddressId === active.id)) {
        initialLoadedRef.current = true;
        setForm((f) => ({
          ...f,
          contact_name: active.contact_name || f.contact_name,
          phone: active.phone || f.phone,
          email: active.email || user?.email || f.email,
          flat_building: active.flat_building || "",
          street_landmark: active.street_landmark || "",
          area_locality: active.area_locality || "",
          city: active.city || "",
          state: active.state || "",
          pincode: active.pincode || "",
          notes: active.notes || f.notes,
        }));
      }
    } else if (initialLoadedRef.current) {
      // If all saved addresses were deleted, clear the address fields
      setForm((f) => ({
        ...f,
        flat_building: "",
        street_landmark: "",
        area_locality: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
      }));
    }
  }, [selectedAddressId, userSavedAddresses.length, isAddingNewAddress, editingAddressId]);

  function handleSelectSavedAddress(addr: SavedAddress) {
    selectAddress(addr.id);
    setForm((f) => ({
      ...f,
      contact_name: addr.contact_name,
      phone: addr.phone,
      email: addr.email || user?.email || "",
      flat_building: addr.flat_building,
      street_landmark: addr.street_landmark,
      area_locality: addr.area_locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      notes: addr.notes || f.notes,
    }));
  }

  function handleOpenEditAddress(addr: SavedAddress) {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label || "Home");
    setIsAddingNewAddress(true);
    setForm({
      contact_name: addr.contact_name,
      phone: addr.phone,
      email: addr.email || user?.email || "",
      flat_building: addr.flat_building,
      street_landmark: addr.street_landmark,
      area_locality: addr.area_locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      notes: addr.notes || "",
    });
  }

  async function handleDeleteSavedAddress(e: React.MouseEvent, addr: SavedAddress) {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete this address for "${addr.contact_name}"?`)) {
      await deleteAddress(addr.id);
      toast.success("Address deleted and removed from database");
      if (editingAddressId === addr.id) {
        setEditingAddressId(null);
        setIsAddingNewAddress(false);
      }
      if (userSavedAddresses.length <= 1 || selectedAddressId === addr.id) {
        setForm((f) => ({
          ...f,
          flat_building: "",
          street_landmark: "",
          area_locality: "",
          city: "",
          state: "",
          pincode: "",
          notes: "",
        }));
      }
    }
  }

  const compiledAddress = [
    form.flat_building,
    form.street_landmark,
    form.area_locality,
    form.city,
    `${form.state}${form.pincode ? ` - ${form.pincode}` : ""}`,
  ]
    .filter(Boolean)
    .join(", ");

  // ─────────────────────────────────────────────────────────────
  // 1. ORDER SUCCESS SCREEN (SHOWN ON SUCCESS OR PREVIEW)
  // ─────────────────────────────────────────────────────────────
  const displayOrder: CompletedOrderData | null =
    completedOrder ||
    (isPreviewSuccess
      ? {
          orderId: "7984A3A2-9",
          contact_name: form.contact_name || user?.user_metadata?.full_name || "Valued Customer",
          phone: form.phone || "+919876543210",
          email: form.email || user?.email || "customer@priorabykp.com",
          address:
            compiledAddress ||
            "Vidhi Complex, Kalyan West, Maharashtra - 421301",
          notes: "",
          items: [
            {
              productId: "demo-royal-bow-paid",
              name: "Royal Bow",
              price: 349,
              qty: 2,
              image: "/assets/necklace-bow-DEJS6n6e.png",
              isFree: false,
              totalPrice: 698,
            },
            {
              productId: "demo-royal-bow-free",
              name: "Royal Bow",
              price: 0,
              qty: 1,
              image: "/assets/necklace-bow-DEJS6n6e.png",
              isFree: true,
              totalPrice: 0,
            },
          ],
          subtotal: 1047,
          discountAmount: 349,
          finalTotal: 698,
          appliedOfferCode: "B2G1",
          paymentId: "pay_rzp_PRIORA_VERIFIED",
          createdAt: new Date().toISOString(),
        }
      : null);

  if (displayOrder) {
    const formattedDate = new Date(displayOrder.createdAt || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const handleCopyOrderId = () => {
      navigator.clipboard.writeText(displayOrder.orderId);
      setCopiedOrderId(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopiedOrderId(false), 2000);
    };

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in duration-500 space-y-8">
        {/* Live Preview Bar if in preview mode */}
        {isPreviewSuccess && !completedOrder && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between shadow-xs print:hidden">
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles size={15} className="text-amber-600 animate-pulse" />
              <strong>Live Preview Mode:</strong> Order Success Screen
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="text-[11px] underline font-bold hover:opacity-80 cursor-pointer"
            >
              Exit Preview
            </button>
          </div>
        )}

        {/* TOP NOTIFICATION RIBBON */}
        <div className="text-center">
          <div
            style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF", color: "#3D2A25" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-xs sm:text-sm font-bold tracking-wide shadow-xs"
          >
            <Sparkles size={16} className="text-[#E06A8B] animate-pulse shrink-0" />
            <span>Your product have been successfully ordered and will be dispatched within 1-2 days</span>
          </div>
        </div>

        {/* PRIORA LOGO HEADER */}
        <div className="text-center flex justify-center pt-2">
          <Wordmark size="lg" />
        </div>

        {/* HERO TITLE & BRAND STATEMENT */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div
            style={{ backgroundColor: "#E06A8B" }}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-lg shadow-[#E06A8B]/25 mb-1"
          >
            <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </div>

          <h1
            style={{ color: "#3D2A25" }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Order Confirmed
          </h1>

          <p
            style={{ color: "#E06A8B" }}
            className="font-serif text-lg sm:text-xl font-bold italic tracking-wide"
          >
            A beautiful choice, now on its way to you.
          </p>

          <p
            style={{ color: "#3D2A25" }}
            className="text-sm sm:text-base font-semibold leading-relaxed px-4 max-w-xl mx-auto"
          >
            Your Priora piece is designed for lasting shine, effortless elegance, and skin-friendly comfort made to be worn, loved, and enjoyed every day.
          </p>

          {/* BRAND ATTRIBUTE BADGES */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span
              style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF", color: "#3D2A25" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-black tracking-wide shadow-xs"
            >
              <Sparkles size={14} className="text-[#E06A8B]" />
              Anti-Tarnish · Hypoallergenic
            </span>
            <span
              style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF", color: "#3D2A25" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-black tracking-wide shadow-xs"
            >
              <Truck size={14} className="text-[#E06A8B]" />
              Your order will be dispatched within 1–2 business days.
            </span>
          </div>
        </div>

        {/* MAIN 2-COLUMN SECTION: 3D PARALLAX TRACKER + ORDER INVOICE DETAILS */}
        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start justify-center pt-4">
          {/* LEFT: 3D PARALLAX TRACKING CARD */}
          <div className="flex justify-center w-full">
            <OrderTrackingParallaxCard
              orderId={displayOrder.orderId.slice(0, 8).toUpperCase()}
              product={
                displayOrder.items.length > 1
                  ? `${displayOrder.items[0]?.name} + ${displayOrder.items.length - 1} more`
                  : displayOrder.items[0]?.name || "Priora Jewellery Piece"
              }
              status="Processing"
              eta="1–2 Business Days"
              imageUrl="/delivery-truck.png"
            />
          </div>

          {/* RIGHT: ORDER SUMMARY & SHIPPING DESTINATION */}
          <div className="space-y-5">
            {/* Quick Metadata & Shipping Destination */}
            <div
              style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF" }}
              className="rounded-3xl p-5 sm:p-6 border shadow-xl shadow-[#E06A8B]/5 space-y-4 print-card"
            >
              <div
                style={{ borderBottomColor: "#F5D3DF" }}
                className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
              >
                <div>
                  <span
                    style={{ color: "#8A6270" }}
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    Order Reference
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      style={{ color: "#3D2A25" }}
                      className="font-mono font-bold text-sm sm:text-base select-all"
                    >
                      #{displayOrder.orderId.slice(0, 10).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="p-1.5 rounded-lg text-[#8A6270] hover:text-[#3D2A25] hover:bg-[#FBE1EA] transition-colors cursor-pointer print:hidden"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    style={{ color: "#8A6270" }}
                    className="text-[10px] font-black uppercase tracking-widest"
                  >
                    Date Placed
                  </span>
                  <p
                    style={{ color: "#3D2A25" }}
                    className="text-xs sm:text-sm font-bold mt-0.5"
                  >
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div>
                <h3
                  style={{ color: "#3D2A25" }}
                  className="text-xs uppercase tracking-widest font-black mb-1.5 flex items-center gap-1.5"
                >
                  <MapPin size={14} className="text-[#E06A8B]" /> Shipping Destination
                </h3>
                <div
                  style={{ backgroundColor: "#FBE1EA", borderColor: "#F5D3DF" }}
                  className="p-3.5 rounded-2xl border text-xs space-y-1 shadow-xs"
                >
                  <div
                    style={{ color: "#3D2A25" }}
                    className="flex items-center justify-between font-bold"
                  >
                    <span>{displayOrder.contact_name}</span>
                    <span style={{ color: "#8A6270" }} className="font-semibold">{displayOrder.phone}</span>
                  </div>
                  <p style={{ color: "#8A6270" }} className="font-medium">{displayOrder.email}</p>
                  <p
                    style={{ color: "#3D2A25" }}
                    className="font-semibold pt-0.5 leading-relaxed"
                  >
                    {displayOrder.address}
                  </p>
                  {displayOrder.notes && (
                    <p
                      style={{ color: "#8A6270", borderTopColor: "#F5D3DF" }}
                      className="text-[10px] italic pt-1 border-t mt-1"
                    >
                      Note: &quot;{displayOrder.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Confirmation Badge */}
              <div
                style={{ backgroundColor: "#FBE1EA", borderColor: "#F5D3DF" }}
                className="p-3 rounded-2xl border text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Payment Confirmed (SSL Secured)
                  </p>
                  {displayOrder.paymentId && (
                    <p
                      style={{ color: "#8A6270" }}
                      className="text-[11px] font-mono font-bold"
                    >
                      Ref: {displayOrder.paymentId}
                    </p>
                  )}
                </div>
                <span
                  style={{ backgroundColor: "#E06A8B", color: "#FFFFFF" }}
                  className="px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-xs"
                >
                  Paid Online
                </span>
              </div>
            </div>

            {/* Items Purchased & Financial Breakdown */}
            <div
              style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF" }}
              className="rounded-3xl border overflow-hidden shadow-xl shadow-[#E06A8B]/5 print-card"
            >
              <div
                style={{ backgroundColor: "#FBE1EA", borderBottomColor: "#F5D3DF" }}
                className="px-5 py-3.5 border-b flex items-center justify-between"
              >
                <h3
                  style={{ color: "#3D2A25" }}
                  className="text-xs font-bold flex items-center gap-2"
                >
                  <ShoppingBag size={14} className="text-[#E06A8B]" />
                  Items in Order ({displayOrder.items.reduce((s, i) => s + (i.qty || 1), 0)})
                </h3>
              </div>

              {/* Item list */}
              <div
                style={{ borderColor: "#F5D3DF" }}
                className="divide-y max-h-[260px] overflow-y-auto"
              >
                {displayOrder.items.map((i, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: i.isFree ? "#FBE1EA" : "transparent",
                      borderBottomColor: "#F5D3DF",
                    }}
                    className="flex items-center gap-3.5 px-5 py-3 text-xs"
                  >
                    <div
                      style={{ backgroundColor: "#FBE1EA", borderColor: "#F5D3DF" }}
                      className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border relative shadow-xs"
                    >
                      {i.image && (
                        <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                      )}
                      {i.isFree && (
                        <span
                          style={{ backgroundColor: "#E06A8B", color: "#FFFFFF" }}
                          className="absolute top-1 left-1 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs leading-none tracking-wider z-10"
                        >
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{ color: "#3D2A25" }}
                        className="font-bold truncate"
                      >
                        {i.name}
                      </p>
                      <p
                        style={{ color: "#8A6270" }}
                        className="text-[10px] font-medium flex items-center gap-1.5 flex-wrap"
                      >
                        {i.isFree ? (
                          <span
                            style={{ color: "#3D2A25" }}
                            className="font-bold flex items-center gap-1"
                          >
                            <span>🎁</span> Free Item (Qty: {i.qty || 1})
                          </span>
                        ) : (
                          <span>Qty: {i.qty}</span>
                        )}
                      </p>
                    </div>
                    <div className="font-bold shrink-0 text-right">
                      {i.isFree ? (
                        <span style={{ color: "#E06A8B" }} className="font-bold">FREE</span>
                      ) : (
                        <div>
                          <div style={{ color: "#3D2A25" }} className="font-bold">{formatPrice(i.totalPrice ?? i.price * i.qty)}</div>
                          {i.qty > 1 && (
                            <div style={{ color: "#8A6270" }} className="text-[9px] font-medium">
                              {formatPrice(i.price)} each
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div
                style={{ backgroundColor: "#FBE1EA", borderTopColor: "#F5D3DF" }}
                className="px-5 py-4 border-t space-y-1.5 text-xs"
              >
                <div className="flex justify-between">
                  <span style={{ color: "#8A6270" }} className="font-medium">Subtotal</span>
                  <span style={{ color: "#3D2A25" }} className="font-bold">{formatPrice(displayOrder.subtotal)}</span>
                </div>
                {displayOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-green-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles size={11} className="text-[#D9A441]" /> Discount {displayOrder.appliedOfferCode ? `(${displayOrder.appliedOfferCode})` : ""}
                    </span>
                    <span>-{formatPrice(displayOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "#8A6270" }} className="font-medium">Insured Express Shipping</span>
                  <span className="text-emerald-700 dark:text-green-400 font-bold">FREE</span>
                </div>
                <div style={{ backgroundColor: "#F5D3DF" }} className="h-px my-1.5" />
                <div className="flex justify-between font-serif text-base font-bold">
                  <span style={{ color: "#3D2A25" }}>Total Paid</span>
                  <span style={{ color: "#E06A8B" }} className="font-black">{formatPrice(displayOrder.finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 print:hidden no-print">
          <Link
            to="/account"
            style={{ backgroundColor: "#E06A8B", color: "#FFFFFF" }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold shadow-lg shadow-[#E06A8B]/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2.5 cursor-pointer hover:opacity-95"
          >
            <Sparkles size={16} className="text-[#D9A441] animate-pulse shrink-0" />
            <span>View in My Orders</span>
          </Link>

          <Link
            to="/"
            style={{ backgroundColor: "#FFEAF1", borderColor: "#F5D3DF", color: "#3D2A25" }}
            className="w-full sm:w-auto hover:bg-[#FBE1EA] border-2 px-7 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all text-center shadow-xs flex items-center justify-center gap-2"
          >
            <span>Back to Home</span>
            <ArrowRight size={14} className="text-[#E06A8B]" />
          </Link>
        </div>

        {/* PRIORA OFFICIAL FOOTER */}
        <footer
          style={{ backgroundColor: "#FDE6EE", borderColor: "#F5D3DF" }}
          className="border-t px-4 sm:px-6 py-10 text-center rounded-3xl mt-12 print:hidden no-print"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            <Wordmark size="lg" />
            <p style={{ color: "#8A6270" }} className="text-xs max-w-md mx-auto">
              Jewellery that reflects your Aura
            </p>
            <div style={{ color: "#8A6270" }} className="flex justify-center gap-6">
              <a
                href="https://mail.google.com/mail/?view=cm&to=priorabykp@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
                className="hover:text-[#E06A8B] transition-colors"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://www.instagram.com/priorabykp?igsi=MW1jaDI3Z3M4aXZ4eg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#E06A8B] transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
            <div
              style={{ color: "#8A6270" }}
              className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest font-semibold"
            >
              <Link to="/shop" className="hover:text-[#E06A8B] transition-colors">Shop</Link>
              <Link to="/page/about" className="hover:text-[#E06A8B] transition-colors">About Us</Link>
              <Link to="/page/support" className="hover:text-[#E06A8B] transition-colors">Support</Link>
              <Link to="/page/shipping" className="hover:text-[#E06A8B] transition-colors">Shipping Policy</Link>
              <Link to="/page/privacy" className="hover:text-[#E06A8B] transition-colors">Privacy Policy</Link>
              <Link to="/page/terms" className="hover:text-[#E06A8B] transition-colors">Terms</Link>
              <Link to="/page/contact" className="hover:text-[#E06A8B] transition-colors">Contact</Link>
              <Link to="/account" className="hover:text-[#E06A8B] transition-colors">Account</Link>
            </div>
            <p style={{ color: "#8A6270" }} className="text-[10px] opacity-80 pt-2">
              © {new Date().getFullYear()} PRIORA by KP · Jewellery that reflects your Aura
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-[65vh]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={13} />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        {/* Empty Box Card */}
        <div className="max-w-md mx-auto text-center py-14 px-6 bg-card rounded-3xl border border-border/70 shadow-xs mb-10">
          <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl mb-2 text-foreground">Your bag is empty</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-6 max-w-xs mx-auto">
            Discover handcrafted luxury jewellery and add items to proceed with checkout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 transition-all text-center"
            >
              Explore Shop
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer"
            >
              Open Bag
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Step 1 -> Step 2 transition
  async function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (hasUnavailable) {
      toast.error("Some items just went out of stock. Please review your bag.");
      return;
    }

    const parsed = step1Schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    // Clear any stale payment errors when moving forward
    setPaymentError(null);

    // If editing existing address
    if (editingAddressId) {
      await updateAddress(editingAddressId, {
        label: addressLabel,
        contact_name: parsed.data.contact_name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        flat_building: parsed.data.flat_building,
        street_landmark: parsed.data.street_landmark,
        area_locality: parsed.data.area_locality,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        notes: parsed.data.notes || "",
        userId: user?.id ?? null,
      });
      setEditingAddressId(null);
      setIsAddingNewAddress(false);
      toast.success("Address updated and saved to database!");
    } else if (isAddingNewAddress || userSavedAddresses.length === 0) {
      // ONLY add a new address if the user was explicitly adding a new one or has 0 addresses saved
      if (saveToBook || userSavedAddresses.length === 0) {
        await addAddress({
          userId: user?.id ?? null,
          label: addressLabel,
          contact_name: parsed.data.contact_name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          flat_building: parsed.data.flat_building,
          street_landmark: parsed.data.street_landmark,
          area_locality: parsed.data.area_locality,
          city: parsed.data.city,
          state: parsed.data.state,
          pincode: parsed.data.pincode,
          notes: parsed.data.notes || "",
          is_default: userSavedAddresses.length === 0,
        });
      }
      setIsAddingNewAddress(false);
      setEditingAddressId(null);
    }

    // Save full structured details to Supabase profile in background if logged in
    if (user) {
      const structuredAddress = JSON.stringify({
        flat_building: parsed.data.flat_building,
        street_landmark: parsed.data.street_landmark,
        area_locality: parsed.data.area_locality,
        label: addressLabel,
        notes: parsed.data.notes || "",
        saved_addresses: useAddressStore
          .getState()
          .addresses.filter((a) => a.userId === user.id || !a.userId),
      });

      saveProfile({
        full_name: parsed.data.contact_name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: structuredAddress,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
      }).catch((err) => console.warn("Could not save profile:", err));
    }

    setIsAddingNewAddress(false);
    setEditingAddressId(null);
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Handle Step 2 -> Submit Order & Launch Razorpay
  async function handleFinalPaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasUnavailable) {
      toast.error("Some items just went out of stock. Please review your bag.");
      return;
    }

    const parsed = step1Schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setCurrentStep("shipping");
      return;
    }

    setSubmitting(true);
    setPaymentError(null);

    // Refresh session to ensure JWT is valid before order insert (prevents RLS violations)
    if (user) {
      try {
        await supabase.auth.refreshSession();
      } catch {
        // Non-fatal: proceed even if refresh fails
      }
    }

    const offerNote = appliedOffer
      ? ` [Offer: ${appliedOffer.code} - ${appliedOffer.title} (-₹${offerResult.discountAmount})]`
      : "";

    const splitItems = splitCartItemsForBOGO(items, appliedOffer);

    // Use verified user_id from refreshed session
    const { data: sessionData } = await supabase.auth.getSession();
    const freshUserId = sessionData?.session?.user?.id ?? user?.id ?? null;

    const payload = {
      user_id: freshUserId,
      contact_name: parsed.data.contact_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: compiledAddress,
      notes: (parsed.data.notes || "") + offerNote + " [Payment: Razorpay Online (Pending)]",
      subtotal: finalTotal,
      status: "new",
      items: splitItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image,
        isFree: i.isFree,
        totalPrice: i.totalPrice,
      })),
    };

    // 1. Create order via server-side API (uses service_role to bypass RLS)
    let orderData: { id: string } | null = null;
    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error || "Failed to create order");
      orderData = orderJson.order;
    } catch (apiErr: any) {
      // Fallback: try direct Supabase insert
      const { error: dbError, data: fallbackOrder } = await supabase
        .from("orders")
        .insert(payload)
        .select()
        .single();
      if (dbError) {
        setSubmitting(false);
        setPaymentError(`Could not create order: ${dbError.message}`);
        toast.error(dbError.message);
        return;
      }
      orderData = fallbackOrder;
    }

    if (!orderData) {
      setSubmitting(false);
      setPaymentError("Could not create order. Please try again.");
      toast.error("Could not create order. Please try again.");
      return;
    }

    // 2. Lock / Reserve product stock for this session (BookMyShow anti-double spending pattern)
    placeStockReservation(
      splitItems.map((i) => ({ productId: i.productId, qty: i.qty })),
      orderData.id
    );

    // 3. Launch Razorpay Payment Gateway
    try {
      toast.loading("Opening secure payment gateway...");
      const rzpOrder = await createRazorpayOrder(finalTotal, orderData.id, {
        customer_name: parsed.data.contact_name,
        phone: parsed.data.phone,
      });
      toast.dismiss();

      await openRazorpayCheckout({
        orderId: rzpOrder.id,
        keyId: rzpOrder.keyId,
        amount: rzpOrder.amount,
        name: parsed.data.contact_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        description: `PRIORA Order #${orderData.id.slice(0, 8)}`,
        onSuccess: async (paymentData) => {
          try {
            toast.loading("Verifying payment confirmation...");
            const verification = await verifyRazorpayPayment({
              ...paymentData,
              supabase_order_id: orderData.id,
            });
            toast.dismiss();

            // Deduct stock permanently upon confirmed successful payment & release temporary hold
            await decrementInventoryStock(
              splitItems.map((i) => ({ productId: i.productId, qty: i.qty }))
            );
            releaseStockReservation(orderData.id);

            const successOrderInfo: CompletedOrderData = {
              orderId: orderData.id,
              contact_name: parsed.data.contact_name,
              phone: parsed.data.phone,
              email: parsed.data.email,
              address: compiledAddress,
              notes: parsed.data.notes,
              items: splitItems.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                image: i.image,
                isFree: i.isFree,
                totalPrice: i.totalPrice,
              })),
              subtotal: rawSubtotal,
              discountAmount: offerResult.discountAmount,
              finalTotal: finalTotal,
              appliedOfferCode: appliedOffer?.code,
              paymentId: paymentData.razorpay_payment_id,
              createdAt: new Date().toISOString(),
            };

            setCompletedOrder(successOrderInfo);
            clear();
            setSubmitting(false);
            toast.success("Payment successful! 🎉 Your order has been placed.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (vErr: any) {
            toast.dismiss();
            await decrementInventoryStock(
              splitItems.map((i) => ({ productId: i.productId, qty: i.qty }))
            );
            releaseStockReservation(orderData.id);

            const fallbackOrderInfo: CompletedOrderData = {
              orderId: orderData.id,
              contact_name: parsed.data.contact_name,
              phone: parsed.data.phone,
              email: parsed.data.email,
              address: compiledAddress,
              notes: parsed.data.notes,
              items: splitItems.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                image: i.image,
                isFree: i.isFree,
                totalPrice: i.totalPrice,
              })),
              subtotal: rawSubtotal,
              discountAmount: offerResult.discountAmount,
              finalTotal: finalTotal,
              appliedOfferCode: appliedOffer?.code,
              paymentId: paymentData.razorpay_payment_id,
              createdAt: new Date().toISOString(),
            };
            setCompletedOrder(fallbackOrderInfo);
            clear();
            setSubmitting(false);
            toast.success("Payment processed! Order placed successfully.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        onFailure: (error) => {
          releaseStockReservation(orderData.id);
          setSubmitting(false);
          const errDesc = error?.description || error?.reason || "Payment could not be processed.";
          setPaymentError(`Payment Unsuccessful: ${errDesc}. Your cart items and details are safely preserved. You can retry payment below.`);
          toast.error("Payment failed. Please retry or choose a different payment method.");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onDismiss: () => {
          releaseStockReservation(orderData.id);
          setSubmitting(false);
          setPaymentError("Payment was cancelled. Your bag and shipping details are safe. Click 'Pay Online' below to retry whenever you're ready.");
          toast.info("Payment cancelled — your bag is intact. You can try again anytime.");
        },
      });
    } catch (err: any) {
      releaseStockReservation(orderData.id);
      setSubmitting(false);
      toast.dismiss();
      console.error("Payment initiation error:", err);
      setPaymentError(err.message || "Could not initialize payment gateway. Please try again.");
      toast.error(err.message || "Could not initialize payment gateway.");
    }
  }

  const inputCls =
    "w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent border border-border/40 focus:border-accent transition-all text-foreground placeholder:text-muted-foreground/60";

  return (
    <div data-preview="checkout" className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight size={13} />
        <button type="button" onClick={openDrawer} className="hover:text-foreground transition-colors cursor-pointer">Bag</button>
        <ChevronRight size={13} />
        <span className="text-foreground font-medium">Checkout</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground">
          {currentStep === "shipping" ? "Delivery Details" : "Review & Payment"}
        </h1>

        {/* 2-Step Progress Indicator */}
        <div className="flex items-center gap-2 bg-card/80 border border-border/60 rounded-full p-1.5 self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => {
              setIsAddingNewAddress(false);
              setEditingAddressId(null);
              setCurrentStep("shipping");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              currentStep === "shipping"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">
              {currentStep === "payment" ? <Check size={10} className="stroke-[3]" /> : "1"}
            </span>
            <span>1. Address</span>
          </button>

          <ChevronRight size={13} className="text-muted-foreground/40" />

          <button
            type="button"
            onClick={(e) => {
              if (currentStep === "shipping") {
                handleProceedToPayment(e);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              currentStep === "payment"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground/60 cursor-pointer"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>2. Payment</span>
          </button>
        </div>
      </div>

      {/* Stock warning */}
      {hasUnavailable && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2 mb-6">
          <Shield size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>{unavailable.map((u) => u.name).join(", ")}</strong> just went out of stock and was removed.
            Review your bag before proceeding.
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: SHIPPING & ADDRESS DETAILS
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "shipping" && (
        <form onSubmit={handleProceedToPayment}>
          <div className="grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_450px] gap-6 lg:gap-8 2xl:gap-10 items-start">
            {/* Left: Saved Addresses or Structured Form */}
            <div className="space-y-6">
              {/* 1. Saved Addresses Quick Selector */}
              {userSavedAddresses.length > 0 && (
                <section className="glass-card rounded-3xl p-5 sm:p-7 border border-border/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <BookmarkCheck size={16} className="text-accent" />
                      Saved Delivery Addresses
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddressId(null);
                        const nextAdding = !isAddingNewAddress;
                        setIsAddingNewAddress(nextAdding);
                        if (nextAdding) {
                          setForm({
                            contact_name: profile?.full_name || user?.user_metadata?.full_name || "",
                            phone: profile?.phone || user?.phone || user?.user_metadata?.phone || "",
                            email: user?.email || profile?.email || "",
                            flat_building: "",
                            street_landmark: "",
                            area_locality: "",
                            city: "",
                            state: "",
                            pincode: "",
                            notes: "",
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{isAddingNewAddress ? "View Saved Cards" : "Add New Address"}</span>
                    </button>
                  </div>

                  {/* Saved Address Selection Cards Grid */}
                  {!isAddingNewAddress && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {userSavedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleOpenEditAddress(addr)}
                            className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? "border-2 border-accent bg-accent/10 shadow-xs ring-1 ring-accent/40"
                                : "border-border/60 hover:border-accent/60 bg-card/60 hover:bg-card"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded-full text-foreground">
                                  {addr.label || "Home"}
                                </span>
                                {addr.is_default && (
                                  <span className="text-[10px] font-semibold text-accent flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Default
                                  </span>
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-sm text-foreground pt-0.5">{addr.contact_name}</p>
                                <p className="text-xs text-muted-foreground">{addr.phone}</p>
                              </div>

                              <p className="text-xs text-foreground/85 leading-relaxed font-medium line-clamp-2">
                                {formatFullAddress(addr)}
                              </p>
                            </div>

                            {/* Bottom Row: Deliver Here & Actions (Edit + Delete) */}
                            <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs">
                              {/* Left: Deliver Here / Select Status */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSavedAddress(addr);
                                }}
                                className="cursor-pointer"
                              >
                                {isSelected ? (
                                  <span className="text-accent font-semibold flex items-center gap-1 text-xs">
                                    <Check size={13} className="stroke-[3]" /> Deliver Here
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground hover:text-foreground text-xs font-medium underline">
                                    Select Address
                                  </span>
                                )}
                              </div>

                              {/* Right: Explicit Edit & Delete Actions */}
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditAddress(addr)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                                  title="Edit this address"
                                >
                                  <Edit2 size={11} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSavedAddress(e, addr)}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                  title="Delete from address book and database"
                                >
                                  <Trash2 size={11} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* 2. Structured Address Entry Form (If Adding New Address, Editing, or First Time) */}
              {(isAddingNewAddress || userSavedAddresses.length === 0) && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Form Header info */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-accent">
                      {editingAddressId ? "Editing Address Details" : "Enter New Delivery Address"}
                    </span>
                    {userSavedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setEditingAddressId(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                      >
                        Cancel &amp; use saved card
                      </button>
                    )}
                  </div>

                  {/* Contact Information */}
                  <section className="glass-card rounded-3xl p-5 sm:p-7 border border-border/60 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <User size={16} className="text-accent" />
                        Contact Information
                      </h2>
                      <span className="text-[11px] text-muted-foreground">Courier contact</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                          Full Name *
                        </label>
                        <input
                          id="checkout-name"
                          className={inputCls}
                          placeholder=""
                          value={form.contact_name}
                          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                          Phone Number (for Courier &amp; Updates) *
                        </label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          className={inputCls}
                          placeholder=""
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                        Email Address (for Order Invoice &amp; Live Tracking) *
                      </label>
                      <input
                        id="checkout-email"
                        className={inputCls}
                        placeholder=""
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </section>

                  {/* Structured Delivery Address */}
                  <section className="glass-card rounded-3xl p-5 sm:p-7 border border-border/60 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <MapPin size={16} className="text-accent" />
                        Delivery Address
                      </h2>

                      {/* Address Type Selector */}
                      <div className="flex gap-1.5">
                        {(["Home", "Work", "Other"] as AddressLabel[]).map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setAddressLabel(lbl)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              addressLabel === lbl
                                ? "bg-accent text-accent-foreground shadow-xs"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {lbl === "Home" && <Home size={11} />}
                            {lbl === "Work" && <Briefcase size={11} />}
                            {lbl === "Other" && <MoreHorizontal size={11} />}
                            <span>{lbl}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flat / Building */}
                    <div>
                      <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Building size={13} className="text-accent" />
                        Flat, House No., Building / Apartment Name *
                      </label>
                      <input
                        id="checkout-flat"
                        className={inputCls}
                        placeholder=""
                        value={form.flat_building}
                        onChange={(e) => setForm({ ...form, flat_building: e.target.value })}
                        required
                      />
                    </div>

                    {/* Street / Landmark & Area */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Navigation size={13} className="text-accent" />
                          Street, Road or Landmark *
                        </label>
                        <input
                          id="checkout-street"
                          className={inputCls}
                          placeholder=""
                          value={form.street_landmark}
                          onChange={(e) => setForm({ ...form, street_landmark: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Compass size={13} className="text-accent" />
                          Area, Sector or Locality *
                        </label>
                        <input
                          id="checkout-area"
                          className={inputCls}
                          placeholder=""
                          value={form.area_locality}
                          onChange={(e) => setForm({ ...form, area_locality: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                          City / Town *
                        </label>
                        <input
                          id="checkout-city"
                          className={inputCls}
                          placeholder=""
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                          State *
                        </label>
                        <input
                          id="checkout-state"
                          className={inputCls}
                          placeholder=""
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                          Pincode (6 Digits) *
                        </label>
                        <input
                          id="checkout-pincode"
                          className={inputCls}
                          placeholder=""
                          maxLength={10}
                          value={form.pincode}
                          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Save to address book checkbox */}
                    {!editingAddressId && (
                      <div className="pt-1">
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveToBook}
                            onChange={(e) => setSaveToBook(e.target.checked)}
                            className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                          />
                          <span>Save this address to my account for faster future checkout</span>
                        </label>
                      </div>
                    )}

                    {/* Optional Order Notes */}
                    <div className="pt-2">
                      <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
                        Order Notes / Delivery Instructions (optional) (within 150 words)
                      </label>
                      <textarea
                        id="checkout-notes"
                        className={inputCls}
                        placeholder=""
                        rows={2}
                        maxLength={500}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>
                  </section>
                </div>
              )}

              {/* Trust signals */}
              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground px-1">
                {[
                  { icon: Truck, text: "Free insured shipping on ₹999+" },
                  { icon: Shield, text: "256-Bit SSL Bank-Grade Security" },
                  { icon: Lock, text: "100% Encrypted & Authenticated" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5">
                    <Icon size={13} className="text-accent" /> {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Step 1 Mini Order Preview & Next CTA */}
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="glass-card rounded-3xl border border-border/60 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingBag size={16} className="text-accent" />
                    Order Summary ({totalItemCount} item{totalItemCount !== 1 ? "s" : ""})
                  </h2>
                  <button
                    type="button"
                    onClick={openDrawer}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    View Bag
                  </button>
                </div>

                {/* Mini Item List Preview */}
                <div className="divide-y divide-border/40 max-h-[220px] overflow-y-auto">
                  {splitItems.map((i) => (
                    <div key={i.productId} className={`flex items-center gap-3 px-5 py-3 text-xs ${i.isFree ? "bg-accent/5" : ""}`}>
                      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-secondary/50 border border-border/40 relative">
                        {i.image && (
                          <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                        )}
                        {i.isFree && (
                          <span className="absolute top-0.5 left-0.5 bg-[#E06A8B] text-white text-[7px] font-black uppercase px-1 py-0.2 rounded shadow-xs leading-none tracking-wider z-10">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{i.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {i.isFree ? "🎁 Free via BOGO Offer" : `Qty: ${i.qty}`}
                        </p>
                      </div>
                      <div className="font-semibold shrink-0 text-right">
                        {i.isFree ? (
                          <span className="text-accent font-bold">FREE</span>
                        ) : (
                          <div>
                            <div>{formatPrice(i.totalPrice)}</div>
                            {i.qty > 1 && <div className="text-[10px] text-muted-foreground font-normal">{formatPrice(i.price)} each</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Free Shipping status */}
                <div className="px-5 py-4 border-t border-border/60 bg-secondary/20 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(rawSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {rawSubtotal >= 999 ? "FREE" : "Calculated at delivery"}
                    </span>
                  </div>

                  {offerResult.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} /> Discount
                      </span>
                      <span>-{formatPrice(offerResult.discountAmount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-border/60 my-1" />

                  <div className="flex justify-between font-serif text-lg font-bold">
                    <span>Estimated Total</span>
                    <span className="text-accent">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Step 1 Primary CTA Button */}
                <div className="p-5 border-t border-border/60">
                  <button
                    id="checkout-proceed-btn"
                    type="submit"
                    className="w-full bg-accent text-accent-foreground py-4 rounded-2xl text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{editingAddressId ? "Update & Continue to Payment" : "Continue to Payment"}</span>
                    <ArrowRight size={15} />
                  </button>

                  <p className="text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                    <Shield size={11} className="text-accent" /> Next: Choose payment &amp; apply offers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: PAYMENT, OFFERS & FINAL ORDER REVIEW
      ───────────────────────────────────────────────────────────── */}
      {currentStep === "payment" && (
        <form onSubmit={handleFinalPaySubmit}>
          <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_430px] 2xl:grid-cols-[1fr_460px] gap-6 lg:gap-8 2xl:gap-10 items-start">
            {/* Left: Address Summary, Offers & Payment Gateway */}
            <div className="space-y-6">
              {/* Payment Error / Cancellation Recovery Box */}
              {paymentError && (
                <div className="rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 p-5 shadow-xs animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm">Payment Not Completed</h3>
                        <button
                          type="button"
                          onClick={() => setPaymentError(null)}
                          className="text-muted-foreground hover:text-foreground text-xs underline cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {paymentError}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-xl font-semibold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Retry Secure Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep("shipping")}
                          className="inline-flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-foreground px-3.5 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Check Delivery Address</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. Address Recap Card with Edit Button */}
              <section className="glass-card rounded-3xl p-5 sm:p-6 border border-border/60 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Delivering To</h2>
                      <p className="text-[11px] text-muted-foreground">Standard Express Insured Delivery</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(false);
                      setEditingAddressId(null);
                      setCurrentStep("shipping");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-accent hover:bg-accent/10 border border-accent/30 transition-all cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>Change</span>
                  </button>
                </div>

                <div className="mt-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{form.contact_name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-medium text-foreground">{form.phone}</span>
                  </div>
                  <p className="text-muted-foreground">{form.email}</p>
                  <p className="text-foreground/90 leading-relaxed font-medium pt-1">
                    {form.flat_building}, {form.street_landmark}, {form.area_locality}
                  </p>
                  <p className="text-foreground/90 font-medium">
                    {form.city}, {form.state} - <span className="font-bold">{form.pincode}</span>
                  </p>
                  {form.notes && (
                    <p className="text-[11px] text-muted-foreground bg-secondary/30 rounded-xl p-2.5 mt-2 italic">
                      Note: &quot;{form.notes}&quot;
                    </p>
                  )}
                </div>
              </section>

              {/* 2. Payment Gateway Card */}
              <section className="glass-card rounded-3xl p-5 sm:p-6 border border-border/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <CreditCard size={16} className="text-accent" />
                    Payment Method
                  </h2>
                  <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                    256-Bit SSL Encrypted
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border-2 border-accent bg-accent/10 shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-xs">
                        <Lock size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                          Online Payment via Razorpay
                        </span>
                        <span className="text-[11px] text-muted-foreground">UPI, Cards, NetBanking, Wallets</span>
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-xs">
                      <Check size={12} className="stroke-[3]" />
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 leading-relaxed pt-1">
                    Pay securely using <strong>Google Pay, PhonePe, Paytm, BHIM UPI</strong>, <strong>Credit &amp; Debit Cards (Visa, Mastercard, RuPay)</strong>, or <strong>NetBanking</strong>.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-accent/20">
                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      ✓ Instant Confirmation
                    </span>
                    <span className="text-[10px] font-semibold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                      ✓ Free Transit Insurance
                    </span>
                    <span className="text-[10px] font-semibold text-foreground/70 bg-secondary/80 px-2 py-0.5 rounded-full">
                      ✓ Zero Surcharge
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Discount Offers & Coupon Code Section */}
              <section className="glass-card rounded-3xl p-5 sm:p-6 border border-border/60 shadow-xs space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Tag size={16} className="text-accent" />
                  Coupons &amp; Offers
                </h2>
                <DiscountOffersSection className="!bg-transparent !border-border/60 !p-0" />
              </section>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("shipping")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Address Details</span>
                </button>
              </div>
            </div>

            {/* Right: Full Detailed Order Summary & Pay Action */}
            <div className="lg:sticky lg:top-20">
              <div className="glass-card rounded-3xl border border-border/60 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingBag size={16} className="text-accent" />
                    Order Summary ({totalItemCount} item{totalItemCount !== 1 ? "s" : ""})
                  </h2>
                  <button
                    type="button"
                    onClick={openDrawer}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    Edit Bag
                  </button>
                </div>

                {/* Items List — split paid vs free BOGO rows */}
                <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                  {splitItems.map((i) => (
                    <div key={i.productId} className={`flex items-center gap-3.5 px-5 py-3.5 ${i.isFree ? "bg-accent/5" : ""}`}>
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-secondary/50 border border-border/40 relative">
                        {i.image && (
                          <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                        )}
                        {i.isFree && (
                          <span className="absolute top-1 left-1 bg-[#E06A8B] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs leading-none tracking-wider z-10">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 text-foreground">{i.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.isFree ? `🎁 Free Item (Qty: ${i.qty})` : `Qty: ${i.qty}`}
                        </p>
                        {i.isFree && (
                          <span className="inline-block text-[9px] font-bold uppercase bg-accent/15 text-accent px-2 py-0.5 rounded-full mt-0.5">
                            BOGO Offer Applied
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold shrink-0 text-right">
                        {i.isFree ? (
                          <span className="text-accent font-bold">FREE</span>
                        ) : (
                          <div>
                            <div>{formatPrice(i.totalPrice)}</div>
                            {i.qty > 1 && <div className="text-[10px] text-muted-foreground font-normal">{formatPrice(i.price)} × {i.qty}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="px-5 py-4 space-y-2.5 border-t border-border/60 bg-secondary/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(rawSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {rawSubtotal >= 999 ? "FREE" : "Calculated at delivery"}
                    </span>
                  </div>

                  {offerResult.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={13} /> Offer ({appliedOffer?.code})
                      </span>
                      <span>-{formatPrice(offerResult.discountAmount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-border/60 my-1" />

                  <div className="flex justify-between font-serif text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-accent">{formatPrice(finalTotal)}</span>
                  </div>

                  {rawSubtotal >= 999 && (
                    <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1 pt-0.5">
                      <CheckCircle2 size={12} /> You have unlocked free insured shipping!
                    </p>
                  )}
                </div>

                {/* Final Pay Online Button */}
                <div className="p-5 border-t border-border/60">
                  <button
                    id="checkout-pay-btn"
                    disabled={submitting || hasUnavailable || items.length === 0}
                    type="submit"
                    className="w-full bg-accent text-accent-foreground py-4 rounded-2xl text-xs uppercase tracking-widest font-semibold shadow-md disabled:opacity-60 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Opening Razorpay Gateway…</span>
                      </>
                    ) : hasUnavailable ? (
                      "Unavailable item in bag"
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Pay Online · {formatPrice(finalTotal)}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                    <Shield size={11} className="text-accent" /> 100% Secure &amp; Encrypted Online Checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
