import Link from "next/link";
import { Code2, Grid3X3, UserCircle2 } from "lucide-react";
import AdaptiveAvatar from "@/components/home/AdaptiveAvatar";
import Navbar from "@/components/Navbar";

const TEAM = [
  {
    name: "Himanshu Gholse",
    role: "Senior Technical Interviewer",
    bio: "Backend-focused engineer helping candidates decode interviewer intent and round strategy.",
    image: "/h1.jpg",
    code: "https://github.com/himanshug-08",
    profile: "https://www.linkedin.com/in/himanshu-gholse-6604ba227/",
  },
  {
    name: "Neeraj Magdum",
    role: "System Design Expert",
    bio: "Specializes in architecture rounds and practical trade-off thinking for distributed systems.",
    image: "/n2.jpg",
    code: "https://github.com/nirz306",
    profile: "https://www.linkedin.com/in/neerajmagdum/",
  },
  {
    name: "Nilay Tayade",
    role: "Frontend Architect",
    bio: "Builds high-performance UI systems and helps candidates sharpen frontend interview depth.",
    image: "/n1.jpg",
    code: "https://github.com/nilaytayade",
    profile: "https://www.linkedin.com/in/nilay-tayade/",
  },
  {
    name: "Interview Team",
    role: "HR Specialist",
    bio: "Guides communication and behavioral interview preparation for real hiring workflows.",
    image: "",
    code: "/help",
    profile: "/team",
  },
];

export default function Aboutus() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:py-24">
        <div className="mb-20 space-y-6 text-center">
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">Our Team</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
            Meet the experts focused on helping candidates crack interviews with practical, real-world guidance.
          </p>
          <div className="pt-6">
            <Link
              href="/post"
              className="inline-flex rounded-full bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/30 transition-all hover:opacity-90 active:scale-95"
            >
              Join Our Collective
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="group flex flex-col items-center rounded-2xl border border-slate-800 bg-card-dark p-10 transition-all duration-300 hover:border-primary/40"
            >
              <div className="relative mb-8">
                <div className="size-36 overflow-hidden rounded-full border-2 border-slate-700 transition-colors group-hover:border-primary">
                  <AdaptiveAvatar
                    src={member.image}
                    alt={`${member.name} profile`}
                    fallbackText={member.name}
                    className="h-full w-full object-cover text-3xl"
                    fallbackClassName="bg-gradient-to-br from-slate-700 to-slate-800"
                  />
                </div>
              </div>

              <h3 className="mb-1 text-xl font-bold text-white">{member.name}</h3>
              <p className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-primary">{member.role}</p>
              <p className="mb-8 text-center text-sm leading-relaxed text-slate-400">{member.bio}</p>

              <div className="mb-8 flex gap-5">
                <Link className="text-slate-500 transition-colors hover:text-primary" href={member.code} target="_blank">
                  <Code2 size={20} />
                </Link>
                <Link className="text-slate-500 transition-colors hover:text-primary" href={member.profile} target="_blank">
                  <UserCircle2 size={20} />
                </Link>
              </div>

              <Link
                href={member.profile}
                target="_blank"
                className="w-full rounded-xl bg-slate-800/50 py-3 text-center text-sm font-bold text-slate-200 transition-all hover:bg-primary hover:text-white"
              >
                Contact Me
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-800 bg-background-dark/50 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Grid3X3 className="text-primary" size={24} />
            <span className="text-xl font-bold">The Interview Room</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 The Interview Room. All rights reserved.</p>
          <div className="flex gap-8">
            <Link className="text-slate-500 transition-colors hover:text-primary" href="mailto:contact@the-interview.co.in">
              <UserCircle2 size={20} />
            </Link>
            <Link className="text-slate-500 transition-colors hover:text-primary" href="/feed">
              <Code2 size={20} />
            </Link>
            <Link className="text-slate-500 transition-colors hover:text-primary" href="/team">
              <Grid3X3 size={20} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
