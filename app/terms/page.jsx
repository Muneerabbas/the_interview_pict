import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-4 text-3xl font-black tracking-tight">Terms of Service</h1>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              By using this platform, you agree to share truthful interview experiences and avoid posting abusive,
              harmful, or misleading content.
            </p>
            <p>
              You remain responsible for the content you submit. We may remove content that violates platform policies.
            </p>
            <p>
              Continued use of the service means you accept future policy updates published on this page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
