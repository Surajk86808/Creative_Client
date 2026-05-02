import { Phone, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-6">
      <h1 className="text-4xl font-display font-bold text-white mb-4">Contact Us</h1>
      <p className="text-white/60 mb-8 max-w-lg">Get in touch to launch your campaign and generate dynamic pre-built websites for local businesses.</p>

      <div className="flex flex-col gap-6 text-white/80 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
        <a href="tel:+916299846516" className="flex items-center gap-4 hover:text-[#00e5d4] transition-colors font-medium">
          <div className="w-10 h-10 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
            <Phone size={20} />
          </div>
          Call us at 6299846516
        </a>
        <a href="mailto:info@nexviatech.online" className="flex items-center gap-4 hover:text-[#00e5d4] transition-colors font-medium">
          <div className="w-10 h-10 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
            <Mail size={20} />
          </div>
          info@nexviatech.online
        </a>
        <a href="mailto:surajk86808@gmail.com" className="flex items-center gap-4 hover:text-[#00e5d4] transition-colors font-medium">
          <div className="w-10 h-10 rounded-full bg-[#00e5d4]/10 flex items-center justify-center text-[#00e5d4]">
            <Mail size={20} />
          </div>
          surajk86808@gmail.com
        </a>
        <a href="https://wa.me/916299846516" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-green-400 hover:text-green-300 transition-colors font-bold mt-2">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
            <MessageCircle size={20} />
          </div>
          WhatsApp Support
        </a>
      </div>
    </div>
  );
}
