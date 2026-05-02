import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Zap, Layout, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>NexviaTech | Dynamic Website Platform</title>
        <meta name="description" content="AI-powered multi-tenant website generation platform for local businesses." />
      </Helmet>
      
      {/* Hero */}
      <section className="relative px-6 py-24 md:py-32 lg:py-48 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 hero-glow -z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl space-y-6"
        >
          <div className="uppercase tracking-[0.12em] text-[11px] font-bold text-[#00e5d4] mb-4">
            Next-Gen Website Generation Platform
          </div>
          <h1 className="font-display font-extrabold text-white text-5xl md:text-7xl leading-tight">
            Scale Local Business Previews <br className="hidden md:block"/>
            <span className="text-gradient-cyan">Intelligently.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Every local business deserves a website that works. We build it before they even ask.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/india/indore/dentist/quality-dental-care" className="px-6 py-3 bg-[#00e5d4] text-[#0a0f1e] font-display font-bold text-sm rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
              Dentist Demo <ArrowRight size={16} />
            </Link>
            <Link to="/usa/new-york/restaurant/joes-pizza" className="px-6 py-3 bg-[#00e5d4] text-[#0a0f1e] font-display font-bold text-sm rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
              Restaurant Demo <ArrowRight size={16} />
            </Link>
            <a href="https://nexviatech.online" target="_blank" rel="noreferrer" className="px-6 py-3 bg-transparent border border-white/20 text-white font-display font-bold text-sm rounded-lg hover:border-[#00e5d4] hover:text-[#00e5d4] transition-colors flex items-center justify-center gap-2">
              Official Site
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
              <Globe />
            </div>
            <h3 className="font-display font-bold text-xl text-white">Your Business, Online in 24 Hours</h3>
            <p className="text-white/60 text-sm leading-relaxed">Get a professional website live before your next customer searches for you — no waiting, no back-and-forth.</p>
          </div>
          <div className="glass-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
              <Zap />
            </div>
            <h3 className="font-display font-bold text-xl text-white">Looks Like You, Built for Your Industry</h3>
            <p className="text-white/60 text-sm leading-relaxed">Every page is designed specifically for your type of business — not a generic template, but a site that fits how your customers think.</p>
          </div>
          <div className="glass-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
              <Layout />
            </div>
            <h3 className="font-display font-bold text-xl text-white">Turns Visitors Into Calls and Bookings</h3>
            <p className="text-white/60 text-sm leading-relaxed">Built-in WhatsApp, email, and booking buttons so customers can reach you the moment they're interested.</p>
          </div>
        </div>
      </section>
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/916299846516"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-400 hover:scale-110 transition-all z-50 group"
        aria-label="WhatsApp Support"
      >
        <MessageCircle size={28} />
      </a>
    </>
  );
}
