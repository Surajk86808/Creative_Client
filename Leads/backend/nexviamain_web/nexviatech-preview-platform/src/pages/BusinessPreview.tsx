import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { getSite, SiteData } from '../lib/loadSites';
import NotFound from './NotFound';

export default function BusinessPreview() {
  const { country, category, shopname } = useParams();
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (country && category && shopname) {
      getSite(country, category, shopname)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [country, category, shopname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 rounded-full border-t-2 border-[#00e5d4] border-r-2" />
      </div>
    );
  }

  const isExpired = !data || data.active === false || (new Date(data.expires_at) < new Date());

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-[#f0f4f8] p-6 text-center">
        <Helmet>
          <title>Demo Expired | NexviaTech</title>
        </Helmet>
        <LucideIcons.Clock className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">This demo has expired</h1>
        <p className="text-lg text-white/60 mb-8 max-w-md">Contact NexviaTech to get your website live.</p>
        <a href="https://nexviatech.online" className="px-8 py-4 bg-[#00e5d4] text-[#0a0f1e] rounded-xl font-bold uppercase tracking-wider hover:bg-white transition-all">
          Visit NexviaTech.online
        </a>
      </div>
    );
  }

  // At this point data is guaranteed to be non-null due to isExpired check
  const site = data!;
  const phoneDigits = site.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${phoneDigits}`;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#f0f4f8] font-sans">
      <Helmet>
        <title>{site.name} | Preview by NexviaTech</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-40 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0a0f1e] -z-20" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00e5d4]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6">
            {site.name}
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {site.hero}
          </p>
        </motion.div>
      </section>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {site.services.map((service, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <LucideIcons.CheckCircle className="text-[#00e5d4] mb-4 w-8 h-8" />
              <h3 className="text-xl font-bold text-white">{service}</h3>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <section className="mt-24 grid md:grid-cols-2 gap-12 items-center bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Get In Touch</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <LucideIcons.Phone className="text-[#00e5d4]" />
                <span className="text-lg">{site.phone}</span>
              </div>
              <div className="flex items-center gap-4">
                <LucideIcons.Mail className="text-[#00e5d4]" />
                <span className="text-lg">{site.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <LucideIcons.MapPin className="text-[#00e5d4]" />
                <span className="text-lg">{site.address}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {site.whatsapp && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="px-8 py-4 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-500/30 transition-all">
                  <LucideIcons.MessageCircle size={20} />
                  WhatsApp Us
                </a>
              )}
              <a href={`tel:${site.phone}`} className="px-8 py-4 bg-[#00e5d4] text-[#0a0f1e] rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,212,0.4)] transition-all">
                <LucideIcons.Phone size={20} />
                Call Now
              </a>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="w-full h-64 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/20 italic">
               Map Preview
             </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-white/40">
        <p>Powered by NexviaTech | <a href="https://nexviatech.online" className="hover:text-[#00e5d4] transition-colors">nexviatech.online</a></p>
      </footer>
    </div>
  );
}
