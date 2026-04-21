/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Menu, 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Instagram, 
  Youtube, 
  ArrowRight,
  ChevronRight,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "GALLERY", href: "#" },
    { name: "SERVICES", href: "#" },
    { name: "EXPERIENCE", href: "#" },
    { name: "ABOUT", href: "#" },
    { name: "CONTACT", href: "#" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 md:py-6 flex justify-between items-center ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className={`text-xl md:text-2xl font-headline italic tracking-tight ${isScrolled ? "text-on-surface" : "text-white"}`}>
        ETHEREAL <span className="text-primary-container italic">EDITOR</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 lg:gap-12 items-center">
        {navLinks.map((link) => (
          <a 
            key={link.name}
            className={`font-label text-[11px] tracking-widest uppercase transition-colors duration-300 ${isScrolled ? "text-on-surface-variant hover:text-primary" : "text-white/80 hover:text-white"}`} 
            href={link.href}
          >
            {link.name}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden sm:block bg-primary text-on-primary px-6 md:px-8 py-2 md:py-3 text-[11px] tracking-[1.5px] uppercase font-label transition-transform duration-300 hover:scale-105 active:scale-95">
          INQUIRE
        </button>
        <button 
          className="md:hidden text-on-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className={isScrolled ? "text-on-surface" : "text-white"} /> : <Menu className={isScrolled ? "text-on-surface" : "text-white"} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-white shadow-xl py-8 flex flex-col items-center gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a 
              key={link.name}
              className="font-label text-sm tracking-widest uppercase text-on-surface-variant hover:text-primary" 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <button className="bg-primary text-on-primary px-8 py-3 text-[11px] tracking-[1.5px] uppercase font-label">
            INQUIRE
          </button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <img 
        className="absolute inset-0 w-full h-full object-cover" 
        src="https://picsum.photos/seed/wedding-reception/1920/1080" 
        alt="Luxurious wedding reception"
        referrerPolicy="no-referrer"
      />
      <div className="relative z-20 text-center px-6 max-w-5xl">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block font-label text-xs md:text-sm tracking-[0.3em] text-white/90 uppercase mb-6"
        >
          Bespoke Event Curation
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-headline text-5xl md:text-7xl lg:text-8xl leading-tight text-white mb-12"
        >
          [[SHOP_NAME]] Crafts <span className="text-primary-fixed italic">Unforgettable</span> Love Stories
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button className="bg-primary text-white px-10 py-5 text-[12px] tracking-[2px] uppercase font-label transition-all hover:bg-primary-container">
            VIEW OUR WORK
          </button>
          <button className="border border-white text-white px-10 py-5 text-[12px] tracking-[2px] uppercase font-label backdrop-blur-sm hover:bg-white/10 transition-colors">
            OUR SERVICES
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const IntroQuote = () => {
  return (
    <section className="bg-surface-container-low py-24 md:py-32 px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-4xl mx-auto text-center space-y-8"
      >
        <div className="editorial-ornament"><div className="diamond"></div></div>
        <p className="font-headline italic text-3xl md:text-5xl text-on-surface leading-relaxed">[[TAGLINE]]</p>
        <div className="editorial-ornament"><div className="diamond"></div></div>
      </motion.div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      id: "01",
      title: "[[SERVICE_1]]",
      description: "Comprehensive orchestration from the first conceptual sketch to the final farewell dance under the stars."
    },
    {
      id: "02",
      title: "[[SERVICE_2]]",
      description: "Artistic direction focusing on color palettes, textures, and the delicate interplay of light and rose-gold accents."
    },
    {
      id: "03",
      title: "[[SERVICE_3]]",
      description: "Flawless execution of high-profile galas, private dinners, and milestones with meticulous attention to detail."
    }
  ];

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-20">
          <span className="font-label text-xs tracking-widest text-primary uppercase block mb-4">What We Offer</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Bespoke Event Curation</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-0">
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`group bg-white p-8 md:p-12 border-t-2 border-primary-container transition-all duration-500 hover:shadow-2xl relative z-10`}
            >
              <span className="font-headline italic text-4xl text-primary-container/30 mb-8 block">{service.id}</span>
              <h3 className="font-headline text-2xl mb-6">{service.title}</h3>
              <p className="text-on-surface-variant font-light leading-relaxed mb-8">{service.description}</p>
              <a className="font-headline italic text-primary inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                Discover More <ChevronRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    { value: "450+", label: "Events Curated" },
    { value: "12", label: "Global Awards" },
    { value: "15", label: "Years of Grace" },
    { value: "100%", label: "Bespoke Approach" }
  ];

  return (
    <section className="bg-primary-container py-20 md:py-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="font-headline text-4xl md:text-6xl text-white">{stat.value}</div>
            <div className="font-label text-[10px] tracking-widest text-white/80 uppercase">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -top-6 -left-6 md:-top-12 md:-left-12 w-32 h-32 md:w-64 md:h-64 bg-surface-container-high -z-10"></div>
          <img 
            className="w-full h-[400px] md:h-[700px] object-cover shadow-2xl" 
            src="https://picsum.photos/seed/planner/800/1000" 
            alt="Elegant wedding planner"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8 md:space-y-10"
        >
          <span className="font-label text-xs tracking-widest text-primary uppercase">The Visionary</span>
          <h2 className="font-headline text-4xl md:text-6xl leading-tight text-on-surface">Curating the <span className="italic">Exceptional</span></h2>
          <div className="pl-6 md:pl-8 border-l-2 border-primary-container">
            <p className="font-headline italic text-xl md:text-2xl text-on-surface-variant leading-relaxed">
              "Luxury is not about the price tag, but the emotional resonance of every carefully chosen detail."
            </p>
          </div>
          <p className="text-on-surface-variant font-light leading-loose text-base md:text-lg">[[ABOUT_TEXT]]</p>
          <button className="font-headline italic text-primary text-xl border-b border-primary-container/40 pb-2 hover:text-primary-container transition-colors inline-flex items-center gap-2">
            Read Clara's Story <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const images = [
    { src: "https://picsum.photos/seed/table/600/800", title: "Tuscan Romance", alt: "Table setting" },
    { src: "https://picsum.photos/seed/couple/600/400", title: "Eternal Golden Hour", alt: "Couple in field" },
    { src: "https://picsum.photos/seed/cake/600/600", title: "Sculpted Elegance", alt: "Wedding cake" },
    { src: "https://picsum.photos/seed/arch/600/800", title: "Garden Sanctuary", alt: "Floral arch" },
    { src: "https://picsum.photos/seed/invitation/600/400", title: "Heirloom Paper", alt: "Invitations" },
    { src: "https://picsum.photos/seed/night/600/700", title: "Midnight Whimsy", alt: "Night reception" },
  ];

  return (
    <section className="bg-surface-container-low py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16 md:mb-20 space-y-4">
          <span className="font-label text-xs tracking-widest text-primary uppercase">Archive of Beauty</span>
          <h2 className="font-headline text-4xl md:text-5xl">The Gallery</h2>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.map((image, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group overflow-hidden bg-primary break-inside-avoid"
            >
              <img 
                className="w-full transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40" 
                src={image.src} 
                alt={image.alt}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="font-headline text-white text-2xl italic">{image.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Working with Ethereal Editor was like watching a dream manifest into reality. Claraâ€™s eye for rose-gold detailing is unparalleled.",
      author: "Sophia & James",
      location: "Lake Como, Italy"
    },
    {
      quote: "The level of professionalism and artistic integrity was beyond our expectations. They didn't just plan a wedding; they created a legacy.",
      author: "Eleanor & Mark",
      location: "Cotswolds, UK"
    },
    {
      quote: "Absolute architectural precision in every floral arrangement and table setting. Simply the finest event planning available.",
      author: "Julianne & David",
      location: "New York Public Library"
    }
  ];

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-8 md:gap-12">
        {testimonials.map((t, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-white p-8 md:p-12 border-t-2 border-primary-container shadow-sm flex flex-col justify-between"
          >
            <div className="mb-8">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-primary text-primary" />)}
              </div>
              <p className="font-headline italic text-xl leading-relaxed text-on-surface">"{t.quote}"</p>
            </div>
            <div>
              <div className="font-label text-xs tracking-widest uppercase mb-1">{t.author}</div>
              <div className="font-label text-[10px] text-primary-container">{t.location}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 md:gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <h2 className="font-headline text-5xl md:text-6xl leading-tight">Let's Create <span className="italic text-primary">Magic</span></h2>
          <p className="text-on-surface-variant font-light text-lg md:text-xl max-w-md">Currently accepting inquiries for 2025 and 2026 celebrations. Reach out to start our collaboration.</p>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <MapPin className="text-primary-container" size={24} />
              <span className="font-label text-sm tracking-wide">[[ADDRESS]]</span>
            </div>
            <div className="flex items-center gap-6">
              <Mail className="text-primary-container" size={24} />
              <span className="font-label text-sm tracking-wide uppercase">[[EMAIL]]</span>
            </div>
            <div className="flex items-center gap-6">
              <Phone className="text-primary-container" size={24} />
              <span className="font-label text-sm tracking-wide">[[PHONE]]</span>
            </div>
          </div>
        </motion.div>
        
        <motion.form 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8 md:space-y-10"
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-2">
              <label className="font-label text-[10px] tracking-widest text-primary-container uppercase">Full Name</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 font-light placeholder:text-stone-300 transition-colors" 
                placeholder="E.g. Julianne Smith" 
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] tracking-widest text-primary-container uppercase">Email Address</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 font-light placeholder:text-stone-300 transition-colors" 
                placeholder="[[EMAIL]]" 
                type="email"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-2">
              <label className="font-label text-[10px] tracking-widest text-primary-container uppercase">Event Type</label>
              <select className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 font-light text-on-surface-variant">
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Private Gala</option>
                <option>Corporate SoirÃ©e</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] tracking-widest text-primary-container uppercase">Target Date</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 font-light placeholder:text-stone-300 transition-colors" 
                placeholder="MM/DD/YYYY" 
                type="text"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] tracking-widest text-primary-container uppercase">The Vision</label>
            <textarea 
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 font-light placeholder:text-stone-300 transition-colors" 
              placeholder="Describe your dream celebration..." 
              rows={4}
            ></textarea>
          </div>
          <button className="w-full bg-primary text-white py-5 md:py-6 text-xs tracking-[3px] uppercase font-label transition-all hover:bg-primary-container active:scale-[0.98]">
            SEND INQUIRY
          </button>
        </motion.form>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-primary-container pt-20 md:pt-24 pb-12 px-6 md:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        <div className="text-3xl font-headline italic mb-12 text-white">
          ETHEREAL <span className="text-primary-container italic">EDITOR</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-4xl mb-20">
          <div className="space-y-6">
            <h4 className="font-headline italic text-lg text-stone-50">Explore</h4>
            <ul className="font-label text-[11px] space-y-4 tracking-widest text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">GALLERY</li>
              <li className="hover:text-white transition-colors cursor-pointer">SERVICES</li>
              <li className="hover:text-white transition-colors cursor-pointer">EXPERIENCE</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-headline italic text-lg text-stone-50">Support</h4>
            <ul className="font-label text-[11px] space-y-4 tracking-widest text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              <li className="hover:text-white transition-colors cursor-pointer">PRESS</li>
              <li className="hover:text-white transition-colors cursor-pointer">CONTACT</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-headline italic text-lg text-stone-50">Legal</h4>
            <ul className="font-label text-[11px] space-y-4 tracking-widest text-stone-400">
              <li className="hover:text-white transition-colors cursor-pointer uppercase">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer uppercase">Terms of Service</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-headline italic text-lg text-stone-50">Social</h4>
            <div className="flex gap-6">
              <Instagram className="cursor-pointer hover:text-white transition-colors" size={20} />
              <Youtube className="cursor-pointer hover:text-white transition-colors" size={20} />
              <Mail className="cursor-pointer hover:text-white transition-colors" size={20} />
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-stone-800 w-full max-w-4xl text-center">
          <p className="font-label text-[10px] tracking-[2px] text-stone-500 uppercase">
            Â© 2026 ETHEREAL EDITOR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-primary-fixed selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <IntroQuote />
        <Services />
        <Stats />
        <About />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
