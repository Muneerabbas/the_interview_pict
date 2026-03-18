import React from "react";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";

const IconLink = ({ href, label, children }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20"
    >
      {children}
    </a>
  );
};

export default function TeamMemberCard({
  img,
  name,
  subtitle,
  hoverDetail,
  linkedin,
  github,
  email,
  priority = false,
  featured = false,
}) {
  const mailHref = email ? `mailto:${email}` : undefined;

  return (
    <article
      className={[
        "group relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_32px_90px_rgba(15,23,42,0.24)]",
        featured ? "min-h-[22rem]" : "min-h-[28rem]",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <Image
          src={img}
          alt={name}
          fill
          sizes={
            featured ? "100vw" : "(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 100vw"
          }
          className="object-cover transition duration-700 group-hover:scale-110"
          priority={priority}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.28)_35%,rgba(2,6,23,0.92)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.35),transparent_70%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
        <div className="translate-y-4 transition duration-500 group-hover:translate-y-0">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-100">
            Team
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            {name}
          </h3>
          {!!hoverDetail && (
            <p className="mt-1 max-w-xs text-xs font-medium tracking-wide text-sky-100/80 transition duration-500 group-hover:text-sky-100">
              {hoverDetail}
            </p>
          )}
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-200">
            {subtitle}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 opacity-100 transition duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
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

