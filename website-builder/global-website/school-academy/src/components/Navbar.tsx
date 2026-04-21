import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 rounded-b-[16px] border-b border-primary-fixed shadow-[0_20px_40px_rgba(16,26,53,0.06)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Star className="w-8 h-8 text-tertiary-fixed-dim fill-tertiary-fixed-dim" />
          <div className="text-xl font-bold font-headline leading-tight">
            <span className="text-primary">[[SHOP_NAME]]</span>
            <span className="text-tertiary-fixed-dim"></span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-label text-sm uppercase tracking-wider">
          <a className="text-primary border-b-2 border-primary font-semibold transition-colors duration-300" href="#">Home</a>
          <a className="text-slate-600 font-medium hover:text-primary transition-colors duration-300" href="#">Academics</a>
          <a className="text-slate-600 font-medium hover:text-primary transition-colors duration-300" href="#">Admissions</a>
          <a className="text-slate-600 font-medium hover:text-primary transition-colors duration-300" href="#">Faculty</a>
        </div>

        <motion.button 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-6 py-2.5 rounded-full font-bold hover:bg-tertiary transition-all duration-300 shadow-md"
        >
          Enroll Now
        </motion.button>
      </div>
    </nav>
  );
}
