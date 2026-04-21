import { motion } from "motion/react";
import { Leaf, Brush } from "lucide-react";

export default function About() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container-low" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative order-2 md:order-1"
        >
          <img 
            src="https://picsum.photos/seed/artisan/800/1000" 
            alt="Artisan hands working" 
            className="w-full aspect-[4/5] object-cover rounded-[3rem] shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -left-6 bg-secondary p-8 rounded-3xl text-on-primary hidden lg:block max-w-[200px]">
            <p className="font-serif-italic text-lg leading-snug">"Nature is the first and greatest architect."</p>
          </div>
        </motion.div>

        <div className="order-1 md:order-2">
          <span className="text-secondary font-medium tracking-widest uppercase text-xs mb-4 block">Our Origin Story</span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight"
          >
            Built on <span className="font-serif-italic">trust</span>, nurtured by nature.
          </motion.h2>
          <p className="text-on-surface-variant font-light text-lg mb-8 leading-relaxed">
            [[ABOUT_TEXT]]
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                <Leaf className="text-secondary w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Ethical Sourcing</h4>
                <p className="text-sm text-on-surface-variant font-light">Every material is tracked from source to home.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                <Brush className="text-secondary w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Modern Craft</h4>
                <p className="text-sm text-on-surface-variant font-light">Ancient wisdom meets modern engineering.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
