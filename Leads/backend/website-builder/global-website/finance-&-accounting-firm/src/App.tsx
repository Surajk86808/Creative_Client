import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Landmark,
  LineChart,
  Mail,
  MapPin,
  MessageSquare,
  Menu,
  Phone,
  PieChart,
  Quote,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-accent/30">
      {/* 1. Fixed Navbar */}
      <header className="fixed top-0 w-full bg-surface-app/90 backdrop-blur-md z-50 border-b border-primary/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Landmark className="h-8 w-8 text-accent" />
              <span className="font-serif font-bold text-2xl tracking-tight text-primary">
                [[SHOP_NAME]]
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Services', 'About', 'Team', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-primary/80 hover:text-accent transition-colors"
                >
                  {item}
                </a>
              ))}
              <a
                href="#contact"
                className="bg-primary text-white px-6 py-2.5 rounded-sm font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] shadow-lg"
              >
                Book Consultation
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-app border-t border-primary/10">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {['Services', 'About', 'Team', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-accent hover:bg-primary/5 rounded-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="#contact"
                className="block w-full text-center mt-4 bg-primary text-white px-6 py-3 rounded-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Consultation
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* 2. Hero Section */}
        <section className="relative bg-primary overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-4 block">
                  Premium Financial Advisory
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  [[SHOP_NAME]]
                  <span className="block text-accent text-4xl md:text-5xl lg:text-6xl mt-2 font-normal italic">
                    [[TAGLINE]]
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">[[TAGLINE]]</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#contact"
                    className="bg-accent text-primary px-8 py-4 rounded-sm font-semibold text-base hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    Discuss Your Needs <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#services"
                    className="border border-white/30 text-white px-8 py-4 rounded-sm font-medium text-base hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    Explore Services
                  </a>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 translate-x-4 translate-y-4 rounded-sm"></div>
                <img
                  src="[[HERO_IMAGE_URL]]"
                  alt="Financial consulting meeting"
                  referrerPolicy="no-referrer"
                  className="rounded-sm relative z-10 w-full object-cover shadow-2xl h-[500px]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. Services Strip */}
        <section id="services" className="py-20 bg-background-app relative -mt-10 lg:-mt-20 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: '[[SERVICE_1]]', icon: BarChart3, desc: 'Comprehensive financial planning and wealth management strategies tailored to your unique goals.' },
                { title: '[[SERVICE_2]]', icon: Calculator, desc: 'Strategic tax planning, preparation, and compliance to minimize liability and maximize returns.' },
                { title: '[[SERVICE_3]]', icon: Briefcase, desc: 'Precision corporate accounting, payroll, and CFO-level advisory to drive your business growth.' },
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-surface-app p-10 rounded-sm shadow-xl border border-primary/5 hover:-translate-y-2 transition-transform duration-300 group"
                >
                  <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                    <service.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold mb-4 text-primary">
                    {service.title}
                  </h3>
                  <p className="text-primary/70 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <a href="#contact" className="text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. About Section */}
        <section id="about" className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -left-4 -bottom-4 w-3/4 h-full bg-accent/10 -z-10 rounded-sm"></div>
                <img
                  src="[[IMAGE_1]]"
                  alt="Our professional accounting team"
                  referrerPolicy="no-referrer"
                  className="rounded-sm shadow-lg w-full"
                />
                <div className="absolute -right-8 -bottom-8 bg-primary p-8 rounded-sm shadow-xl hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center">
                      <span className="text-white font-serif text-2xl font-bold">25+</span>
                    </div>
                    <div>
                      <p className="text-white font-serif font-medium text-lg">Years of</p>
                      <p className="text-accent opacity-90">Excellence</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-4 block">About Our Firm</span>
                <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-8">
                  Building Wealth on a Foundation of Trust.
                </h2>
                <div className="prose prose-lg text-primary/80 mb-10 font-light leading-relaxed">
                  <p>[[ABOUT_TEXT]]</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-10">
                  {[
                    "Certified CPAs & Advisors",
                    "Data Security & Confidentiality",
                    "Bespoke Financial Strategies",
                    "Proactive Tax Mitigation"
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-accent flex-shrink-0" />
                      <span className="font-medium text-primary">{badge}</span>
                    </div>
                  ))}
                </div>
                
                <a
                  href="#team"
                  className="inline-flex py-3 px-8 border-2 border-primary text-primary font-medium rounded-sm hover:bg-primary hover:text-white transition-colors"
                >
                  Meet the Partners
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Stats Bar */}
        <section className="bg-primary py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
              {[
                { number: '500+', label: 'Clients Served' },
                { number: '25+', label: 'Years Experience' },
                { number: '10K+', label: 'Filings Completed' },
                { number: '99%', label: 'Client Retention' },
              ].map((stat, idx) => (
                <div key={idx} className="px-4">
                  <div className="font-serif text-4xl lg:text-5xl font-bold text-accent mb-2">{stat.number}</div>
                  <div className="text-white/80 font-medium text-sm lg:text-base uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Why Choose Us */}
        <section className="py-20 lg:py-32 bg-background-app">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-3 block">The Difference</span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-16">
              Why Partner With Us
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {[
                { title: 'Expert Knowledge', icon: LineChart, desc: 'Deep industry expertise ensuring forward-thinking strategies and compliance.' },
                { title: 'Client-Centric', icon: Users, desc: 'A dedicated partner prioritizing your goals and acting as your fiduciary.' },
                { title: 'Timely Delivery', icon: Clock, desc: 'Prompt responses, fast turnaround times, and adherence to strict deadlines.' },
                { title: 'Accuracy & Integrity', icon: CheckCircle2, desc: 'Flawless execution driven by rigorous quality control and ethical standards.' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-sm border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-sm mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-primary mb-3">{feature.title}</h3>
                  <p className="text-primary/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Testimonials */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                Client Success Stories
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Jenkins', role: 'CEO, TechFlow Inc.', text: 'Their strategic tax planning saved us substantially this fiscal year. The team acts not just as accountants, but as visionary financial partners.' },
                { name: 'David Chen', role: 'Managing Partner, Chen Associates', text: 'Impeccable attention to detail and unwavering integrity. They overhauled our financial reporting and gave us complete clarity on our margins.' },
                { name: 'Eleanor Vance', role: 'Private Wealth Client', text: 'For over a decade, they have managed my family\'s wealth with the utmost discretion and foresight. True professionals in every sense of the word.' },
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-background-app p-10 rounded-sm relative mt-8">
                  <div className="absolute -top-6 left-10 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                     <Quote className="text-white w-5 h-5 fill-current" />
                  </div>
                  <div className="flex text-accent mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-primary/80 italic mb-8 leading-relaxed font-serif text-lg">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-primary/60">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Contact Form & Info */}
        <section id="contact" className="py-20 lg:py-32 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              <div className="lg:col-span-2">
                <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-3 block">Get in touch</span>
                <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to optimize your financials?
                </h2>
                <p className="text-white/70 mb-12 font-light text-lg">[[ABOUT_TEXT]]</p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center shrink-0">
                      <MapPin className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Our Office</h4>
                      <p className="text-white/70 leading-relaxed">[[ADDRESS]]</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center shrink-0">
                      <Phone className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Direct Line</h4>
                      <p className="text-white/70">[[PHONE]]</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center shrink-0">
                      <Mail className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Email Us</h4>
                      <p className="text-white/70">[[EMAIL]]</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-sm p-8 md:p-12 shadow-2xl">
                  <h3 className="font-serif text-3xl font-bold text-primary mb-8">Request a Consultation</h3>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full px-4 py-3 border border-primary/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-background-app" placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" className="w-full px-4 py-3 border border-primary/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-background-app" placeholder="[[EMAIL]]" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary">Service of Interest</label>
                      <select className="w-full px-4 py-3 border border-primary/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-background-app appearance-none">
                        <option value="">Select a service...</option>
                        <option value="wealth">[[SERVICE_1]]</option>
                        <option value="tax">[[SERVICE_2]]</option>
                        <option value="corporate">[[SERVICE_3]]</option>
                        <option value="other">Other / General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-primary">Message</label>
                      <textarea rows={4} className="w-full px-4 py-3 border border-primary/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-background-app resize-y" placeholder="How can we help you?"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white font-medium py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                      Send Secure Message <MessageSquare className="w-4 h-4" />
                    </button>
                    
                    <p className="text-xs text-primary/50 text-center mt-4">
                      Your information is kept strictly confidential within our firm.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="bg-[#071430] border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Landmark className="h-8 w-8 text-accent" />
                <span className="font-serif font-bold text-2xl tracking-tight text-white">
                  [[SHOP_NAME]]
                </span>
              </div>
              <p className="text-white/60 max-w-sm mb-8 leading-relaxed font-light">
                Premier financial advisory and accounting services dedicated to securing and growing your wealth with uncompromised integrity.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['Services', 'About Us', 'Testimonials', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Disclosures'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/60 hover:text-accent transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} [[SHOP_NAME]]. All rights reserved.
            </p>
            <div className="text-white/40 text-sm">
               Designed with excellence and precision.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
