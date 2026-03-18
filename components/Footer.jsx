"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Heart,
  MapPin,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.includes("@")) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Subscribed successfully!");
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Error subscribing. Please try again.");
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 shadow-sm">
                <span className="text-white font-bold text-sm">ti</span>
              </div>
              <span className="text-lg">
                the<span className="font-bold">Interview</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Empowering students with real interview experiences and practical insights from top candidates at leading tech companies.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-slate-600 transition"><Twitter size={18} /></a>
              <a href="#" className="hover:text-slate-600 transition"><Linkedin size={18} /></a>
              <a href="#" className="hover:text-slate-600 transition"><Instagram size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 lg:ml-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Quick Links</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-slate-600 hover:text-slate-900">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-600 hover:text-slate-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Contact</div>
            <div className="space-y-3 text-sm">
              <a
                href="https://maps.app.goo.gl/xy4z53owHAz4SxgA8"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-slate-600 hover:text-slate-900"
              >
                <MapPin size={18} className="translate-y-0.5 text-blue-600 shrink-0" />
                <span>PICT, Pune, Maharashtra 411045</span>
              </a>
              <a
                href="mailto:hello@theinterview.com"
                className="group flex items-start gap-3 text-slate-600 hover:text-slate-900"
              >
                <Mail size={18} className="translate-y-0.5 text-blue-600 shrink-0" />
                <span>hello@theinterview.com</span>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Newsletter</div>
            <p className="text-sm text-slate-600 leading-relaxed">Get the latest interview experiences and tips delivered straight to your inbox.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Subscribe Now
              </button>
              {message && <p className="text-sm text-blue-700">{message}</p>}
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © 2024 theInterview community. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Made with</span>
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>
              by <span className="font-semibold text-slate-900">theInterview Team</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}