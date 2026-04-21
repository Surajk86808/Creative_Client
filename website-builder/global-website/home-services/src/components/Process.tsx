import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Discovery",
    description: "We begin with a deep dive into your home's unique energy and your personal aspirations."
  },
  {
    number: "02",
    title: "Attunement",
    description: "Our artisans craft a tailored plan using sustainable materials and organic principles."
  },
  {
    number: "03",
    title: "Execution",
    description: "With meticulous care, we transform your space into a grounded, living sanctuary."
  }
];

export default function Process() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6"
        >
          The Guided <span className="font-serif-italic">Journey</span>
        </motion.h2>
        <p className="text-on-surface-variant font-light text-lg">A simple, transparent process to ground your home.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step, index) => (
          <motion.div 
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="text-center group"
          >
            <div className="w-20 h-20 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-serif text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
              {step.number}
            </div>
            <h3 className="text-xl font-serif font-bold text-primary mb-4">{step.title}</h3>
            <p className="text-on-surface-variant font-light">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
