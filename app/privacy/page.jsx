import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-4 text-3xl font-black tracking-tight">Privacy Policy</h1>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              We collect only the information needed to run your account and publish interview experiences, such as
              name, email, profile image, and submitted content.
            </p>
            <p>
              Your data is used for authentication, moderation, and product improvements. We do not sell your personal
              data.
            </p>
            <p>
              If you want your content removed, contact us from the email linked to your account and we will process it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
