import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const location = useLocation();
  const isPreviewRoute = location.pathname.split('/').filter(Boolean).length === 4;

  if (isPreviewRoute) return null; // Previews have their own attribution layer, but no main navbar ideally. Wait, user said "Navbar: sticky, rgba(10,15,30,0.85) + backdrop blur, cyan logo accent". We can keep it minimal or standard for main site, and a specific preview layer for previews. Let's keep it simple.

  return (
    <nav className="fixed top-0 inset-x-0 h-20 z-50 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00e5d4] to-blue-500 rounded-lg flex items-center justify-center font-bold text-[#0a0f1e]">
            N
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">NexviaTech<span className="text-[#00e5d4]">.online</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link to="/" className="hover:text-[#00e5d4] transition-colors">Platform</Link>
          <Link to="/portfolio" className="hover:text-[#00e5d4] transition-colors">Portfolio</Link>
          <Link to="/pricing" className="hover:text-[#00e5d4] transition-colors">Pricing</Link>
          <a href="https://nexviatech.online" target="_blank" rel="noopener noreferrer" className="hover:text-[#00e5d4] transition-colors">Main Site &rarr;</a>
        </div>
        <Link to="/contact" className="hidden md:inline-flex px-6 py-2.5 bg-[#00e5d4] text-[#0a0f1e] font-bold rounded-lg text-sm uppercase tracking-wide hover:bg-[#00c9ba] transition-colors">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
