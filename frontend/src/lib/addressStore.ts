import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/useProfile";

export type AddressLabel = "Home" | "Work" | "Other";

export type SavedAddress = {
  id: string;
  userId?: string | null;
  label: AddressLabel;
  contact_name: string;
  phone: string;
  email: string;
  flat_building: string;
  street_landmark: string;
  area_locality: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
};

type AddressState = {
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  addAddress: (addr: Omit<SavedAddress, "id" | "created_at">) => Promise<SavedAddress>;
  updateAddress: (id: string, addr: Partial<SavedAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => void;
  syncFromProfile: (profile: Profile | null, userEmail?: string | null) => void;
};

export function normalizeAddressKey(a: Partial<SavedAddress>): string {
  return [
    (a.contact_name || "").trim().toLowerCase(),
    (a.phone || "").trim().replace(/\D/g, ""),
    (a.flat_building || "").trim().toLowerCase(),
    (a.street_landmark || "").trim().toLowerCase(),
    (a.area_locality || "").trim().toLowerCase(),
    (a.city || "").trim().toLowerCase(),
    (a.pincode || "").trim().replace(/\D/g, ""),
  ]
    .filter(Boolean)
    .join("|");
}

export function formatFullAddress(addr: Partial<SavedAddress>): string {
  return [
    addr.flat_building,
    addr.street_landmark,
    addr.area_locality,
    addr.city,
    `${addr.state || ""}${addr.pincode ? ` - ${addr.pincode}` : ""}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      addAddress: async (newAddr) => {
        const newKey = normalizeAddressKey(newAddr);
        const currentList = get().addresses;

        // 1. Check if an address with the same physical key already exists
        const existing = currentList.find((a) => normalizeAddressKey(a) === newKey);
        if (existing) {
          await get().updateAddress(existing.id, newAddr);
          get().selectAddress(existing.id);
          return existing;
        }

        // 2. Otherwise create a new unique address
        const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const isFirst = currentList.filter((a) => a.userId === newAddr.userId || !a.userId).length === 0;
        const addressItem: SavedAddress = {
          ...newAddr,
          id,
          is_default: isFirst || !!newAddr.is_default,
          created_at: new Date().toISOString(),
        };

        const seen = new Set<string>();
        const cleanExisting = currentList.filter((a) => {
          const k = normalizeAddressKey(a);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        const updated = cleanExisting.map((a) =>
          addressItem.is_default && (a.userId === newAddr.userId || !a.userId)
            ? { ...a, is_default: false }
            : a
        );

        const newAddressList = [addressItem, ...updated];

        set({
          addresses: newAddressList,
          selectedAddressId: id,
        });

        // Immediately sync to Supabase profile
        await syncUserAddressesToSupabase(newAddr.userId, newAddressList);

        return addressItem;
      },

      updateAddress: async (id, updatedFields) => {
        const currentList = get().addresses;
        const target = currentList.find((a) => a.id === id);
        const targetUserId = updatedFields.userId || target?.userId;

        const updated = currentList.map((a) => {
          if (a.id === id) {
            return { ...a, ...updatedFields };
          }
          if (updatedFields.is_default && (a.userId === targetUserId || !a.userId)) {
            return { ...a, is_default: false };
          }
          return a;
        });

        set({ addresses: updated });

        // Immediately sync to Supabase profile
        await syncUserAddressesToSupabase(targetUserId, updated);
      },

      deleteAddress: async (id) => {
        const currentList = get().addresses;
        const deletedAddr = currentList.find((a) => a.id === id);
        const targetUserId = deletedAddr?.userId;

        const filtered = currentList.filter((a) => a.id !== id);
        
        const userRemaining = filtered.filter((a) => (targetUserId ? a.userId === targetUserId : !a.userId));
        if (userRemaining.length > 0 && !userRemaining.some((a) => a.is_default)) {
          userRemaining[0].is_default = true;
        }

        let newSelected = get().selectedAddressId === id ? null : get().selectedAddressId;
        if (!newSelected && userRemaining.length > 0) {
          newSelected = (userRemaining.find((a) => a.is_default) || userRemaining[0]).id;
        }

        set({
          addresses: filtered,
          selectedAddressId: newSelected,
        });

        // Immediately sync deletion to Supabase profile
        await syncUserAddressesToSupabase(targetUserId, filtered);
      },

      setDefaultAddress: async (id) => {
        const currentList = get().addresses;
        const target = currentList.find((a) => a.id === id);
        const targetUserId = target?.userId;

        const updated = currentList.map((a) => {
          if (a.userId === targetUserId || !a.userId) {
            return { ...a, is_default: a.id === id };
          }
          return a;
        });

        set({
          addresses: updated,
          selectedAddressId: id,
        });

        await syncUserAddressesToSupabase(targetUserId, updated);
      },

      selectAddress: (id) => {
        set({ selectedAddressId: id });
      },

      syncFromProfile: (profile, userEmail) => {
        if (!profile || !profile.id) return;
        const userId = profile.id;
        const currentOtherAddresses = get().addresses.filter((a) => a.userId && a.userId !== userId);

        let parsedAddresses: SavedAddress[] = [];

        if (profile.address && profile.address.trim()) {
          const raw = profile.address.trim();
          if (raw.startsWith("{") || raw.startsWith("[")) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsedAddresses = parsed
                  .filter((a: any) => a && (a.flat_building || a.street_landmark || a.city || a.contact_name))
                  .map((a: any, idx: number) => ({
                    id: a.id || `addr_${userId}_${idx}`,
                    userId,
                    label: (a.label as AddressLabel) || "Home",
                    contact_name: a.contact_name || profile.full_name || "",
                    phone: a.phone || profile.phone || "",
                    email: a.email || profile.email || userEmail || "",
                    flat_building: a.flat_building || "",
                    street_landmark: a.street_landmark || "",
                    area_locality: a.area_locality || "",
                    city: a.city || profile.city || "",
                    state: a.state || profile.state || "",
                    pincode: a.pincode || profile.pincode || "",
                    notes: a.notes || "",
                    is_default: idx === 0 || !!a.is_default,
                    created_at: a.created_at || new Date().toISOString(),
                  }));
              } else if (parsed && typeof parsed === "object") {
                if (Array.isArray(parsed.saved_addresses)) {
                  parsedAddresses = parsed.saved_addresses
                    .filter((a: any) => a && (a.flat_building || a.street_landmark || a.city || a.contact_name))
                    .map((a: any, idx: number) => ({
                      id: a.id || `addr_${userId}_${idx}`,
                      userId,
                      label: (a.label as AddressLabel) || "Home",
                      contact_name: a.contact_name || profile.full_name || "",
                      phone: a.phone || profile.phone || "",
                      email: a.email || profile.email || userEmail || "",
                      flat_building: a.flat_building || "",
                      street_landmark: a.street_landmark || "",
                      area_locality: a.area_locality || "",
                      city: a.city || profile.city || "",
                      state: a.state || profile.state || "",
                      pincode: a.pincode || profile.pincode || "",
                      notes: a.notes || "",
                      is_default: idx === 0 || !!a.is_default,
                      created_at: a.created_at || new Date().toISOString(),
                    }));
                } else if (parsed.flat_building || parsed.street_landmark || parsed.city) {
                  parsedAddresses = [
                    {
                      id: `addr_profile_${userId}`,
                      userId,
                      label: (parsed.label as AddressLabel) || "Home",
                      contact_name: profile.full_name || "",
                      phone: profile.phone || "",
                      email: profile.email || userEmail || "",
                      flat_building: parsed.flat_building || "",
                      street_landmark: parsed.street_landmark || "",
                      area_locality: parsed.area_locality || "",
                      city: profile.city || "",
                      state: profile.state || "",
                      pincode: profile.pincode || "",
                      notes: parsed.notes || "",
                      is_default: true,
                      created_at: new Date().toISOString(),
                    },
                  ];
                }
              }
            } catch (err) {
              console.warn("Could not parse JSON profile address:", err);
            }
          } else if (profile.address.trim().length > 3) {
            const parts = profile.address
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            if (parts.length > 0) {
              parsedAddresses = [
                {
                  id: `addr_profile_${userId}`,
                  userId,
                  label: "Home",
                  contact_name: profile.full_name || "",
                  phone: profile.phone || "",
                  email: profile.email || userEmail || "",
                  flat_building: parts[0] || "",
                  street_landmark: parts.length > 1 ? parts[1] : "",
                  area_locality: parts.length > 2 ? parts.slice(2).join(", ") : "",
                  city: profile.city || "",
                  state: profile.state || "",
                  pincode: profile.pincode || "",
                  is_default: true,
                  created_at: new Date().toISOString(),
                },
              ];
            }
          }
        }

        // Single source of truth for user's addresses
        const finalUserAddresses = parsedAddresses;

        if (finalUserAddresses.length > 0 && !finalUserAddresses.some((a) => a.is_default)) {
          finalUserAddresses[0].is_default = true;
        }

        const combined = [...finalUserAddresses, ...currentOtherAddresses];
        const def = finalUserAddresses.find((a) => a.is_default) || finalUserAddresses[0];
        const nextSelectedId = finalUserAddresses.some((a) => a.id === get().selectedAddressId)
          ? get().selectedAddressId
          : def?.id || null;

        const currentAddresses = get().addresses;
        const isSame =
          currentAddresses.length === combined.length &&
          currentAddresses.every((a, idx) => a.id === combined[idx]?.id && a.is_default === combined[idx]?.is_default) &&
          get().selectedAddressId === nextSelectedId;

        if (isSame) return;

        set({
          addresses: combined,
          selectedAddressId: nextSelectedId,
        });
      },
    }),
    {
      name: "priora_user_addresses_v2",
    }
  )
);

/**
 * Immediately synchronizes all saved addresses and the default address to the user's Supabase profile.
 */
async function syncUserAddressesToSupabase(userId?: string | null, allAddresses?: SavedAddress[]) {
  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data } = await supabase.auth.getUser();
      resolvedUserId = data.user?.id;
    }
    if (!resolvedUserId) return;

    const userAddresses = (allAddresses || useAddressStore.getState().addresses).filter(
      (a) => a.userId === resolvedUserId || !a.userId
    );

    if (userAddresses.length === 0) {
      await supabase.from("profiles").update({
        address: null,
        city: null,
        state: null,
        pincode: null,
      }).eq("id", resolvedUserId);
      return;
    }

    const defaultAddr = userAddresses.find((a) => a.is_default) || userAddresses[0];

    // Encode full structured addresses JSON payload
    const structuredPayload = JSON.stringify({
      flat_building: defaultAddr.flat_building,
      street_landmark: defaultAddr.street_landmark,
      area_locality: defaultAddr.area_locality,
      label: defaultAddr.label,
      notes: defaultAddr.notes || "",
      saved_addresses: userAddresses,
    });

    await supabase.from("profiles").upsert({
      id: resolvedUserId,
      full_name: defaultAddr.contact_name,
      phone: defaultAddr.phone,
      email: defaultAddr.email,
      address: structuredPayload,
      city: defaultAddr.city,
      state: defaultAddr.state,
      pincode: defaultAddr.pincode,
    });
  } catch (err) {
    console.warn("Could not sync addresses to Supabase profile:", err);
  }
}
