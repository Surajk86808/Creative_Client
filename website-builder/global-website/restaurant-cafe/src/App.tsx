/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import {
  UtensilsCrossed,
  Leaf,
  Star,
  MapPin,
  Clock,
  Phone,
  Send,
  ArrowRight,
  Bike,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  CreditCard,
  Wallet,
  Nfc
} from "lucide-react";
import { useState, useRef } from "react";

const FEATURED_ITEMS = [
  {
    id: 1,
    name: "[[SERVICE_1]]",
    description: "[[SERVICE_1_TEXT]]",
    image: "[[ITEM_IMAGE_1]]",
    badge: "[[SERVICE_1_BADGE]]"
  },
  {
    id: 2,
    name: "[[SERVICE_2]]",
    description: "[[SERVICE_2_TEXT]]",
    image: "[[ITEM_IMAGE_2]]",
    badge: "[[SERVICE_2_BADGE]]"
  },
  {
    id: 3,
    name: "[[SERVICE_3]]",
    description: "[[SERVICE_3_TEXT]]",
    image: "[[ITEM_IMAGE_3]]",
    badge: "[[SERVICE_3_BADGE]]"
  }
];

const TESTIMONIALS = [
  {
    initials: "[[TESTIMONIAL_1_INITIALS]]",
    name: "[[TESTIMONIAL_1_NAME]]",
    role: "[[TESTIMONIAL_1_ROLE]]",
    text: "[[TESTIMONIAL_1_QUOTE]]"
  },
  {
    initials: "[[TESTIMONIAL_2_INITIALS]]",
    name: "[[TESTIMONIAL_2_NAME]]",
    role: "[[TESTIMONIAL_2_ROLE]]",
    text: "[[TESTIMONIAL_2_QUOTE]]"
  },
  {
    initials: "[[TESTIMONIAL_3_INITIALS]]",
    name: "[[TESTIMONIAL_3_NAME]]",
    role: "[[TESTIMONIAL_3_ROLE]]",
    text: "[[TESTIMONIAL_3_QUOTE]]"
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Featured");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-deep-brown/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto gap-4">
          <div className="min-w-0 text-2xl font-bold uppercase tracking-tighter text-primary font-display flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8" />
            <span className="truncate inline-block max-w-[55vw]">[[SHOP_NAME]]</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Highlights", "Our Story", "Contact", "Reviews"].map((item) => (
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
            [[CTA_PRIMARY]]
          </button>
        </div>
      </nav>

      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="[[HERO_IMAGE_URL]]"
            alt="Hero image"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>
        </motion.div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-secondary text-white px-4 py-1 rounded-full mb-8 tracking-widest uppercase text-xs font-bold"
          >
            <Leaf className="w-3 h-3 mr-2 fill-current" />
            [[HERO_KICKER]]
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="text-white/80 font-medium uppercase tracking-[0.3em] text-xs mb-5"
          >
            [[SHOP_NAME]]
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl md:text-[88px] font-bold text-white leading-[0.9] uppercase tracking-tighter mb-6"
          >
            [[HERO_HEADLINE]]
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12"
          >
            [[TAGLINE]]
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12"
          >
            <button className="w-full md:w-auto bg-primary text-white font-display font-bold px-10 py-4 rounded-lg uppercase tracking-wider text-lg hover:bg-primary-dark transition-colors">
              [[CTA_PRIMARY]]
            </button>
            <button className="w-full md:w-auto border-2 border-white text-white font-display font-bold px-10 py-4 rounded-lg uppercase tracking-wider text-lg hover:bg-white hover:text-primary transition-all">
              [[CTA_SECONDARY]]
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 inline-flex flex-wrap items-center justify-center gap-6 border border-white/10"
          >
            {[
              { icon: Bike, label: "[[VALUE_PROP_1]]" },
              { icon: Star, label: "[[VALUE_PROP_2]]" },
              { icon: Sparkles, label: "[[VALUE_PROP_3]]" }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-tertiary" />
                <span className="text-white font-bold">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="highlights" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <span className="text-primary font-display font-bold tracking-[0.2em] uppercase text-sm block mb-2">Featured Highlights</span>
              <h2 className="text-5xl font-display font-bold tracking-tight text-deep-brown">SIGNATURE PICKS</h2>
            </div>
            <div className="flex bg-warm-bg p-1 rounded-xl">
              {["Featured", "Popular", "Seasonal", "New"].map((cat) => (
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
            {FEATURED_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-warm-bg rounded-xl overflow-hidden editorial-shadow transition-all hover:translate-y-[-8px]"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-tertiary text-white font-display px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                    {item.badge}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-display font-bold mb-4">{item.name}</h3>
                  <p className="text-muted-brown font-light mb-6">{item.description}</p>
                  <button className="flex items-center gap-2 text-primary font-display font-bold uppercase tracking-wider group-hover:gap-4 transition-all">
                    [[CTA_SECONDARY]] <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              src="[[IMAGE_1]]"
              alt="Story image"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded-xl shadow-2xl hidden md:block text-center">
              <span className="font-display text-white text-4xl font-bold italic leading-tight block">[[STAT_1_VALUE]]</span>
              <span className="text-white/70 uppercase tracking-[0.2em] text-xs font-bold">[[STAT_1_LABEL]]</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <span className="font-display text-[120px] text-primary opacity-5 absolute -top-20 -left-10 select-none">&quot;</span>
            <h2 className="text-5xl font-display font-bold tracking-tight text-deep-brown mb-8 relative">[[HERO_HEADLINE]]</h2>
            <div className="font-light text-xl text-muted-brown mb-10 leading-relaxed">
              [[ABOUT_TEXT]]
            </div>
            <ul className="space-y-6 mb-12">
              {["[[VALUE_PROP_1]]", "[[VALUE_PROP_2]]", "[[VALUE_PROP_3]]"].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="bg-secondary/10 p-2 rounded-full">
                    <Leaf className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-bold">{item}</span>
                </li>
              ))}
            </ul>
            <button className="text-primary font-display font-bold border-b-2 border-primary pb-1 text-lg hover:text-primary-dark hover:border-primary-dark transition-all">
              [[CTA_SECONDARY]]
            </button>
          </motion.div>
        </div>
      </section>

      <section className="bg-primary py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { label: "[[STAT_1_LABEL]]", value: "[[STAT_1_VALUE]]" },
            { label: "[[STAT_2_LABEL]]", value: "[[STAT_2_VALUE]]" },
            { label: "[[STAT_3_LABEL]]", value: "[[STAT_3_VALUE]]" }
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="font-display text-[64px] font-bold text-white leading-none mb-2">{stat.value}</div>
              <div className="text-white/60 font-medium tracking-[0.2em] uppercase text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="reviews" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-16 tracking-tight">WHAT PEOPLE SAY</h2>
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
                <p className="font-light italic text-muted-brown text-lg mb-8 leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-display font-bold">{t.name}</div>
                    <div className="text-sm text-muted-brown">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white px-6 border-t border-deep-brown/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-5xl font-display font-bold tracking-tight mb-4">[[CTA_PRIMARY]]</h2>
            <p className="text-muted-brown text-lg mb-10">[[TAGLINE]]</p>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Full Name" type="text" />
                <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Phone Number" type="tel" />
              </div>
              <input className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="Address or request details" type="text" />
              <textarea className="w-full bg-warm-bg border-none p-4 rounded-lg focus:ring-2 focus:ring-primary transition-all" placeholder="How can we help today?" rows={4}></textarea>
              <button className="w-full bg-primary text-white font-display font-bold py-4 rounded-lg uppercase tracking-widest text-lg hover:bg-primary-dark transition-colors shadow-lg active:scale-[0.98]">
                [[CTA_PRIMARY]]
              </button>
            </form>
          </div>
          <div className="flex flex-col gap-8">
            <div className="w-full h-[400px] rounded-xl overflow-hidden editorial-shadow">
              <img
                className="w-full h-full object-cover"
                src="[[IMAGE_2]]"
                alt="Location image"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-warm-bg p-6 rounded-xl flex items-start gap-4">
                <MapPin className="w-6 h-6 text-secondary" />
                <div>
                  <h4 className="font-display font-bold mb-1">Visit Us</h4>
                  <p className="text-sm text-muted-brown">[[ADDRESS]]<br />[[CITY]]</p>
                </div>
              </div>
              <div className="bg-warm-bg p-6 rounded-xl flex items-start gap-4">
                <Clock className="w-6 h-6 text-secondary" />
                <div>
                  <h4 className="font-display font-bold mb-1">Availability</h4>
                  <p className="text-sm text-muted-brown">[[STAT_2_VALUE]]<br />[[STAT_2_LABEL]]</p>
                </div>
              </div>
            </div>
            <button className="w-full bg-secondary text-white py-6 rounded-xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-transform shadow-xl active:scale-95">
              <Phone className="w-8 h-8" />
              <span className="font-display text-2xl font-bold tracking-widest">CALL: [[PHONE]]</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-deep-brown text-white py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="text-xl font-bold uppercase text-primary font-display flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6" />
              <span>[[SHOP_NAME]]</span>
            </div>
            <p className="text-white/60 font-light leading-relaxed">[[FOOTER_DESCRIPTION]]</p>
          </div>
          <div>
            <h4 className="text-tertiary font-display font-bold mb-6 tracking-widest">QUICK LINKS</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#highlights" className="hover:text-white transition-colors">Highlights</a></li>
              <li><a href="#our-story" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
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
            <h4 className="text-tertiary font-display font-bold mb-6 tracking-widest">STAY CONNECTED</h4>
            <p className="text-white/60 text-sm mb-4">Updates, offers, and new reasons to stop by.</p>
            <div className="flex">
              <input className="bg-white/10 border-none rounded-l-lg p-3 w-full text-white text-sm focus:ring-1 focus:ring-primary" placeholder="[[EMAIL]]" type="email" />
              <button className="bg-primary text-white px-4 rounded-r-lg hover:bg-primary-dark transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© 2024 [[SHOP_NAME]]. All Rights Reserved.</p>
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