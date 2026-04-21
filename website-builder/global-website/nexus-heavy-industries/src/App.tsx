/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  ChevronRight,
  Settings,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Box
} from 'lucide-react';

const SHOP_NAME = "[[SHOP_NAME]]";
const TAGLINE = "ENGINEERING TOMORROW'S INFRASTRUCTURE WITH PRECISION.";
const ABOUT_TEXT = "For over two decades, Nexus has delivered unparalleled engineering and industrial solutions. Our commitment to precision, safety, and innovation ensures that your most complex projects are executed flawlessly from blueprint to operation.";
const SERVICE_1 = "Structural Fabrication";
const SERVICE_2 = "Heavy Fluid Systems";
const SERVICE_3 = "Machinery Refurbishment";
const ADDRESS = "[[ADDRESS]]";
const PHONE = "[[PHONE]]";
const EMAIL = "[[EMAIL]]";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-background text-gray-300 selection:bg-primary selection:text-surface">
      {/* Background blueprint grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-40 z-0"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-12 border-x border-white/10 relative">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => scrollToSection('top')}>
              <span className="font-mono text-[10px] text-primary tracking-[0.2em] transform -rotate-90 mr-2 opacity-50 hidden sm:block">SYS.01</span>
              <span className="font-display font-bold text-3xl tracking-tight text-white uppercase">
                {SHOP_NAME}<span className="text-primary">.</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex h-full items-center">
              <div className="flex h-full border-l border-white/10">
                {['Services', 'Capabilities', 'Process', 'Contact'].map((item, idx) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="h-full px-6 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-[11px] font-mono tracking-widest uppercase border-r border-white/10 relative group"
                  >
                    <span className="text-primary/40 mr-2">0{idx + 1}</span>
                    {item}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-primary hover:bg-white text-background font-mono font-bold h-full px-8 text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
              >
                Get Quote
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-background border-b border-white/10"
            >
              <div className="px-4 py-4 space-y-1">
                {['Services', 'Capabilities', 'Process', 'Contact'].map((item, idx) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left px-3 py-4 text-gray-300 hover:text-white hover:bg-white/5 disabled:text-gray-600 font-mono text-[11px] uppercase tracking-widest border-b border-white/5"
                  >
                     <span className="text-primary/40 mr-3">0{idx + 1}</span>
                    {item}
                  </button>
                ))}
                <div className="pt-4 px-3">
                  <button onClick={() => scrollToSection('contact')} className="w-full bg-primary text-background font-mono font-bold py-4 text-[11px] uppercase tracking-[0.2em]">
                    Get Quote
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div id="top"></div>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col md:flex-row border-b border-white/10 bg-background max-w-[1440px] mx-auto border-x mt-20">
        
        {/* Left Content Pane */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-16 lg:py-24 relative z-10 border-b md:border-b-0 md:border-r border-white/10 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] border border-white/10 bg-white/[0.02] inline-block px-3 py-1 mb-8">
              SEQ-01 // Heavy Engineering
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[7rem] font-bold uppercase leading-[0.85] tracking-tight mb-8 text-white shrink-0">
              {SHOP_NAME}
              <span className="block text-primary">HEAVY</span>
              <span className="block">INDUSTRIES</span>
            </h1>
            
            <p className="font-sans text-lg text-gray-400 font-light mb-12 leading-relaxed border-l-2 border-primary pl-5">
              {TAGLINE}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-mono text-[11px]">
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-primary hover:bg-white text-background font-bold py-5 px-8 uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-colors shrink-0"
              >
                <span>Start Project</span>
                <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="bg-transparent border border-white/20 hover:border-white/80 text-white font-bold py-5 px-8 uppercase tracking-[0.2em] flex items-center justify-center transition-colors shrink-0"
              >
                <span>View Specs</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Image Pane */}
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-full flex items-end">
          <img 
            src="https://picsum.photos/seed/nexus-heavy/2670/1800" 
            alt="Industrial Welding" 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Overlay burn-in effect */}
          <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
          
          <div className="relative z-20 w-full p-6 border-t border-white/10 bg-background/50 backdrop-blur-md">
            <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-gray-300">
              <span>Status: <span className="text-primary">Operational</span></span>
              <span>1400.Industrial.Pkwy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section id="services" className="border-b border-white/10 bg-surface relative max-w-[1440px] mx-auto border-x">
        <div className="border-b border-white/10 p-6 md:p-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="flex flex-col md:flex-row md:items-end justify-between"
          >
            <div>
              <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] mb-4">SEQ-02 // Operations</div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white max-w-xl">
                Core <span className="text-primary">Services</span> & Engineering
              </h2>
            </div>
            <p className="text-gray-400 max-w-sm mt-4 md:mt-0 font-mono text-[11px] leading-relaxed uppercase tracking-widest border-l border-white/20 pl-4">[[TAGLINE]]</p>
          </motion.div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          {[
            {
              title: SERVICE_1,
              icon: <Settings size={32} strokeWidth={1.5} />,
              desc: "High-tolerance steel structures for load-bearing and extreme weathering conditions. Designed for longevity."
            },
            {
              title: SERVICE_2,
              icon: <Wrench size={32} strokeWidth={1.5} />,
              desc: "Industrial piping, hydraulic complexes, and process systems for hazardous and high-pressure materials."
            },
            {
              title: SERVICE_3,
              icon: <ShieldAlert size={32} strokeWidth={1.5} />,
              desc: "Complete teardown, precision machining, and modernization of heavy industrial plant equipment."
            }
          ].map((service, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="group bg-background hover:bg-white/[0.02] transition-colors p-8 sm:p-12 relative overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-start mb-16">
                <div className="text-primary border border-white/10 p-3 bg-surface group-hover:bg-primary group-hover:text-background transition-colors">
                  {service.icon}
                </div>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                  OP.0{index + 1}
                </span>
              </div>
              
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide mb-4 text-white group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-gray-400 font-sans leading-relaxed mb-8 flex-grow">
                {service.desc}
              </p>
              
              <button className="flex items-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors w-max relative z-10 border-b border-primary pb-1 group-hover:border-white">
                <span className="mr-3">View Specs</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* About / Capabilities */}
      <section id="capabilities" className="bg-background relative border-b border-x border-white/10 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          <div className="p-6 sm:p-12 lg:p-20 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] inline-block mb-6 border border-white/10 px-2 py-1 bg-surface">
                SEQ-03 // Accreditations
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-8 text-white">
                Capabilities & <br/>Standards
              </h2>
              
              <p className="font-sans text-lg text-gray-400 mb-8 leading-relaxed">
                {ABOUT_TEXT}
              </p>

              <ul className="space-y-0 border-t border-white/10">
                {[
                  "ISO 9001:2015 Quality Management Certified",
                  "ASME 'U' and 'S' Stamp Authorizations",
                  "AWS D1.1 Structural Welding Certified",
                  "OSHA VPP Star Site Designation"
                ].map((cert, i) => (
                  <li key={i} className="flex items-center py-4 border-b border-white/10">
                    <span className="font-mono text-[10px] text-primary w-6 mr-4 mt-0.5">0{i+1}</span>
                    <span className="font-mono text-[11px] text-gray-300 tracking-widest uppercase">{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="relative bg-stripes opacity-90 p-6 sm:p-12 lg:p-20 flex flex-col justify-center">
            {/* Stats Matrix inside the right panel instead of standalone */}
            <div className="bg-surface border border-white/10 p-8 sm:p-12 relative z-20 shadow-2xl">
               <div className="font-mono text-[10px] text-primary mb-8 uppercase tracking-[0.3em]">Operational Metrics</div>
               <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
                {[
                  { label: "Projects", value: "850+" },
                  { label: "Clients", value: "124" },
                  { label: "Countries", value: "14" },
                  { label: "Engineers", value: "65+" }
                ].map((stat, i) => (
                  <div key={i} className="bg-background p-6 lg:p-8 flex flex-col justify-center">
                    <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative crosshairs */}
            <div className="absolute top-12 left-12 w-4 h-4 border-t border-l border-primary/50"></div>
            <div className="absolute bottom-12 right-12 w-4 h-4 border-b border-r border-primary/50"></div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section id="process" className="bg-surface relative border-b border-x border-white/10 max-w-[1440px] mx-auto overflow-hidden">
        <div className="p-6 md:p-12 border-b border-white/10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] mb-4">SEQ-04 // Execution</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white">
              Project <span className="text-primary">Lifecycle</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-background">
          {[
            {
              step: "01",
              title: "[[SERVICE_1]]",
              desc: "Rigorous site assessment, feasibility studies, and scope definition to eliminate structural uncertainties."
            },
            {
              step: "02",
              title: "[[SERVICE_2]]",
              desc: "Advanced CAD/CAM modeling, stress testing, and workflow optimization prior to material procurement."
            },
            {
              step: "03",
              title: "[[SERVICE_3]]",
              desc: "Flawless fabrication, strict QA/QC compliance, and seamless on-site integration."
            }
          ].map((phase, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="p-8 sm:p-12 relative group"
            >
              <div className="font-display text-7xl font-bold text-white/5 absolute top-8 right-8 group-hover:text-primary/10 transition-colors pointer-events-none">
                {phase.step}
              </div>
              
              <div className="w-12 h-12 bg-surface border border-white/20 flex flex-col items-center justify-center mb-8 relative z-10 group-hover:border-primary transition-colors">
                <div className="w-1 h-1 bg-primary mb-1 animate-pulse"></div>
                <div className="font-mono text-[10px] text-gray-500 font-bold">{phase.step}</div>
              </div>
              
              <h3 className="font-display text-xl font-bold uppercase tracking-wide mb-4 relative z-10 text-white">{phase.title}</h3>
              <p className="font-sans text-sm text-gray-400 leading-relaxed relative z-10">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-background relative border-b border-x border-white/10 max-w-[1440px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          <div className="p-6 md:p-12 bg-surface flex flex-col justify-center">
            <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] mb-4">SEQ-05 // Verification</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-8">
              Industry <br/><span className="text-primary">Validation</span>
            </h2>
            <p className="font-sans text-sm text-gray-400 max-w-sm">[[ABOUT_TEXT]]</p>
          </div>

          <div className="flex flex-col divide-y divide-white/10">
            {[
              {
                quote: "Nexus delivered the structural framework for our offshore rig 3 weeks ahead of schedule. Their D1.1 welding quality was flawless under X-ray inspection.",
                author: "S. Jenkins",
                role: "VP Ops / Atlantic Energy"
              },
              {
                quote: "When our heavy fluid systems needed an emergency overhaul, Nexus mobilized within hours. They are the definition of precision and reliability.",
                author: "D. Vance",
                role: "Plant Mgr / Kinsley Mfg"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 sm:p-10 relative bg-background hover:bg-white/[0.02] transition-colors"
              >
                <p className="font-sans text-lg text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center font-mono">
                  <span className="text-primary mr-3 shrink-0">[{testimonial.author}]</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{testimonial.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-background relative border-b border-x border-white/10 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          <div className="p-6 md:p-12 lg:p-20 relative z-10 bg-surface">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] mb-4">SEQ-06 // Direct Line</div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-8 text-white">
                Operate at <br/><span className="text-primary">Peak Capacity.</span>
              </h2>
              <p className="font-sans text-gray-400 mb-12 max-w-md">
                Require a specialized component or a complete facility overhaul? Contact our engineering bid team today to discuss your specifications.
              </p>

              <div className="space-y-8 font-mono text-sm">
                <div className="flex items-start">
                  <div className="text-primary mr-6 mt-1 border border-primary/30 p-2 bg-primary/5">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-2">Headquarters</h4>
                    <p className="text-gray-400 max-w-[200px] leading-relaxed">{ADDRESS}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-primary mr-6 mt-1 border border-primary/30 p-2 bg-primary/5">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-2">Direct Line</h4>
                    <p className="text-gray-400">{PHONE}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-primary mr-6 mt-1 border border-primary/30 p-2 bg-primary/5">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-2">Bid Requests</h4>
                    <p className="text-gray-400">{EMAIL}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="p-6 md:p-12 lg:p-20 bg-background relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide mb-8">Request A Quote</h3>
              
              <form className="space-y-6 font-mono" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Full Name *</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Company *</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Email Address *</label>
                  <input 
                    type="email" 
                    className="w-full bg-surface border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Project Details *</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-surface border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-white text-background font-bold py-4 text-[11px] uppercase tracking-[0.2em] transition-colors mt-4"
                >
                  Submit Request
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface relative border-b border-x border-white/10 max-w-[1440px] mx-auto text-center md:text-left font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
          <div className="p-8 sm:p-12 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-6 font-display font-bold text-2xl tracking-wider text-white uppercase">
                <Box className="text-primary mr-3" size={24} />
                <span>{SHOP_NAME}</span>
              </div>
              <p className="text-gray-500 text-[11px] max-w-sm mx-auto md:mx-0 leading-relaxed uppercase tracking-widest">
                Engineered for extremes. Global provider of industrial infrastructure and precision heavy mechanics.
              </p>
            </div>
            <div className="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
              SYS.ID: NX-99482-B
            </div>
          </div>
          
          <div className="p-8 sm:p-12 flex flex-col">
            <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.2em] border-b border-white/10 pb-4 inline-block w-max">Site Map</h4>
            <ul className="space-y-4 text-[11px] text-gray-400 uppercase tracking-widest">
              <li><a href="#services" className="hover:text-primary hover:pl-2 transition-all block">Services</a></li>
              <li><a href="#capabilities" className="hover:text-primary hover:pl-2 transition-all block">Capabilities</a></li>
              <li><a href="#process" className="hover:text-primary hover:pl-2 transition-all block">Process</a></li>
              <li><a href="#contact" className="hover:text-primary hover:pl-2 transition-all block">Contact</a></li>
            </ul>
          </div>

          <div className="p-8 sm:p-12 flex flex-col bg-background/50">
             <div className="flex flex-col h-full justify-between">
               <div>
                  <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.2em] border-b border-white/10 pb-4 inline-block w-max">Legal / Docs</h4>
                  <ul className="space-y-4 text-[11px] text-gray-400 uppercase tracking-widest">
                    <li><a href="#" className="hover:text-primary hover:pl-2 transition-all block">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-primary hover:pl-2 transition-all block">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-primary hover:pl-2 transition-all block">Safety Standards</a></li>
                  </ul>
               </div>
               <div className="mt-12 text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} {SHOP_NAME}.
               </div>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
