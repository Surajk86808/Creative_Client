export default function Stats() {
  const stats = [
    { value: '20+', label: 'Years of Legacy' },
    { value: '15:1', label: 'Student Ratio' },
    { value: '100%', label: 'Safety Record' },
    { value: '250+', label: 'Daily Workshops' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <div className="text-4xl font-headline font-extrabold text-primary mb-1">{stat.value}</div>
            <div className="text-on-surface-variant text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
