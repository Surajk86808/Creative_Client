import { motion } from "motion/react";
import { 
  Menu, 
  ArrowRight, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Twitter, 
  Youtube,
  Dumbbell,
  Zap,
  Activity,
  Waves,
  Box,
  Flame,
  Microscope,
  Sword,
  Wind
} from "lucide-react";
import { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-[#1A1A25] to-[#0e0e13] shadow-2xl">
        <nav className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-brand-red"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter font-headline">
              <span className="text-brand-red"></span>[[SHOP_NAME]]
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {["Home", "Training", "Equipment", "Locations"].map((item) => (
              <a 
                key={item}
                href="#" 
                className={`uppercase font-bold tracking-widest text-sm transition-colors duration-300 font-headline ${
                  item === "Home" ? "text-brand-red border-b-2 border-brand-red pb-1" : "text-white hover:text-brand-red"
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          <button className="bg-brand-red text-white font-headline font-black px-6 md:px-8 py-2 md:py-3 uppercase tracking-tighter scale-95 active:opacity-80 transition-all hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] text-sm md:text-base">
            JOIN NOW
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-surface border-t border-brand-red/10 px-6 py-8 flex flex-col gap-6"
          >
            {["Home", "Training", "Equipment", "Locations"].map((item) => (
              <a key={item} href="#" className="text-white font-headline font-bold uppercase tracking-widest text-lg">
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Professional Athlete" 
              className="w-full h-full object-cover grayscale brightness-[0.3]" 
              src="[[HERO_IMAGE_URL]]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
            <div className="absolute inset-0 hero-diagonal opacity-30"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-red/10 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
            <motion.div {...fadeIn}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] w-12 bg-brand-red"></div>
                <span className="font-headline font-bold text-brand-red tracking-[0.3em] uppercase text-sm md:text-base">[[TAGLINE]]</span>
              </div>
              <h1 className="font-headline font-black text-5xl md:text-8xl lg:text-[10rem] leading-[0.9] uppercase tracking-tighter mb-8 italic">
                PUSH YOUR <br/> LIMITS <span className="text-brand-red block">BEYOND POWER</span>
              </h1>
              <p className="max-w-xl text-gray-400 text-lg md:text-xl font-light mb-10 leading-relaxed">[[TAGLINE]]</p>
              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <button className="bg-gradient-to-br from-brand-red to-[#C0303C] text-white font-headline font-bold px-10 py-5 uppercase tracking-wider text-lg hover:shadow-[0_0_30px_rgba(230,57,70,0.5)] transition-all">
                  START FREE TRIAL
                </button>
                <button className="border border-white/20 text-white font-headline font-bold px-10 py-5 uppercase tracking-wider text-lg hover:bg-white/5 transition-all">
                  VIEW PROGRAMS
                </button>
              </div>

              <div className="flex flex-wrap gap-8 md:gap-12 border-l border-brand-red/30 pl-8">
                {[
                  { label: "Elite Coaches", value: "50+" },
                  { label: "Facility Access", value: "24/7" },
                  { label: "Members", value: "12k+" }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-headline font-black text-white">{stat.value}</div>
                    <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-surface py-16 border-y border-brand-red/10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "98%", label: "Success Rate" },
              { value: "15", label: "Global Locations" },
              { value: "2.5k", label: "Daily Sessions" },
              { value: "100%", label: "Premium Gear" }
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <span className="block text-4xl md:text-5xl font-headline font-black text-white">{stat.value}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Elite Programs */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-brand-red font-headline font-bold tracking-widest uppercase mb-4 block">Transformation pathways</span>
              <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">ELITE PROGRAMS</h2>
            </div>
            <button className="text-brand-red font-headline font-bold uppercase tracking-widest text-sm border-b-2 border-brand-red pb-1 hover:text-white hover:border-white transition-all">VIEW ALL PATHWAYS</button>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                id: "01",
                icon: <Dumbbell className="text-brand-red" size={48} />,
                title: "[[SERVICE_1]]",
                desc: "Scientific approach to muscle building focused on volume, tension, and metabolic stress."
              },
              {
                id: "02",
                icon: <Zap className="text-brand-red" size={48} />,
                title: "[[SERVICE_2]]",
                desc: "High-intensity functional conditioning designed to incinerate fat and peak your VO2 max."
              },
              {
                id: "03",
                icon: <Activity className="text-brand-red" size={48} />,
                title: "[[SERVICE_3]]",
                desc: "Recovery and mobility protocols used by pro athletes to ensure longevity and peak health."
              }
            ].map((program) => (
              <motion.div 
                key={program.id}
                variants={fadeIn}
                className="bg-surface border-t-4 border-brand-red p-10 md:p-12 group hover:bg-surface-high hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 text-white/5 font-black text-9xl font-headline group-hover:text-brand-red/5 transition-colors">{program.id}</div>
                <div className="mb-8 group-hover:scale-110 transition-transform origin-left block">
                  {program.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-black uppercase mb-4">{program.title}</h3>
                <p className="text-gray-400 mb-10 leading-relaxed font-light">{program.desc}</p>
                <a className="flex items-center gap-2 text-brand-red font-headline font-bold uppercase tracking-widest group-hover:gap-4 transition-all" href="#">
                  Explore <ArrowRight size={16} />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Facilities */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative">
              <img 
                alt="Gym Interior" 
                className="grayscale w-full aspect-square object-cover" 
                src="[[IMAGE_1]]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 bg-brand-red p-8 md:p-12 text-white hidden sm:block">
                <span className="text-4xl md:text-6xl font-headline font-black italic">EST. 2024</span>
              </div>
            </div>
            <div>
              <span className="text-brand-red font-headline font-bold tracking-widest uppercase mb-6 block">The Arena</span>
              <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none mb-12">WORLD-CLASS <br/> FACILITIES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: <Waves size={24} />, label: "Olympic Pool" },
                  { icon: <Box size={24} />, label: "Cryo Chamber" },
                  { icon: <Flame size={24} />, label: "Fuel Bar" },
                  { icon: <Microscope size={24} />, label: "Recovery Lab" },
                  { icon: <Sword size={24} />, label: "Combat Zone" },
                  { icon: <Wind size={24} />, label: "Sauna Suite" }
                ].map((facility) => (
                  <div key={facility.label} className="flex items-center gap-4 group">
                    <span className="bg-background p-4 border border-brand-red/20 group-hover:border-brand-red transition-colors text-brand-red">
                      {facility.icon}
                    </span>
                    <span className="font-headline font-bold text-xl uppercase tracking-tighter">{facility.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
          <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter mb-4 italic">[[SHOP_NAME]] <span className="text-brand-red">TRIBE</span></h2>
            <p className="text-gray-500 tracking-[0.2em] uppercase font-bold text-sm">Hear from those who dared to push</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                name: "James Dalton",
                role: "Triathlete",
                initials: "JD",
                text: "The intensity here is unmatched. Kinetic isn't just a gym; it's a high-performance lab where I discovered my true physical limits."
              },
              {
                name: "Sarah Ross",
                role: "Powerlifter",
                initials: "SR",
                text: "From the equipment to the coaching, everything is elite. I've gained more strength in 6 months here than in 3 years elsewhere."
              },
              {
                name: "Marcus King",
                role: "MMA Athlete",
                initials: "MK",
                text: "The recovery facilities are a game changer. The cryo and mobility work have kept me injury-free during my heaviest training cycles."
              }
            ].map((t) => (
              <div key={t.name} className="bg-surface p-8 md:p-10 border-l-2 border-brand-red italic relative">
                <div className="flex text-brand-red mb-6 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg text-white leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center font-headline font-bold text-white">{t.initials}</div>
                  <div>
                    <div className="font-headline font-black uppercase tracking-tighter text-white">{t.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <div>
                <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none mb-8 italic">JOIN THE <span className="text-brand-red">ELITE</span></h2>
                <p className="text-gray-400 text-xl mb-12 font-light">Your transformation begins with a single step. Complete the form and our performance consultants will contact you within 24 hours.</p>
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border-b border-white/20 focus-within:border-brand-red transition-colors py-2">
                      <label className="block text-xs font-headline font-bold uppercase tracking-widest text-gray-500 mb-1">Full Name</label>
                      <input className="w-full bg-transparent border-none focus:ring-0 text-white font-headline text-xl outline-none" placeholder="John Doe" type="text"/>
                    </div>
                    <div className="relative border-b border-white/20 focus-within:border-brand-red transition-colors py-2">
                      <label className="block text-xs font-headline font-bold uppercase tracking-widest text-gray-500 mb-1">Email Address</label>
                      <input className="w-full bg-transparent border-none focus:ring-0 text-white font-headline text-xl outline-none" placeholder="[[EMAIL]]" type="email"/>
                    </div>
                  </div>
                  <div className="relative border-b border-white/20 focus-within:border-brand-red transition-colors py-2">
                    <label className="block text-xs font-headline font-bold uppercase tracking-widest text-gray-500 mb-1">Select Program</label>
                    <select className="w-full bg-transparent border-none focus:ring-0 text-white font-headline text-xl uppercase outline-none appearance-none">
                      <option className="bg-surface">Hypertrophy X</option>
                      <option className="bg-surface">Kinetic Flow</option>
                      <option className="bg-surface">Mind-Body Lab</option>
                    </select>
                  </div>
                  <button className="w-full md:w-auto bg-brand-red text-white font-headline font-black px-12 py-6 uppercase tracking-[0.2em] text-xl hover:shadow-[0_0_40px_rgba(230,57,70,0.4)] transition-all">
                    CLAIM SESSION
                  </button>
                </form>
              </div>
              <div className="space-y-6">
                {[
                  { icon: <MapPin />, title: "HEADQUARTERS", content: "[[ADDRESS]]" },
                  { icon: <Phone />, title: "CALL US", content: "[[PHONE]] - Available 24/7" },
                  { icon: <Mail />, title: "EMAIL US", content: "[[EMAIL]]" }
                ].map((item) => (
                  <div key={item.title} className="bg-surface-high p-8 flex items-start gap-6 border-l-4 border-brand-red">
                    <span className="text-brand-red">{item.icon}</span>
                    <div>
                      <h4 className="font-headline font-black uppercase text-xl mb-2">{item.title}</h4>
                      <p className="text-gray-400">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-brand-red/15">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="text-2xl font-black text-white uppercase mb-6 font-headline">
              <span className="text-brand-red">K</span>INETIC
            </div>
            <p className="font-sans font-light text-sm tracking-wide text-gray-500 leading-loose mb-8">[[ABOUT_TEXT]]</p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-surface-high flex items-center justify-center hover:bg-brand-red transition-colors duration-300 text-white">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "TRAINING", links: ["Personal Coaching", "Nutrition Lab", "Digital Training", "Corporate Athleticism"] },
            { title: "COMPANY", links: ["Our Science", "Global Locations", "Careers", "Affiliate Program"] },
            { title: "SUPPORT", links: ["Member FAQ", "Terms of Service", "Privacy Policy", "Contact Us"] }
          ].map((group) => (
            <div key={group.title}>
              <h4 className="font-headline font-black text-brand-red uppercase tracking-widest text-lg mb-8">{group.title}</h4>
              <ul className="space-y-4 font-sans font-light text-sm tracking-wide">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-brand-red hover:translate-x-1 transition-all duration-200 block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-sans font-light text-sm tracking-wide text-gray-500">
            © 2024 [[SHOP_NAME]]. ALL RIGHTS RESERVED.
          </span>
          <div className="flex gap-8 font-headline font-bold text-xs uppercase tracking-[0.2em] text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
