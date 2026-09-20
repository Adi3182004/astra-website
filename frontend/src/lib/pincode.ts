import { create } from "zustand";
import { persist } from "zustand/middleware";

type PincodeState = {
  pincode: string | null;
  open: boolean;
  set: (p: string) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
};

export const usePincode = create<PincodeState>()(
  persist(
    (set) => ({
      pincode: null,
      open: false,
      // Saving a pincode must NOT close the dialog — the customer needs to
      // read the delivery answer that appears right below the input.
      set: (p) => set({ pincode: p }),
      clear: () => set({ pincode: null }),
      setOpen: (o) => set({ open: o }),
    }),
    { name: "priora-pincode", partialize: (s) => ({ pincode: s.pincode }) }
  )
);

/** Deterministic dummy delivery estimate derived from the pincode. */
export function deliveryEstimate(pin: string) {
  const days = 2 + (Number(pin.slice(-2)) % 4);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return {
    days,
    date: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
  };
}
