import { motion } from "motion/react";

const stats = [
  { value: "450+", label: "Homes Grounded" },
  { value: "28k", label: "Trees Planted" },
  { value: "100%", label: "Plastic Free Delivery" }
];

export default function Stats() {
  return (
    <section className="bg-primary py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-around gap-12 text-center">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="space-y-2"
          >
            <div className="text-tertiary-fixed text-6xl font-serif font-bold">{stat.value}</div>
            <div className="text-on-primary/80 font-light tracking-widest uppercase text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
