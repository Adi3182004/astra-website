import { Link } from "react-router-dom";
import { Heart, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist, useCart } from "@/lib/store";
import { formatPrice } from "@/lib/settings";
import { stockLabel } from "@/lib/queries";
import { toast } from "sonner";
import { styleToCss } from "@/lib/textStyles";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image: string;
  hoverImage?: string | null;
  stock?: number;
  out_of_stock?: boolean;
  show_stock?: boolean;
  stock_prefix?: string | null;
  stock_suffix?: string | null;
  categoryName?: string | null;
  description?: string | null;
  tags?: string[];
  text_style?: Record<string, any>;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const hasWish = useWishlist((s) => s.ids.includes(p.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const cartItems = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);

  const cartItem = cartItems.find((i) => i.productId === p.id);
  const qtyInCart = cartItem?.qty ?? 0;
  const availableStock = Number(p.stock ?? 0);
  const soldOut = !!p.out_of_stock || availableStock <= 0;

  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : 0;
  const label = soldOut
    ? null
    : stockLabel({
        stock: availableStock,
        out_of_stock: p.out_of_stock,
        show_stock: p.show_stock,
        stock_prefix: p.stock_prefix,
        stock_suffix: p.stock_suffix,
      });
  const lowStock = availableStock > 0 && availableStock <= 5;
  const ts = p.text_style ?? {};

  const handleAddOne = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (soldOut || availableStock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (qtyInCart >= availableStock) {
      toast.error(`Only ${availableStock} item${availableStock > 1 ? "s" : ""} available in stock`);
      return;
    }
    add({ productId: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug, stock: availableStock }, 1);
    toast.success(`Added to bag`);
  };

  const handleIncrement = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (qtyInCart >= availableStock) {
      toast.error(`Only ${availableStock} item${availableStock > 1 ? "s" : ""} available in stock`);
      return;
    }
    setQty(p.id, qtyInCart + 1);
  };

  const handleDecrement = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (qtyInCart <= 1) {
      remove(p.id);
      toast.info("Removed from bag");
    } else {
      setQty(p.id, qtyInCart - 1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
      className="group relative rounded-2xl overflow-hidden glass-card luxury-shadow flex flex-col h-full"
    >
      <Link to={`/product/${p.slug}`} className="relative block overflow-hidden">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              soldOut
                ? "blur-[3px] scale-105 saturate-50"
                : p.hoverImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            }`}
          />
          {p.hoverImage && !soldOut && (
            <img
              src={p.hoverImage}
              alt={`${p.name} alternate view`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
            />
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center oos-overlay backdrop-blur-[3px]">
              <span className="oos-badge -rotate-[18deg] font-serif tracking-[0.28em] text-sm md:text-base uppercase px-5 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-accent text-accent-foreground text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md shadow-xs">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(p.id);
          }}
          className="absolute top-2.5 right-2.5 bg-background/80 hover:bg-background backdrop-blur rounded-full p-2 transition-colors shadow-xs"
          aria-label="Wishlist"
        >
          <Heart size={14} className={hasWish ? "fill-accent text-accent" : "text-foreground"} />
        </button>
      </Link>
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/product/${p.slug}`}
            style={styleToCss(ts.name)}
            className="font-serif text-[15px] sm:text-lg font-semibold text-foreground leading-snug line-clamp-1 min-h-[1.4em] hover:text-accent transition-colors block"
          >
            {p.name}
          </Link>
          <div className="flex items-center justify-between gap-1 mt-1 sm:mt-1.5 min-h-[22px]">
            <div className="flex items-baseline gap-1.5 flex-shrink-0">
              <span
                style={styleToCss(ts.price)}
                className="text-[15px] sm:text-lg font-semibold text-foreground tracking-tight"
              >
                {formatPrice(p.price)}
              </span>
              {p.compare_at_price && p.compare_at_price > p.price && (
                <span className="text-xs text-muted-foreground/75 line-through font-normal">
                  {formatPrice(p.compare_at_price)}
                </span>
              )}
            </div>
            {label && !soldOut && (
              <span
                style={styleToCss(ts.stock)}
                className={`text-[10px] sm:text-[10.5px] font-medium whitespace-nowrap text-right ml-auto truncate max-w-[105px] sm:max-w-[130px] ${
                  lowStock
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-muted-foreground"
                }`}
                title={label}
              >
                {label}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2.5 sm:pt-3">
          {soldOut ? (
            <button
              disabled
              className="h-8 sm:h-9 w-full text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold bg-muted text-muted-foreground rounded-full opacity-60 cursor-not-allowed flex items-center justify-center"
            >
              Out of stock
            </button>
          ) : qtyInCart >= 1 ? (
            <div className="h-8 sm:h-9 w-full flex items-center justify-between bg-foreground text-background rounded-full p-0.5 shadow-sm">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-background/15 hover:bg-background/30 text-background transition-colors active:scale-90 cursor-pointer"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-background select-none px-1">
                <span>{qtyInCart}</span>
                <span className="text-[9px] uppercase tracking-wider font-sans opacity-75 font-normal">in bag</span>
              </div>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-background/15 hover:bg-background/30 text-background transition-colors active:scale-90 cursor-pointer"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddOne}
              className="h-8 sm:h-9 w-full text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              Add to bag
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
