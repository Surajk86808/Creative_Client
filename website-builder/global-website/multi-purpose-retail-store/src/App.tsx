import { motion } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Star,
  Users,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RefreshCw,
  HeartHandshake,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

// Placeholders
const SHOP_NAME = "[[SHOP_NAME]]";
const TAGLINE = "[[TAGLINE]]";
const ABOUT_TEXT = "[[ABOUT_TEXT]]";
const SERVICE_1 = "[[SERVICE_1]]";
const SERVICE_2 = "[[SERVICE_2]]";
const SERVICE_3 = "[[SERVICE_3]]";
const ADDRESS = "[[ADDRESS]]";
const PHONE = "[[PHONE]]";
const EMAIL = "[[EMAIL]]";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#" className="font-bold text-2xl tracking-tight text-primary">
                {SHOP_NAME}
                <span className="text-accent">.</span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#categories" className="text-sm font-medium hover:text-accent transition-colors">Categories</a>
              <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">About Us</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-accent transition-colors">Reviews</a>
              <a href="#contact" className="text-sm font-medium hover:text-accent transition-colors">Contact</a>
            </div>

            {/* Icons & CTA */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-primary hover:text-accent transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-primary hover:text-accent transition-colors relative" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
              <a href="#shop" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
                Shop Now
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-4">
              <button className="text-primary relative">
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-primary hover:text-accent transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 top-20 bg-background border-b border-surface md:hidden">
          <div className="px-4 py-8 flex flex-col space-y-6 text-center">
             <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Categories</a>
             <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">About Us</a>
             <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Reviews</a>
             <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Contact</a>
             <div className="h-px bg-surface w-full my-4"></div>
             <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="bg-accent text-white px-5 py-3 rounded-xl text-base font-medium mx-auto w-full max-w-xs shadow-md shadow-accent/20">
                Shop Now
             </a>
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface)_0%,_transparent_50%)]"></div>
      
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center space-x-2 bg-surface px-3 py-1 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-primary/70">New Collection Arrived</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-primary">
            {TAGLINE}
          </h1>
          <p className="text-lg text-primary/60 mb-8 max-w-lg leading-relaxed">
            Experience the perfect curation of premium quality products designed to elevate your everyday life. Shop the latest trends at {SHOP_NAME}.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <a href="#categories" className="bg-accent text-white px-8 py-4 rounded-full font-medium hover:bg-accent/90 transition-all shadow-lg shadow-accent/30 active:scale-95 flex items-center group">
              Start Exploring
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#about" className="bg-surface text-primary px-8 py-4 rounded-full font-medium hover:bg-surface/80 transition-all active:scale-95">
              Learn More
            </a>
          </div>

          <div className="mt-12 flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} src={`https://picsum.photos/seed/face${i}/100/100`} alt="Customer" className="w-10 h-10 rounded-full border-2 border-background object-cover" referrerPolicy="no-referrer" />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center text-yellow-400">
                <Star fill="currentColor" className="w-4 h-4" />
                <Star fill="currentColor" className="w-4 h-4" />
                <Star fill="currentColor" className="w-4 h-4" />
                <Star fill="currentColor" className="w-4 h-4" />
                <Star fill="currentColor" className="w-4 h-4" />
              </div>
              <p className="font-medium mt-0.5 text-primary">Trusted by 10k+ customers</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-surface to-background rounded-[40px] transform rotate-3 scale-105 -z-10"></div>
           <div className="grid grid-cols-2 gap-4 w-full">
              <div className="space-y-4 pt-12">
                <img src="https://picsum.photos/seed/retail1/600/800" alt="Product" className="w-full rounded-2xl object-cover shadow-sm aspect-[4/5]" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/retail2/600/600" alt="Product" className="w-full rounded-2xl object-cover shadow-sm aspect-square" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4 pb-12">
                <img src="https://picsum.photos/seed/retail3/600/600" alt="Product" className="w-full rounded-2xl object-cover shadow-sm aspect-square" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/retail4/600/800" alt="Product" className="w-full rounded-2xl object-cover shadow-sm aspect-[4/5]" referrerPolicy="no-referrer" />
              </div>
           </div>
           
           {/* Floating Badge */}
           <div className="absolute bottom-8 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-surface">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary/60 uppercase">Guarantee</p>
                <p className="font-bold text-primary">100% Authentic</p>
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}

function Categories() {
  const categories = [
    { name: SERVICE_1, image: "https://picsum.photos/seed/cat1/800/1000", delay: 0.1 },
    { name: SERVICE_2, image: "https://picsum.photos/seed/cat2/800/1000", delay: 0.2 },
    { name: SERVICE_3, image: "https://picsum.photos/seed/cat3/800/1000", delay: 0.3 },
  ];

  return (
    <section id="categories" className="py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Categories</h2>
            <p className="text-primary/60">[[TAGLINE]]</p>
          </div>
          <a href="#" className="inline-flex items-center font-medium text-accent hover:underline mt-4 md:mt-0">
            View entire catalog
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: cat.delay }}
              className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white/80 text-sm font-medium mb-1 tracking-wider uppercase">Shop</span>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-accent transition-all duration-300">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const stats = [
    { label: "Products", value: "2,000+" },
    { label: "Happy Customers", value: "15k+" },
    { label: "Years Open", value: "10+" },
    { label: "Average Rating", value: "4.9" },
  ];

  return (
    <section id="about" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative"
          >
             <div className="aspect-square rounded-[3rem] overflow-hidden bg-surface relative">
               <img src="https://picsum.photos/seed/aboutstore/1000/1000" alt="Store Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-primary/10"></div>
             </div>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="absolute -bottom-8 -right-8 bg-primary text-white p-8 rounded-3xl w-64 shadow-2xl hidden md:block"
             >
                <div className="text-5xl font-bold mb-2">10+</div>
                <div className="text-sm text-white/70 font-medium">Years of delivering excellence and building trust.</div>
             </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Redefining the way you shop for quality.</h2>
            <div className="w-20 h-1.5 bg-accent rounded-full mb-8"></div>
            <p className="text-lg text-primary/70 leading-relaxed mb-6 font-medium">
              At {SHOP_NAME}, we believe that every product tells a story. Our journey began with a simple mission: to provide our community with access to thoughtfully selected items that enhance daily life.
            </p>
            <p className="text-primary/60 leading-relaxed mb-10">
              {ABOUT_TEXT}
            </p>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm font-semibold text-primary/50 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 flex-shrink-0" />,
      title: "[[SERVICE_1]]",
      desc: "Every item is rigorously tested to ensure it meets our high standards of durability and excellence."
    },
    {
      icon: <Truck className="w-8 h-8 flex-shrink-0" />,
      title: "[[SERVICE_2]]",
      desc: "Get your orders delivered to your doorstep quickly and securely with our expedited shipping."
    },
    {
      icon: <RefreshCw className="w-8 h-8 flex-shrink-0" />,
      title: "[[SERVICE_3]]",
      desc: "Not exactly what you wanted? Enjoy a hassle-free 30-day return policy on all eligible items."
    },
    {
      icon: <MapPin className="w-8 h-8 flex-shrink-0" />,
      title: "Local Business",
      desc: "Support your local community. We are independently owned and deeply rooted in our hometown."
    }
  ];

  return (
    <section className="py-24 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Shop With Us</h2>
          <p className="text-white/60">[[ABOUT_TEXT]]</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors"
            >
              <div className="w-14 h-14 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      text: "Absolutely stunning quality and incredibly fast shipping. The customer service was exceptionally helpful when I had a question about sizing. Highly recommend!",
      author: "Sarah Jenkins",
      role: "Verified Buyer",
      rating: 5
    },
    {
      text: "I've been a loyal customer for 3 years now. They consistently curate the best products and their attention to detail is evident in everything they do.",
      author: "Marcus Rivera",
      role: "Local Artist",
      rating: 5
    },
    {
      text: "The easiest shopping experience I've had in a long time. The website is beautiful, checkout was a breeze, and the product exceeded my expectations.",
      author: "Emily Chen",
      role: "First-time Shopper",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-surface">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Our Community</h2>
           <p className="text-primary/60 max-w-xl mx-auto">Don't just take our word for it. Here is what our customers have to say about their experience with {SHOP_NAME}.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-surface p-8 rounded-3xl relative">
               <div className="absolute top-8 right-8 text-primary/10">
                 <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h7v-6H6.5v-.83A2.67 2.67 0 0 1 9.17 8.5H10V6H7.17zm10 0A5.17 5.17 0 0 0 12 11.17V18h7v-6h-2.5v-.83A2.67 2.67 0 0 1 19.17 8.5H20V6h-2.83z"></path>
                 </svg>
               </div>
               <div className="flex items-center text-accent mb-6">
                 {[...Array(review.rating)].map((_, i) => (
                   <Star key={i} fill="currentColor" className="w-4 h-4" />
                 ))}
               </div>
               <p className="text-primary/80 font-medium leading-relaxed mb-8 relative z-10">
                 "{review.text}"
               </p>
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {review.author.charAt(0)}
                 </div>
                 <div>
                   <div className="font-bold text-sm">{review.author}</div>
                   <div className="text-xs text-primary/50">{review.role}</div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Visit Our Store</h2>
            <p className="text-primary/60 mb-10 leading-relaxed font-medium">
              We'd love to see you in person! Drop by our physical location to experience our products firsthand, or reach out to us using the details below.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center flex-shrink-0 text-accent mr-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Our Location</h4>
                  <p className="text-primary/60">{ADDRESS}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center flex-shrink-0 text-accent mr-4">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Call Us</h4>
                  <p className="text-primary/60">{PHONE}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center flex-shrink-0 text-accent mr-4">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email Us</h4>
                  <p className="text-primary/60">{EMAIL}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[500px] bg-surface rounded-3xl overflow-hidden relative border border-primary/5">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <MapPin className="w-12 h-12 text-primary/20 mb-4" />
                <p className="text-primary/40 font-medium">Google Maps Placeholder</p>
                <p className="text-xs text-primary/30 mt-2">{ADDRESS}</p>
             </div>
             {/* Imagine an iframe map here */}
             <div className="absolute inset-0 bg-primary/[0.02]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <a href="#" className="font-bold text-2xl tracking-tight text-white inline-block mb-6">
              {SHOP_NAME}
              <span className="text-accent">.</span>
            </a>
            <p className="text-white/50 text-sm leading-relaxed mb-6 pr-4">
             Curating the finest products for modern lifestyles. Quality, design, and reliable service in every purchase.
            </p>
            <div className="flex space-x-4">
               {/* Social placeholders */}
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                  <span className="text-xs font-bold">IG</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                  <span className="text-xs font-bold">FB</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                  <span className="text-xs font-bold">TW</span>
               </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-accent transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Special Offers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-2 rounded-l-lg w-full focus:outline-none focus:border-accent text-sm"
              />
              <button className="bg-accent px-4 py-2 rounded-r-lg hover:bg-accent/90 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-accent/20">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <About />
        <Features />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

