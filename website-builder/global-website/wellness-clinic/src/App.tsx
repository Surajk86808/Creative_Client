/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Leaf, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Search, 
  Sprout, 
  Stethoscope, 
  Users, 
  FlaskConical, 
  Activity, 
  Brain, 
  Dna, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

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

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="text-xl md:text-2xl font-extrabold text-primary flex items-center gap-2 font-headline tracking-tight">
            <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary fill-primary/20" />
            <span>[[SHOP_NAME]]</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
            <a className="text-tertiary border-b-2 border-tertiary pb-1 hover:opacity-100 transition-all duration-300" href="#services">Services</a>
            <a className="text-primary opacity-80 hover:opacity-100 hover:text-tertiary transition-all duration-300" href="#about">About</a>
            <a className="text-primary opacity-80 hover:opacity-100 hover:text-tertiary transition-all duration-300" href="#research">Research</a>
            <a className="text-primary opacity-80 hover:opacity-100 hover:text-tertiary transition-all duration-300" href="#contact">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block bg-primary px-6 py-2.5 rounded-lg text-white font-bold font-headline transition-transform active:scale-95 shadow-lg shadow-primary/20">
              Book Appointment
            </button>
            <button 
              className="md:hidden p-2 text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-background border-b border-outline-variant/20 px-6 py-4 space-y-4"
          >
            <a className="block text-primary font-bold" href="#services" onClick={() => setIsMenuOpen(false)}>Services</a>
            <a className="block text-primary font-bold" href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
            <a className="block text-primary font-bold" href="#research" onClick={() => setIsMenuOpen(false)}>Research</a>
            <a className="block text-primary font-bold" href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <button className="w-full bg-primary px-6 py-3 rounded-lg text-white font-bold font-headline">
              Book Appointment
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-[#f2fcf0]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.span variants={fadeIn} className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase">
              Advanced Natural Therapeutics
            </motion.span>
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold text-primary font-headline leading-[1.1]">
              Where Scientific <span className="text-tertiary">Precision</span> Meets Botanical Wisdom.
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg text-on-surface-variant max-w-xl font-body leading-relaxed">
              Personalized healthcare designed around the synergy of plant-based pharmacology and modern diagnostic excellence. Experience a sanctuary of restorative medicine.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 pt-4">
              <button className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-lg font-bold transition-all shadow-md active:scale-95">
                Consult Our Specialists
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-lg font-bold transition-all active:scale-95">
                Our Research Trials
              </button>
            </motion.div>
            <motion.div variants={fadeIn} className="flex flex-wrap gap-8 pt-8 border-t border-outline-variant/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Evidence Based</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Holistic Focus</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-auto">
              <img 
                alt="Medical clinic interior" 
                className="w-full h-full object-cover" 
                src="https://picsum.photos/seed/botanical-clinic/800/1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-primary/5">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Star className="w-6 h-6 fill-tertiary" />
              </div>
              <div>
                <div className="font-headline font-bold text-primary">4.9/5 Patient Rating</div>
                <div className="text-xs text-on-surface-variant">Based on 2,400+ clinical outcomes</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-wrap justify-around items-center gap-8">
          <div className="flex items-center gap-4">
            <Stethoscope className="text-secondary-container w-10 h-10" />
            <span className="text-white font-headline font-bold text-xl">15+ Specialty Clinics</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="text-secondary-container w-10 h-10" />
            <span className="text-white font-headline font-bold text-xl">Expert PhD Researchers</span>
          </div>
          <div className="flex items-center gap-4">
            <FlaskConical className="text-secondary-container w-10 h-10" />
            <span className="text-white font-headline font-bold text-xl">On-site Extraction Lab</span>
          </div>
          <div className="flex items-center gap-4">
            <Activity className="text-secondary-container w-10 h-10" />
            <span className="text-white font-headline font-bold text-xl">Personalized Care</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-primary font-headline">Clinical Excellence</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto font-body">[[TAGLINE]]</p>
          </div>
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                title: "[[SERVICE_1]]", 
                icon: <Brain className="w-8 h-8" />, 
                desc: "Specialized herbal protocols for neuroprotection, cognitive enhancement, and chronic stress management." 
              },
              { 
                title: "[[SERVICE_2]]", 
                icon: <Dna className="w-8 h-8" />, 
                desc: "Metabolic and hormonal balancing through targeted phytonutrient therapy and nutritional genomics." 
              },
              { 
                title: "[[SERVICE_3]]", 
                icon: <ShieldAlert className="w-8 h-8" />, 
                desc: "Advanced immunomodulation therapies using concentrated botanical compounds and antioxidant support." 
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="group bg-surface rounded-2xl p-8 transition-all hover:shadow-lg relative overflow-hidden border border-outline-variant/10"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 font-headline">{service.title}</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6 font-body">{service.desc}</p>
                <a className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all" href="#">
                  Learn More <ChevronRight className="w-4 h-4" />
                </a>
                <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-tertiary transition-all duration-500 group-hover:w-full"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <img 
                alt="Laboratory" 
                className="w-full aspect-square object-cover" 
                src="https://picsum.photos/seed/botanical-lab/800/800"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 bg-tertiary p-8 rounded-2xl shadow-xl z-20 text-white">
              <div className="text-4xl font-extrabold mb-1">98%</div>
              <div className="text-sm font-medium opacity-90">Clinical Success Rate</div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary rounded-full -z-10 opacity-10"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-primary font-headline leading-tight">Decades of Research, <br/>Focused on Your Healing.</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed font-body">
              Founded on the principle that the most powerful medicine often grows from the earth, we have spent 25 years refining the extraction and application of botanical compounds for complex medical needs.
            </p>
            <ul className="space-y-4">
              {[
                { title: "Custom Tincture Formulation", desc: "On-site compounding tailored to your specific genetic markers." },
                { title: "Biometric Integration", desc: "Real-time monitoring of your body's response to botanical protocols." },
                { title: "Global Research Network", desc: "Collaborating with leading universities on ethno-botanical studies." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-tertiary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-6xl font-extrabold text-secondary-container font-headline">12k+</div>
            <div className="text-white text-lg tracking-widest uppercase font-semibold">Patients Restored</div>
          </div>
          <div className="space-y-2">
            <div className="text-6xl font-extrabold text-secondary-container font-headline">85</div>
            <div className="text-white text-lg tracking-widest uppercase font-semibold">Peer-Reviewed Papers</div>
          </div>
          <div className="space-y-2">
            <div className="text-6xl font-extrabold text-secondary-container font-headline">04</div>
            <div className="text-white text-lg tracking-widest uppercase font-semibold">Regional Care Centers</div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-primary font-headline">The Botanical Advantage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <FlaskConical />, title: "Analytical Precision", desc: "We utilize gas chromatography to ensure every drop of our medicine contains the precise therapeutic concentration required for clinical efficacy." },
              { icon: <Sprout />, title: "Ethical Sourcing", desc: "Our botanicals are wild-harvested or grown in regenerative systems that prioritize biodiversity and the potency of the whole plant." },
              { icon: <Users />, title: "Collaborative Medicine", desc: "We work alongside your existing physicians to provide a supportive, integrative layer to your comprehensive health plan." },
              { icon: <ShieldCheck />, title: "Rigorous Standards", desc: "Every protocol undergoes strict clinical review. We prioritize safety and proven therapeutic outcomes above all else." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-surface-container-low p-10 rounded-2xl border-t-4 border-primary"
              >
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 font-headline">{item.title}</h3>
                <p className="text-on-surface-variant font-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-4xl font-extrabold text-primary font-headline text-center mb-16">Patient Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Dr. Robert Chen", 
                role: "Professor of History", 
                text: "The Botanical Authority didn't just treat my symptoms; they looked at my entire biology. The results have been life-changing for my chronic inflammation.",
                img: "https://picsum.photos/seed/patient1/100/100"
              },
              { 
                name: "Elena Rodriguez", 
                role: "Professional Athlete", 
                text: "I was skeptical of 'herbal' medicine, but the clinical rigor here is world-class. My recovery speed after surgery was cut in half.",
                img: "https://picsum.photos/seed/patient2/100/100"
              },
              { 
                name: "Sarah Williams", 
                role: "Retired Architect", 
                text: "A sanctuary of healing. From the atmosphere to the expertise, everything about this clinic signals precision and deep care.",
                img: "https://picsum.photos/seed/patient3/100/100"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border-t-[3px] border-tertiary">
                <div className="flex gap-1 text-tertiary mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-tertiary" />)}
                </div>
                <p className="text-on-surface italic leading-loose mb-8 font-body">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img alt={t.name} className="w-full h-full object-cover" src={t.img} referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">{t.name}</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h2 className="text-4xl font-extrabold text-primary font-headline mb-8">Begin Your Journey</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary px-1">Full Name</label>
                  <input className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 transition-all outline-none" placeholder="John Doe" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary px-1">Email Address</label>
                  <input className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 transition-all outline-none" placeholder="[[EMAIL]]" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary px-1">Specialty Interest</label>
                <select className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 transition-all outline-none appearance-none">
                  <option>Neurological Care</option>
                  <option>Endocrine Health</option>
                  <option>Immune Resilience</option>
                  <option>General Consultation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary px-1">Your Message</label>
                <textarea className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 h-32 transition-all outline-none resize-none" placeholder="How can we help you thrive?"></textarea>
              </div>
              <button className="w-full bg-tertiary hover:bg-tertiary-container text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-[0.98]">
                Schedule Consultation
              </button>
            </form>
          </div>
          <div className="space-y-8">
            <div className="rounded-3xl overflow-hidden h-64 shadow-inner relative">
              <img 
                alt="Map" 
                className="w-full h-full object-cover" 
                src="https://picsum.photos/seed/portland-map/800/400"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-surface-container-low rounded-2xl flex items-start gap-4">
                <MapPin className="text-primary w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-primary">Portland Flagship</h4>
                  <p className="text-sm text-on-surface-variant">[[ADDRESS]]</p>
                </div>
              </div>
              <div className="p-6 bg-surface-container-low rounded-2xl flex items-start gap-4">
                <Phone className="text-primary w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-primary">Direct Line</h4>
                  <p className="text-sm text-on-surface-variant">[[PHONE]]<br/>Mon-Fri, 8am - 6pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white pt-20 pb-8 mt-20 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-extrabold flex items-center gap-2 font-headline tracking-tight mb-6">
              <Leaf className="w-8 h-8 text-secondary-container fill-secondary-container/20" />
              [[SHOP_NAME]]
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6 font-body">[[ABOUT_TEXT]]</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-tertiary transition-colors" href="#"><Globe className="w-4 h-4" /></a>
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-tertiary transition-colors" href="#"><Mail className="w-4 h-4" /></a>
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-tertiary transition-colors" href="#"><ShieldAlert className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-secondary-container font-bold font-headline uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/80 font-body">
              <li><a className="hover:text-secondary-container transition-colors" href="#services">Our Services</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Specialist Team</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Clinical Research</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Patient Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-secondary-container font-bold font-headline uppercase tracking-widest text-sm mb-6">Patient Care</h4>
            <ul className="space-y-4 text-white/80 font-body">
              <li><a className="hover:text-secondary-container transition-colors" href="#">New Patient Form</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Pharmacy Portal</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Success Stories</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Financial Planning</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-secondary-container font-bold font-headline uppercase tracking-widest text-sm mb-6">Legal & Policy</h4>
            <ul className="space-y-4 text-white/80 font-body">
              <li><a className="hover:text-secondary-container transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Clinical Trials Ethics</a></li>
              <li><a className="hover:text-secondary-container transition-colors" href="#">Cookie Settings</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40 tracking-widest uppercase font-headline">
          <div>Â© 2026 [[SHOP_NAME]]. Precision Botanical Medicine.</div>
          <div className="mt-4 md:mt-0">Built with Integrity & Nature.</div>
        </div>
      </footer>
    </div>
  );
}
