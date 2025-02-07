"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Heart,
  MapPin
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
    <footer className="bg-[#F0F2F5] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-600">theInterview</h3>
            <p className="text-[#1D1D1D] text-sm">
              Empowering tech professionals with interview experiences and insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1D]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#1D1D1D] hover:text-blue-600 transition-colors underline-offset-2 hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-[#1D1D1D] hover:text-blue-600 transition-colors underline-offset-2 hover:underline">
                  Help
                </Link>
              </li>
            
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1D]">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
               <MapPin size={18} className="text-blue-600" />
                  <a href="https://maps.app.goo.gl/xy4z53owHAz4SxgA8" target="_blank" rel="noopener noreferrer" className="text-[#1D1D1D] hover:text-blue-600 transition-colors underline-offset-2 hover:underline"><span className="text-[#1D1D1D]">PICT, Pune, Maharashtra 411045</span> {/* Replace with actual PICT Pune address if needed */}
                 </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1D]">Newsletter</h3>
            <p className="text-sm text-[#1D1D1D]">Stay updated with the latest interview experiences.</p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 rounded-lg border border-[#B0B3B8] focus:outline-none focus:ring-2 focus:ring-[#8B77F9] focus:border-transparent transition-all duration-300"
              />
              <button
                type="submit"
                className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300"
              >
                Subscribe
              </button>
              {message && <p className="text-sm text-blue-600">{message}</p>}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-[#B0B3B8]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-[#1D1D1D]">
              © {new Date().getFullYear()} theInterview. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-[#1D1D1D]">
              <span>Made with</span>
              <Heart size={16} className="text-[#FF5F5F] fill-[#FF5F5F]" />
              <span className="underline">by <Link href='/about'>theInterview Team</Link></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}