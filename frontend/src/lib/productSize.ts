export type ProductSizeInfo = {
  mode: "free" | "custom";
  free_type?: string;
  value?: string;
  unit?: string;
  custom_unit?: string;
  label: string;
};

/**
 * Extracts a human-readable size label for a product.
 * Returns a clean fallback of "Free Size (Adjustable)" if no size was configured.
 */
export function getProductSizeLabel(product: any): string {
  if (!product) return "Free Size (Adjustable)";
  
  const textStyle = (product as any)?.text_style;
  const sizeInfo = textStyle?.size_info;

  if (sizeInfo) {
    if (typeof sizeInfo === "object" && sizeInfo.label && typeof sizeInfo.label === "string" && sizeInfo.label.trim()) {
      return sizeInfo.label.trim();
    }
    if (typeof sizeInfo === "string" && sizeInfo.trim()) {
      return sizeInfo.trim();
    }
  }

  return "Free Size (Adjustable)";
}

/**
 * Common presets for Free Size jewellery items.
 */
export const FREE_SIZE_PRESETS = [
  "Free Size (Adjustable)",
  "Free Size (Standard Fit)",
  "Adjustable with 2\" Extender Chain",
  "Open Ring (Adjustable Fit)",
  "One Size Fits All (Cord / Slide Knot)",
  "Standard Free Size (Earrings / Studs)",
];

/**
 * Common measurement units for jewellery.
 */
export const SIZE_UNITS = [
  { value: "inch", label: "Inches (inch) — e.g. 16\", 18\", 20\" Necklaces" },
  { value: "cm", label: "Centimeters (cm) — e.g. 40cm, 45cm Chains" },
  { value: "mm", label: "Millimeters (mm) — e.g. 6mm, 8mm Studs/Pearls" },
  { value: "US Ring Size", label: "US Ring Size (e.g. 5, 6, 7, 8, 9)" },
  { value: "Indian Ring Size", label: "Indian Ring Size (e.g. 10, 12, 14, 16, 18)" },
  { value: "Indian Bangle Size", label: "Indian Bangle Size (e.g. 2.2, 2.4, 2.6, 2.8)" },
  { value: "custom", label: "Custom Unit / Degree of Measurement" },
];
