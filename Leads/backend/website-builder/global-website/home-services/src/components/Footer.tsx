import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="text-3xl font-serif-italic text-on-primary mb-6">[[SHOP_NAME]]</div>
          <p className="text-on-primary/70 text-sm font-light leading-relaxed">[[ABOUT_TEXT]]</p>
        </div>
        
        <div>
          <h4 className="text-on-primary uppercase tracking-widest font-medium text-xs mb-8">Navigation</h4>
          <ul className="space-y-4 text-sm font-light text-on-primary/70">
            <li><a href="#" className="hover:text-on-primary transition-all">Services</a></li>
            <li><a href="#" className="hover:text-on-primary transition-all">Our Process</a></li>
            <li><a href="#" className="hover:text-on-primary transition-all">The Journal</a></li>
            <li><a href="#" className="hover:text-on-primary transition-all">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-on-primary uppercase tracking-widest font-medium text-xs mb-8">Follow</h4>
          <ul className="space-y-4 text-sm font-light text-on-primary/70">
            <li><a href="#" className="hover:text-on-primary transition-all">Instagram</a></li>
            <li><a href="#" className="hover:text-on-primary transition-all">Pinterest</a></li>
            <li><a href="#" className="hover:text-on-primary transition-all">Journal</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-on-primary uppercase tracking-widest font-medium text-xs mb-8">Newsletter</h4>
          <div className="relative">
            <input 
              className="w-full bg-white/5 border-none rounded-full px-6 py-3 text-sm focus:ring-1 focus:ring-on-primary/30" 
              placeholder="Email address" 
              type="email" 
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-on-primary">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 border-t border-on-primary/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-on-primary/50 uppercase tracking-widest">
        <div>© 2024 [[SHOP_NAME]]. Built with Intention.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-on-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-on-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
