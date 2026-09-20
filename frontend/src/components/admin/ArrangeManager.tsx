import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  RotateCcw, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  DollarSign, 
  Sparkles,
  Layers,
  Save,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ArrangeItem = {
  id: string;
  name: string;
  sort_order: number;
  image?: string | null;
  price?: number | null;
  created_at?: string;
  categoryName?: string | null;
  subtitle?: string | null;
  [key: string]: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tableName: "products" | "categories" | "site_videos" | "site_banners";
  items: ArrangeItem[];
  onSaved: () => void;
};

export function ArrangeManager({ isOpen, onClose, title, tableName, items, onSaved }: Props) {
  const [list, setList] = useState<ArrangeItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize and sort items by current sort_order
  useEffect(() => {
    if (isOpen) {
      const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setList(sorted);
      setSelectedIds([]);
      setSearchQuery("");
    }
  }, [isOpen, items]);

  // Quick Preset Sorters
  function applyPreset(type: "az" | "za" | "newest" | "oldest" | "price_high" | "price_low" | "reset") {
    const updated = [...list];
    switch (type) {
      case "az":
        updated.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        updated.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        updated.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "oldest":
        updated.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "price_high":
        updated.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "price_low":
        updated.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "reset":
        updated.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        break;
    }
    setList(updated);
    toast.success(`Preset applied: ${type.replace("_", " ")}`);
  }

  // Interactive Click-to-Assign Sequence Number
  function handleItemClick(id: string) {
    if (selectedIds.includes(id)) {
      // Deselect
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      // Assign next sequence number
      setSelectedIds([...selectedIds, id]);
    }
  }

  // Apply selected click sequence to top of the list
  function applySelectedSequence() {
    if (selectedIds.length === 0) return;
    const selectedItems = selectedIds.map((id) => list.find((it) => it.id === id)!).filter(Boolean);
    const remainingItems = list.filter((it) => !selectedIds.includes(it.id));
    setList([...selectedItems, ...remainingItems]);
    setSelectedIds([]);
    toast.success("Applied custom click sequence");
  }

  // Move item up/down
  function moveItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= list.length) return;
    const updated = [...list];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setList(updated);
  }

  // Move to Top / Bottom
  function moveToExtreme(fromIndex: number, position: "top" | "bottom") {
    const updated = [...list];
    const [moved] = updated.splice(fromIndex, 1);
    if (position === "top") {
      updated.unshift(moved);
    } else {
      updated.push(moved);
    }
    setList(updated);
  }

  // Direct Number Input Change
  function handleDirectSequenceChange(fromIndex: number, newSeqNum: number) {
    if (isNaN(newSeqNum) || newSeqNum < 1 || newSeqNum > list.length) return;
    const targetIndex = newSeqNum - 1;
    moveItem(fromIndex, targetIndex);
  }

  // Save changes to database
  async function handleSave() {
    setSaving(true);
    try {
      // Update each item's sort_order to its new index in the list
      const updates = list.map((item, idx) => 
        supabase
          .from(tableName)
          .update({ sort_order: idx })
          .eq("id", item.id)
      );

      await Promise.all(updates);
      toast.success(`Updated sequence for ${list.length} items!`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save sequence");
    } finally {
      setSaving(false);
    }
  }

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((it) => 
      it.name.toLowerCase().includes(q) || 
      it.subtitle?.toLowerCase().includes(q) ||
      it.categoryName?.toLowerCase().includes(q)
    );
  }, [list, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <ArrowUpDown size={16} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold">{title}</h2>
              <p className="text-[11px] text-muted-foreground">
                Drag, click numbers, or use presets to arrange the exact display sequence.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Sorter Presets */}
        <div className="px-6 py-3 bg-secondary/15 border-b border-border/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground mr-1 uppercase tracking-wider">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset("az")}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-all"
              >
                <SortAsc size={12} /> Name A → Z
              </button>
              <button
                type="button"
                onClick={() => applyPreset("za")}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-all"
              >
                <SortDesc size={12} /> Name Z → A
              </button>
              <button
                type="button"
                onClick={() => applyPreset("newest")}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-all"
              >
                <Calendar size={12} /> Recent First
              </button>
              {tableName === "products" && (
                <>
                  <button
                    type="button"
                    onClick={() => applyPreset("price_high")}
                    className="px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-all"
                  >
                    <DollarSign size={12} /> Price: High → Low
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("price_low")}
                    className="px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-all"
                  >
                    <DollarSign size={12} /> Price: Low → High
                  </button>
                </>
              )}
            </div>

            {/* Click-to-Rank Bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-accent/15 text-accent px-3 py-1 rounded-full text-xs font-medium">
                <span>{selectedIds.length} items ranked in click order</span>
                <button
                  type="button"
                  onClick={applySelectedSequence}
                  className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Place at Top
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reorderable Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredList.map((item, index) => {
            const actualIndex = list.findIndex((x) => x.id === item.id);
            const clickRank = selectedIds.indexOf(item.id);
            const isClickSelected = clickRank !== -1;

            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border bg-card/60 transition-all ${
                  isClickSelected
                    ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                    : "border-border/60 hover:border-border hover:bg-secondary/30"
                }`}
              >
                {/* Left: Sequence Badge + Item Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Sequence Position Badge (Clickable for custom ordering) */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                      isClickSelected
                        ? "bg-accent text-accent-foreground scale-110 shadow"
                        : "bg-secondary text-foreground hover:bg-accent/20 hover:text-accent"
                    }`}
                    title="Click to select custom ranking"
                  >
                    {isClickSelected ? `#${clickRank + 1}` : `#${actualIndex + 1}`}
                  </button>

                  {/* Thumbnail */}
                  {item.image && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border/40">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {item.categoryName && <span>{item.categoryName}</span>}
                      {item.price != null && (
                        <span className="font-mono text-accent font-medium">₹{Number(item.price).toLocaleString("en-IN")}</span>
                      )}
                      {item.subtitle && <span>{item.subtitle}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Manual Position Controls & Direct Number Input */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Quick Direct Jump Input */}
                  <div className="flex items-center gap-1 mr-2">
                    <span className="text-[10px] text-muted-foreground">Pos:</span>
                    <input
                      type="number"
                      min={1}
                      max={list.length}
                      value={actualIndex + 1}
                      onChange={(e) => handleDirectSequenceChange(actualIndex, parseInt(e.target.value))}
                      className="w-11 bg-secondary/80 text-center rounded-lg py-1 text-xs font-mono font-semibold outline-none focus:ring-1 focus:ring-accent border border-border/40"
                    />
                  </div>

                  {/* Chevron Steppers */}
                  <button
                    type="button"
                    onClick={() => moveItem(actualIndex, actualIndex - 1)}
                    disabled={actualIndex === 0}
                    className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary disabled:opacity-30 text-muted-foreground transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(actualIndex, actualIndex + 1)}
                    disabled={actualIndex === list.length - 1}
                    className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary disabled:opacity-30 text-muted-foreground transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToExtreme(actualIndex, "top")}
                    disabled={actualIndex === 0}
                    className="px-2 py-1 rounded-lg bg-secondary/60 hover:bg-secondary disabled:opacity-30 text-[10px] text-muted-foreground font-semibold transition-colors"
                    title="Move to Very Top"
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToExtreme(actualIndex, "bottom")}
                    disabled={actualIndex === list.length - 1}
                    className="px-2 py-1 rounded-lg bg-secondary/60 hover:bg-secondary disabled:opacity-30 text-[10px] text-muted-foreground font-semibold transition-colors"
                    title="Move to Very Bottom"
                  >
                    End
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-secondary/30">
          <span className="text-xs text-muted-foreground font-mono">
            Total {list.length} items to be saved
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest border border-border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Sequence
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
