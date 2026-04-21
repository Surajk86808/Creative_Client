import { motion } from "motion/react";
import { ArrowRight, Leaf } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')",
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 backdrop-blur-md rounded-full mb-8"
        >
          <Leaf className="text-primary-light w-4 h-4" />
          <span className="text-primary-light text-[10px] font-bold tracking-[0.2em] uppercase">
            [[TAGLINE]]
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-5xl md:text-[84px] leading-[1.1] text-white max-w-4xl mb-8"
        >
          Welcome to <i className="text-primary-light not-italic">[[SHOP_NAME]]</i>.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-sans font-light text-white/70 text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
        >
          [[TAGLINE]]
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <button className="bg-primary text-white px-8 py-4 rounded-lg font-display font-bold text-base hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 group">
            Experience the Table
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="backdrop-blur-md bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-display font-bold text-base hover:bg-white/20 transition-all">
            View Seasonal Curation
          </button>
        </motion.div>
      </div>
    </section>
  );
}
