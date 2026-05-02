import type { SiteRecord } from "@/lib/sites-store";

type SitePageProps = {
  site: SiteRecord;
};

function getWhatsAppHref(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export default function SitePage({ site }: SitePageProps) {
  return (
    <div className="relative overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,229,212,0.18),_transparent_45%),linear-gradient(180deg,_rgba(10,15,30,0.95),_rgba(6,12,24,1))]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:px-8 lg:px-12">
        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur md:grid-cols-[1.3fr_0.7fr] md:p-12">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
              Live demo website
            </span>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                {site.name}
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                {site.hero}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6">
            <h2 className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">
              Contact
            </h2>
            <div className="mt-5 space-y-4 text-slate-200">
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Phone</span>
                <a className="text-lg text-white hover:text-cyan-200" href={`tel:${site.phone}`}>
                  {site.phone}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Email</span>
                <a className="text-lg text-white hover:text-cyan-200" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">Address</span>
                <span className="text-lg text-white">{site.address}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Services</p>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              Everything your customers need to know at a glance
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {site.services.map((service) => (
              <div
                key={service}
                className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur"
              >
                <p className="font-display text-2xl text-white">{service}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Tailored delivery, clear communication, and a polished digital presence designed to build trust quickly.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 backdrop-blur md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">Reach Out</p>
              <h2 className="mt-2 font-display text-3xl text-white">
                Ready to connect with {site.name}?
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                href={`tel:${site.phone}`}
              >
                Call Now
              </a>
              {site.whatsapp ? (
                <a
                  className="rounded-full border border-cyan-200/40 bg-transparent px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-200/10"
                  href={getWhatsAppHref(site.phone)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
          Powered by NexviaTech
        </footer>
      </div>
    </div>
  );
}
