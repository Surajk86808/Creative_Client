import { Shield, Award, Users, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function Benefits() {
  const benefits = [
    {
      title: 'Secure Campus',
      description: '24/7 security and advanced tracking systems ensure peace of mind for every parent.',
      icon: Shield,
    },
    {
      title: 'Elite Credentials',
      description: 'Our curriculum is recognized by leading international educational bodies.',
      icon: Award,
    },
    {
      title: 'Vibrant Community',
      description: 'Join a network of motivated students and supportive, active parents.',
      icon: Users,
    },
    {
      title: 'Global Exposure',
      description: 'Annual international tours and virtual exchange programs with partner schools.',
      icon: Compass,
    },
  ];

  return (
    <section className="py-24 px-8 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-headline font-bold text-white mb-4">Why Families Choose Lumina</h2>
          <p className="text-primary-fixed max-w-2xl mx-auto">Providing more than just education — we build a foundation for life.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white p-10 rounded-lg flex gap-6 group transition-all"
            >
              <div className="shrink-0 bg-tertiary-fixed-dim w-16 h-16 rounded-xl flex items-center justify-center text-on-tertiary-fixed">
                <benefit.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold mb-3 text-on-surface">{benefit.title}</h3>
                <p className="text-on-surface-variant">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
