import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Lumina transformed my daughter's approach to learning. She used to be timid, but now she leads her robotics team with confidence.",
      author: "Sarah Miller",
      role: "Mother of Grade 8 Student",
      initials: "SM",
    },
    {
      quote: "The teacher-to-student ratio is perfect. My son gets the individual attention he needs to excel in advanced mathematics.",
      author: "James David",
      role: "Father of Grade 10 Student",
      initials: "JD",
    },
    {
      quote: "Lumina doesn't just teach subjects; they teach children how to think, create, and lead. Highly recommended for any parent.",
      author: "Elena Park",
      role: "Mother of Grade 5 Student",
      initials: "EP",
    },
  ];

  return (
    <section className="py-24 px-8 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-16">Parent Perspectives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm border-t-[3px] border-tertiary-fixed-dim relative">
              <div className="mb-6 text-tertiary-fixed-dim">
                <Quote className="w-8 h-8 fill-current" />
              </div>
              <p className="italic text-on-surface-variant mb-8 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-on-surface">{t.author}</div>
                  <div className="text-xs text-on-surface-variant font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
