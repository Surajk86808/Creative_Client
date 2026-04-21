import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-surface-container p-12">
          <h2 className="text-4xl font-headline font-bold text-primary mb-6">Let's Discuss Your Child's Future</h2>
          <p className="text-on-surface-variant mb-10 leading-relaxed text-lg">
            [[ABOUT_TEXT]]
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary shrink-0" />
              <div className="text-on-surface-variant">[[ADDRESS]]</div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary shrink-0" />
              <div className="text-on-surface-variant">[[PHONE]]</div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary shrink-0" />
              <div className="text-on-surface-variant">[[EMAIL]]</div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 p-12">
          <div className="mb-6">
            <span className="text-tertiary font-bold tracking-tight uppercase text-sm block mb-2">Limited seats — enroll today!</span>
            <h3 className="text-2xl font-headline font-bold">Registration Inquiry</h3>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Parent's Name</label>
              <input 
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none" 
                placeholder="e.g. John Doe" 
                type="text"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Email Address</label>
              <input 
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none" 
                placeholder="[[EMAIL]]" 
                type="email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Grade of Interest</label>
              <select className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary py-3 px-4 outline-none">
                <option>Kindergarten</option>
                <option>Elementary (Grades 1-5)</option>
                <option>Middle School (Grades 6-8)</option>
                <option>High School (Grades 9-12)</option>
              </select>
            </div>
            <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl mt-4 hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
