import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Compass className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">404</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We could not find that page. It may have been removed.
        </p>
        <Link
          href="/feed"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Browse experiences
        </Link>
      </div>
    </main>
  );
}
