import React from 'react';
import Navbar from "@/components/Navbar";
import { Lock, Eye, Database, Share2, UserCheck, Mail } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = "March 31, 2024";

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: "When you sign in via Google, we collect basic profile information including your name, email address, and profile picture. Additionally, we store the interview experiences and comments you voluntarily share on the platform."
    },
    {
      title: "2. How We Use Information",
      icon: Eye,
      content: "We use your information to: (a) provide and maintain the service; (b) attribute your contributions to your profile; (c) personalize your experience; and (d) communicate important updates about the platform."
    },
    {
      title: "3. Cookies & Tracking",
      icon: UserCheck,
      content: "theInterviewRoom uses essential cookies for authentication (via NextAuth) and session management. We may also use analytics to understand how users interact with the platform to improve our features."
    },
    {
      title: "4. Sharing Your Information",
      icon: Share2,
      content: "We do not sell your personal data. Your profile name and picture are displayed alongside your public contributions (experiences and comments). We may share data with third-party service providers (like database or hosting providers) only as necessary to operate the platform."
    },
    {
      title: "5. Data Security",
      icon: Lock,
      content: "We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
    },
    {
      title: "6. Your Data Rights",
      icon: Mail,
      content: "You have the right to access the data we hold about you. You can clear your session data as described in the Logout process. For complete account deletion or data requests, please contact us via email."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />

      <main className="container mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
            <Lock size={14} />
            Privacy Policy
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Your Privacy Matters</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Last Updated: <span className="font-semibold text-slate-900 dark:text-slate-200">{lastUpdated}</span>
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section
                key={index}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-cyan-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-100 dark:bg-slate-800 dark:text-cyan-400 dark:group-hover:bg-slate-700">
                    <Icon size={24} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                      {section.content}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>


      </main>
    </div>
  );
};

export default PrivacyPage;
