import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";

export const Nav = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-surface">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-2">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative overflow-hidden rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            <Wordmark size="md" />
          </div>
        </a>
        <div className="hidden md:flex gap-10 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {["Collections", "The KP Chapter", "Bespoke", "Inquire"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-foreground transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-accent after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              {item}
            </a>
          ))}
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden px-6 pb-6 flex flex-col gap-4 text-sm uppercase tracking-[0.15em] text-muted-foreground"
        >
          {["Collections", "The KP Chapter", "Bespoke", "Inquire"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-foreground transition-colors duration-300" onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
