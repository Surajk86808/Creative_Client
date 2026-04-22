/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Menu, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Mail, 
  Star,
  Instagram,
  Linkedin,
  Youtube,
  X
} from 'lucide-react';

const destinations = [
  {
    id: 1,
    title: 'Maldives',
    category: 'Island Paradise',
    price: '$4,200',
    image: '[[ITEM_IMAGE_1]]',
    alt: 'Luxury overwater bungalow in the Maldives'
  },
  {
    id: 2,
    title: 'Zermatt',
    category: 'Alpine Luxury',
    price: '$3,800',
    image: '[[ITEM_IMAGE_2]]',
    alt: 'Snow-capped Swiss mountain peaks'
  },
  {
    id: 3,
    title: 'Kyoto',
    category: 'Cultural Heritage',
    price: '$2,900',
    image: '[[ITEM_IMAGE_3]]',
    alt: 'Traditional Japanese Zen garden'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'James Wilson',
    role: 'CEO, TechNorth',
    content: '"The level of detail was staggering. From the private driver waiting at the terminal to the surprise sunset dinner on the dunes, everything was flawless."',
    avatar: '[[AVATAR_IMAGE_1]]'
  },
  {
    id: 2,
    name: 'Elena Rodriguez',
    role: 'Architectural Designer',
    content: '"Horizon Voyager doesn\'t just plan trips; they deliver magic. Our Japanese odyssey was the most seamless and enriching experience of our lives."',
    avatar: '[[AVATAR_IMAGE_2]]'
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-coral selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 backdrop-blur-xl shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="flex justify-between items-center px-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Compass className="text-primary w-8 h-8" />
            <span className="font-headline text-xl font-bold tracking-tighter uppercase">
              <span className="text-primary">[[SHOP_NAME]]</span>
              <span className="text-coral"></span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {['Destinations', 'Our Story', 'Offers'].map((item) => (
              <a key={item} href="#" className={`font-medium transition-all hover:text-secondary ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                {item}
              </a>
            ))}
            <button className="bg-gradient-to-r from-secondary to-primary-container text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl p-6 flex flex-col gap-4"
            >
              {['Destinations', 'Our Story', 'Offers'].map((item) => (
                <a key={item} href="#" className="text-lg font-bold text-primary border-b border-slate-100 pb-2">
                  {item}
                </a>
              ))}
              <button className="bg-primary text-white py-4 rounded-full font-bold mt-4">
                Book Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="[[HERO_IMAGE_URL]]" 
              alt="Luxury travel hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-coral text-white font-bold px-6 py-2 rounded-full text-sm uppercase tracking-widest mb-6"
            >
              Explore the Extraordinary
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-headline text-5xl md:text-8xl text-white font-bold leading-none mb-8 tracking-tighter"
            >
              UNFOLD THE <br/> HORIZON
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col md:flex-row gap-4 justify-center"
            >
              <button className="bg-coral text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl">
                Start Journey
              </button>
              <button className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all backdrop-blur-sm">
                View Gallery
              </button>
            </motion.div>
          </div>

          {/* Search Bar Widget */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-5xl z-20">
            <div className="glass-card p-6 md:p-8 rounded-lg shadow-2xl flex flex-col md:flex-row gap-6 items-end">
              <div className="w-full space-y-2">
                <label className="text-[10px] uppercase font-bold text-primary tracking-widest px-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                  <input 
                    className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-t-lg py-4 pl-12 text-primary font-bold" 
                    placeholder="Where to next?" 
                    type="text"
                  />
                </div>
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] uppercase font-bold text-primary tracking-widest px-2">Dates</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                  <input 
                    className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-t-lg py-4 pl-12 text-primary font-bold" 
                    placeholder="Select dates" 
                    type="text"
                  />
                </div>
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] uppercase font-bold text-primary tracking-widest px-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                  <input 
                    className="w-full bg-surface-container-high border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-t-lg py-4 pl-12 text-primary font-bold" 
                    placeholder="How many?" 
                    type="text"
                  />
                </div>
              </div>
              <button className="bg-primary text-white w-full md:w-auto px-10 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors h-[58px]">
                <Search className="w-5 h-5" /> Search
              </button>
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="font-headline text-4xl text-primary font-bold tracking-tight mb-2">Curated Escapes</h2>
            <div className="h-1 w-20 bg-coral rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest, idx) => (
              <motion.div 
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[500px] rounded-lg overflow-hidden cursor-pointer shadow-xl"
              >
                <img 
                  src={dest.image} 
                  alt={dest.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 p-8 w-full">
                  <span className="text-coral font-bold text-sm uppercase tracking-widest mb-2 block translate-y-4 group-hover:translate-y-0 transition-transform">
                    {dest.category}
                  </span>
                  <h3 className="font-headline text-3xl text-white font-bold">{dest.title}</h3>
                  <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white/80 text-sm">From {dest.price}</span>
                    <ArrowRight className="text-coral w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="bg-surface-container-low py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="relative w-full md:w-1/2">
              <div className="aspect-square rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="[[IMAGE_1]]" 
                  alt="Luxury experience"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 bg-coral text-white p-8 rounded-lg shadow-2xl flex flex-col items-center justify-center"
              >
                <span className="font-headline text-5xl font-bold">15+</span>
                <span className="text-xs uppercase font-bold tracking-widest text-center">Years of <br/> Excellence</span>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="font-headline text-4xl text-primary font-bold leading-tight">
                Crafting Memories That <br/> Last a Lifetime
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">[[TAGLINE]]</p>
              <ul className="space-y-4">
                {[
                  '[[SERVICE_1]]',
                  '[[SERVICE_2]]',
                  '[[SERVICE_3]]'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-primary font-bold">
                    <CheckCircle className="text-coral w-6 h-6" /> {item}
                  </li>
                ))}
              </ul>
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-secondary transition-colors shadow-lg">
                Learn More About Us
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Happy Travelers', value: '12k+' },
              { label: 'Destinations', value: '140+' },
              { label: 'Luxury Hotels', value: '500+' },
              { label: 'Satisfaction Rate', value: '98%' }
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-coral font-headline text-5xl font-bold">{stat.value}</div>
                <div className="text-white/80 font-bold uppercase text-xs tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-surface-container-high py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-4">
                <h2 className="font-headline text-4xl text-primary font-bold">Voices of the Horizon</h2>
                <p className="text-on-surface-variant">Real stories from our most discerning travelers.</p>
              </div>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white p-8 rounded-lg shadow-xl border-t-[3px] border-coral">
                  <div className="flex gap-1 text-coral mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-primary italic mb-8 text-lg">{t.content}</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-primary">{t.name}</h4>
                      <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto glass-card rounded-lg shadow-2xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <h2 className="font-headline text-4xl text-primary font-bold">Ready to Start Your Voyage?</h2>
                <p className="text-on-surface-variant text-lg">[[ABOUT_TEXT]] • [[ADDRESS]]</p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <Phone className="text-coral w-6 h-6" />
                    <span className="font-bold text-primary">[[PHONE]]</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="text-coral w-6 h-6" />
                    <span className="font-bold text-primary">[[EMAIL]]</span>
                  </div>
                </div>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-coral focus:ring-0 rounded-t-lg p-4 font-medium transition-colors" placeholder="Full Name" type="text" />
                <input className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-coral focus:ring-0 rounded-t-lg p-4 font-medium transition-colors" placeholder="[[EMAIL]]" type="email" />
                <textarea className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:border-coral focus:ring-0 rounded-t-lg p-4 font-medium transition-colors" placeholder="Tell us about your dream destination..." rows={4}></textarea>
                <button className="w-full bg-coral text-white py-5 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary pt-24 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Compass className="text-coral w-8 h-8" />
                <span className="font-headline text-2xl font-bold tracking-tighter uppercase">
                  [[SHOP_NAME]] <span className="text-coral"></span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Curating the world's most extraordinary travel experiences for the discerning few. From private islands to polar expeditions.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-coral font-bold uppercase tracking-widest text-sm">Destinations</h4>
              <ul className="space-y-3">
                {['Europe', 'Asia & Pacific', 'Americas', 'Africa & Middle East'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-coral font-bold uppercase tracking-widest text-sm">Quick Links</h4>
              <ul className="space-y-3">
                {['Our Story', 'Special Offers', 'Privacy Policy', 'Terms of Service'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-coral font-bold uppercase tracking-widest text-sm">Newsletter</h4>
              <p className="text-slate-400 text-sm">Receive curated travel inspiration directly to your inbox.</p>
              <div className="flex border-b border-slate-700 pb-2">
                <input className="bg-transparent border-none focus:ring-0 text-white w-full placeholder:text-slate-600" placeholder="Email" type="email" />
                <button className="text-coral"><ArrowRight className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs">Â© 2024 [[SHOP_NAME]]. All rights reserved.</p>
            <div className="flex gap-6">
              <Instagram className="w-5 h-5 text-slate-500 hover:text-coral cursor-pointer" />
              <Linkedin className="w-5 h-5 text-slate-500 hover:text-coral cursor-pointer" />
              <Youtube className="w-5 h-5 text-slate-500 hover:text-coral cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-3 z-50 flex justify-between items-center">
        <button className="flex flex-col items-center gap-1 text-secondary">
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
      </div>
    </div>
  );
}
