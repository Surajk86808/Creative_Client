import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <header className="relative min-h-screen pt-32 pb-16 px-6 bg-surface-container-low overflow-hidden flex flex-col items-center">
      {/* Organic decorative circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary-container opacity-40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-tertiary-fixed opacity-40 rounded-full blur-3xl"></div>

      <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-secondary-container rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-on-primary tracking-widest uppercase">Eco-Conscious Excellence</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-bold text-primary leading-tight tracking-tight mb-6"
        >
          [[SHOP_NAME]] â€” The <span className="font-serif-italic">art</span> of the <br/>sustainable home.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-on-surface-variant font-light max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          [[TAGLINE]]
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto"
        >
          <motion.button 
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-medium uppercase tracking-widest text-sm shadow-xl"
          >
            View Our Services
          </motion.button>
          <motion.button 
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-medium uppercase tracking-widest text-sm hover:bg-primary hover:text-on-primary transition-colors"
          >
            Our Philosophy
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {["Carbon Neutral", "Artisan Crafted", "Trusted Locally"].map((text) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm">
              <CheckCircle className="text-secondary w-4 h-4" />
              <span className="text-xs font-medium text-on-surface uppercase tracking-tighter">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative w-full max-w-6xl mx-auto mt-8"
      >
        <img 
          src="[[HERO_IMAGE_URL]]" 
          alt="Minimalist eco-conscious interior" 
          className="w-full h-[400px] md:h-[600px] object-cover rounded-3xl shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-8 right-8 md:right-16 bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-2xl border border-outline-variant/10 max-w-[240px]">
          <div className="text-tertiary text-4xl md:text-5xl font-serif font-bold mb-1">12+</div>
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-widest leading-tight">Years of sustainable stewardship</div>
        </div>
      </motion.div>
    </header>
  );
}
