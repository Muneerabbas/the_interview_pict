"use client";

import React, { useState, useEffect } from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import CloudinaryImage from "@/components/CloudinaryImage";
import { Check, Copy } from "lucide-react";

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700/60 dark:hover:text-slate-300"
      aria-label="Copy code"
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>
      ) : (
        <><Copy className="h-3.5 w-3.5" /><span>Copy</span></>
      )}
    </button>
  );
};

const MarkdownRenderer = ({ content }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  const components = {
    div: ({ children }) => <div className="mb-6 text-[16px] leading-[1.75] text-slate-700 dark:text-slate-300">{children}</div>,
    section: ({ children }) => <section className="mb-6 text-[16px] leading-[1.75] text-slate-700 dark:text-slate-300">{children}</section>,
    article: ({ children }) => <article className="mb-6 text-[16px] leading-[1.75] text-slate-700 dark:text-slate-300">{children}</article>,
    span: ({ children }) => <span className="text-inherit">{children}</span>,
    h1: ({ children }) => <h1 className="mb-8 mt-2 border-b border-slate-200/80 pb-4 text-[1.95rem] font-extrabold leading-tight tracking-tight text-slate-900 dark:border-slate-700/70 dark:text-slate-50 sm:text-[2.25rem]">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-4 mt-12 border-b border-slate-200 pb-2 text-[1.35rem] font-extrabold leading-snug text-slate-900 dark:border-slate-700/70 dark:text-slate-100 sm:text-[1.45rem]">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-8 border-l-4 border-blue-500 pl-3 text-[1.125rem] font-bold leading-snug text-slate-900 dark:border-cyan-400 dark:text-slate-100 sm:text-[1.18rem]">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-7 text-[1.05rem] font-bold leading-snug text-slate-900 dark:text-slate-100">{children}</h4>,
    p: ({ children }) => <div className="mb-6 text-[16px] leading-[1.75] text-slate-700 dark:text-[#D1D5DB]">{children}</div>,
    strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
    em: ({ children }) => <em className="font-medium text-slate-700 dark:text-slate-300">{children}</em>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-800 hover:decoration-blue-500 dark:text-cyan-300 dark:decoration-cyan-500/40 dark:hover:text-cyan-200 dark:hover:decoration-cyan-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="mb-7 list-disc space-y-2.5 pl-6 text-[16px] leading-[1.75] text-slate-700 marker:text-blue-500 dark:text-[#E8EDF5] dark:marker:text-blue-400">{children}</ul>,
    ol: ({ children }) => (
      <ol className="mb-7 list-decimal space-y-2.5 pl-6 text-[16px] leading-[1.75] text-slate-700 marker:font-semibold marker:text-blue-600 dark:text-[#E8EDF5] dark:marker:text-blue-400">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-[1.8]">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50/70 px-4 py-3 text-slate-700 dark:border-cyan-400 dark:bg-cyan-950/30 dark:text-slate-300">
        <div className="text-[15px] leading-7 sm:text-base">{children}</div>
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline) {
        const lang = match?.[1] || "code";
        const codeString = String(children).replace(/\n$/, "");
        return (
          <div className="my-6 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm dark:border-slate-700/50">
            <div className="flex items-center gap-2 border-b border-slate-200/40 bg-[#f9fafb] px-4 py-2.5 dark:border-slate-700/40 dark:bg-[#0d1117]">
              <span className="flex gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400/70 dark:bg-red-500/60" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400/70 dark:bg-yellow-500/60" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400/70 dark:bg-green-500/60" />
              </span>
              <span className="ml-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">{lang}</span>
              <CopyButton code={codeString} />
            </div>
            <SyntaxHighlighter
              language={match?.[1] || "text"}
              style={isDarkMode ? oneDark : prism}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: "transparent",
                padding: "16px 20px",
                fontSize: "13.5px",
                lineHeight: "1.7",
              }}
              className={isDarkMode ? "!bg-[#0d1117]" : "!bg-[#f9fafb]"}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" {...props}>
          {children}
        </code>
      );
    },
    hr: () => <hr className="my-8 border-0 border-t border-dashed border-slate-300 dark:border-slate-700" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100/80 dark:bg-slate-800/80">{children}</thead>,
    tr: ({ children }) => <tr className="border-t border-slate-200 dark:border-slate-700">{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-slate-800 dark:text-slate-200">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{children}</td>,
    img: ({ src, alt, width, height, style }) => {
      if (typeof src === "string" && src.includes("res.cloudinary.com")) {
        return (
          <CloudinaryImage
            src={src}
            alt={alt || "Article image"}
            width={width}
            height={height}
            style={style}
          />
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || ""}
          alt={alt || "Markdown image"}
          width={width}
          height={height}
          style={style}
          className="my-6 block max-w-full h-auto rounded-xl border border-slate-200 object-contain dark:border-slate-700"
        />
      );
    },
  };

  return (
    <div className="markdown-container mx-auto max-w-[700px] px-2 pb-2 sm:px-4">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
