import { Microscope, Palette, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Courses() {
  const courses = [
    {
      title: '[[SERVICE_1]]',
      description: 'Advanced laboratory experiments and robotics for curious young minds exploring the future of tech.',
      icon: Microscope,
      popular: false,
    },
    {
      title: '[[SERVICE_2]]',
      description: 'From digital illustration to classical music, we nurture the unique artistic voice within every student.',
      icon: Palette,
      popular: true,
    },
    {
      title: '[[SERVICE_3]]',
      description: 'Developing critical thinkers through historical analysis, sociology, and modern linguistic studies.',
      icon: Globe,
      popular: false,
    },
  ];

  return (
    <section className="py-24 px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-4">Our Core Academics</h2>
          <div className="h-1.5 w-24 bg-tertiary-fixed-dim rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`bg-white p-8 rounded-lg shadow-sm border-t-[3px] border-primary flex flex-col h-full relative group transition-all duration-300 ${course.popular ? 'scale-105 ring-4 ring-primary/5' : ''}`}
            >
              {course.popular && (
                <div className="absolute top-4 right-4 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Popular
                </div>
              )}
              <course.icon className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-headline font-bold mb-4">{course.title}</h3>
              <p className="text-on-surface-variant mb-8 flex-grow">{course.description}</p>
              <a className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                Explore Program <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
