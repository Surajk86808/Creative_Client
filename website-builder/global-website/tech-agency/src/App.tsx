/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Sun, 
  Wrench, 
  CheckCircle, 
  Cpu, 
  RefreshCw, 
  Shield, 
  MapPin, 
  Phone, 
  Share2, 
  Globe, 
  Terminal, 
  Zap, 
  ArrowRight, 
  Quote,
  Menu
} from "lucide-react";

export default function App() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-secondary/30">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0E17]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold tracking-widest text-white font-headline">[[SHOP_NAME]]</span>
          <span className="text-2xl font-bold tracking-widest text-secondary font-headline"></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold font-headline transition-transform active:scale-95 hover:bg-primary-container/90">
            CONNECT
          </button>
          <Menu className="text-white cursor-pointer w-6 h-6" />
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col justify-center px-6 py-12 circuit-bg overflow-hidden">
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10 max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-8 bg-secondary"></div>
              <span className="text-secondary font-headline font-bold text-sm tracking-[0.2em] uppercase">Engineered for Excellence</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-headline font-bold leading-tight mb-6 text-gradient"
            >
              [[SHOP_NAME]]
            </motion.h1>
            
            <motion.p 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant font-light text-lg mb-8 leading-relaxed"
            >
              [[TAGLINE]]
            </motion.p>
            
            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:row gap-4 mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-primary-container text-white px-8 py-4 rounded-lg font-headline font-bold flex items-center justify-center gap-2 group transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  Inquire Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="border border-secondary/20 text-secondary px-8 py-4 rounded-lg font-headline font-bold hover:bg-secondary/5 transition-colors">
                  View Projects
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 gap-4"
            >
              <motion.div variants={fadeIn} className="bg-surface-container-low p-6 rounded-lg border-t-2 border-secondary">
                <div className="text-3xl font-headline font-bold text-white mb-1">99.9%</div>
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Uptime Reliability</div>
              </motion.div>
              <motion.div variants={fadeIn} className="bg-surface-container-low p-6 rounded-lg border-t-2 border-secondary">
                <div className="text-3xl font-headline font-bold text-white mb-1">150+</div>
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Active Nodes</div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-surface-dim px-6 py-20">
          <div className="mb-12">
            <h2 className="text-2xl font-headline font-bold text-white mb-2 uppercase tracking-tight">Core Solutions</h2>
            <div className="h-1 w-12 bg-secondary"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                id: "01", 
                title: "[[SERVICE_1]]", 
                desc: "Enterprise-grade CCTV surveillance with neural network analytics and real-time biometric detection.",
                icon: <ShieldCheck className="text-secondary w-10 h-10" />
              },
              { 
                id: "02", 
                title: "[[SERVICE_2]]", 
                desc: "High-efficiency photovoltaic systems designed for zero-interruption power delivery and grid independence.",
                icon: <Sun className="text-secondary w-10 h-10" />
              },
              { 
                id: "03", 
                title: "[[SERVICE_3]]", 
                desc: "Precision component-level diagnostics and restoration of critical telecommunications and computing infrastructure.",
                icon: <Wrench className="text-secondary w-10 h-10" />
              }
            ].map((service) => (
              <motion.div 
                key={service.id}
                whileHover={{ y: -5 }}
                className="bg-surface-container p-8 rounded-lg border-t-2 border-secondary group hover:bg-surface-container-high transition-colors"
              >
                <div className="mb-6 flex justify-between items-start">
                  {service.icon}
                  <span className="text-outline-variant font-headline font-bold text-xl">{service.id}</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-white mb-3">{service.title}</h3>
                <p className="text-on-surface-variant font-light text-sm leading-relaxed mb-6">
                  {service.desc}
                </p>
                <div className="h-[1px] w-full bg-outline-variant/30"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="px-6 py-20 flex flex-col lg:flex-row gap-12 items-center">
          <div className="relative rounded-xl overflow-hidden aspect-video w-full lg:w-1/2">
            <img 
              alt="Technical Lab" 
              className="w-full h-full object-cover" 
              src="[[HERO_IMAGE_URL]]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
            <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-lg border border-outline-variant/20">
              <p className="text-[10px] font-label text-secondary uppercase tracking-[0.3em]">Operational Protocol</p>
              <p className="text-xs text-white font-medium">[[TAGLINE]]</p>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-headline font-bold text-white mb-6 leading-tight">Advanced Technical Governance</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              At [[SHOP_NAME]], we operate at the intersection of traditional engineering and future-state digital architecture. Our methodology prioritizes structural integrity and information security.
            </p>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              {[
                { icon: <CheckCircle className="text-secondary w-5 h-5" />, label: "Certified Technicians" },
                { icon: <Cpu className="text-secondary w-5 h-5" />, label: "OEM Components" },
                { icon: <RefreshCw className="text-secondary w-5 h-5" />, label: "24/7 Monitoring" },
                { icon: <Shield className="text-secondary w-5 h-5" />, label: "Secure Chain" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {item.icon}
                  <span className="text-xs font-label uppercase text-white tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-surface-container-low px-6 py-20 overflow-hidden">
          <h2 className="text-2xl font-headline font-bold text-white mb-16 text-center uppercase tracking-widest">Protocol Execution</h2>
          <div className="relative flex flex-col gap-20 max-w-2xl mx-auto">
            <div className="absolute left-6 top-10 bottom-10 w-[1px] border-l border-dashed border-secondary/30"></div>
            
            {[
              { step: 1, title: "Systems Analysis", desc: "Comprehensive site audit and risk assessment identifying infrastructure vulnerabilities." },
              { step: 2, title: "Strategic Deployment", desc: "Implementation of hardware arrays with minimal operational downtime and maximum coverage." },
              { step: 3, title: "Continuous Optimization", desc: "Ongoing maintenance cycles and performance tuning for long-term technical sustainability." }
            ].map((item) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex gap-8"
              >
                <div className="relative z-10 w-12 h-12 shrink-0 bg-background border-2 border-secondary rounded-full flex items-center justify-center text-secondary font-headline font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-white font-headline font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-on-surface-variant text-sm font-light">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dynamic Stats Section */}
        <section className="bg-secondary-container px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-center">
            <div>
              <div className="text-5xl font-headline font-bold text-background mb-2">500+</div>
              <div className="text-background/70 font-label uppercase tracking-widest text-xs font-bold">Complex Projects</div>
            </div>
            <div>
              <div className="text-5xl font-headline font-bold text-background mb-2">24/7</div>
              <div className="text-background/70 font-label uppercase tracking-widest text-xs font-bold">Technical Support</div>
            </div>
            <div>
              <div className="text-5xl font-headline font-bold text-background mb-2">12MW</div>
              <div className="text-background/70 font-label uppercase tracking-widest text-xs font-bold">Solar Capacity</div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-20 bg-surface-dim">
          <h2 className="text-2xl font-headline font-bold text-white mb-12 uppercase text-center tracking-tight italic">Technical Validation</h2>
          <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
            {[
              { 
                initials: "RJ", 
                name: "Robert Jensen", 
                role: "CTO, Nexus Logistics", 
                quote: "The integration of their smart surveillance systems transformed our logistics hub's safety protocol. Impeccable technical execution." 
              },
              { 
                initials: "SL", 
                name: "Sarah Lim", 
                role: "Facilities Director, GreenPort", 
                quote: "Reliable, precise, and professional. Their solar arrays have cut our operational energy costs by 40% in the first quarter alone." 
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-8 rounded-lg flex-1">
                <Quote className="text-secondary mb-4 w-8 h-8" />
                <p className="text-on-surface-variant font-light italic text-sm leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center font-headline font-bold text-secondary text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-outline text-[10px] uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-6 py-20 flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/10 flex-1">
            <h2 className="text-2xl font-headline font-bold text-white mb-8">Request Technical Specs</h2>
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase mb-2">Operational Identifier</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-white placeholder:text-outline focus:ring-1 focus:ring-secondary transition-shadow outline-none" 
                  placeholder="Full Name" 
                  type="text"
                />
              </div>
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase mb-2">Comm Channel</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-white placeholder:text-outline focus:ring-1 focus:ring-secondary transition-shadow outline-none" 
                  placeholder="[[EMAIL]]" 
                  type="email"
                />
              </div>
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase mb-2">Requirement Protocol</label>
                <textarea 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-white placeholder:text-outline focus:ring-1 focus:ring-secondary transition-shadow outline-none" 
                  placeholder="Brief project description..." 
                  rows={4}
                ></textarea>
              </div>
              <button className="w-full bg-primary-container text-white py-4 rounded-lg font-headline font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-colors">
                Initiate Protocol
              </button>
            </form>
          </div>
          
          <div className="flex flex-col gap-8 flex-1">
            <div className="flex items-start gap-4">
              <div className="bg-surface-container p-3 rounded-lg">
                <MapPin className="text-secondary w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Central Operations</p>
                <p className="text-on-surface-variant text-xs font-light">[[ADDRESS]]</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-surface-container p-3 rounded-lg">
                <Phone className="text-secondary w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Direct Uplink</p>
                <p className="text-on-surface-variant text-xs font-light">[[PHONE]]</p>
              </div>
            </div>
            <div className="w-full h-64 bg-surface-container-highest rounded-xl overflow-hidden grayscale opacity-60 relative">
              <img 
                alt="Location Map" 
                className="w-full h-full object-cover" 
                src="[[IMAGE_1]]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-secondary/10 pointer-events-none"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E17] py-16 px-6 flex flex-col gap-12 border-t border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto w-full">
          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-6">
              <span className="text-lg font-bold text-white font-headline">[[SHOP_NAME]]</span>
              <span className="text-lg font-bold text-secondary font-headline"></span>
            </div>
            <p className="text-gray-500 font-light text-xs leading-relaxed max-w-xs">
              Architecting high-availability infrastructure for the modern digital era. Quality engineered, precision installed.
            </p>
          </div>
          
          <div>
            <h5 className="font-headline font-semibold text-secondary uppercase text-xs tracking-widest mb-4">Solutions</h5>
            <ul className="flex flex-col gap-3">
              {["Smart Security", "Solar Integration", "Hardware Repair", "Cloud Backup"].map(item => (
                <li key={item}><a className="text-gray-500 text-xs font-light hover:text-white transition-colors" href="#">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-headline font-semibold text-secondary uppercase text-xs tracking-widest mb-4">Resources</h5>
            <ul className="flex flex-col gap-3">
              {["Compliance", "Global Support", "Documentation", "Privacy Policy"].map(item => (
                <li key={item}><a className="text-gray-500 text-xs font-light hover:text-white transition-colors" href="#">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-headline font-semibold text-secondary uppercase text-xs tracking-widest mb-6">Global Network</h5>
            <div className="flex gap-4">
              {[Share2, Globe, Terminal].map((Icon, idx) => (
                <div key={idx} className="w-10 h-10 border border-outline-variant/20 rounded-full flex items-center justify-center group hover:bg-secondary/10 hover:border-secondary transition-colors cursor-pointer">
                  <Icon className="text-gray-500 group-hover:text-secondary w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-outline-variant/5">
          <p className="text-[10px] font-label text-gray-600 text-center tracking-[0.2em]">© 2024 [[SHOP_NAME]]. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button className="w-14 h-14 bg-secondary text-background rounded-full shadow-[0_0_20px_rgba(93,230,255,0.4)] flex items-center justify-center transition-all hover:shadow-[0_0_30px_rgba(93,230,255,0.6)]">
          <Zap className="w-6 h-6 fill-current" />
        </button>
      </motion.div>
    </div>
  );
}
