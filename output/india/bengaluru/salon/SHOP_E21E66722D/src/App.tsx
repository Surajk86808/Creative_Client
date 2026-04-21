/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Star, ArrowRight, Globe, Camera, Mail } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 slow-luxury-ease-in-out ${isScrolled ? "bg-surface/80 backdrop-blur-md shadow-[0_20px_40px_rgba(28,24,17,0.04)] py-4" : "bg-transparent py-6"}`}>
      <div className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto">
        <div className="text-xl font-serif tracking-[0.2em] uppercase text-on-surface">
          ATELIER <span className="italic text-primary-container normal-case tracking-normal">Spa</span>
        </div>
        
        <div className="hidden md:flex space-x-10 items-center">
          <a className="text-primary font-medium border-b border-primary-container pb-1 font-body text-xs tracking-widest uppercase slow-luxury-ease-in-out" href="#services">SERVICES</a>
          <a className="text-on-surface/70 font-body text-xs tracking-widest uppercase hover:text-primary-container slow-luxury-ease-in-out" href="#artisans">ARTISANS</a>
          <a className="text-on-surface/70 font-body text-xs tracking-widest uppercase hover:text-primary-container slow-luxury-ease-in-out" href="#rituals">RITUALS</a>
          <a className="text-on-surface/70 font-body text-xs tracking-widest uppercase hover:text-primary-container slow-luxury-ease-in-out" href="#journal">JOURNAL</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block border border-primary px-6 py-2 text-xs font-body tracking-widest uppercase text-primary hover:bg-primary hover:text-white slow-luxury-ease-in-out">
            BOOK APPOINTMENT
          </button>
          <button 
            className="md:hidden text-on-surface"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-surface border-t border-outline-variant absolute top-full left-0 w-full p-6 flex flex-col gap-6 shadow-xl"
        >
          <a className="text-on-surface text-sm tracking-widest uppercase" href="#services" onClick={() => setIsMobileMenuOpen(false)}>SERVICES</a>
          <a className="text-on-surface text-sm tracking-widest uppercase" href="#artisans" onClick={() => setIsMobileMenuOpen(false)}>ARTISANS</a>
          <a className="text-on-surface text-sm tracking-widest uppercase" href="#rituals" onClick={() => setIsMobileMenuOpen(false)}>RITUALS</a>
          <a className="text-on-surface text-sm tracking-widest uppercase" href="#journal" onClick={() => setIsMobileMenuOpen(false)}>JOURNAL</a>
          <button className="bg-primary text-white px-6 py-3 text-xs tracking-widest uppercase w-full">
            BOOK APPOINTMENT
          </button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col md:flex-row pt-20">
      <div className="flex-1 bg-surface-container-low flex items-center px-8 md:px-20 py-20 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 border border-outline-variant/30 rounded-full"></div>
        <div className="absolute top-40 -left-10 w-32 h-32 border border-outline-variant/20 rounded-full"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-xl"
        >
          <h1 className="text-5xl md:text-[68px] leading-[1.1] font-serif text-on-surface mb-8">
            The Art of <br /> <span className="italic text-primary-container">Miss Nail Art Studio- Vijayanagar</span> Radiance
          </h1>
          <p className="text-lg text-on-surface-variant font-light mb-10 max-w-md leading-relaxed">
            Trusted salon in bengaluru
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-primary text-on-primary px-10 py-4 text-sm tracking-widest uppercase slow-luxury-ease-in-out hover:opacity-90">
              EXPLORE SERVICES
            </button>
            <button className="border border-outline px-10 py-4 text-sm tracking-widest uppercase slow-luxury-ease-in-out hover:bg-surface-container">
              VIEW GALLERY
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 bg-surface p-6 inline-flex items-center gap-4 shadow-[0_20px_40px_rgba(28,24,17,0.06)] border border-outline-variant/10"
          >
            <div className="flex -space-x-2">
              <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://picsum.photos/seed/woman1/100/100" alt="Client" referrerPolicy="no-referrer" />
              <img className="w-10 h-10 rounded-full border-2 border-surface" src="https://picsum.photos/seed/man1/100/100" alt="Client" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex text-primary-container mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-[10px] tracking-widest uppercase font-semibold">500+ RADIANT REVIEWS</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div className="flex-1 min-h-[500px]">
        <img 
          alt="Spa interior" 
          className="w-full h-full object-cover" 
          src="https://picsum.photos/seed/spa-hero/1200/1600" 
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
};

const Quote = () => {
  return (
    <section className="py-32 bg-surface-container flex flex-col items-center px-6">
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        className="w-12 h-[1px] bg-primary-container mb-12"
      ></motion.div>
      <motion.blockquote 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl text-center"
      >
        <p className="text-3xl md:text-5xl font-serif italic text-on-surface leading-snug">
          Miss Nail Art Studio- Vijayanagar provides professional salon services for customers in 999/21, Service Rd, opposite metro, Kilkodungalur, MC Layout, Vijayanagar, Bengaluru, Karnataka 560040. We focus on quality, clear communication, and great results. Call 072042 53546 to get started.
        </p>
      </motion.blockquote>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      icon: "âœ¨",
      title: "[[SERVICE_1]]",
      desc: "Advanced dermatological techniques fused with rare botanical extracts for transformative luminosity."
    },
    {
      icon: "ðŸŒ¿",
      title: "[[SERVICE_2]]",
      desc: "Structural massage therapies designed to release chronic tension and restore the body's natural alignment."
    },
    {
      icon: "ðŸ’Ž",
      title: "[[SERVICE_3]]",
      desc: "Meticulous care for hands, feet, and hair, ensuring every detail reflects your inner elegance."
    }
  ];

  return (
    <section id="services" className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="text-xs tracking-[0.3em] uppercase text-primary mb-4 block">Our Curations</span>
          <h2 className="text-4xl md:text-5xl font-serif">Signature Rituals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-surface-container-low p-12 slow-luxury-ease-in-out hover:bg-white hover:shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="text-4xl mb-8">{service.icon}</div>
              <h3 className="text-2xl font-serif mb-4">{service.title}</h3>
              <p className="text-on-surface-variant font-light mb-8 leading-relaxed">{service.desc}</p>
              <a className="text-xs tracking-widest uppercase font-semibold border-b border-outline-variant pb-1 group-hover:text-primary group-hover:border-primary transition-colors inline-block" href="#">
                DISCOVER MORE
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  return (
    <section className="py-24 bg-surface border-y border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          {[
            { num: "12", label: "Master Artisans" },
            { num: "25k", label: "Transformations" },
            { num: "08", label: "Global Locations" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-6xl font-serif text-primary mb-2 italic">{stat.num}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="artisans" className="py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="grid grid-cols-12 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="col-span-8"
            >
              <img alt="Atelier process" className="w-full h-[500px] object-cover" src="https://picsum.photos/seed/process/800/1000" referrerPolicy="no-referrer" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="col-span-4 mt-20"
            >
              <img alt="Spa detail" className="w-full h-[300px] object-cover" src="https://picsum.photos/seed/detail/400/600" referrerPolicy="no-referrer" />
            </motion.div>
          </div>
          <div className="absolute -bottom-10 -right-10 bg-primary-container p-12 hidden md:block">
            <p className="text-white font-serif italic text-2xl">Est. 2012</p>
          </div>
        </div>
        <div>
          <span className="text-xs tracking-[0.3em] uppercase text-primary mb-6 block">The Atelier Philosophy</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">Beyond the Surface of Beauty</h2>
          <p className="text-on-surface-variant font-light mb-12 text-lg leading-relaxed">Trusted salon in bengaluru</p>
          <div className="space-y-6">
            {["ETHICAL SOURCING", "CLINICAL PRECISION", "BESPOKE RITUALS"].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-6 group cursor-pointer"
              >
                <div className="w-12 h-[1px] bg-outline-variant group-hover:bg-primary group-hover:w-16 transition-all duration-500"></div>
                <span className="text-xs tracking-widest uppercase font-semibold">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      text: "The attention to detail at Atelier is unmatched. It feels less like an appointment and more like a private invitation to a master's studio.",
      author: "Eleanor Laurent",
      role: "Fashion Editor",
      initials: "EL",
      color: "bg-primary-container"
    },
    {
      text: "My skin has never felt more alive. The facial ritual was transformative, and the environment is pure tranquility.",
      author: "Sophia Vance",
      role: "Visual Artist",
      initials: "SV",
      color: "bg-primary"
    },
    {
      text: "The Body Sculpting treatment is essential for my recovery. Professional, clinical, and profoundly effective.",
      author: "Julian Marc",
      role: "Architecture Lead",
      initials: "JM",
      color: "bg-secondary"
    }
  ];

  return (
    <section className="py-32 bg-surface-container-low px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reviews.map((review, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="border-t border-primary-container pt-12"
            >
              <p className="font-serif italic text-xl mb-10 leading-relaxed text-on-surface">"{review.text}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${review.color} flex items-center justify-center text-white text-xs font-semibold`}>
                  {review.initials}
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase font-bold">{review.author}</p>
                  <p className="text-[9px] tracking-widest uppercase opacity-60">{review.role}</p>
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
    <section id="rituals" className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h2 className="text-4xl font-serif mb-8">Secure Your Ritual</h2>
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input 
                className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-xs tracking-widest focus:ring-0 focus:border-primary placeholder:text-outline/50 uppercase transition-all outline-none" 
                placeholder="FULL NAME" 
                type="text" 
              />
            </div>
            <div className="relative">
              <input 
                className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-xs tracking-widest focus:ring-0 focus:border-primary placeholder:text-outline/50 uppercase transition-all outline-none" 
                placeholder="EMAIL ADDRESS" 
                type="email" 
              />
            </div>
            <div className="relative">
              <select className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-xs tracking-widest focus:ring-0 focus:border-primary text-outline/50 uppercase transition-all outline-none appearance-none">
                <option disabled selected>SELECT A RITUAL</option>
                <option>[[SERVICE_1]]</option>
                <option>[[SERVICE_2]]</option>
                <option>[[SERVICE_3]]</option>
              </select>
            </div>
            <div className="relative">
              <textarea 
                className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-xs tracking-widest focus:ring-0 focus:border-primary placeholder:text-outline/50 uppercase transition-all outline-none resize-none" 
                placeholder="MESSAGE (OPTIONAL)" 
                rows={4}
              ></textarea>
            </div>
            <button className="w-full bg-primary text-on-primary py-5 text-xs tracking-[0.3em] font-semibold hover:opacity-90 slow-luxury-ease-in-out">
              REQUEST APPOINTMENT
            </button>
          </form>
        </div>
        <div className="space-y-12">
          <div className="h-[400px] bg-surface-container grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/map/800/600" 
              alt="Location" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] tracking-widest uppercase font-bold mb-4 text-primary">VISIT US</h4>
              <p className="text-xs leading-relaxed text-on-surface-variant font-light">999/21, Service Rd, opposite metro, Kilkodungalur, MC Layout, Vijayanagar, Bengaluru, Karnataka 560040<br />bengaluru</p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-widest uppercase font-bold mb-4 text-primary">CONTACT</h4>
              <p className="text-xs leading-relaxed text-on-surface-variant font-light">072042 53546<br />abhihr1996@gmail.com</p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-widest uppercase font-bold mb-4 text-primary">HOURS</h4>
              <p className="text-xs leading-relaxed text-on-surface-variant font-light">MON - SAT<br />09:00 - 21:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#1c1c19] w-full py-20 px-6 md:px-12 border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div>
          <div className="text-lg font-serif italic text-[#fcf9f4] mb-8">
            ATELIER <span className="text-[#c9a96e]">Spa</span>
          </div>
          <div className="flex space-x-6">
            <a className="text-[#fcf9f4]/50 hover:text-[#c9a96e] transition-all duration-300" href="#"><Globe size={18} /></a>
            <a className="text-[#fcf9f4]/50 hover:text-[#c9a96e] transition-all duration-300" href="#"><Camera size={18} /></a>
            <a className="text-[#fcf9f4]/50 hover:text-[#c9a96e] transition-all duration-300" href="#"><Mail size={18} /></a>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-[#c9a96e] font-body text-xs tracking-[0.1em] uppercase font-bold mb-6">EXPLORE</h4>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">SERVICES</a>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">ARTISANS</a>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">JOURNAL</a>
        </div>
        <div className="space-y-4">
          <h4 className="text-[#c9a96e] font-body text-xs tracking-[0.1em] uppercase font-bold mb-6">COMPANY</h4>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">PRIVACY POLICY</a>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">TERMS OF SERVICE</a>
          <a className="block text-[#fcf9f4]/50 font-body text-xs tracking-[0.1em] uppercase hover:text-[#fcf9f4] transition-all" href="#">CAREERS</a>
        </div>
        <div className="space-y-4">
          <h4 className="text-[#c9a96e] font-body text-xs tracking-[0.1em] uppercase font-bold mb-6">NEWSLETTER</h4>
          <p className="text-[#fcf9f4]/30 text-[10px] leading-relaxed uppercase tracking-widest mb-4">Join our inner circle for exclusive rituals and updates.</p>
          <div className="flex">
            <input 
              className="bg-transparent border-0 border-b border-[#fcf9f4]/20 text-[#fcf9f4] text-[10px] tracking-widest w-full focus:ring-0 focus:border-[#c9a96e] pb-2 outline-none" 
              placeholder="EMAIL" 
              type="email" 
            />
            <button className="border-b border-[#fcf9f4]/20 pb-2 px-4 hover:border-[#c9a96e] transition-colors">
              <ArrowRight size={14} className="text-[#c9a96e]" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-32 border-t border-[#fcf9f4]/10 pt-10">
        <p className="text-[#fcf9f4]/30 font-body text-[10px] tracking-[0.2em] uppercase text-center md:text-left">Miss Nail Art Studio- Vijayanagar provides professional salon services for customers in 999/21, Service Rd, opposite metro, Kilkodungalur, MC Layout, Vijayanagar, Bengaluru, Karnataka 560040. We focus on quality, clear communication, and great results. Call 072042 53546 to get started.</p>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />
      <Hero />
      <Quote />
      <Services />
      <Stats />
      <About />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
