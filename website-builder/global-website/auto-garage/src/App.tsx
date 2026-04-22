/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import {
  Wrench,
  Settings,
  Cpu,
  Search,
  Shield,
  Star,
  Share2,
  Podcast,
  Phone,
  Mail,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Clock4
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-zinc-950/90 backdrop-blur-md fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 border-b border-zinc-800/50">
      <div className="flex items-center gap-2 min-w-0">
        <Wrench className="text-primary w-6 h-6" />
        <span className="text-2xl font-headline uppercase tracking-tighter text-primary font-bold truncate">[[SHOP_NAME]]</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a href="#services" className="text-xs font-headline font-bold uppercase tracking-widest hover:text-primary transition-colors">Services</a>
        <a href="#about" className="text-xs font-headline font-bold uppercase tracking-widest hover:text-primary transition-colors">About</a>
        <a href="#contact" className="text-xs font-headline font-bold uppercase tracking-widest hover:text-primary transition-colors">Contact</a>
        <button className="bg-primary text-surface px-4 py-2 font-headline font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(245,197,24,0.3)] transition-all active:scale-95 duration-150">
          [[CTA_PRIMARY]]
        </button>
      </div>

      <button className="md:hidden text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X /> : <Menu />}
      </button>

      {isMenuOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 md:hidden">
          <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-sm font-headline font-bold uppercase tracking-widest">Services</a>
          <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-sm font-headline font-bold uppercase tracking-widest">About</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-sm font-headline font-bold uppercase tracking-widest">Contact</a>
          <button className="bg-primary text-surface px-4 py-3 font-headline font-bold uppercase tracking-widest text-sm">[[CTA_PRIMARY]]</button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center px-6 pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img alt="Hero image" className="w-full h-full object-cover brightness-[0.25]" src="[[HERO_IMAGE_URL]]" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 grid-overlay z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-20"></div>
      </div>

      <div className="relative z-30 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
          <div className="space-y-3">
            <p className="text-primary font-headline font-bold uppercase tracking-[0.35em] text-xs">[[HERO_KICKER]]</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold uppercase tracking-tight text-white leading-none">[[HERO_HEADLINE]]</h1>
            <p className="text-on-surface-variant font-light text-lg md:text-xl max-w-xl leading-relaxed">[[TAGLINE]]</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-primary text-surface px-6 py-4 font-headline font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(245,197,24,0.25)] transition-all active:scale-95">[[CTA_PRIMARY]]</button>
            <button className="border border-zinc-700 text-white px-6 py-4 font-headline font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all">[[CTA_SECONDARY]]</button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-12 max-w-2xl">
            {[
              { value: '[[STAT_1_VALUE]]', label: '[[STAT_1_LABEL]]' },
              { value: '[[STAT_2_VALUE]]', label: '[[STAT_2_LABEL]]' },
              { value: '[[STAT_3_VALUE]]', label: '[[STAT_3_LABEL]]' }
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <span className="block text-3xl md:text-4xl font-headline font-bold text-primary">{stat.value}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const StatsBar = () => {
  return (
    <section className="bg-primary py-8 px-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8 md:gap-4">
        {[
          { value: '[[STAT_1_VALUE]]', label: '[[STAT_1_LABEL]]' },
          { value: '[[STAT_2_VALUE]]', label: '[[STAT_2_LABEL]]' },
          { value: '[[STAT_3_VALUE]]', label: '[[STAT_3_LABEL]]' }
        ].map((stat, idx) => (
          <div key={stat.label} className={`text-center px-4 w-full md:w-auto ${idx > 0 ? 'md:border-l border-surface/20' : ''}`}>
            <span className="block text-4xl md:text-5xl font-headline font-bold text-surface leading-none">{stat.value}</span>
            <span className="text-[10px] font-headline font-bold uppercase text-surface/80 tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    { icon: <Settings className="w-10 h-10" />, title: '[[SERVICE_1]]', desc: '[[SERVICE_1_TEXT]]', code: 'OPS-01' },
    { icon: <Cpu className="w-10 h-10" />, title: '[[SERVICE_2]]', desc: '[[SERVICE_2_TEXT]]', code: 'OPS-02' },
    { icon: <Search className="w-10 h-10" />, title: '[[SERVICE_3]]', desc: '[[SERVICE_3_TEXT]]', code: 'OPS-03' }
  ];

  return (
    <section id="services" className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] mb-2">Core Services</h2>
          <h3 className="text-4xl md:text-5xl font-headline font-bold uppercase">Built Around Fast, Reliable Support</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div key={index} whileHover={{ y: -10 }} className="bg-surface-container border-t-2 border-primary p-8 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,197,24,0.1)]">
              <div className="text-primary mb-6 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
              <h4 className="text-xl font-headline font-bold uppercase mb-4">{service.title}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{service.desc}</p>
              <div className="text-[10px] font-headline font-bold text-primary tracking-widest flex items-center gap-2">CODE: {service.code} <span className="w-8 h-[1px] bg-primary"></span></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyUs = () => {
  const pillars = [
    { icon: Sparkles, title: '[[VALUE_PROP_1]]' },
    { icon: Clock4, title: '[[VALUE_PROP_2]]' },
    { icon: Shield, title: '[[VALUE_PROP_3]]' },
    { icon: Search, title: '[[VALUE_PROP_4]]' }
  ];

  return (
    <section id="about" className="py-24 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden lg:block"><Shield className="w-64 h-64" /></div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] mb-2">Why Teams Choose Us</h2>
          <h3 className="text-4xl md:text-5xl font-headline font-bold uppercase mb-8">[[ABOUT_HEADLINE]]</h3>
          <p className="text-on-surface-variant mb-12 max-w-xl">[[ABOUT_TEXT]]</p>
          <div className="grid grid-cols-2 gap-4">
            {pillars.map((item) => (
              <div key={item.title} className="bg-surface-container p-6 space-y-4 border border-zinc-800 hover:border-primary/30 transition-colors">
                <item.icon className="text-primary w-7 h-7" />
                <h5 className="font-headline font-bold uppercase text-sm">{item.title}</h5>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
          <img alt="About image" className="w-full grayscale brightness-75 border-l-4 border-primary" src="[[IMAGE_1]]" referrerPolicy="no-referrer" />
          <div className="absolute -bottom-6 -right-6 bg-primary p-8 hidden md:block text-right">
            <span className="block text-4xl font-headline font-bold text-surface">[[STAT_4_VALUE]]</span>
            <span className="block text-xs font-headline font-bold uppercase tracking-[0.3em] text-surface/80">[[STAT_4_LABEL]]</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const rows = [
    { text: '[[TESTIMONIAL_1_QUOTE]]', author: '[[TESTIMONIAL_1_NAME]]', role: '[[TESTIMONIAL_1_ROLE]]', initials: '[[TESTIMONIAL_1_INITIALS]]' },
    { text: '[[TESTIMONIAL_2_QUOTE]]', author: '[[TESTIMONIAL_2_NAME]]', role: '[[TESTIMONIAL_2_ROLE]]', initials: '[[TESTIMONIAL_2_INITIALS]]' }
  ];

  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] mb-2">Client Feedback</h2>
          <h3 className="text-4xl md:text-5xl font-headline font-bold uppercase">Real Results, Clear Communication</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {rows.map((t, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-surface-container p-8 relative border border-zinc-800">
              <div className="flex text-primary mb-6">{[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-primary" />)}</div>
              <p className="italic text-on-surface-variant font-light leading-relaxed mb-6">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-headline font-bold text-xs text-primary">{t.initials}</div>
                <div>
                  <div className="text-sm font-headline font-bold uppercase tracking-wider">{t.author}</div>
                  <div className="text-[10px] text-primary uppercase font-headline">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 bg-surface-container">
      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <h2 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] mb-2">Contact</h2>
          <h3 className="text-4xl md:text-5xl font-headline font-bold uppercase">[[CTA_PRIMARY]]</h3>
        </div>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-[10px] font-headline font-bold uppercase text-primary tracking-[0.2em]">Full Name</label>
            <input className="w-full bg-zinc-950 border-none border-b-2 border-zinc-800 text-on-surface p-4 focus:ring-0 focus:border-primary transition-all placeholder:text-zinc-700 outline-none" placeholder="Your name" type="text" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-headline font-bold uppercase text-primary tracking-[0.2em]">Email</label>
            <input className="w-full bg-zinc-950 border-none border-b-2 border-zinc-800 text-on-surface p-4 focus:ring-0 focus:border-primary transition-all placeholder:text-zinc-700 outline-none" placeholder="[[EMAIL]]" type="email" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-headline font-bold uppercase text-primary tracking-[0.2em]">Request</label>
            <textarea className="w-full bg-zinc-950 border-none border-b-2 border-zinc-800 text-on-surface p-4 focus:ring-0 focus:border-primary transition-all placeholder:text-zinc-700 outline-none resize-none" placeholder="How can we help?" rows={4}></textarea>
          </div>
          <button className="w-full bg-primary text-surface py-4 font-headline font-bold uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2">[[CTA_PRIMARY]] <ArrowRight className="w-4 h-4" /></button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="text-2xl font-headline font-bold text-primary uppercase tracking-tighter">[[SHOP_NAME]]</div>
          <p className="text-zinc-500 text-xs leading-relaxed uppercase font-headline tracking-wider">[[FOOTER_DESCRIPTION]]</p>
          <div className="flex gap-4">
            <a className="w-10 h-10 border border-zinc-800 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#"><Share2 className="w-4 h-4" /></a>
            <a className="w-10 h-10 border border-zinc-800 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#"><Podcast className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="text-primary font-headline uppercase tracking-wider text-sm font-bold">SERVICES</h4>
          <ul className="space-y-4 text-xs font-headline tracking-widest text-zinc-500">
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[SERVICE_1]]</li>
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[SERVICE_2]]</li>
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[SERVICE_3]]</li>
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[VALUE_PROP_1]]</li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-primary font-headline uppercase tracking-wider text-sm font-bold">LOCATION</h4>
          <ul className="space-y-4 text-xs font-headline tracking-widest text-zinc-500">
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[ADDRESS]]</li>
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[CITY]]</li>
            <li className="hover:text-primary hover:translate-x-1 duration-200 transition-all cursor-pointer">[[COUNTRY]]</li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-primary font-headline uppercase tracking-wider text-sm font-bold">CONTACT</h4>
          <ul className="space-y-4 text-xs font-headline tracking-widest text-zinc-500">
            <li className="flex items-center gap-2"><Phone className="w-3 h-3" />[[PHONE]]</li>
            <li className="flex items-center gap-2"><Mail className="w-3 h-3" />[[EMAIL]]</li>
          </ul>
        </div>
      </div>
      <div className="mt-20 border-t border-zinc-900 pt-8 text-center"><span className="font-headline uppercase tracking-wider text-[10px] text-zinc-500">© 2024 [[SHOP_NAME]]. ALL RIGHTS RESERVED.</span></div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-primary selection:text-surface">
      <Navbar />
      <Hero />
      <StatsBar />
      <Services />
      <WhyUs />
      <Testimonials />
      <Contact />
      <Footer />

      <div className="fixed bottom-0 left-0 w-full h-1 bg-surface z-[100] md:hidden">
        <div className="h-full bg-primary w-1/4"></div>
      </div>
    </div>
  );
}