import { motion } from "motion/react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 h-[72px] flex items-center justify-between ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold font-serif transition-colors duration-500 ${isScrolled ? "text-on-surface" : "text-white"}`}>
          [[SHOP_NAME]] <i className="text-primary not-italic"></i>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 font-display font-medium text-xs tracking-widest uppercase">
        {["Our Story", "Curation", "The Studio", "Journal", "Inquiry"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(" ", "-")}`}
            className={`transition-colors duration-500 hover:text-primary ${
              isScrolled ? "text-stone-500" : "text-white/80"
            }`}
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-display font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
          Reserve Now
        </button>
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className={isScrolled ? "text-on-surface" : "text-white"} /> : <Menu className={isScrolled ? "text-on-surface" : "text-white"} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[72px] left-0 w-full bg-background p-6 flex flex-col gap-6 md:hidden shadow-xl"
        >
          {["Our Story", "Curation", "The Studio", "Journal", "Inquiry"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-on-surface font-display font-medium text-sm tracking-widest uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button className="bg-primary text-white w-full py-4 rounded-lg font-display font-semibold text-sm">
            Reserve Now
          </button>
        </motion.div>
      )}
    </nav>
  );
}
