import Link from "next/link";
import { Globe, Mail, Share2, DoorOpen } from "lucide-react";

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="mb-8 text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h4>
      <ul className="space-y-5 text-sm font-bold text-slate-400">
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

export default function HomeFooter() {
  return (
    <footer className="border-t border-slate-800 bg-background-dark py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-8 flex items-center gap-2 text-primary">
              <DoorOpen className="text-4xl font-bold" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">The Interview Room</h2>
            </div>
            <p className="mb-8 max-w-sm font-medium leading-relaxed text-slate-400">
              Building hiring transparency for engineers through firsthand interview experiences and peer-led preparation.
            </p>
            <div className="flex gap-4">
              <a className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:border-primary/50 hover:text-primary" href="#" aria-label="Website">
                <Globe size={18} />
              </a>
              <a className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:border-primary/50 hover:text-primary" href="#" aria-label="Share">
                <Share2 size={18} />
              </a>
              <a className="flex size-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:border-primary/50 hover:text-primary" href="mailto:contact@the-interview.co.in" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Insights"
            links={[
              { label: "Question Bank", href: "/feed" },
              { label: "Company Playbooks", href: "/search" },
              { label: "Compensation", href: "/feed" },
              { label: "Study Paths", href: "/help" },
            ]}
          />

          <FooterColumn
            title="Network"
            links={[
              { label: "Activity Feed", href: "/feed" },
              { label: "Hall of Fame", href: "/about" },
              { label: "Find a Mentor", href: "/about" },
              { label: "Workshops", href: "/help" },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Policies", href: "/team" },
            ]}
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-800/50 pt-10 text-sm font-bold text-slate-500 md:flex-row">
          <p>© 2026 The Interview Room Platform. Forged for builders.</p>
          <button className="flex items-center gap-2 transition-colors hover:text-white">
            <Globe size={16} /> English (US)
          </button>
        </div>
      </div>
    </footer>
  );
}
