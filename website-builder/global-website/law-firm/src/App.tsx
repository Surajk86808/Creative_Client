import { motion } from "motion/react";
import { 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Banknote, 
  ShieldCheck, 
  Briefcase, 
  Star, 
  Share2, 
  Mail, 
  Lock,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-on-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline/10 px-6 md:px-12 py-4 md:py-6 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-black text-primary font-serif italic">
          [[SHOP_NAME]]
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {["Practice Areas", "Our Partners", "Insights", "Contact"].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-slate-400 font-serif font-bold text-lg tracking-tight hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-6 md:px-8 py-2 md:py-3 bg-transparent border border-primary text-primary font-sans uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary hover:text-on-primary transition-all duration-300 active:scale-95">
            Free Consultation
          </button>
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-background border-b border-outline/20 p-6 flex flex-col gap-4 md:hidden"
          >
            {["Practice Areas", "Our Partners", "Insights", "Contact"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-slate-400 font-serif font-bold text-lg tracking-tight"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="w-full py-3 bg-primary text-on-primary font-sans uppercase tracking-widest text-xs font-bold">
              Free Consultation
            </button>
          </motion.div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center px-6 md:px-12 overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
              <img 
                alt="Luxury law firm interior" 
                className="w-full h-full object-cover opacity-30 grayscale brightness-[0.18] saturate-[0.8]" 
                src="[[HERO_IMAGE_URL]]"
                referrerPolicy="no-referrer"
              />
            <div className="absolute inset-0 hero-overlay"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="mb-8 flex items-center gap-4"
            >
              <span className="text-primary font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase bg-surface px-4 py-2 border border-outline/20">
                LONDON Â· EST. 1984
              </span>
              <div className="h-[1px] w-12 md:w-24 bg-primary/40"></div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="serif-title text-4xl sm:text-6xl md:text-[84px] leading-[1.1] font-bold mb-10 max-w-4xl tracking-tight"
            >
              Preserving Legacy through <br/>
              <span className="italic text-primary">Absolute Authority.</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-wrap gap-4 md:gap-6 items-center mt-12"
            >
              <button className="gold-gradient px-8 md:px-10 py-4 md:py-5 text-on-primary font-sans font-bold uppercase tracking-widest text-xs md:text-sm flex items-center gap-3 hover:brightness-110 transition-all active:scale-95">
                <Phone size={18} />
                Free Consultation
              </button>
              <button className="px-8 md:px-10 py-4 md:py-5 border border-outline text-slate-200 font-sans uppercase tracking-widest text-xs md:text-sm hover:border-primary transition-all active:scale-95">
                Our Strategy
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="whileInView"
              className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: "Assets Protected", value: "$4.2B+" },
                { label: "Cases Won", value: "1,400+" },
                { label: "Retention Rate", value: "98%" },
                { label: "Concierge Service", value: "24/7" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={fadeIn}
                  className="border-l border-primary/30 pl-6 py-2"
                >
                  <div className="text-2xl md:text-3xl font-bold serif-title text-primary">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-sans mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Practice Areas Section */}
        <section id="practice-areas" className="py-24 md:py-32 px-6 md:px-12 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div 
                {...fadeIn}
                className="max-w-2xl"
              >
                <span className="text-primary font-sans text-xs tracking-widest uppercase block mb-4">Precision Jurisprudence</span>
                <h2 className="serif-title text-4xl md:text-5xl font-bold">Unrivaled Expertise in High-Stakes Environments.</h2>
              </motion.div>
              <a href="#" className="text-primary font-sans text-sm uppercase tracking-widest border-b border-primary/30 pb-2 hover:border-primary transition-all">
                View All Practices â†’
              </a>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-outline/20"
            >
              {[
                {
                  icon: <Banknote className="text-primary" size={40} />,
                  title: "[[SERVICE_1]]",
                  desc: "Discreet and complex jurisdictional strategies designed for the preservation of multi-generational capital."
                },
                {
                  icon: <ShieldCheck className="text-primary" size={40} />,
                  title: "[[SERVICE_2]]",
                  desc: "Defending personal and corporate autonomy through aggressive, precedent-setting legal representation."
                },
                {
                  icon: <Briefcase className="text-primary" size={40} />,
                  title: "[[SERVICE_3]]",
                  desc: "Architecting high-value acquisitions and divestitures with surgical precision and absolute confidentiality."
                }
              ].map((area, i) => (
                <motion.div 
                  key={i}
                  variants={fadeIn}
                  className="group relative bg-surface p-8 md:p-12 border-r border-b md:border-b-0 border-outline/20 hover:bg-surface-high transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="mb-8 block">{area.icon}</div>
                  <h3 className="serif-title text-2xl mb-4">{area.title}</h3>
                  <p className="text-slate-400 font-sans leading-relaxed mb-8">{area.desc}</p>
                  <a href="#" className="text-primary font-sans text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Learn More <ArrowRight size={14} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="our-partners" className="py-24 md:py-32 px-6 md:px-12 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="md:col-span-5 relative"
            >
              <img 
                alt="Senior Partner" 
                className="grayscale brightness-75 w-full aspect-[4/5] object-cover" 
                src="[[IMAGE_1]]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 bg-primary p-8 md:p-12 hidden md:block">
                <div className="text-4xl font-bold serif-title text-on-primary">40+</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-on-primary font-bold">Years of Precedent</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="md:col-span-7 md:pl-12"
            >
              <span className="text-primary font-sans text-xs tracking-widest uppercase block mb-6">Our Philosophy</span>
              <h2 className="serif-title text-4xl md:text-5xl font-bold mb-10 leading-tight">
                Beyond Legal Advice: We are the Architects of Your <span className="italic text-primary">Sovereignty.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">[[TAGLINE]]</p>
              <ul className="space-y-6 mb-12">
                {[
                  "Strictly capped client list ensures immediate accessibility.",
                  "No-conflict policy in all major financial centers.",
                  "Bespoke cross-border strategies for global residents."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="text-primary shrink-0" size={20} />
                    <span className="text-slate-200 font-sans font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="px-10 py-5 border border-primary/30 text-primary font-sans uppercase tracking-widest text-xs hover:bg-primary hover:text-on-primary transition-all">
                Read Our Manifesto
              </button>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 md:py-32 px-6 md:px-12 bg-surface">
          <div className="max-w-7xl mx-auto text-center mb-24">
            <span className="text-primary font-sans text-xs tracking-widest uppercase block mb-4">Operational Protocol</span>
            <h2 className="serif-title text-4xl md:text-5xl font-bold">The Engagement Lifecycle</h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-outline/30 z-0"></div>
            {[
              {
                step: "01",
                title: "Discovery",
                desc: "Deep analysis of current assets, legal exposure, and long-term objectives under strict NDA."
              },
              {
                step: "02",
                title: "Architecting",
                desc: "Development of a bespoke structural framework, balancing protection with tactical liquidity.",
                active: true
              },
              {
                step: "03",
                title: "Enforcement",
                desc: "Ongoing active management and aggressive defense of the established legacy structure."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 font-serif text-2xl font-bold transition-all duration-500 ${
                  item.active 
                  ? "bg-primary text-on-primary shadow-[0_0_40px_rgba(232,193,120,0.3)]" 
                  : "bg-surface border-2 border-primary text-primary"
                }`}>
                  {item.step}
                </div>
                <h3 className="serif-title text-xl mb-4">{item.title}</h3>
                <p className="text-slate-400 font-sans text-sm leading-relaxed px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32 px-6 md:px-12 bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "In the world of high-value litigation, many talk about authorityâ€”Sovereign Authority embodies it. Their discretion is unmatched.",
                author: "Managing Director",
                firm: "Global Equity Partners"
              },
              {
                quote: "They didn't just win our case; they restructured our entire global presence to ensure we never have to step foot in a courtroom again.",
                author: "CEO & Founder",
                firm: "Technology Syndicate Inc."
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                className="bg-surface p-8 md:p-12 border-l-4 border-primary"
              >
                <div className="flex gap-1 mb-8 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="serif-title text-xl md:text-2xl italic leading-relaxed mb-8">"{t.quote}"</p>
                <div>
                  <div className="font-bold uppercase tracking-widest text-xs text-slate-200">{t.author}</div>
                  <div className="text-primary text-[10px] uppercase tracking-widest mt-1">{t.firm}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 md:py-32 px-6 md:px-12 bg-surface">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <motion.div {...fadeIn}>
              <span className="text-primary font-sans text-xs tracking-widest uppercase block mb-6">Confidential Inquiry</span>
              <h2 className="serif-title text-4xl md:text-5xl font-bold mb-8">Secure a Private Consultation.</h2>
              <p className="text-slate-400 mb-12">Every communication is protected by absolute attorney-client privilege. We respond within 4 business hours to all qualified inquiries.</p>
              
              <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Name</label>
                    <input 
                      className="w-full bg-transparent border-0 border-b border-outline p-0 pb-4 text-slate-200 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700" 
                      placeholder="Alexander Hamilton" 
                      type="text"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Entity / Firm</label>
                    <input 
                      className="w-full bg-transparent border-0 border-b border-outline p-0 pb-4 text-slate-200 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700" 
                      placeholder="Optional" 
                      type="text"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Subject of Inquiry</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline p-0 pb-4 text-slate-200 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700" 
                    placeholder="Practice Area or Case Focus" 
                    type="text"
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Message</label>
                  <textarea 
                    className="w-full bg-transparent border-0 border-b border-outline p-0 pb-4 text-slate-200 focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700" 
                    placeholder="Describe the scope of your requirements..." 
                    rows={4}
                  ></textarea>
                </div>
                <button className="gold-gradient w-full py-5 text-on-primary font-sans font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-[0.98]">
                  Dispatch Secure Request
                </button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">[[ABOUT_TEXT]]</p>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="h-96 w-full relative grayscale contrast-125 overflow-hidden">
                <img 
                  alt="Location Map" 
                  className="w-full h-full object-cover brightness-50" 
                  src="[[IMAGE_2]]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface p-8 border border-outline/10">
                  <h4 className="text-primary font-sans text-xs uppercase tracking-widest mb-4">London HQ</h4>
                  <p className="text-slate-300 font-sans leading-relaxed text-sm">
                    [[ADDRESS]]
                  </p>
                </div>
                <div className="bg-surface p-8 border border-outline/10">
                  <h4 className="text-primary font-sans text-xs uppercase tracking-widest mb-4">Direct Contact</h4>
                  <p className="text-slate-300 font-sans leading-relaxed text-sm">
                    [[PHONE]]<br/>
                    [[EMAIL]]<br/>
                    PGP Key: 0x8F92...
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-outline/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1">
            <div className="text-xl font-bold text-primary font-serif mb-6">[[SHOP_NAME]]</div>
            <p className="text-slate-500 font-sans text-xs leading-relaxed max-w-xs">
              A private office providing uncompromising legal and financial defense for the global elite.
            </p>
          </div>
          
          <div>
            <h5 className="text-primary font-sans uppercase tracking-widest text-xs mb-6 font-bold">Services</h5>
            <ul className="space-y-4">
              {["Wealth Strategy", "Risk Mitigation", "Estate Planning", "Litigation"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-500 font-sans uppercase tracking-widest text-[10px] hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-primary font-sans uppercase tracking-widest text-xs mb-6 font-bold">Connect</h5>
            <div className="flex gap-4">
              {[Share2, Mail, Lock].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-outline/40 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-primary font-sans uppercase tracking-widest text-xs mb-6 font-bold">Regulatory</h5>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Disclaimer"].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-500 font-sans uppercase tracking-widest text-[10px] hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-outline/10 py-8 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-sans uppercase tracking-widest text-[10px]">
            <p>Â© 2024 [[SHOP_NAME]]. All rights reserved. Confidentiality Guaranteed.</p>
            <p>Licensed under SRA Authority #982245</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
