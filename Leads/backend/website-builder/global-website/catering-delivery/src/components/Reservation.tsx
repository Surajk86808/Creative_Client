import { motion } from "motion/react";
import { MapPin, Clock, Phone } from "lucide-react";

export default function Reservation() {
  return (
    <section id="inquiry" className="py-32 bg-surface-container px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="font-display text-primary font-bold text-xs tracking-[0.3em] uppercase mb-4 block">Inquiry</span>
          <h2 className="font-serif text-5xl md:text-6xl text-on-surface mb-10">The Table Awaits</h2>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Marcus Aurelius"
                  className="w-full bg-white border-none rounded-xl p-5 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-stone-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  placeholder="[[EMAIL]]"
                  className="w-full bg-white border-none rounded-xl p-5 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Party Size</label>
                <select className="w-full bg-white border-none rounded-xl p-5 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-stone-500 appearance-none">
                  <option>2 Guests</option>
                  <option>4 Guests</option>
                  <option>6+ Guests (Private)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Preferred Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white border-none rounded-xl p-5 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-stone-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Special Request</label>
              <textarea 
                rows={4}
                placeholder="Note allergies or celebration details..."
                className="w-full bg-white border-none rounded-xl p-5 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-stone-300"
              />
            </div>

            <button className="w-full bg-primary text-white py-6 rounded-xl font-display font-bold text-lg hover:opacity-90 active:scale-[0.99] transition-all shadow-xl shadow-primary/20">
              Confirm Request
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="rounded-3xl overflow-hidden h-[400px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <img 
              src="[[IMAGE_3]]" 
              alt="Location" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg flex gap-5">
              <MapPin className="text-primary w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-xs mb-2 uppercase tracking-widest">Visit Us</h4>
                <p className="text-stone-500 text-sm leading-relaxed">[[ADDRESS]]</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg flex gap-5">
              <Clock className="text-primary w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-xs mb-2 uppercase tracking-widest">Kitchen Hours</h4>
                <p className="text-stone-500 text-sm leading-relaxed">Tues - Sun: 12:00 - 22:30<br/>Monday: Closed</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary p-10 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-secondary/20">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] mb-2 opacity-70">Direct Line</div>
              <div className="text-3xl font-serif">[[PHONE]]</div>
            </div>
            <Phone className="w-10 h-10 opacity-20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
