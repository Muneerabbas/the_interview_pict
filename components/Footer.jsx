import Link from "next/link";
import { DoorOpen, Globe, Mail, Share2 } from "lucide-react";

function Column({ title, links }) {
  return (
    <div>
      <h4 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h4>
      <ul className="space-y-4 text-sm font-bold text-slate-400">
        {links.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-background-dark py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-6 flex items-center gap-2 text-primary">
              <DoorOpen className="text-3xl font-bold" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">The Interview Room</h2>
            </div>
            <p className="mb-6 max-w-sm text-base font-medium leading-relaxed text-slate-400">
              Building hiring transparency for engineers through firsthand interview experiences and peer-led preparation.
            </p>
            <div className="flex gap-3">
              <a className="flex size-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:border-primary/50 hover:text-primary" href="#" aria-label="Website">
                <Globe size={17} />
              </a>
              <a className="flex size-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:border-primary/50 hover:text-primary" href="#" aria-label="Share">
                <Share2 size={17} />
              </a>
              <a className="flex size-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:border-primary/50 hover:text-primary" href="mailto:contact@the-interview.co.in" aria-label="Email">
                <Mail size={17} />
              </a>
            </div>
          </div>

          <Column
            title="Insights"
            links={[
              { label: "Experiences", href: "/feed" },
              { label: "Search", href: "/search" },
              { label: "Preparation", href: "/help" },
              { label: "Share Post", href: "/post" },
            ]}
          />

          <Column
            title="Network"
            links={[
              { label: "About Team", href: "/about" },
              { label: "Community", href: "/team" },
              { label: "Profile", href: "/profile" },
            ]}
          />

          <Column
            title="Legal"
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ]}
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-slate-800/50 pt-8 text-sm font-bold text-slate-500 md:flex-row">
          <p>© 2026 The Interview Room Platform. Forged for builders.</p>
          <button className="flex items-center gap-2 transition-colors hover:text-white">
            <Globe size={15} /> English (US)
          </button>
        </div>
      </div>
    </footer>
  );
}
