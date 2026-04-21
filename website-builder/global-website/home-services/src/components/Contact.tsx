import { motion } from "motion/react";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface" id="contact">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <div className="lg:w-1/2">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight"
          >
            Let's start your <br/><span className="font-serif-italic">grounded</span> transformation.
          </motion.h2>
          <p className="text-on-surface-variant font-light text-lg mb-12">[[ABOUT_TEXT]]</p>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-2xl">
              <Mail className="text-primary w-8 h-8" />
              <div>
                <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-medium">Email Us</div>
                <div className="text-lg font-serif font-bold text-primary">[[EMAIL]] â€¢ [[PHONE]]</div>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-2xl">
              <MapPin className="text-primary w-8 h-8" />
              <div>
                <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-medium">The Studio</div>
                <div className="text-lg font-serif font-bold text-primary">[[ADDRESS]]</div>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:w-1/2"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-medium text-on-surface-variant px-1">Full Name</label>
                <input className="w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="John Doe" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-medium text-on-surface-variant px-1">Email Address</label>
                <input className="w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="[[EMAIL]]" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-medium text-on-surface-variant px-1">Interest</label>
              <select className="w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all appearance-none">
                <option>[[SERVICE_1]]</option>
                <option>[[SERVICE_2]]</option>
                <option>[[SERVICE_3]]</option>
                <option>General Inquiry</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-medium text-on-surface-variant px-1">Your Message</label>
              <textarea className="w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="Tell us about your home..." rows={5}></textarea>
            </div>
            <motion.button 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-primary text-on-primary py-5 rounded-xl font-medium uppercase tracking-widest text-sm shadow-xl"
            >
              Send Inquiry
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
