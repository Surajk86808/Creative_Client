import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-on-surface pt-32 pb-16 px-6 md:px-12 text-white/90">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
        <div className="space-y-8">
          <span className="text-3xl font-bold font-serif">
            [[SHOP_NAME]] <i className="text-primary-light not-italic"></i>
          </span>
          <p className="font-sans text-white/50 text-base leading-relaxed max-w-xs">
            [[ABOUT_TEXT]]
          </p>
          <div className="flex gap-5">
            {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
              <a 
                key={i}
                href="#" 
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
              >
                <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-serif text-primary-light text-xl mb-10 italic">The Journal</h4>
          <ul className="space-y-5 font-sans text-white/40 text-sm tracking-wide">
            <li><a href="#" className="hover:text-white transition-colors">Spring Harvest Notes</a></li>
            <li><a href="#" className="hover:text-white transition-colors">The Art of Sourdough</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cellar Master Interviews</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Seasonal Recipes</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-primary-light text-xl mb-10 italic">Connections</h4>
          <ul className="space-y-5 font-sans text-white/40 text-sm tracking-wide">
            <li><a href="#" className="hover:text-white transition-colors">Inquiry Form</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Private Dining</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Gift Curation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Career Sanctuary</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-primary-light text-xl mb-10 italic">Legal</h4>
          <ul className="space-y-5 font-sans text-white/40 text-sm tracking-wide">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Experience</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cookie Ledger</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
        <span>© 2024 [[SHOP_NAME]]. All rights reserved.</span>
        <div className="flex gap-12">
          <span>Crafted in Florence</span>
          <span>Established 1924</span>
        </div>
      </div>
    </footer>
  );
}
