import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-4 text-3xl font-black tracking-tight">The Interview Team</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Meet the contributors building The Interview Room and helping candidates prepare with real interview stories.
          </p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Visit the detailed team page on the <Link href="/about" className="font-semibold text-primary underline hover:text-primary/80">About</Link> section.
          </p>
        </div>
      </section>
    </main>
  );
}
