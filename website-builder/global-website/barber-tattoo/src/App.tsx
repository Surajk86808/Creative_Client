import { motion } from "motion/react";
import { 
  Scissors, 
  Brush, 
  PenTool as Ink, 
  ArrowRight, 
  Share2, 
  MapPin, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-background/95 backdrop-blur-sm border-b border-bone/10 h-20">
      <div className="flex items-center gap-2">
        <Scissors className="text-primary w-6 h-6" />
        <span className="text-2xl font-headline tracking-[4px] text-bone">[[SHOP_NAME]]</span>
      </div>
      
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#services" className="font-headline tracking-[2px] text-sm hover:text-primary transition-colors">SERVICES</a>
        <a href="#gallery" className="font-headline tracking-[2px] text-sm hover:text-primary transition-colors">GALLERY</a>
        <a href="#contact" className="font-headline tracking-[2px] text-sm hover:text-primary transition-colors">CONTACT</a>
        <button className="bg-primary text-bone px-5 py-2 font-headline tracking-[2px] text-sm hover:brightness-110 transition-all duration-200">
          BOOK NOW
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden text-bone" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-0 w-full bg-background border-b border-bone/10 p-6 flex flex-col gap-4 md:hidden"
        >
          <a href="#services" onClick={() => setIsMenuOpen(false)} className="font-headline tracking-[2px] text-lg">SERVICES</a>
          <a href="#gallery" onClick={() => setIsMenuOpen(false)} className="font-headline tracking-[2px] text-lg">GALLERY</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="font-headline tracking-[2px] text-lg">CONTACT</a>
          <button className="bg-primary text-bone py-3 font-headline tracking-[2px] text-lg">
            BOOK NOW
          </button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex flex-col justify-center px-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Dark cinematic barber shop" 
          className="w-full h-full object-cover brightness-[0.25]" 
          src="[[HERO_IMAGE_URL]]"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="w-12 h-[1px] bg-secondary"></span>
          <span className="text-secondary font-headline tracking-[3px] text-sm">[[TAGLINE]]</span>
        </div>
        <h1 className="font-headline text-7xl md:text-9xl leading-none tracking-tight mb-4">
          <span className="text-bone block">PRECISION</span>
          <span className="text-primary block">CRAFTED</span>
        </h1>
        <p className="text-muted text-lg max-w-md font-light mb-10 leading-relaxed">[[TAGLINE]]</p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-bone px-10 py-4 font-headline tracking-[3px] text-lg hover:brightness-110 transition-all">
            RESERVE CHAIR
          </button>
          <button className="border border-bone/20 text-bone px-10 py-4 font-headline tracking-[3px] text-lg hover:bg-bone hover:text-background transition-all">
            VIEW ARTISTS
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-12 right-8 flex flex-col items-end gap-6 md:flex-row md:items-center">
        <div className="text-right">
          <span className="block text-4xl font-headline text-secondary tracking-tighter">15+</span>
          <span className="text-[10px] uppercase tracking-[2px] text-muted font-medium">Years Mastery</span>
        </div>
        <div className="text-right">
          <span className="block text-4xl font-headline text-secondary tracking-tighter">2.4K</span>
          <span className="text-[10px] uppercase tracking-[2px] text-muted font-medium">Skins Inked</span>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "[[SERVICE_1]]",
      description: "The signature obsidian taper. Hand-crafted symmetry tailored to your skull structure.",
      icon: <Scissors className="text-secondary w-10 h-10" />,
    },
    {
      title: "[[SERVICE_2]]",
      description: "Bold lines and heavy saturation. Specialized in high-contrast black and grey traditional work.",
      icon: <Ink className="text-secondary w-10 h-10" />,
    },
    {
      title: "[[SERVICE_3]]",
      description: "Line-work using traditional straight razors. Conditioning treatment and structural shaping.",
      icon: <Brush className="text-secondary w-10 h-10" />,
    },
  ];

  return (
    <section id="services" className="py-24 px-8 bg-surface-container-low blade-texture">
      <h2 className="font-headline text-5xl text-bone tracking-[4px] mb-16 text-center">MASTER SERVICES</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <motion.div 
            key={index}
            whileHover={{ y: -10 }}
            className="bg-surface p-8 border-t-4 border-primary group hover:bg-surface-container-high transition-all duration-300"
          >
            <div className="mb-6">{service.icon}</div>
            <h3 className="font-headline text-3xl mb-4 tracking-[2px]">{service.title}</h3>
            <p className="text-muted font-light mb-8 leading-relaxed">{service.description}</p>
            <a href="#contact" className="text-secondary font-headline tracking-[3px] flex items-center gap-2 group-hover:gap-4 transition-all">
              BOOK <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section className="relative py-24 px-8 bg-background flex flex-col md:flex-row gap-16 items-center max-w-7xl mx-auto">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <span className="font-headline text-[25vw] text-bone whitespace-nowrap">EST. 2024</span>
      </div>
      <div className="w-full md:w-1/2 z-10">
        <img 
          alt="Barber working on client" 
          className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" 
          src="[[IMAGE_1]]"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="w-full md:w-1/2 z-10">
        <h2 className="font-headline text-5xl text-primary tracking-[4px] mb-8">THE CRAFT</h2>
        <p className="text-bone text-xl font-light mb-8 leading-relaxed">
          [[ABOUT_TEXT]]
        </p>
        <div className="space-y-4">
          {[
            { label: "CERTIFIED", sub: "Master Barbers" },
            { label: "VINTAGE", sub: "Steel Blades" },
            { label: "CUSTOM", sub: "Ink Artistry" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-headline text-secondary text-xl tracking-[2px]">{item.label}</span>
              <div className="h-[1px] flex-grow bg-bone/10"></div>
              <span className="text-muted text-sm uppercase tracking-[2px]">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  return (
    <section className="py-20 bg-primary px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {[
          { val: "500+", label: "Monthly Fades" },
          { val: "12", label: "Master Artists" },
          { val: "100%", label: "Sharp Focus" },
          { val: "4.9", label: "Rating" }
        ].map((stat, i) => (
          <div key={i}>
            <span className="block font-headline text-6xl text-bone">{stat.val}</span>
            <span className="text-bone/80 uppercase tracking-[3px] text-[10px] font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Gallery = () => {
  const images = [
    "[[GALLERY_IMAGE_1]]",
    "[[GALLERY_IMAGE_2]]",
    "[[GALLERY_IMAGE_3]]",
    "[[GALLERY_IMAGE_4]]",
    "[[GALLERY_IMAGE_5]]",
    "[[GALLERY_IMAGE_6]]"
  ];

  return (
    <section id="gallery" className="py-24 px-8 bg-surface-container-low">
      <h2 className="font-headline text-5xl text-bone tracking-[4px] mb-16 text-center">GALLERY OF BLADES</h2>
      <div className="columns-1 md:columns-3 gap-4 space-y-4 max-w-7xl mx-auto">
        {images.map((src, i) => (
          <motion.img 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full grayscale hover:grayscale-0 transition-all duration-500 border border-bone/5 cursor-pointer" 
            src={src}
            referrerPolicy="no-referrer"
          />
        ))}
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-24 px-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {[
          { text: "The most precise fade I've ever had. These guys treat every haircut like a surgery. No mistakes, just perfection.", author: "MARCUS V." },
          { text: "Obsidian handled my full sleeve. The detail is insane and the healing was perfect. True masters of the ink.", author: "ELIAS R." }
        ].map((t, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-surface-container-high p-12 border-l-4 border-primary relative"
          >
            <span className="absolute top-4 right-8 font-headline text-8xl text-bone/5 select-none">"</span>
            <p className="text-bone italic font-light text-xl mb-6 leading-relaxed">"{t.text}"</p>
            <span className="font-headline text-secondary tracking-[2px]">{t.author}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Contact = () => {
  return (
        <section id="contact" className="py-24 px-8 bg-surface-container-low border-t border-bone/5">
          <div className="max-w-xl mx-auto">
            <h2 className="font-headline text-6xl text-bone tracking-[4px] mb-4 text-center">CLAIM YOUR CHAIR</h2>
        <p className="text-muted text-center mb-12 font-light">[[ABOUT_TEXT]] • [[ADDRESS]] • [[PHONE]] • [[EMAIL]]</p>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-headline tracking-[3px] text-muted mb-2">FULL NAME</label>
            <input 
              className="w-full bg-transparent border-0 border-b border-muted focus:ring-0 focus:border-primary text-bone font-light py-3 transition-all outline-none" 
              type="text" 
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-headline tracking-[3px] text-muted mb-2">SERVICE</label>
              <select className="w-full bg-transparent border-0 border-b border-muted focus:ring-0 focus:border-primary text-bone font-light py-3 appearance-none outline-none cursor-pointer">
                <option className="bg-surface">[[SERVICE_1]]</option>
                <option className="bg-surface">[[SERVICE_2]]</option>
                <option className="bg-surface">[[SERVICE_3]]</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-headline tracking-[3px] text-muted mb-2">PREFERRED DATE</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-muted focus:ring-0 focus:border-primary text-bone font-light py-3 outline-none" 
                type="date" 
              />
            </div>
          </div>
          <button className="w-full bg-primary text-bone py-5 font-headline tracking-[4px] text-xl hover:brightness-110 transition-all">
            SEND REQUEST
          </button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0C] px-8 py-16 flex flex-col md:flex-row justify-between items-start gap-12 border-t border-bone/10">
      <div className="max-w-xs">
        <h4 className="font-headline text-3xl text-bone tracking-[3px] mb-6">[[SHOP_NAME]]</h4>
        <p className="text-muted text-sm leading-relaxed mb-8">Established 2024. Providing elite grooming and custom ink services to those who value the edge.</p>
        <div className="flex gap-4">
          <div className="w-10 h-10 border border-bone/10 flex items-center justify-center hover:border-primary transition-all text-bone cursor-pointer">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="w-10 h-10 border border-bone/10 flex items-center justify-center hover:border-primary transition-all text-bone cursor-pointer">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-16">
        <div>
          <h5 className="font-headline text-primary tracking-[2px] mb-6">NAVIGATION</h5>
          <ul className="space-y-4 text-muted font-light text-sm">
            <li className="hover:text-secondary cursor-pointer transition-colors">Services</li>
            <li className="hover:text-secondary cursor-pointer transition-colors">Gallery</li>
            <li className="hover:text-secondary cursor-pointer transition-colors">Artists</li>
            <li className="hover:text-secondary cursor-pointer transition-colors">Contact</li>
          </ul>
        </div>
        <div>
          <h5 className="font-headline text-primary tracking-[2px] mb-6">HOURS</h5>
          <ul className="space-y-2 text-muted font-light text-[11px] uppercase tracking-[1px]">
            <li>MON-FRI: 10AM - 8PM</li>
            <li>SAT: 9AM - 6PM</li>
            <li>SUN: BY APPOINTMENT</li>
          </ul>
        </div>
      </div>
      <div className="w-full pt-12 border-t border-bone/5 flex justify-between items-center md:hidden">
        <span className="text-[10px] text-muted tracking-[2px]">Â© 2024 [[SHOP_NAME]].</span>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background text-bone selection:bg-primary selection:text-bone">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Services />
        <About />
        <Stats />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
