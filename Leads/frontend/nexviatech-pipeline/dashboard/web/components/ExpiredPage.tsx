export default function ExpiredPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#07111f] px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,99,132,0.12),_transparent_40%),linear-gradient(180deg,_rgba(10,15,30,0.98),_rgba(5,10,20,1))]" />
      <div className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
        <span className="inline-flex rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-1 text-sm font-medium text-rose-100">
          Demo unavailable
        </span>
        <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">
          This demo has expired
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Contact NexviaTech to launch a fresh website demo, extend this one, or turn it into your full live business site.
        </p>
        <a
          className="mt-8 inline-flex rounded-full bg-cyan-300 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          href="https://nexviatech.online"
          target="_blank"
          rel="noreferrer"
        >
          Contact NexviaTech for your website
        </a>
      </div>
    </div>
  );
}
