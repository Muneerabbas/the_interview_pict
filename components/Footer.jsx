"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Twitter,
  Heart,
  Phone,
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
            <div className="flex space-x-4">
              <a href="#" className="text-blue-600 hover:text-[#8B77F9] transition-colors">
                <Github size={24} />
              </a>
              <a href="#" className="text-blue-600 hover:text-[#8B77F9] transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="#" className="text-blue-600 hover:text-[#8B77F9] transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1D]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#1D1D1D] hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#1D1D1D] hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#1D1D1D] hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#1D1D1D] hover:text-blue-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1D]">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-blue-600" />
                <span className="text-[#1D1D1D]">support@-blue-600.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-blue-600" />
                <span className="text-[#1D1D1D]">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={18} className="text-blue-600" />
                <span className="text-[#1D1D1D]">San Francisco, CA</span>
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
              © {new Date().getFullYear()} The Interview. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-[#1D1D1D]">
              <span>Made with</span>
              <Heart size={16} className="text-[#FF5F5F] fill-[#FF5F5F]" />
              <span>by The Interview Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
