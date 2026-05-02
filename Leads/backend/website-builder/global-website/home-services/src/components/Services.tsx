import { motion } from "motion/react";
import { ArrowRight, Leaf, Wrench, Droplets } from "lucide-react";

const services = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "[[SERVICE_1]]",
    description: "Interior arrangements focused on biophilic principles, air-purifying flora, and non-toxic finishes.",
    color: "border-secondary"
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "[[SERVICE_2]]",
    description: "Restoring family heirlooms and built-in fixtures using ancient wood-working methods and natural oils.",
    color: "border-tertiary-fixed-dim"
  },
  {
    icon: <Droplets className="w-8 h-8" />,
    title: "[[SERVICE_3]]",
    description: "Implementing water-saving systems and natural thermal management to reduce your footprint.",
    color: "border-secondary-fixed"
  }
];

export default function Services() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6"
            >
              Our <span className="font-serif-italic">Atelier</span> Services
            </motion.h2>
            <p className="text-on-surface-variant font-light text-lg">We approach every home with the reverence it deserves, using techniques that honor the earth and your well-being.</p>
          </div>
          <button className="text-secondary font-medium uppercase tracking-widest text-sm border-b-2 border-secondary pb-1 hover:text-primary transition-colors">Explore All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`bg-surface-container-lowest p-8 rounded-2xl border-l-[6px] ${service.color} shadow-sm hover:shadow-xl transition-all group`}
            >
              <div className="text-primary mb-6 transition-transform group-hover:scale-110">
                {service.icon}
              </div>
              <h3 className="text-2xl font-serif font-semibold text-primary mb-4">{service.title}</h3>
              <p className="text-on-surface-variant font-light leading-relaxed mb-6">{service.description}</p>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-4 transition-all">
                LEARN MORE <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
