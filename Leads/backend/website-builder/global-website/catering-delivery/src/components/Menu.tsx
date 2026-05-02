import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const MENU_ITEMS = [
  {
    title: "[[SERVICE_1]]",
    desc: "Heirloom root vegetables roasted in wild honey, served with whipped mountain goat cheese and toasted hazelnuts.",
    price: "€28",
    image: "[[ITEM_IMAGE_1]]"
  },
  {
    title: "[[SERVICE_2]]",
    desc: "Ancient grain loaf fermented for 72 hours, served with hand-churned sea salt butter and wild garlic flowers.",
    price: "€14",
    image: "[[ITEM_IMAGE_2]]"
  },
  {
    title: "[[SERVICE_3]]",
    desc: "Late-season pear poached in star anise and vintage port, paired with a vanilla bean silk and pistachio crumble.",
    price: "€18",
    image: "[[ITEM_IMAGE_3]]"
  }
];

export default function Menu() {
  return (
    <section id="curation" className="py-32 bg-surface px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="font-display text-primary font-bold text-xs tracking-[0.3em] uppercase mb-4 block">The Curation</span>
          <h2 className="font-serif text-5xl md:text-6xl text-on-surface mb-6">Seasonal Specialties</h2>
          <p className="font-sans text-stone-500 font-light text-lg">Our menu transforms with the rhythm of the seasons, honoring the harvest at its peak of vitality.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {MENU_ITEMS.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-8 rounded-[32px] shadow-xl hover:-translate-y-3 transition-all duration-500 group"
            >
              <div className="rounded-2xl overflow-hidden mb-8 h-72">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-serif text-3xl mb-3 text-on-surface">{item.title}</h3>
              <p className="font-sans text-stone-500 text-base leading-relaxed mb-8">{item.desc}</p>
              <div className="flex justify-between items-center pt-6 border-t border-surface">
                <span className="font-display font-bold text-xl text-primary">{item.price}</span>
                <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
