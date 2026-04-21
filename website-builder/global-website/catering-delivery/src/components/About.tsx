import { motion } from "motion/react";
import { CheckCircle2, Landmark, Wine, Star } from "lucide-react";

export default function About() {
  return (
    <section id="our-story" className="py-32 bg-background px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
              alt="Artisan hands" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-12 -right-12 w-2/3 rounded-2xl overflow-hidden aspect-square border-[12px] border-background shadow-2xl hidden md:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1800&auto=format&fit=crop" 
              alt="Fresh ingredients" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display text-primary font-bold text-xs tracking-[0.3em] uppercase block mb-4">Our Heritage</span>
            <h2 className="font-serif text-5xl md:text-6xl text-secondary leading-tight mb-8">
              Crafted with patience, <i className="italic font-normal">nourished</i> by the land.
            </h2>
            <div className="pl-6 border-l-4 border-primary/20 py-2 mb-8">
              <p className="font-serif italic text-2xl text-stone-600 leading-relaxed">
                "Luxury isn't about excess; it's about the intimacy between the soil and the plate, the quiet moment before the first bite."
              </p>
            </div>
            <p className="font-sans text-stone-500 leading-relaxed text-lg font-light mb-10">
              [[ABOUT_TEXT]]
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: CheckCircle2, text: "Zero-Kilometer Sourcing" },
              { icon: Landmark, text: "Historic Stone Oven" },
              { icon: Wine, text: "Rare Vintage Cellar" },
              { icon: Star, text: "Michelin Heritage" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="text-primary w-5 h-5" />
                </div>
                <span className="font-display text-sm font-semibold text-on-surface">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            className="bg-primary text-white px-10 py-4 rounded-lg font-display font-bold transition-all shadow-lg shadow-primary/20"
          >
            Discover Our Story
          </motion.button>
        </div>
      </div>
    </section>
  );
}
