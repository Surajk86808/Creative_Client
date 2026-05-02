import { Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-auto md:h-16 bg-[#0a0f1e] border-t border-white/5 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6 md:py-0 shrink-0 mt-auto">
      <div className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium mb-4 md:mb-0">
        © NexviaTech {new Date().getFullYear()} · All Business Data Dynamic
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        <a href="https://www.instagram.com/nexviatech_solutions/" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#00e5d4] text-xs font-bold tracking-widest uppercase transition-colors">
          Instagram
        </a>
        <a href="https://www.linkedin.com/company/nexviatechsolutions" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#00e5d4] text-xs font-bold tracking-widest uppercase transition-colors">
          LinkedIn
        </a>
        <span className="hidden md:block w-px h-4 bg-white/10"></span>
        <a href="https://nexviatech.online" target="_blank" rel="noreferrer" className="text-[#00e5d4] font-bold text-xs tracking-widest uppercase transition-colors">
          nexviatech.online
        </a>
      </div>
    </footer>
  );
}
