import { useState } from "react";
import { useAddressStore, SavedAddress, AddressLabel, formatFullAddress } from "@/lib/addressStore";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home,
  Briefcase,
  MoreHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";

interface AddressManagerProps {
  mode?: "manage" | "checkout-select";
  onSelectAddress?: (address: SavedAddress) => void;
  className?: string;
}

export function AddressManager({
  mode = "manage",
  onSelectAddress,
  className = "",
}: AddressManagerProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const addresses = useAddressStore((s) => s.addresses);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);
  const setDefaultAddress = useAddressStore((s) => s.setDefaultAddress);
  const selectAddress = useAddressStore((s) => s.selectAddress);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const userAddresses = user
    ? addresses.filter((a) => a.userId === user.id || !a.userId)
    : addresses;

  const [formData, setFormData] = useState({
    label: "Home" as AddressLabel,
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
    is_default: userAddresses.length === 0,
  });

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      label: "Home",
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
      is_default: userAddresses.length === 0,
    });
    setIsEditing(true);
  }

  function openEditModal(addr: SavedAddress) {
    setEditingId(addr.id);
    setFormData({
      label: addr.label || "Home",
      contact_name: addr.contact_name,
      phone: addr.phone,
      email: addr.email,
      flat_building: addr.flat_building,
      street_landmark: addr.street_landmark,
      area_locality: addr.area_locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      notes: addr.notes || "",
      is_default: addr.is_default,
    });
    setIsEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.contact_name.trim()) return toast.error("Please enter recipient name");
    if (!formData.phone.trim() || formData.phone.length < 7) return toast.error("Please enter valid phone number");
    if (!formData.flat_building.trim()) return toast.error("Please enter flat/building info");
    if (!formData.street_landmark.trim()) return toast.error("Please enter street, road or landmark");
    if (!formData.area_locality.trim()) return toast.error("Please enter area or locality");
    if (!formData.city.trim()) return toast.error("Please enter city");
    if (!formData.state.trim()) return toast.error("Please enter state");
    if (!formData.pincode.trim()) return toast.error("Please enter valid 6-digit pincode");

    if (editingId) {
      await updateAddress(editingId, {
        ...formData,
        userId: user?.id ?? null,
      });
      toast.success("Address updated and saved to database!");
    } else {
      const saved = await addAddress({
        ...formData,
        userId: user?.id ?? null,
      });
      if (onSelectAddress) {
        onSelectAddress(saved);
      }
      toast.success("New address saved to database and address book!");
    }

    setIsEditing(false);
    setEditingId(null);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete the address for "${name}"?`)) {
      await deleteAddress(id);
      toast.success("Address removed from database and address book");
    }
  }

  const inputCls =
    "w-full bg-secondary/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent border border-border/40 focus:border-accent transition-all text-foreground placeholder:text-muted-foreground/60";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with "Add New Address" button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <MapPin size={16} className="text-accent" />
          {mode === "checkout-select" ? "Saved Delivery Addresses" : "Your Saved Addresses"}
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground shadow-xs hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Address Form (Modal / Inline Editor) */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="glass-card rounded-3xl p-5 sm:p-6 border-2 border-accent/40 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h4 className="text-sm font-bold text-foreground">
              {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Address Label Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1.5 block">
              Address Type
            </label>
            <div className="flex gap-2">
              {(["Home", "Work", "Other"] as AddressLabel[]).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: lbl })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    formData.label === lbl
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lbl === "Home" && <Home size={12} />}
                  {lbl === "Work" && <Briefcase size={12} />}
                  {lbl === "Other" && <MoreHorizontal size={12} />}
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                Full Name *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                Phone Number *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
              Email Address *
            </label>
            <input
              type="email"
              className={inputCls}
              placeholder=""
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Structured Fields */}
          <div>
            <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
              Flat, House No., Building / Apartment Name *
            </label>
            <input
              className={inputCls}
              placeholder=""
              value={formData.flat_building}
              onChange={(e) => setFormData({ ...formData, flat_building: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                Street, Road or Landmark *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.street_landmark}
                onChange={(e) => setFormData({ ...formData, street_landmark: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                Area, Sector or Locality *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.area_locality}
                onChange={(e) => setFormData({ ...formData, area_locality: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                City / Town *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                State *
              </label>
              <input
                className={inputCls}
                placeholder=""
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-1 block">
                Pincode (6 Digits) *
              </label>
              <input
                className={inputCls}
                placeholder=""
                maxLength={10}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
              />
              <span>Set as my default delivery address</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              {editingId ? "Update Address" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-secondary hover:bg-secondary/80 text-foreground px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Addresses Grid List */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {userAddresses.length === 0 ? (
            <div className="col-span-full py-8 px-4 text-center bg-card/60 rounded-2xl border border-dashed border-border/80">
              <MapPin size={28} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No saved addresses yet.</p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-3 text-xs text-accent font-semibold underline hover:opacity-80 cursor-pointer"
              >
                + Add your first delivery address
              </button>
            </div>
          ) : (
            userAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    selectAddress(addr.id);
                    if (onSelectAddress) onSelectAddress(addr);
                  }}
                  className={`glass-card rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-2 border-accent bg-accent/10 shadow-xs ring-1 ring-accent/40"
                      : "border-border/60 hover:border-border hover:bg-card/80"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Badges & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground px-2.5 py-0.5 rounded-full">
                          {addr.label || "Home"}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} /> Default
                          </span>
                        )}
                      </div>

                      {/* Edit / Delete Icons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openEditModal(addr)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                          title="Edit address"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr.id, addr.contact_name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{addr.contact_name}</span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs font-medium text-foreground">{addr.phone}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{addr.email}</p>
                    </div>

                    {/* Address Text */}
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      {formatFullAddress(addr)}
                    </p>
                  </div>

                  {/* Bottom Select / Default Button */}
                  <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    {isSelected ? (
                      <span className="text-accent font-semibold flex items-center gap-1 text-[11px]">
                        <Check size={13} className="stroke-[3]" /> Selected Address
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Click to deliver here</span>
                    )}

                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultAddress(addr.id);
                          toast.success("Set as default delivery address");
                        }}
                        className="text-[10px] text-muted-foreground hover:text-accent font-medium underline cursor-pointer"
                      >
                        Make Default
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
