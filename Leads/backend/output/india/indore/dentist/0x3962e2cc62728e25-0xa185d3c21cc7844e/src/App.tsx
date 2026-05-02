import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Star, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  Microscope, 
  Phone, 
  Mail, 
  MapPin, 
  Send,
  Instagram,
  Facebook,
  Twitter,
  Smile,
  Activity,
  Scissors
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-serif italic text-primary">
            The <span className="text-secondary">Studio</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {['Services', 'Specialists', 'The Studio', 'Patient Care'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-primary hover:text-secondary font-medium tracking-wide transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
            </a>
          ))}
          <button className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-6 py-2.5 transition-all hover:translate-y-[-1px] font-medium shadow-md">
            Book Consultation
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl md:hidden p-6 flex flex-col gap-4 border-t border-gray-100"
          >
            {['Services', 'Specialists', 'The Studio', 'Patient Care'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-primary text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="bg-secondary text-white rounded-xl px-6 py-4 font-medium mt-2">
              Book Consultation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 z-10"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/20 text-secondary text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse mr-2"></span>
            Trusted in London since 2012
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-primary mb-8">
            Aishwary Dental Clinic: Precision Care for Your <br/>
            <span className="italic font-serif">Dental Health</span>
          </h1>
          <p className="text-lg md:text-xl text-primary/70 max-w-lg mb-10 leading-relaxed">Trusted dentist in indore</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
              Start Your Journey <ArrowRight size={20} />
            </button>
            <button className="border-2 border-primary text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-primary/5 transition-all">
              View Case Studies
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="rounded-[40px] overflow-hidden shadow-2xl relative aspect-[4/5]">
            <img 
              src="https://source.unsplash.com/2000x1200/?dentist,clinic,doctor" 
              alt="Modern Clinical Studio" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Floating UI Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 hidden sm:flex"
            >
              <div className="bg-accent p-2 rounded-xl">
                <Star className="text-secondary fill-secondary" size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Average Rating</p>
                <p className="text-primary font-bold text-lg">4.9/5.0</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 -left-4 bg-white p-5 rounded-2xl shadow-xl hidden sm:block"
            >
              <div className="flex -space-x-3 mb-3">
                {["https://source.unsplash.com/200x200/?doctor,portrait", "https://source.unsplash.com/200x200/?nurse,portrait", "https://source.unsplash.com/200x200/?doctor,portrait,smile"].map((src) => (
                  <img
                    key={src}
                    src={src}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover" 
                    alt="Specialist"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white text-white text-[10px] font-bold">+12</div>
              </div>
              <p className="text-sm font-bold text-primary">Elite Specialists</p>
              <p className="text-xs text-gray-400">Board-certified surgeons</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TrustBar = () => {
  const items = [
    { icon: <Microscope size={20} />, text: "State-of-the-Art Technology" },
    { icon: <ShieldCheck size={20} />, text: "GDC Certified Practice" },
    { icon: <Clock size={20} />, text: "Same-Day Appointments" },
    { icon: <CreditCard size={20} />, text: "Major Insurance Accepted" },
  ];

  return (
    <section className="bg-primary py-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8 text-white/90">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-secondary">{item.icon}</span>
            <span className="font-medium tracking-wide text-sm md:text-base">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Consultations",
      desc: "Comprehensive preventative care and routine maintenance for lifelong oral health stability.",
      icon: <Smile size={28} />,
    },
    {
      title: "Diagnostics & checkups",
      desc: "Invisalign and discreet alignment solutions tailored to your unique facial profile.",
      icon: <Activity size={28} />,
    },
    {
      title: "Pharmacy & support",
      desc: "Veneers, whitening, and smile design that emphasizes natural brilliance over artificial perfection.",
      icon: <Sparkles size={28} />,
    },
    {
      title: "Implants",
      desc: "Permanent restorative solutions using bio-compatible titanium and ceramic materials.",
      icon: <Stethoscope size={28} />,
    },
    {
      title: "Oral Surgery",
      desc: "Expert surgical care in a sedation-friendly environment for complete patient comfort.",
      icon: <Scissors size={28} />,
    },
    {
      title: "Preventive Care",
      desc: "Hygiene-focused treatments designed to protect your natural teeth for a lifetime.",
      icon: <ShieldCheck size={28} />,
    },
  ];

  return (
    <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl text-primary mb-6">Expertise Across All <span className="italic font-serif text-secondary">Disciplines</span></h2>
          <p className="text-primary/70">We provide holistic care through specialized departments, each led by renowned experts using the most advanced minimally invasive techniques.</p>
        </div>
        <a href="#" className="text-primary font-semibold flex items-center gap-2 group hover:text-secondary transition-colors">
          View All Services <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -8 }}
            className="group bg-white p-10 rounded-[32px] transition-all duration-500 shadow-sm hover:shadow-xl border border-gray-100"
          >
            <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent transition-colors text-primary">
              {service.icon}
            </div>
            <h3 className="text-2xl text-primary mb-4">{service.title}</h3>
            <p className="text-sm text-primary/60 leading-relaxed mb-6">{service.desc}</p>
            <div className="w-0 group-hover:w-16 h-[2px] bg-secondary transition-all duration-300"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="the-studio" className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl">
            <img 
              src="https://source.unsplash.com/1200x900/?doctor,consultation" 
              alt="Expert Doctor" 
              className="w-full aspect-square object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="absolute -bottom-10 -right-4 md:-right-10 bg-secondary text-white p-8 md:p-10 rounded-[40px] shadow-2xl"
          >
            <p className="text-5xl font-serif mb-2">15+</p>
            <p className="text-xs font-medium tracking-widest uppercase">Years of Precision</p>
          </motion.div>
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl text-primary mb-8 leading-tight">Defining the Future of <span className="italic font-serif">Clinical Excellence</span></h2>
          <p className="text-lg text-primary/70 mb-10 leading-relaxed">Aishwary Dental Clinic provides professional dentist services for customers in Laxmi Plaza Complex, 20-C, Indrapuri Colony Main Rd, Bhawarkuan Square, Indor.... We focus on quality, clear communication, and great results. Call 090986 19197 to get started.</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Microscope size={20} />, text: "Nano-Precision Tech" },
              { icon: <Sparkles size={20} />, text: "Anxiety-Free Suite" },
              { icon: <Activity size={20} />, text: "Multi-Expert Panel" },
              { icon: <Clock size={20} />, text: "Lifetime Care Focus" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm text-secondary">
                  {item.icon}
                </div>
                <span className="font-semibold text-primary">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      name: "Eleanor Mitchell",
      role: "London, UK",
      text: "The attention to detail here is unparalleled. I never thought I would say that I look forward to my dental visits, but The Studio has changed everything.",
      initials: "EM"
    },
    {
      name: "Robert Jensen",
      role: "Opera Artist",
      text: "As a professional singer, my smile and jaw health are vital. The specialists here worked with me to ensure my treatment didn't affect my performance schedule.",
      initials: "RJ"
    },
    {
      name: "Sarah Dubois",
      role: "Tech CEO",
      text: "Clinical excellence that feels like a boutique spa. They transformed my smile in three sittings with zero pain. Simply the best in London.",
      initials: "SD"
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl text-primary mb-6 italic font-serif">Patient Testimonials</h2>
          <p className="text-primary/60 max-w-xl mx-auto">Discover why our patients travel from across Europe to experience our uniquely gentle approach to dental mastery.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[32px] border-t-[3px] border-secondary shadow-sm"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-secondary fill-secondary" />
                ))}
              </div>
              <p className="text-primary italic leading-relaxed mb-8">"{review.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-primary">
                  {review.initials}
                </div>
                <div>
                  <p className="font-bold text-primary">{review.name}</p>
                  <p className="text-xs text-primary/50">{review.role}</p>
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
    <section id="patient-care" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl md:text-5xl text-primary mb-8">Secure Your <span className="italic font-serif text-secondary">Consultation</span></h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary">Full Name</label>
                <input className="bg-background border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary outline-none" placeholder="John Doe" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-primary">Email Address</label>
                <input className="bg-background border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary outline-none" placeholder="" type="email" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-primary">Service Interest</label>
              <select className="bg-background border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary outline-none appearance-none">
                <option>Cosmetic Smile Design</option>
                <option>Invisalign Orthodontics</option>
                <option>Dental Implants</option>
                <option>General Checkup</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-primary">Your Message</label>
              <textarea className="bg-background border-none rounded-2xl p-4 focus:ring-2 focus:ring-secondary outline-none" placeholder="Tell us about your goals..." rows={4}></textarea>
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all">Request Callback</button>
          </form>
        </div>
        <div className="flex flex-col gap-8">
          <div className="rounded-[32px] overflow-hidden h-[300px] shadow-lg relative group">
            <img 
              src="https://source.unsplash.com/1200x900/?clinic,interior" 
              alt="Map Location" 
              className="w-full h-full object-cover grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-4 rounded-full shadow-2xl animate-pulse text-secondary">
                <MapPin size={32} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Phone size={20} />, label: "Phone", value: "090986 19197" },
              { icon: <Mail size={20} />, label: "Email", value: "" },
              { icon: <MapPin size={20} />, label: "Studio", value: "Laxmi Plaza Complex, 20-C, Indrapuri Colony Main Rd, Bhawarkuan Square, Indore, Madhya Pradesh 452001" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm text-center flex flex-col items-center">
                <span className="text-secondary mb-3">{item.icon}</span>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary pt-20 pb-10 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <span className="font-serif text-2xl">The Clinical <span className="italic text-secondary">Atelier</span></span>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">Redefining clinical standards through precision, art, and patient-first philosophy since 2012.</p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-secondary transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-secondary font-bold tracking-widest uppercase text-xs mb-8">Navigation</h4>
          <ul className="space-y-4">
            {['Our Specialists', 'The Studio Philosophy', 'Smile Gallery', 'Refer a Patient'].map((item) => (
              <li key={item}><a href="#" className="text-white/70 hover:text-secondary text-sm transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-secondary font-bold tracking-widest uppercase text-xs mb-8">Patient Care</h4>
          <ul className="space-y-4">
            {['Patient Portal', 'First Visit Guide', 'Insurance & Financing', 'Privacy Policy'].map((item) => (
              <li key={item}><a href="#" className="text-white/70 hover:text-secondary text-sm transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-secondary font-bold tracking-widest uppercase text-xs mb-8">Newsletter</h4>
          <p className="text-sm text-white/60 mb-6 italic">Insights on longevity and oral health aesthetics.</p>
          <div className="relative">
            <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-secondary outline-none" placeholder="Your email" type="email" />
            <button className="absolute right-2 top-2 bottom-2 bg-secondary px-3 rounded-lg flex items-center justify-center">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-20 border-t border-white/5 pt-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <p className="text-xs text-white/40">© 2024 Aishwary Dental Clinic. Precision in Healing.</p>
        <div className="flex gap-8 text-xs text-white/40 uppercase tracking-widest">
          <a href="#" className="hover:text-secondary">Terms</a>
          <a href="#" className="hover:text-secondary">Privacy</a>
          <a href="#" className="hover:text-secondary">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background selection:bg-accent selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
