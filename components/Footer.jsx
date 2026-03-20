"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Heart,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  Send
} from "lucide-react";

export default function Footer({ isLandingPage = false }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Subscribed successfully! 🎉");
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Error subscribing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/60 bg-white/80 backdrop-blur-xl text-slate-900">
      {/* Decorative background blurs */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full blur-[120px] bg-blue-100/50" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full blur-[120px] bg-indigo-100/50" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & Socials (takes more space) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20">
                <span className="font-bold text-lg">ti</span>
              </div>
              <span className="text-xl">
                the<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold">Interview</span>
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed max-w-sm text-slate-500">
              Empowering students with real interview experiences and practical insights from top candidates at leading tech companies. Your roadmap to dream jobs.
            </p>
            <div className="flex items-center gap-5 pt-2">
              {[
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                >
                  <social.icon size={18} className="transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:ml-auto space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Quick Links</h3>
            <ul className="space-y-4 text-[15px] font-medium">
              {[
                { name: "About us", href: "/about" },
                { name: "Help Center", href: "/help" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 transition-colors text-slate-600 hover:text-blue-600">
                    <span className="relative overflow-hidden">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-full h-[1px] transform -translate-x-[101%] transition-transform duration-300 group-hover:translate-x-0 bg-blue-600"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Contact & Info</h3>
            <div className="space-y-5 text-[15px] font-medium">
              <a
                href="https://maps.app.goo.gl/xy4z53owHAz4SxgA8"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 transition-colors text-slate-600 hover:text-slate-900"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors bg-blue-50 group-hover:bg-blue-100 text-blue-600">
                  <MapPin size={16} />
                </div>
                <span className="leading-relaxed">PICT, Pune, <br/>Maharashtra 411045</span>
              </a>
              <a
                href="mailto:hello@theinterview.com"
                className="group flex items-center gap-4 transition-colors text-slate-600 hover:text-slate-900"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors bg-blue-50 group-hover:bg-blue-100 text-blue-600">
                  <Mail size={16} />
                </div>
                <span>hello@theinterview.com</span>
              </a>
            </div>
          </div>

          {/* Newsletter (takes 3 cols on lg) */}
          <div className="lg:col-span-3 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Stay Updated</h3>
            <p className="text-[15px] leading-relaxed text-slate-500">
              Get the latest interview experiences and tips delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-300 disabled:opacity-70 bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-inner"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 text-slate-400 group-focus-within:text-blue-500" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-70 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
              >
                <span>{isSubmitting ? "Subscribing..." : "Subscribe Now"}</span>
                {!isSubmitting && <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
              </button>
              {message && (
                <p className={`text-sm font-medium ${message.includes("success") ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between border-slate-200/80">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} theInterview community. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Made with</span>
            <div>
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </div>
            <span>
              by <span className="font-semibold text-slate-900">theInterview Team</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}