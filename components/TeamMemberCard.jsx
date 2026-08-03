"use client";

import React from "react";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";

const IconLink = ({ href, label, children }) => {
  if (!href || href === "#") return null;
  return (
    <motion.a
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20"
    >
      {children}
    </motion.a>
  );
};

export default function TeamMemberCard({
  img,
  name,
  subtitle,
  linkedin,
  github,
  email,
  priority = false,
}) {
  const mailHref = email && email !== "#" ? `mailto:${email}` : undefined;

  return (
    <article
      className="group relative isolate aspect-[3/4] w-full max-w-[19rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={img}
          alt={name}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 via-42% to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content Container - Better Visibility */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
          <h3 className="mb-2 text-xl font-bold leading-tight tracking-tight text-white [text-shadow:0_2px_14px_rgba(2,6,23,0.7)]">
            {name}
          </h3>
          <div className="mb-3 h-1 w-10 origin-left rounded-full bg-blue-500 transition-all duration-300 group-hover:w-14" />

          {/* Subtitle */}
          <div className="inline-flex rounded-md border border-white/15 bg-black/40 px-3 py-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Social Links - Slide Up on Hover */}
        <div className="mt-4 flex items-center gap-3 translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 overflow-visible">
          <IconLink href={linkedin} label={`${name} LinkedIn`}>
            <Linkedin size={18} />
          </IconLink>
          <IconLink href={github} label={`${name} GitHub`}>
            <Github size={18} />
          </IconLink>
          <IconLink href={mailHref} label={`Email ${name}`}>
            <Mail size={18} />
          </IconLink>
        </div>
      </div>
    </article>
  );
}
