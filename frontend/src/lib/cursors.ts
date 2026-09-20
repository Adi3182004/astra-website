/**
 * Dynamic Bow Ribbon Cursor for Deals / Offers Carousel
 * Generates the clean vector gift bow cursor with admin-configurable color & size.
 */

export function getCustomHandCursor(
  type: "grab" | "grabbing" = "grab",
  color: string = "#F77885",
  size: number = 32
): string {
  const safeColor = color || "#F77885";
  const strokeColor = "#1F040C";
  const safeSize = Math.max(20, Math.min(48, size || 32));

  // Bow Ribbon Vector SVG
  const bowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 100 100" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
    <g stroke="${strokeColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Left Ribbon Tail -->
      <path d="M44,52 C38,62 26,76 18,84 C26,81 35,82 40,86 C45,74 48,60 49,52 Z" fill="${safeColor}" />
      <!-- Right Ribbon Tail -->
      <path d="M56,52 C62,62 74,76 82,84 C74,81 65,82 60,86 C55,74 52,60 51,52 Z" fill="${safeColor}" />

      <!-- Left Bow Loop -->
      <path d="M46,45 C38,32 18,22 10,34 C4,43 14,60 32,54 C40,51 46,47 48,46 Z" fill="${safeColor}" />
      <!-- Left Inner Fold -->
      <path d="M22,34 C16,40 22,48 32,46" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" />
      <path d="M42,44 C34,42 26,45 22,48" fill="#1F040C" stroke="none" opacity="0.2" />

      <!-- Right Bow Loop -->
      <path d="M54,45 C62,32 82,22 90,34 C96,43 86,60 68,54 C60,51 54,47 52,46 Z" fill="${safeColor}" />
      <!-- Right Inner Fold -->
      <path d="M78,34 C84,40 78,48 68,46" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" />
      <path d="M58,44 C66,42 74,45 78,48" fill="#1F040C" stroke="none" opacity="0.2" />

      <!-- Center Knot -->
      <ellipse cx="50" cy="46" rx="9" ry="8" fill="${safeColor}" />
      <ellipse cx="48" cy="44" rx="4" ry="3" fill="rgba(255,255,255,0.5)" stroke="none" />
    </g>
  </svg>`;

  const encoded = encodeURIComponent(bowSvg.trim());
  const center = Math.round(safeSize / 2);

  return `url("data:image/svg+xml,${encoded}") ${center} ${center}, url("/custom-hand-cursor.svg") 16 16, grab, pointer`;
}
