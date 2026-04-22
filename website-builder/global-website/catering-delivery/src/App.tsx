import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Menu from "./components/Menu";
import Reservation from "./components/Reservation";
import Footer from "./components/Footer";
import { motion, useScroll, useSpring } from "motion/react";

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      <Navbar />
      <main>
        <Hero />
        
        {/* Stats Strip */}
        <section className="bg-secondary py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="text-primary-light text-7xl font-serif mb-4">98%</div>
              <div className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase">Local Ingredients</div>
            </motion.div>
            <div className="hidden md:block h-24 w-[1px] bg-white/10" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 w-full"
            >
              <div className="text-primary-light text-7xl font-serif mb-4">120+</div>
              <div className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase">Wine Varietals</div>
            </motion.div>
            <div className="hidden md:block h-24 w-[1px] bg-white/10" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex-1 w-full"
            >
              <div className="text-primary-light text-7xl font-serif mb-4">4.9</div>
              <div className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase">Guest Rating</div>
            </motion.div>
          </div>
        </section>

        <About />
        <Menu />
        
        {/* Testimonials */}
        <section className="py-32 bg-background px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span className="font-display text-primary font-bold text-xs tracking-[0.3em] uppercase mb-4 block">The Experience</span>
              <h2 className="font-serif text-5xl md:text-6xl text-on-surface">Letters of Affection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  quote: "An absolute masterclass in restraint and quality. The bread alone is worth the flight from London.",
                  author: "Clara Montagu",
                  role: "Food Critic, The Herald",
                  img: "[[AVATAR_IMAGE_1]]"
                },
                {
                  quote: "They don't just serve food; they serve memories. The atmosphere feels like a warm embrace.",
                  author: "Julian Rossi",
                  role: "Art Collector",
                  img: "[[AVATAR_IMAGE_2]]"
                },
                {
                  quote: "The most sincere dining experience I've had in years. Every ingredient speaks of its origin.",
                  author: "Elena Vance",
                  role: "Botanist",
                  img: "[[AVATAR_IMAGE_3]]"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white p-12 rounded-3xl shadow-xl border-t-8 border-primary relative"
                >
                  <p className="font-serif italic text-xl leading-relaxed text-stone-600 mb-10">
                    "{item.quote}"
                  </p>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-md">
                      <img src={item.img} alt={item.author} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm text-on-surface">{item.author}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-widest">{item.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Reservation />
      </main>
      <Footer />
    </div>
  );
}
