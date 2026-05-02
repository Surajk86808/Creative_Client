import { motion } from "motion/react";
import { Menu, Trees } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-4 left-1/2 w-[92%] max-w-5xl z-50 rounded-full glass-nav shadow-[0_12px_32px_rgba(29,28,23,0.06)] flex justify-between items-center px-6 md:px-8 py-3"
    >
      <div className="flex items-center gap-2">
        <Trees className="text-primary w-6 h-6" />
        <span className="text-2xl font-serif-italic text-primary">[[SHOP_NAME]]</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="text-primary font-medium border-b-2 border-primary transition-colors duration-300">Home</a>
        <a href="#services" className="text-on-surface-variant font-light hover:text-secondary transition-colors duration-300">Services</a>
        <a href="#about" className="text-on-surface-variant font-light hover:text-secondary transition-colors duration-300">About</a>
        <motion.a 
          whileHover={{ scale: 0.95 }}
          whileTap={{ scale: 0.9 }}
          href="#contact" 
          className="px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-medium tracking-wide uppercase"
        >
          Contact
        </motion.a>
      </div>

      <button className="md:hidden text-primary">
        <Menu className="w-6 h-6" />
      </button>
    </motion.nav>
  );
}
