/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Calendar, 
  ArrowRight, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Droplets, 
  Thermometer,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className={`text-2xl font-black tracking-tighter uppercase ${isScrolled ? 'text-primary' : 'text-white'}`}>
          ActiveREHAB Physiotherapy Clinic
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Services', 'Project Gallery', 'About Us', 'Reviews', 'Careers'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className={`text-sm font-semibold transition-colors hover:text-secondary-container ${isScrolled ? 'text-on-surface-variant' : 'text-white/80'}`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block bg-secondary-container hover:bg-secondary-container/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95">
            Request Quote
          </button>
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className={isScrolled ? 'text-primary' : 'text-white'} /> : <Menu className={isScrolled ? 'text-primary' : 'text-white'} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-surface-container md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {['Services', 'Project Gallery', 'About Us', 'Reviews', 'Careers'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-lg font-bold text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button className="w-full bg-secondary-container text-white py-4 rounded-xl font-bold mt-4">
                Request Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative hero-gradient min-h-[90vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://source.unsplash.com/2000x1200/?chiropractor,business" 
          alt="Industrial blueprints" 
          className="w-full h-full object-cover mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 py-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm w-fit mb-8 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 mr-2 text-secondary-container" />
            Licensed · Insured · Same-Day Service
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
            Repairs Done <span className="text-secondary-container">Right</span>.<br />Every Single Time.
          </h1>
          
          <p className="text-white/70 text-lg md:text-xl font-light mb-10 max-w-xl leading-relaxed">Trusted chiropractor in Noida</p>
          
          <div className="flex flex-wrap gap-4">
            <button className="bg-secondary-container text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary-container/90 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20">
              Schedule Service <Calendar className="w-5 h-5" />
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm">
              View Projects
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:col-span-5 lg:flex items-center justify-center"
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
            <h3 className="text-primary font-bold text-xl mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-secondary" /> Daily Reliability Metrics
            </h3>
            
            <div className="space-y-8">
              {[
                { label: 'On-Time Arrival', value: '99.4%', status: 'Target Met' },
                { label: 'Client Satisfaction', value: '4.9/5', status: 'Verified' },
                { label: 'First-Visit Fix', value: '92%', status: 'Industry Lead' },
                { label: 'Active Teams', value: '24 Units', status: 'Deployment' }
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-surface-container pb-4 last:border-0 last:pb-0">
                  <span className="text-on-surface-variant font-medium">{stat.label}</span>
                  <div className="text-right">
                    <div className="font-black text-primary text-xl">{stat.value}</div>
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {stat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const EmergencyBanner = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 via-secondary-container to-red-700 py-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
        <span className="text-white font-bold text-lg md:text-xl flex items-center gap-3 animate-pulse">
          <Zap className="w-6 h-6 fill-white" /> 
          24/7 EMERGENCY SERVICE AVAILABLE
        </span>
        <button className="bg-white text-primary font-black px-8 py-2.5 rounded-xl hover:scale-105 transition-transform text-sm uppercase tracking-widest shadow-lg">
          Call 098088 81883
        </button>
      </div>
    </div>
  );
};

const Services = () => {
  const services = [
    {
      title: 'Consultation',
      desc: 'Full panel upgrades, rewiring, and smart home integration performed with precision planning.',
      icon: <Zap className="w-10 h-10 text-secondary-container" />,
    },
    {
      title: 'Service & support',
      desc: 'From leak detection to full-scale commercial pipe networks. High-pressure solutions for every infrastructure.',
      icon: <Droplets className="w-10 h-10 text-secondary-container" />,
    },
    {
      title: 'Custom solutions',
      desc: 'Seasonal maintenance and emergency AC repair. Optimized air flow systems for maximum efficiency.',
      icon: <Thermometer className="w-10 h-10 text-secondary-container" />,
    }
  ];

  return (
    <section id="services" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight">Precision Services</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Engineering-grade solutions for your home and business. Every technician is certified to ActiveREHAB Physiotherapy Clinic standards.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-2xl border-l-8 border-secondary-container shadow-sm hover:shadow-xl transition-all flex flex-col h-full group"
            >
              <div className="mb-8">{service.icon}</div>
              <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-secondary-container transition-colors">
                {service.title}
              </h3>
              <p className="text-on-surface-variant font-light leading-relaxed mb-10">
                {service.desc}
              </p>
              <a href="#" className="mt-auto flex items-center gap-2 text-secondary-container font-bold hover:gap-4 transition-all">
                Get Quote <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Workflow = () => {
  return (
    <section className="py-32 bg-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-white text-4xl md:text-5xl font-black text-center mb-24 tracking-tight">The Blueprint Workflow</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {[
            { step: '1', title: 'Call or Book Online', desc: 'Instant scheduling with our digital concierge or live technical dispatchers.', rotate: '-rotate-3' },
            { step: '2', title: 'We Visit & Quote', desc: 'Expert technicians arrive on-site for a comprehensive diagnostic and flat-rate quote.', rotate: 'rotate-0' },
            { step: '3', title: 'Done Right.', desc: 'Precision execution with a 100% satisfaction guarantee on all labor and parts.', rotate: 'rotate-3' }
          ].map((item, idx) => (
            <div key={idx} className="relative text-center lg:text-left">
              <div className={`w-20 h-20 bg-secondary-container text-white text-4xl font-black flex items-center justify-center rounded-2xl mx-auto lg:mx-0 mb-10 transform ${item.rotate} shadow-xl`}>
                {item.step}
              </div>
              <h3 className="text-white text-2xl font-bold mb-6">{item.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  return (
    <section className="py-24 bg-white border-y border-surface-container">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
        {[
          { value: '15k+', label: 'Projects Completed' },
          { value: '24h', label: 'Emergency Response' },
          { value: '100%', label: 'Certified Staff' },
          { value: '10yr', label: 'Labor Guarantee' }
        ].map((stat, idx) => (
          <div key={idx}>
            <div className="text-5xl font-black text-secondary-container mb-3">{stat.value}</div>
            <div className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      text: '"Blueprint Pro handled our complex electrical overhaul with the precision of an engineering firm. Truly impressive attention to detail."',
      author: 'Jonathan Sterling',
      role: 'Homeowner in Dallas',
      initials: 'JS'
    },
    {
      text: '"The emergency team arrived within 40 minutes of our call. They saved our basement from a catastrophic flood. Absolute heroes."',
      author: 'Maria Alverez',
      role: 'Estate Manager',
      initials: 'MA'
    },
    {
      text: '"Finally, a contractor that understands deadlines and architectural specs. Their commercial HVAC team is top-tier."',
      author: 'Robert Kincaid',
      role: 'Developer',
      initials: 'RK'
    }
  ];

  return (
    <section id="reviews" className="py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black text-primary text-center mb-20 tracking-tight">Trusted by Professionals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-2xl border-t-4 border-secondary-container shadow-sm flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary-container text-secondary-container" />)}
              </div>
              <p className="text-on-surface-variant italic font-light leading-relaxed mb-10 text-lg">
                {review.text}
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">
                  {review.initials}
                </div>
                <div>
                  <div className="font-bold text-primary">{review.author}</div>
                  <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                    {review.role}
                  </div>
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
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight">ActiveREHAB Physiotherapy Clinic: Your Next Project</h2>
          <p className="text-on-surface-variant mb-12 text-lg">ActiveREHAB Physiotherapy Clinic provides professional chiropractor services for customers in Spring meadows, Society Market, near Nirala Estate, Techzone 4, Patwari, Grea.... We focus on quality, clear communication, and great results. Call 098088 81883 to get started.</p>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                className="w-full bg-surface-container-low border-none rounded-xl p-5 focus:ring-2 focus:ring-secondary-container transition-all outline-none" 
                placeholder="Full Name" 
                type="text"
              />
              <input 
                className="w-full bg-surface-container-low border-none rounded-xl p-5 focus:ring-2 focus:ring-secondary-container transition-all outline-none" 
                placeholder="" 
                type="email"
              />
            </div>
            <select className="w-full bg-surface-container-low border-none rounded-xl p-5 focus:ring-2 focus:ring-secondary-container transition-all outline-none appearance-none">
              <option>Select Service Category</option>
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>HVAC</option>
            </select>
            <textarea 
              className="w-full bg-surface-container-low border-none rounded-xl p-5 focus:ring-2 focus:ring-secondary-container transition-all outline-none" 
              placeholder="Tell us about your requirements..." 
              rows={4}
            ></textarea>
            <button className="w-full bg-secondary-container text-white font-black py-5 rounded-xl text-lg hover:bg-secondary-container/90 transition-all shadow-xl shadow-orange-500/20">
              Request Technical Quote
            </button>
          </form>
        </div>
        
        <div className="space-y-10">
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <img 
              src="https://source.unsplash.com/1200x900/?chiropractor,interior" 
              alt="Dallas Map" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-6 p-8 bg-surface-container-low rounded-2xl">
              <MapPin className="w-8 h-8 text-secondary-container shrink-0" />
              <div>
                <h4 className="font-bold text-primary text-xl mb-2">Headquarters</h4>
                <p className="text-on-surface-variant leading-relaxed">
                  Spring meadows, Society Market, near Nirala Estate, Techzone 4, Patwari, Greater Noida, Uttar Pradesh 201318
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-8 bg-surface-container-low rounded-2xl">
              <Phone className="w-8 h-8 text-secondary-container shrink-0" />
              <div>
                <h4 className="font-bold text-primary text-xl mb-2">Emergency Technical Line</h4>
                <p className="text-on-surface-variant leading-relaxed">
                  098088 81883 · 24/7 Availability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        <div className="col-span-1 lg:col-span-1">
          <span className="text-3xl font-black text-white mb-8 block uppercase tracking-tighter">ActiveREHAB Physiotherapy Clinic</span>
          <p className="text-white/50 font-light leading-relaxed mb-8">
            Defining the next generation of trade services through engineering excellence and radical transparency.
          </p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-secondary-container transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-secondary-container font-black uppercase tracking-widest text-sm mb-8">Primary Services</h4>
          <ul className="space-y-4">
            {['Emergency Service', 'Residential Plumbing', 'Commercial Electrical', 'HVAC Solutions'].map(item => (
              <li key={item}><a href="#" className="text-white/60 hover:text-white transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-secondary-container font-black uppercase tracking-widest text-sm mb-8">Company</h4>
          <ul className="space-y-4">
            {['Maintenance Plans', 'Project Gallery', 'Privacy Policy', 'Terms of Service'].map(item => (
              <li key={item}><a href="#" className="text-white/60 hover:text-white transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-secondary-container font-black uppercase tracking-widest text-sm mb-8">Newsletter</h4>
          <p className="text-white/50 text-sm mb-6">Subscribe to technical updates and seasonal maintenance tips.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-secondary-container"
            />
            <button className="bg-secondary-container px-6 rounded-xl font-bold text-sm">Join</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/40 text-sm font-light">
          © 2024 Blueprint Master Trades. Precision Engineering in Every Repair.
        </p>
        <div className="flex gap-8 text-xs text-white/30">
          <a href="#" className="hover:text-white">Sitemap</a>
          <a href="#" className="hover:text-white">Accessibility</a>
          <a href="#" className="hover:text-white">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-secondary-container selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <EmergencyBanner />
        <Services />
        <Workflow />
        <Stats />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
