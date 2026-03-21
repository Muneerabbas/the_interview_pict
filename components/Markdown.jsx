import React from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CloudinaryImage from "@/components/CloudinaryImage";

const MarkdownRenderer = ({ content }) => {
  const components = {
    h1: ({ children }) => <h1 className="mb-6 mt-2 border-b border-slate-200 pb-4 text-[1.9rem] font-black leading-tight tracking-tight text-slate-900 sm:text-[2.2rem]">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-4 mt-8 border-b border-slate-200 pb-3 text-[1.45rem] font-extrabold leading-tight text-slate-900 sm:text-[1.6rem]">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-7 text-[1.15rem] font-bold leading-tight text-slate-900 sm:text-[1.25rem]">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-6 text-[1rem] font-semibold leading-tight text-slate-900">{children}</h4>,
    p: ({ children }) => <p className="mb-5 text-[15px] leading-8 text-slate-700 sm:text-base">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="font-medium text-slate-700">{children}</em>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-800 hover:decoration-blue-500"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-slate-700 marker:text-blue-500">{children}</ul>,
    ol: ({ children }) => (
      <ol className="mb-5 list-decimal space-y-2 pl-6 text-slate-700 marker:font-semibold marker:text-blue-600">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50/70 px-4 py-3 text-slate-700">
        <div className="text-[15px] leading-7 sm:text-base">{children}</div>
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline) {
        const lang = match?.[1] || "code";
        return (
          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {lang}
            </div>
            <SyntaxHighlighter
              language={match?.[1] || "text"}
              style={github}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: "#f8fafc",
                padding: "14px 16px",
                fontSize: "13px",
              }}
              showLineNumbers
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-slate-800" {...props}>
          {children}
        </code>
      );
    },
    hr: () => <hr className="my-8 border-0 border-t border-dashed border-slate-300" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100/80">{children}</thead>,
    tr: ({ children }) => <tr className="border-t border-slate-200">{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-slate-800">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-slate-700">{children}</td>,
    img: ({ src, alt }) => {
      if (typeof src === "string" && src.includes("res.cloudinary.com")) {
        return (
          <CloudinaryImage
            src={src}
            alt={alt || "Article image"}
          />
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || ""}
          alt={alt || "Markdown image"}
          className="my-6 max-h-[420px] w-full rounded-xl border border-slate-200 object-cover"
        />
      );
    },
  };

  return (
    <div className="markdown-container mx-auto max-w-[900px] px-2 pb-2 sm:px-3">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
