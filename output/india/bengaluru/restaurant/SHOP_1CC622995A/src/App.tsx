/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { 
  Pizza, 
  Leaf, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Send, 
  ArrowRight, 
  Bike, 
  Flame,
  Instagram,
  Facebook,
  Twitter,
  CreditCard,
  Wallet,
  Nfc
} from "lucide-react";
import { useState, useRef } from "react";

const PIZZAS = [
  {
    id: 1,
    name: "[[SERVICE_1]]",
    price: "$18",
    description: "San Marzano tomatoes, buffalo mozzarella, fresh basil, and extra virgin olive oil.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL2bzp0V16KpZfb1on8Q4jrzkHESmJ7WEuW1CEZpg6gyb-OWRx2Jyn2RmsKef4iRFFeXX_yozloIwpnOPa1fKwr260izu3qEVCctEmnuk2vMMgsfiopS21yd6k5SppL21r8y-g_L300z2ySBkHRUx5isjcue_FAjPCpdWUEYIyGpynjSt3a4MFADA1RZ5b7QoedLL4LRrcsCunBWmqF8BcXS6Fair0FIWL1RnCuGDGfdZPknrQJvbgxZ9YZi29TWr2h-PtC3WVkVk",
    tag: "Chef's Choice"
  },
  {
    id: 2,
    name: "[[SERVICE_2]]",
    price: "$22",
    description: "Spicy salami, tomato sauce, mozzarella, chili oil, and wildflower honey.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQdZak2JGOHBTEQnTfgUmxpNK0fs66qtLM34gBnVroaJDJN0yoU2m-qdti79oAFmn0hViXLMSElPYDuo0irZxDho4GpfrddaUQEjUDgHya5jPlEqfqaeuM_0I1zMJevB300vsVpQSSSpbDVfj9CiJ9QGhEuSLnab0cANvbhwO8Q5SbmJAq1nKpuuP1WoSbGiz7dxgR2j5j1EDtFDyV1YLsSbw3FbgRvqdsnoc4tayqn062x3VHUBbGROnvq1gOnsjxz5kKuYxIBAU",
    tag: "Spicy"
  },
  {
    id: 3,
    name: "[[SERVICE_3]]",
    price: "$26",
    description: "White base, wild mushrooms, fresh ricotta, chives, and black truffle oil.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgbw_AufxZwRWItOjrXAsN8pjXc7bHWOx7kINFz6GC4souhHQZPyQmvztYH7qWwREhrZMxwsput5qYwAsOGMVSuW6sCY9jLEJT8zKnLLSFReYLo0vYXFaf_61V3XUD7-QXq-JKqZu3BCknG_eEvwT-6Ze8TaoXQbWiHmb95L8JpOq1FpepWhJ6Az583TL0-v6q1Cv6sCOWN5M8Ocb67jTez-Gg6YO0o5s1-5cJb-JIu6UVmkxVxFDAj6abYVLYRPDUacZHVZaToek",
    tag: "Vegetarian"
  }
];

const TESTIMONIALS = [
  {
    initials: "JD",
    name: "James Donahue",
    text: "\"The crust is unlike anything I've had in the city. Truly authentic, charred in all the right places. The Margherita D.O.P. is a masterpiece.\""
  },
  {
    initials: "AR",
    name: "Alessia Rossi",
    text: "\"Madre Pizza brings back memories of my summers in Salerno. The ingredients are top-notch and the atmosphere is pure New York soul.\""
  },
  {
    initials: "MK",
    name: "Marcus King",
    text: "\"The Bee Sting pizza is the perfect balance of heat and sweet. Fast delivery and it arrives piping hot every single time.\""
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Pizza");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-deep-brown/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold uppercase tracking-tighter text-primary font-display flex items-center gap-2">
            <Pizza className="w-8 h-8" />
            <span>The Creek</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Menu", "Our Story", "Locations", "Reviews"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-deep-brown hover:text-primary font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded font-display font-bold uppercase tracking-wide hover:bg-primary-dark transition-all active:scale-95">
            Order Online
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAvvh_YgwyAnjcfcjYihcr6L_I0VvvcsEuVJSfSCMjNzAm3EkoEi3QVfquAP4G4fB_PqVsX_fdsVvX01BroQK3M8zoigwfpsX8xALGqlf9AGMea8c6DipIOP8i105UzHKrtiO7A1fjsdhMEH7Xj1J5YC2DAzTghEiiM6QYAaMDApOdTgE37FCNRUf6SmHW9gmSTKyFuX3D27shzbSr5kvO7lluPcMsvTsroS-ks7co1DNm7I4hnmo79NIJsC8AN6CYr8rPr3OkOkY"
            alt="Wood-fired pizza"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-secondary text-white px-4 py-1 rounded-full mb-8 tracking-widest uppercase text-xs font-bold"
          >
            <Leaf className="w-3 h-3 mr-2 fill-current" />
            Trusted restaurant in bengaluru
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-6xl md:text-[100px] font-bold text-white leading-[0.85] uppercase tracking-tighter mb-8"
          >
            The Creek<br/>Trusted restaurant in bengaluru
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12"
          >
            <button className="w-full md:w-auto bg-primary text-white font-display font-bold px-10 py-4 rounded-lg uppercase tracking-wider text-lg hover:bg-primary-dark transition-colors">
              Order Delivery
            </button>
            <button className="w-full md:w-auto border-2 border-white text-white font-display font-bold px-10 py-4 rounded-lg uppercase tracking-wider text-lg hover:bg-white hover:text-primary transition-all">
              View Menu
            </button>
          </motion.div>

          {/* Delivery Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 inline-flex flex-wrap items-center justify-center gap-6 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <Bike className="w-5 h-5 text-secondary" />
              <span className="text-white font-bold">30 min Delivery</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-tertiary fill-current" />
              <span className="text-white font-bold">4.9/5 Rating</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-white font-bold">Wood Fired</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <span className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm block mb-2">Our Selection</span>
              <h2 className="text-5xl font-display font-bold tracking-tight text-deep-brown">CRAFTED CLASSICS</h2>
            </div>
            <div className="flex bg-warm-bg p-1 rounded-xl">
              {["Pizza", "Pasta", "Sides", "Desserts"].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-lg font-display font-bold transition-all ${
                    activeCategory === cat ? "bg-primary text-white shadow-lg" : "text-muted-brown hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PIZZAS.map((pizza, idx) => (
              <motion.div 
                key={pizza.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-warm-bg rounded-xl overflow-hidden editorial-shadow transition-all hover:translate-y-[-8px]"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    src={pizza.image}
                    alt={pizza.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-tertiary text-white font-display px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                    {pizza.tag}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold">{pizza.name}</h3>
                    <span className="text-xl font-bold text-primary">{pizza.price}</span>
                  </div>
                  <p className="text-muted-brown font-light mb-6">{pizza.description}</p>
                  <button className="flex items-center gap-2 text-primary font-display font-bold uppercase tracking-wider group-hover:gap-4 transition-all">
                    Add to Order <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="our-story" className="py-24 bg-warm-bg px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              className="rounded-xl object-cover w-full h-[600px] editorial-shadow" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBELX0nMOPbn4qSQmD0CYQ45PQpiegiCloWBFOune0wBw9huLlP7hKxRaSZtUQSl8ucUg13cx3L--Qnii6atZqN3feUIe10mvubMlaxFTUopr-8eN7DyjixXXm9x3cELJHGCGw6BfOhjR8JJgPymUSqC9byyADOfDtzQE7R4SVE-hCBJ7VQJkLWN6qOHhLitFpzced128D-AUIDQ8mcAO1cPkA2y8XRH0p8WZEn3CCm-KqlT_ln54zcGyrrXza8k8tHvJnE2eYcsX0"
              alt="Pizza chef"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded-xl shadow-2xl hidden md:block">
              <span className="font-display text-white text-4xl font-bold italic leading-tight block">Since<br/>1984</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <span className="font-display text-[120px] text-primary opacity-5 absolute -top-20 -left-10 select-none">â€œ</span>
            <h2 className="text-5xl font-display font-bold tracking-tight text-deep-brown mb-8 relative">PIZZA IS NOT JUST FOOD, IT'S A HERITAGE.</h2>
            <div className="font-light text-xl text-muted-brown mb-10 leading-relaxed">
              The Creek provides professional restaurant services for customers in The DEN Hotel, ITPL Main Rd, KIADB Export Promotion Industrial Area, Whitefield, Bengaluru, Karnataka 560066. We focus on quality, clear communication, and great results. Call 08071 117 272 to get started.
            </div>
            <ul className="space-y-6 mb-12">
              {[
                "72-Hour Naturally Fermented Dough",
                "Original Wood-Fired Brick Ovens",
                "Imported San Marzano Tomatoes"
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="bg-secondary/10 p-2 rounded-full">
                    <Leaf className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-bold">{item}</span>
                </li>
              ))}
            </ul>
            <button className="text-primary font-display font-bold border-b-2 border-primary pb-1 text-lg hover:text-primary-dark hover:border-primary-dark transition-all">
              Read Our Full Story
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { label: "Oven Temperature", value: "485Â°C" },
            { label: "Pizzas Served", value: "150k+" },
            { label: "Local Partners", value: "12" }
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="font-display text-[64px] font-bold text-white leading-none mb-2">{stat.value}</div>
              <div className="text-white/60 font-medium tracking-[0.2em] uppercase text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-16 tracking-tight">VOICES FROM THE TABLE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div 
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-warm-bg p-10 rounded-xl editorial-shadow border-t-[3px] border-tertiary"
              >
                <div className="flex gap-1 text-tertiary mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="font-light italic text-muted-brown text-lg mb-8 leading-relaxed">
                  {t.text}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold">
                    {t.initials}
                  </div>
                  <div className="font-display font-bold">{t.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Order / Contact */}
      <section id="locations" className="py-24 bg-white px-6 border-t border-deep-brown/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-5xl font-display font-bold tracking-tight mb-4">ORDER NOW</h2>
            <p className="text-muted-brown text-lg mb-10">Trusted restaurant in bengaluru</p>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Full Name" type="text" />
                <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Phone Number" type="tel" />
              </div>
              <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Delivery Address" type="text" />
              <textarea className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Your Order Details" rows={4}></textarea>
              <button className="w-full bg-primary text-white font-display font-bold py-4 rounded-lg uppercase tracking-widest text-lg hover:bg-primary-dark transition-colors shadow-lg active:scale-[0.98]">
                Place Your Order
              </button>
            </form>
          </div>
          <div className="flex flex-col gap-8">
            <div className="w-full h-[400px] rounded-xl overflow-hidden editorial-shadow">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIQSKQcGf9WjmKvP7EhtyHjn6vX8a6SzrH-oFILryqosCUg4OYgwsMBo8_jXzCUkKxnLLqMKdaoC81QpCo9w3Xuwn0HAotkIzrlexw-cGQsZ4Qg5gQNyiI7Ri8eWL4goX5qneBINJ8N6bIMt5b9MS2QFTqW__YdcRv_zs5Al29tcE6Tize1-FFmVNx6prgKqvysnfi_VmMyyjimQUT62le7tWZThxK0kHzpRVp-2G2qSphImCyX_aawpAl9a-KJQVG5A_fyNNRMWY"
                alt="Map"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-warm-bg p-6 rounded-xl flex items-start gap-4">
                <MapPin className="w-6 h-6 text-secondary" />
                <div>
                  <h4 className="font-display font-bold mb-1">Visit Us</h4>
                  <p className="text-sm text-muted-brown">The DEN Hotel, ITPL Main Rd, KIADB Export Promotion Industrial Area, Whitefield, Bengaluru, Karnataka 560066<br/>bengaluru</p>
                </div>
              </div>
              <div className="bg-warm-bg p-6 rounded-xl flex items-start gap-4">
                <Clock className="w-6 h-6 text-secondary" />
                <div>
                  <h4 className="font-display font-bold mb-1">Hours</h4>
                  <p className="text-sm text-muted-brown">Mon - Sun: 11:00 AM - 11:00 PM<br/>Fri - Sat: Late night til 2 AM</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-secondary text-white py-6 rounded-xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-xl active:scale-95">
              <Phone className="w-8 h-8" />
              <span className="font-display text-2xl font-bold tracking-widest">CALL: 08071 117 272</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-brown text-white py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="text-xl font-bold uppercase text-primary font-display flex items-center gap-2">
              <Pizza className="w-6 h-6" />
              <span>The Creek</span>
            </div>
            <p className="text-white/60 font-light leading-relaxed">
              Bringing the warmth of the wood-fired oven and the soul of Italian heritage to the streets of New York since 1984.
            </p>
          </div>
          <div>
            <h4 className="text-tertiary font-display font-bold mb-6 tracking-widest">QUICK LINKS</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-tertiary font-display font-bold mb-6 tracking-widest">SOCIAL</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-tertiary font-display font-bold mb-6 tracking-widest">JOIN THE FAMILY</h4>
            <p className="text-white/60 text-sm mb-4">Get special offers and event invites.</p>
            <div className="flex">
              <input className="bg-white/10 border-none rounded-l-lg p-3 w-full text-white text-sm focus:ring-1 focus:ring-primary" placeholder="incoming@danhotels.com" type="email" />
              <button className="bg-primary text-white px-4 rounded-r-lg hover:bg-primary-dark transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">Â© 2024 The Creek. All Rights Reserved.</p>
          <div className="flex gap-6 text-white/40">
            <CreditCard className="w-5 h-5" />
            <Wallet className="w-5 h-5" />
            <Nfc className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
}
