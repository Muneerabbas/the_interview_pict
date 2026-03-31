import React from 'react';
import Navbar from '@/components/Navbar';
import { Shield, FileText, CheckCircle2, AlertTriangle, Scale, HelpCircle } from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = "March 31, 2024";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: CheckCircle2,
      content: "By accessing or using theInterviewRoom, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      title: "2. User Accounts",
      icon: Shield,
      content: "To contribute experiences or interact with the community, you may be required to sign in via Google. You are responsible for maintaining the security of your account and for all activities that occur under your account. We reserve the right to suspend accounts that violate our community guidelines."
    },
    {
      title: "3. Content Ownership & License",
      icon: FileText,
      content: "By sharing an interview experience on theInterviewRoom, you grant us a non-exclusive, worldwide, royalty-free license to use, host, store, reproduce, and display such content. You represent that you own or have the necessary rights to any content you post and that it does not infringe on any third-party rights or confidential company information (NDAs)."
    },
    {
      title: "4. Prohibited Conduct",
      icon: AlertTriangle,
      content: "Users agree not to: (a) post false or misleading information; (b) share strictly confidential interview questions that violate specific company NDAs; (c) harass or abuse other users; (d) use automated systems to scrape data; or (e) attempt to interfere with the proper working of the platform."
    },
    {
      title: "5. Disclaimer of Warranties",
      icon: HelpCircle,
      content: "The content on theInterviewRoom is provided on an 'as is' basis. While we strive for accuracy, we do not warrant that the interview experiences or preparation tips are 100% accurate, complete, or current. Use of the platform is at your own risk."
    },
    {
      title: "6. Limitation of Liability",
      icon: Scale,
      content: "In no event shall theInterviewRoom or its contributors be liable for any damages (including, without limitation, loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />

      <main className="container mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-cyan-400">
            <Scale size={14} />
            Legal Policy
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1>
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
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-cyan-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-slate-800 dark:text-cyan-400 dark:group-hover:bg-slate-700">
                    <Icon size={24} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 italic">
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

export default TermsPage;
