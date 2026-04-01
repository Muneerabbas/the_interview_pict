"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Copy,
  Check,
  MessageSquare,
  Search,
  ArrowRight,
  Mail,
  FileText,
  ShieldQuestion,
  ChevronDown,
  Sparkles,
  BookOpen,
  Send
} from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left transition-all hover:text-blue-600 dark:hover:text-cyan-400"
      >
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 dark:text-slate-400 leading-relaxed italic">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HelpPage() {
  const { resolvedTheme } = useTheme();
  const [markdown, setMarkdown] = useState(`
## 🚀 Interview Experience Template

Welcome to your Interview Experience Guide! This template is here to help you share your journey in a way that’s informative and exciting. Feel free to customize it as you wish and help future aspirants!

---

### 1. 🏢 **Company & Role**

*   **Company:** [Company Name] (e.g., Google, Microsoft, Startup X)
*   **Role:** [Job Title] (e.g., SDE Intern, Software Engineer, Data Scientist)
*   **Batch/Year of Graduation:** [Your Graduation Year] (e.g., 2024, 2023)
*   **Branch:** [Your Branch of Engineering] (e.g., Computer Science, IT, Electronics)

---

### 2. 📅 **Application Process**

*   **How did you apply?** (e.g., LinkedIn, Company Website, Referral, On-Campus)
*   **Timeline:**
    *   **Application Date:** [Date]
    *   **Online Assessment Date:** [Date] (if applicable)
    *   **Interview Dates:** [Date(s)]
    *   **Offer Date:** [Date] (if applicable)

---

### 3. 💬 **Interview Rounds**

#### Round 1: [Round Name] (e.g., Online Assessment, Technical Interview 1)
*   **Type:** [e.g., Coding, MCQ, Technical, HR]
*   **Description:** [Detailed description of the round. What kind of questions were asked? Coding problems, DSA concepts, System Design, Behavioral questions etc.]
    *   **Example Questions:**
        1.  [Question 1] 👨‍💻
        2.  [Question 2] 🧠
        3.  [Question 3] 🔥
*   **Difficulty Level:** [Easy, Medium, Hard]
*   **Your Experience:** [How did you perform? What was challenging? Tips for this round?]

#### Round 2: [Round Name] (e.g., Technical Interview 2, HR Round)
*   **Type:** [e.g., Coding, Technical, HR, Managerial]
*   **Description:** [Detailed description of the round]
    *   **Example Questions:**
        1.  [Question 1] 🔍
        2.  [Question 2] 💡
*   **Difficulty Level:** [Easy, Medium, Hard]
*   **Your Experience:** [Your performance and tips]

#### Round 3 (and subsequent rounds if any):

*   [Follow the same format as above for each round.]

---

### 4. 📊 **Overall Experience & Tips**

*   **Overall Interview Experience:** [How was your overall experience with the company? Positive, negative, or neutral?]
*   **What to prepare?** 💯 [List of topics to prepare for this company and role, e.g., DSA, System Design, specific technologies, behavioral questions.]
*   **Tips for Aspirants:** ✨ [Any general tips or advice for future candidates? Share your golden nuggets!]
*   **Verdict:** [Selected/Rejected/Waiting] (Optional)

---

### 5. 🖼️ **Add Images!**
![image](https://i.imgflip.com/9jbjc6.jpg)

Feel free to upload any image that showcases your interview experience—perhaps a photo of the company’s office or your work environment. Visuals help make your experience even more relatable!

---

### 6. 📝 **Additional Comments (Optional)**

*   [Any other information you want to share, e.g., interviewer feedback, company culture insights, salary discussions, etc.]

---

### 💡 **Code Snippet Examples (Optional)**

Here’s an example of a coding question you could include in your experience. Feel free to add some code snippets to demonstrate your problem-solving skills!

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\`

---

Good Luck, and Remember: Stay Confident! 😎

**Note:** Be as detailed as possible, and don’t forget to replace the bracketed placeholders with your actual interview details. The more info you provide, the more helpful your experience will be to others. 🙌
`);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const editorColorMode = mounted && resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const steps = [
    { title: "Sign In", desc: "Authenticate via Google to start contributing.", icon: ShieldQuestion },
    { title: "Pick a Template", desc: "Copy the standard format below to save time.", icon: FileText },
    { title: "Share & Inspire", desc: "Submit your post and help thousands of juniors.", icon: Send }
  ];

  const faqs = [
    { question: "How do I edit my experience after posting?", answer: "Go to your Profile, find the post, and click on 'Edit'. You can refine your content anytime." },
    { question: "Are my contributions anonymous?", answer: "Currently, all posts are attributed to your Google profile name. We are considering an 'Anonymous' mode for future updates." },
    { question: "Can I include code snippets?", answer: "Absolutely! The editor supports standard Markdown, so you can fence your code blocks with language identifiers." },
    { question: "What should I do if a company asks me to remove a post?", answer: "If you receive a legal request or NDA concern, please contact our support team immediately at help@theinterviewroom.in" }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFEFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-cyan-400"
          >
            <HelpCircle size={14} />
            Help Center
          </motion.div>
          <h1 className="mt-8 text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            How can we <br className="sm:hidden" /> <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">help you</span> today?
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto italic font-medium">
            Find guides, templates, and answers to common questions about sharing your interview journey.
          </p>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full dark:bg-cyan-500/10 pointer-events-none" />
        <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] bg-indigo-200/20 blur-[100px] rounded-full dark:bg-indigo-500/10 pointer-events-none" />
      </section>

      <main className="container mx-auto px-6 pb-32">
        {/* Quick Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:bg-slate-900/50 dark:border-slate-800"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic">0{idx + 1}. {step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Template Section */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                Experience Template <Sparkles className="text-blue-500" />
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 italic">Copy this standard format to make your contribution more detailed and structured.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyClick}
              className={`flex items-center gap-2 rounded-2xl px-8 py-4 font-black transition-all shadow-xl ${copySuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-slate-900 text-white hover:bg-blue-600 dark:bg-white dark:text-slate-950'}`}
            >
              {copySuccess ? <Check size={20} /> : <Copy size={20} />}
              {copySuccess ? 'Copied To Clipboard' : 'Copy Template Text'}
            </motion.button>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/30">
            <div className="p-1 sm:p-2">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <MDEditor
                  value={markdown}
                  preview="live"
                  hideToolbar={true}
                  data-color-mode={editorColorMode}
                  className="w-full h-full read-only-editor !bg-transparent !border-none"
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </section>


      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .read-only-editor .w-md-editor-text {
          cursor: default !important;
        }
        .w-md-editor-preview {
            padding: 2rem !important;
        }
      `}</style>
    </div>
  );
}
