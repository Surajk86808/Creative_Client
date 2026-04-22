import { ShieldCheck, GraduationCap, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <section className="py-24 px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-surface-container-high rounded-full opacity-50 blur-3xl"></div>
          <img 
            alt="Principal speaking" 
            className="relative z-10 rounded-[20px] shadow-2xl w-full h-[600px] object-cover" 
            src="[[IMAGE_1]]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-6">A Legacy of Light and Learning</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            [[ABOUT_TEXT]]
          </p>
          
          <div className="space-y-4 mb-10">
            {[
              { icon: ShieldCheck, text: 'Holistic Development Framework' },
              { icon: GraduationCap, text: 'Ivy League Qualified Faculty' },
              { icon: Brain, text: 'Emotional Intelligence Curriculum' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-primary font-semibold">
                <div className="bg-primary/10 p-2 rounded-full">
                  <item.icon className="w-5 h-5" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
          
          <button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold hover:bg-primary-container transition-all">
            Meet the Faculty
          </button>
        </motion.div>
      </div>
    </section>
  );
}
