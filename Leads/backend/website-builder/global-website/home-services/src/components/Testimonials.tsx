import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Their attention to detail and commitment to using zero-VOC materials changed how we breathe in our own home. Truly transformative experience.",
    author: "Eleanor Vance",
    role: "Residential Client"
  },
  {
    text: "The restoration of our mid-century cabinets was done with such soul. You can tell they actually care about the heritage of the wood.",
    author: "Marcus Thorne",
    role: "Artisan Collector"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.author}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface-container-lowest p-10 rounded-2xl border-t-4 border-tertiary-fixed shadow-sm"
            >
              <div className="flex gap-1 mb-6 text-tertiary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xl font-serif font-medium italic text-primary leading-relaxed mb-8">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-dim"></div>
                <div>
                  <div className="font-bold text-primary">{testimonial.author}</div>
                  <div className="text-xs uppercase tracking-widest text-on-surface-variant">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
