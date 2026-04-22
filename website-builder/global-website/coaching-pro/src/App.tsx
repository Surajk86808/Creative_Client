/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  School, 
  Verified, 
  Users, 
  Star, 
  ArrowRight, 
  Code, 
  BarChart3, 
  Palette, 
  Zap, 
  Network, 
  Brain, 
  Trophy, 
  Quote, 
  Globe, 
  MessageSquare, 
  Instagram,
  ChevronRight
} from "lucide-react";

export default function App() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* 1. NAV */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-xl shadow-blue-900/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <School className="text-primary w-8 h-8" />
            <span className="text-2xl font-extrabold text-primary tracking-tight font-headline">
              [[SHOP_NAME]]<span className="text-secondary-container bg-primary px-1 rounded ml-0.5"></span>
            </span>
          </div>
          <button className="bg-primary text-white font-headline font-bold py-2.5 px-6 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20">
            Join Now
          </button>
        </div>
      </header>

      {/* 2. HERO */}
      <section className="pt-32 pb-16 px-6 dot-grid bg-surface min-h-screen flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6 border border-outline-variant/20"
        >
          <span className="text-lg">🏆</span>
          <span className="font-headline font-bold text-primary-container text-sm">[[TAGLINE]]</span>
        </motion.div>

        <motion.h1 
          {...fadeIn}
          className="text-center font-headline font-extrabold text-4xl md:text-6xl leading-[1.1] text-primary mb-6 tracking-tight max-w-4xl"
        >
          Unlock Your Potential with <span className="relative inline-block">
            [[SHOP_NAME]]
            <span className="absolute -bottom-2 left-0 w-full h-3 bg-secondary-container/40 -z-10 rounded-full"></span>
          </span>
        </motion.h1>

        <motion.p 
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="text-center font-body text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl"
        >
          [[TAGLINE]]
        </motion.p>

        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row w-full max-w-md gap-4 mb-12"
        >
          <button className="flex-1 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg shadow-xl hover:scale-105 transition-all">
            Get Started Today
          </button>
          <button className="flex-1 py-4 rounded-full bg-secondary-container text-primary font-headline font-bold text-lg hover:scale-105 transition-all">
            Explore Programs
          </button>
        </motion.div>

        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          <div className="flex items-center gap-2">
            <Verified className="text-secondary w-5 h-5" />
            <span className="font-headline font-semibold text-sm">98% Success Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-secondary w-5 h-5" />
            <span className="font-headline font-semibold text-sm">Expert Mentors</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative w-full max-w-md mx-auto"
        >
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              alt="Empowered students" 
              className="w-full h-full object-cover" 
              src="[[HERO_IMAGE_URL]]"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -top-6 -right-4 glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/40"
          >
            <div className="bg-secondary-container w-10 h-10 rounded-full flex items-center justify-center">
              <Star className="text-primary w-5 h-5 fill-primary" />
            </div>
            <div>
              <div className="font-headline font-bold text-primary leading-tight">4.9 Rating</div>
              <div className="text-xs text-on-surface-variant">Global Trust</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: 1 }}
            className="absolute -bottom-6 -left-4 glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/40"
          >
            <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center text-white">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="font-headline font-bold text-primary leading-tight">50k+ Graduates</div>
              <div className="text-xs text-on-surface-variant">Active Community</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. STATS STRIP */}
      <section className="bg-white py-16 px-6 border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: "Students", value: "12k+" },
            { label: "Programs", value: "450+" },
            { label: "Faculty", value: "200+" },
            { label: "Awards", value: "150+" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2 tracking-tight">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. PROGRAMS */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center md:text-left">
            <span className="font-headline font-bold text-secondary uppercase tracking-widest text-xs">Curated Excellence</span>
            <h2 className="text-4xl font-headline font-extrabold text-primary mt-2">Our Featured Programs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-6 h-6 text-primary" />,
                title: "[[SERVICE_1]]",
                desc: "Master the latest architectures, AI integration, and cloud scaling with our hands-on labs.",
                featured: false
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-primary" />,
                title: "[[SERVICE_2]]",
                desc: "Turn information into actionable insight for high-level decision making and market leadership.",
                featured: true
              },
              {
                icon: <Palette className="w-6 h-6 text-primary" />,
                title: "[[SERVICE_3]]",
                desc: "Learn the editorial design secrets of world-class agencies and top digital brands.",
                featured: false
              }
            ].map((program, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 flex flex-col border-t-4 border-primary hover:scale-[1.02] transition-all relative ${program.featured ? 'scale-105 z-10 border-secondary-container' : ''}`}
              >
                {program.featured && (
                  <div className="absolute top-4 right-4 bg-secondary-container text-primary px-3 py-1 rounded-full text-xs font-bold">Popular</div>
                )}
                <div className="bg-surface p-4 rounded-2xl w-fit mb-6">
                  {program.icon}
                </div>
                <h3 className="text-xl font-headline font-bold text-primary mb-3">{program.title}</h3>
                <p className="text-on-surface-variant font-body text-sm mb-8 leading-relaxed flex-grow">{program.desc}</p>
                <a href="#" className="inline-flex items-center gap-2 text-primary font-bold group">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT */}
      <section className="py-24 px-6 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div {...fadeIn}>
            <span className="font-headline font-bold text-secondary-container uppercase tracking-widest text-xs">Our Identity</span>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold mt-4 mb-8 leading-tight">Why We're Different</h2>
            <p className="text-white/80 leading-relaxed text-lg mb-10">
              [[ABOUT_TEXT]]
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-headline font-extrabold text-secondary-container mb-1">#1</div>
                <div className="text-sm font-headline font-bold text-white/70">Nationally Ranked</div>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-headline font-extrabold text-secondary-container mb-1">100%</div>
                <div className="text-sm font-headline font-bold text-white/70">Career Support</div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            {...fadeIn}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border-8 border-white/10">
              <img 
                src="[[IMAGE_1]]" 
                alt="Mentorship" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-secondary-container p-8 rounded-3xl shadow-2xl text-primary">
              <Trophy className="w-10 h-10 mb-4" />
              <div className="text-2xl font-headline font-extrabold">Elite Tier</div>
              <div className="text-sm font-headline font-bold opacity-70">Certification</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. WHY JOIN */}
      <section className="py-24 px-6 bg-primary-container">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap />, title: "Accelerated Path", desc: "Compress years of experience into intensive months of focused, elite coaching." },
              { icon: <Network />, title: "Elite Networking", desc: "Direct access to industry leaders and private career events exclusive to our community." },
              { icon: <Brain />, title: "Custom Curriculums", desc: "Tailored learning paths that adapt to your pace and specific career objectives." },
              { icon: <Trophy />, title: "Lifetime Prestige", desc: "Graduate with a credential that is recognized and respected by top tier global firms." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-xl relative group overflow-hidden hover:scale-105 transition-all"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-surface rounded-bl-[100%] transition-all group-hover:bg-secondary-container/20"></div>
                <div className="bg-secondary-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  {item.icon}
                </div>
                <h4 className="text-xl font-headline font-bold text-primary mb-3">{item.title}</h4>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-headline font-extrabold text-primary mb-16 text-center">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah Jenkins",
                role: "Senior Lead at Fintech Co",
                quote: "The mentorship at AchieveElite didn't just help me get a job; it completely reshaped how I approach complex problems. I felt truly elite.",
                img: "[[AVATAR_IMAGE_1]]"
              },
              {
                name: "David Chen",
                role: "CTO at Stellar Systems",
                quote: "Transitioning from academia to executive leadership was seamless with AchieveElite's coaching. The curriculum is world-class.",
                img: "[[AVATAR_IMAGE_2]]"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-secondary-container relative"
              >
                <div className="absolute -top-6 left-10 bg-secondary-container w-12 h-12 rounded-full flex items-center justify-center text-primary shadow-lg">
                  <Quote className="w-6 h-6 fill-primary" />
                </div>
                <p className="font-body italic text-on-surface-variant text-lg leading-relaxed pt-4 mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full border-2 border-primary/10" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-headline font-bold text-primary">{t.name}</div>
                    <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONTACT */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto bg-surface p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden border border-outline-variant/10">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl font-headline font-extrabold text-primary mb-4">Start Your Journey</h2>
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 px-4 py-2 rounded-full text-secondary font-bold text-sm mb-10">
              <Zap className="w-4 h-4" />
              [[ADDRESS]] . [[PHONE]] . [[EMAIL]]
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-primary font-bold text-sm mb-2 px-1">Full Name</label>
                  <input className="w-full bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="John Doe" type="text" />
                </div>
                <div>
                  <label className="block text-primary font-bold text-sm mb-2 px-1">Professional Email</label>
                  <input className="w-full bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="[[EMAIL]]" type="email" />
                </div>
              </div>
              <div>
                <label className="block text-primary font-bold text-sm mb-2 px-1">Area of Interest</label>
                <select className="w-full bg-white border-none rounded-2xl p-4 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none">
                  <option>Software Engineering</option>
                  <option>Executive Leadership</option>
                  <option>Data Strategy</option>
                  <option>UI/UX Design</option>
                </select>
              </div>
              <button className="w-full py-5 rounded-2xl bg-primary text-white font-headline font-extrabold text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                Request Admission
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-primary text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <School className="text-secondary-container w-8 h-8" />
                <span className="text-2xl font-extrabold text-white tracking-tight font-headline">
                  [[SHOP_NAME]]<span className="text-secondary-container"></span>
                </span>
              </div>
              <p className="text-white/60 font-body text-sm leading-relaxed max-w-xs">[[TAGLINE]]</p>
            </div>
            <div>
              <h5 className="text-secondary-container font-headline font-bold text-sm uppercase tracking-widest mb-6">Programs</h5>
              <ul className="space-y-4">
                {["Engineering", "Leadership", "Scholarships", "Faculty"].map(link => (
                  <li key={link}><a href="#" className="text-white/60 hover:text-white transition-all text-sm font-medium flex items-center gap-1 group">
                    {link} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-secondary-container font-headline font-bold text-sm uppercase tracking-widest mb-6">Company</h5>
              <ul className="space-y-4">
                {["About Us", "Success Stories", "Contact", "Privacy"].map(link => (
                  <li key={link}><a href="#" className="text-white/60 hover:text-white transition-all text-sm font-medium flex items-center gap-1 group">
                    {link} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-6">
              <Globe className="w-5 h-5 text-white/40 hover:text-secondary-container transition-colors cursor-pointer" />
              <MessageSquare className="w-5 h-5 text-white/40 hover:text-secondary-container transition-colors cursor-pointer" />
              <Instagram className="w-5 h-5 text-white/40 hover:text-secondary-container transition-colors cursor-pointer" />
            </div>
            <p className="text-white/40 text-xs font-medium">
              © 2024 [[SHOP_NAME]]. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
