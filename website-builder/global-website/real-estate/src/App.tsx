/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Menu, 
  ArrowRight, 
  ChevronsDown, 
  Star, 
  Globe, 
  Share2, 
  Mail,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";

const properties = [
  {
    id: 1,
    title: "[[SERVICE_1]]",
    location: "Zurich, Switzerland",
    strategy: "High Yield Core",
    image: "[[ITEM_IMAGE_1]]",
  },
  {
    id: 2,
    title: "[[SERVICE_2]]",
    location: "Dubai, UAE",
    strategy: "Appreciation Growth",
    image: "[[ITEM_IMAGE_2]]",
  },
  {
    id: 3,
    title: "[[SERVICE_3]]",
    location: "Malibu, USA",
    strategy: "Legacy Asset",
    image: "[[ITEM_IMAGE_3]]",
  },
];

const stats = [
  { label: "Years of Heritage", value: "15+" },
  { label: "Assets Managed", value: "$2B+" },
  { label: "Global Awards", value: "42" },
  { label: "Commitment", value: "100%" },
];

const steps = [
  {
    id: "01",
    title: "Curated Consultation",
    description: "A private briefing to understand your portfolio requirements and aesthetic leanings.",
  },
  {
    id: "02",
    title: "Site Immersion",
    description: "Private viewings curated at times that highlight the property's natural light and atmosphere.",
  },
  {
    id: "03",
    title: "Seamless Acquisition",
    description: "White-glove legal and financial orchestration for a frictionless transition of title.",
  },
];

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 transition-all duration-500 ${
          isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-primary/15" : "bg-transparent"
        }`}
      >
        <div className="text-xl md:text-2xl font-headline italic text-primary">[[SHOP_NAME]]</div>
        <div className="flex items-center gap-4 md:gap-8">
          <button className="hidden lg:block text-on-surface hover:text-primary transition-colors duration-300 font-medium uppercase tracking-widest text-[10px]">Portfolio</button>
          <button className="text-primary border border-primary/40 px-4 md:px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all active:scale-95">
            Book Viewing
          </button>
          <Menu className="text-primary cursor-pointer w-6 h-6" />
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Luxury skyscraper" 
              className="w-full h-full object-cover brightness-[0.3]" 
              src="[[HERO_IMAGE_URL]]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 gold-glow"></div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 max-w-4xl"
          >
            <h1 className="text-5xl md:text-8xl font-headline leading-tight text-on-surface mb-6">
              The <span className="italic text-primary font-bold">Modern</span> Estate
            </h1>
            <p className="text-lg md:text-2xl font-light text-on-surface-variant mb-10 tracking-wide max-w-2xl mx-auto">[[TAGLINE]]</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="gold-gradient-cta text-background font-bold py-4 px-10 rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-2xl uppercase tracking-widest text-xs">
                Explore Portfolio
              </button>
              <button className="border border-primary/40 text-primary font-bold py-4 px-10 rounded-lg hover:bg-primary/5 transition-all uppercase tracking-widest text-xs">
                View Strategy
              </button>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-40"
          >
            <ChevronsDown className="text-primary w-8 h-8" />
          </motion.div>
        </section>

        {/* Credibility Bar */}
        <section className="bg-surface border-y border-primary/15 py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-3xl md:text-4xl font-headline text-primary mb-2">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-32 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xs font-bold text-primary uppercase tracking-[0.4em] mb-4">The Collection</h2>
                <p className="text-4xl md:text-6xl font-headline text-on-surface">Curated <span className="italic">Masterpieces</span></p>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-md text-on-surface-variant font-light leading-relaxed"
              >
                Each selection in our reserve undergoes a rigorous 150-point investment appraisal to ensure generational wealth preservation.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {properties.map((prop, i) => (
                <motion.div 
                  key={prop.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="group bg-surface-variant/30 rounded-xl overflow-hidden border-t-2 border-primary/40 transition-all hover:-translate-y-3"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img 
                      alt={prop.title} 
                      className="w-full h-full object-cover grayscale-hover scale-105 group-hover:scale-100 transition-transform duration-700" 
                      src={prop.image}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-10">
                    <h3 className="text-2xl font-headline text-on-surface mb-2">{prop.title}</h3>
                    <p className="text-sm text-on-surface-variant font-light mb-8 tracking-wide">{prop.location} • {prop.strategy}</p>
                    <a href="#" className="inline-flex items-center text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                      View Details <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-32 px-6 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative"
            >
              <div className="absolute -top-6 -left-6 w-32 h-32 border-t border-l border-primary/30"></div>
              <img 
                alt="Architectural office" 
                className="w-full grayscale hover:grayscale-0 transition-all duration-1000 border-8 border-primary/10 p-3" 
                src="[[IMAGE_1]]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 bg-primary text-background py-6 px-10 font-headline font-bold text-2xl shadow-2xl">
                Est. 2009
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-headline text-on-surface leading-tight">
                Built on <span className="italic">Excellence</span>, Sustained by Vision
              </h2>
              <p className="text-on-surface-variant font-light leading-relaxed text-lg">
                Aurelian Reserve was founded with a single mission: to bridge the gap between speculative development and curator-grade architecture. 
              </p>
              <p className="text-on-surface-variant font-light leading-relaxed">[[ABOUT_TEXT]]</p>
              <div className="pt-6 flex items-center gap-6">
                <div className="w-16 h-[1px] bg-primary"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Our Philosophy</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-32 px-6 bg-background">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.4em] mb-4">Methodology</h2>
            <p className="text-4xl md:text-6xl font-headline text-on-surface">The Path to <span className="italic">Ownership</span></p>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l border-dashed border-primary/20 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-24 md:space-y-32">
              {steps.map((step, i) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center gap-12 relative z-10 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className={`flex-1 text-center ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <h3 className="text-2xl font-headline text-on-surface mb-3">{step.title}</h3>
                    <p className="text-sm font-light text-on-surface-variant leading-relaxed max-w-sm mx-auto md:mx-0 inline-block">{step.description}</p>
                  </div>
                  
                  <div className="w-20 h-20 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(242,195,107,0.15)]">
                    <span className="text-2xl font-headline text-primary italic">{step.id}</span>
                  </div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 px-6 bg-surface border-y border-primary/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {[1, 2].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative bg-background p-12 rounded-2xl border border-primary/5 group hover:border-primary/20 transition-all duration-500"
                >
                  <span className="absolute top-6 right-10 text-9xl font-serif text-primary/5 select-none">“</span>
                  <div className="flex gap-1 mb-8">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-primary fill-primary" />)}
                  </div>
                  <p className="text-xl font-light italic text-on-surface mb-10 leading-relaxed">
                    {i === 0 
                      ? "Aurelian Reserve doesn't just sell real estate; they curate a lifestyle that I thought was only possible in architectural digests. Their attention to detail is uncompromising."
                      : "Finding an investment partner that understands both the emotional weight of a home and the analytical rigor of a portfolio asset is rare. They are the benchmark."
                    }
                  </p>
                  <div>
                    <p className="font-headline text-primary text-2xl">{i === 0 ? "Julian Vane" : "Elena Rossi"}</p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{i === 0 ? "Venture Capitalist" : "Private Investor"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-32 px-6 bg-background relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-headline text-on-surface mb-8">Begin Your <span className="italic">Legacy</span></h2>
              <p className="text-on-surface-variant font-light mb-12 text-lg">Submit your inquiry for a confidential portfolio strategy session. Our consultants respond within 24 hours.</p>
              
              <form className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                  <input 
                    className="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none text-on-surface py-4 transition-all placeholder:text-on-surface-variant/30" 
                    placeholder="Alexander Thorne" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Digital Correspondence</label>
                  <input 
                    className="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none text-on-surface py-4 transition-all placeholder:text-on-surface-variant/30" 
                    placeholder="[[EMAIL]]" 
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Portfolio Interest</label>
                  <select className="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none text-on-surface py-4 transition-all appearance-none">
                    <option className="bg-surface">European Heritage Assets</option>
                    <option className="bg-surface">Modern Coastal Estates</option>
                    <option className="bg-surface">Urban High-Yield Core</option>
                  </select>
                </div>
                <button className="w-full gold-gradient-cta text-background font-bold py-6 rounded-xl tracking-[0.3em] uppercase text-xs transition-all hover:opacity-90 hover:scale-[1.01] shadow-xl">
                  Initialize Contact
                </button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="min-h-[500px] relative rounded-2xl overflow-hidden border border-primary/10"
            >
              <img 
                alt="Location map" 
                className="w-full h-full object-cover grayscale opacity-40 absolute inset-0" 
                src="[[IMAGE_2]]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-background/40"></div>
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-background/90 backdrop-blur-md p-10 border border-primary/20 text-center max-w-xs shadow-2xl rounded-xl">
                  <h4 className="font-headline text-primary text-xl mb-3">Headquarters</h4>
                  <p className="text-sm font-light text-on-surface-variant mb-6 leading-relaxed">[[ADDRESS]]</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Visit by appointment</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-primary/10 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="lg:col-span-1">
            <div className="text-2xl font-headline italic text-primary mb-8">The *Modern* Estate</div>
            <p className="text-sm font-light text-on-surface-variant leading-relaxed">
              Defining the nexus of architectural art and investment performance since 2009.
            </p>
          </div>
          
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8">Expertise</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              {["Portfolio Strategy", "Investment Audit", "Private Placement"].map(item => (
                <li key={item} className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8">The Reserve</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              {["Active Listings", "Past Performance", "Market Insights"].map(item => (
                <li key={item} className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8">Connect</h5>
            <div className="flex gap-6">
              <Globe className="w-5 h-5 text-on-surface-variant hover:text-primary transition-all cursor-pointer" />
              <Share2 className="w-5 h-5 text-on-surface-variant hover:text-primary transition-all cursor-pointer" />
              <Mail className="w-5 h-5 text-on-surface-variant hover:text-primary transition-all cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
          <p>© 2024 [[SHOP_NAME]]. All rights reserved.</p>
          <div className="flex gap-10">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Investment Strategy</a>
            <a className="hover:text-primary transition-colors" href="#">Inquiry</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
