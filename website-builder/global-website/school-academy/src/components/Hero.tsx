import { Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <header className="relative bg-surface-container-low dot-grid pt-16 pb-24 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center bg-primary/10 text-on-primary-fixed-variant px-4 py-1.5 rounded-full font-label text-xs font-bold tracking-widest uppercase mb-6">
            [[TAGLINE]]
          </div>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface font-extrabold leading-[1.1] tracking-tight mb-6">
            [[SHOP_NAME]]: Nurturing the <span className="text-primary">Architects</span> of Tomorrow
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
            [[TAGLINE]]
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Start Learning Today
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed px-8 py-4 rounded-full font-bold transition-all"
            >
              View Curriculum
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: '1.2k+' },
              { label: 'Faculty', value: '85+' },
              { label: 'Awards', value: '42' },
              { label: 'Success', value: '99%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-primary/5">
                <div className="text-2xl font-headline font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-on-surface-variant font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(16,26,53,0.12)]">
            <img 
              alt="School Campus" 
              className="w-full h-[500px] object-cover" 
              src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="bg-tertiary-fixed-dim p-2 rounded-full text-white">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-on-surface font-bold">5.0 Rating</div>
              <div className="text-xs text-on-surface-variant">Parent Satisfaction</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-8 -left-8 z-20 bg-tertiary-fixed p-5 rounded-2xl shadow-xl flex items-center gap-4"
          >
            <Trophy className="w-10 h-10 text-on-tertiary-fixed-variant fill-current" />
            <div className="text-on-tertiary-fixed-variant font-bold leading-tight">
              Excellence Award<br/><span className="text-xs font-normal">Academic Year 2023</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
