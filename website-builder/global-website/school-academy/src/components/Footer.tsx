import { Globe, Youtube, Share2, Star } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-blue-50 font-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 px-12 py-20">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-6 h-6 text-tertiary-fixed-dim fill-current" />
            <span className="text-tertiary-fixed-dim font-bold italic text-2xl">[[SHOP_NAME]]</span>
          </div>
          <p className="text-blue-100/80 leading-relaxed">
            [[ABOUT_TEXT]]
          </p>
          <div className="flex gap-4 mt-8">
            {[Globe, Youtube, Share2].map((Icon, i) => (
              <a key={i} className="w-10 h-10 rounded-full border border-blue-100/20 flex items-center justify-center hover:bg-tertiary-fixed-dim hover:text-primary transition-all" href="#">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-tertiary-fixed-dim font-bold uppercase tracking-wider text-sm mb-8">Academics</h4>
          <ul className="space-y-4">
            {['STEM Program', 'Arts & Humanities', 'Physical Education', 'Curriculum Map'].map((item) => (
              <li key={item}>
                <a className="text-blue-100/80 hover:text-tertiary-fixed-dim transition-colors inline-block hover:-translate-y-1" href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-tertiary-fixed-dim font-bold uppercase tracking-wider text-sm mb-8">Admissions</h4>
          <ul className="space-y-4">
            {['Fee Structure', 'Scholarships', 'Enrollment Policy', 'Visit Campus'].map((item) => (
              <li key={item}>
                <a className="text-blue-100/80 hover:text-tertiary-fixed-dim transition-colors inline-block hover:-translate-y-1" href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-tertiary-fixed-dim font-bold uppercase tracking-wider text-sm mb-8">Resources</h4>
          <ul className="space-y-4">
            {['Faculty Portal', 'Parent Dashboard', 'Privacy Policy', 'School Calendar'].map((item) => (
              <li key={item}>
                <a className="text-blue-100/80 hover:text-tertiary-fixed-dim transition-colors inline-block hover:-translate-y-1" href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-100/10 py-8 text-center text-blue-100/50 text-sm">
        © 2024 [[SHOP_NAME]]. Nurturing the Architects of Tomorrow.
      </div>
    </footer>
  );
}
