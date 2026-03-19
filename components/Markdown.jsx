import React from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Sparkles, ClipboardCheck, Layers, Lightbulb, FileText } from 'lucide-react';

const stripEmojis = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
};

const cleanChildren = (children) => {
  if (Array.isArray(children)) {
    return children.map(child => typeof child === 'string' ? stripEmojis(child) : child);
  }
  return typeof children === 'string' ? stripEmojis(children) : children;
};

const getIconForHeading = (children) => {
  let text = '';
  if (Array.isArray(children)) {
    text = children.filter(c => typeof c === 'string').join(' ');
  } else if (typeof children === 'string') {
    text = text + children;
  }
  text = text.toLowerCase();

  if (text.includes('interview experience')) return <Sparkles className="shrink-0 mr-2.5 text-blue-600" size={24} />;
  if (text.includes('shortlisting')) return <ClipboardCheck className="shrink-0 mr-2 text-indigo-600" size={20} />;
  if (text.includes('round')) return <Layers className="shrink-0 mr-2 text-indigo-600" size={20} />;
  if (text.includes('verdict') || text.includes('tip')) return <Lightbulb className="shrink-0 mr-2 text-amber-500" size={20} />;
  return null;
};

const MarkdownRenderer = ({ content }) => {
  const components = {
    // Custom heading rendering
    h1: ({ children }) => {
      const icon = getIconForHeading(children) || <FileText className="shrink-0 mr-2.5 text-blue-600" size={24} />;
      return (
        <h1 className="flex items-center text-[2em] font-extrabold tracking-tight text-slate-900 leading-[1.25] mt-6 mb-4 pb-3 border-b border-slate-200 break-words">
          {icon}
          <span>{cleanChildren(children)}</span>
        </h1>
      );
    },
    h2: ({ children }) => {
      const icon = getIconForHeading(children);
      return (
        <h2 className="flex items-center text-[1.5em] font-bold text-slate-800 leading-[1.25] mt-6 mb-4 pb-3 border-b border-slate-200 break-words">
          {icon}
          <span>{cleanChildren(children)}</span>
        </h2>
      );
    },
    h3: ({ children }) => {
      const icon = getIconForHeading(children);
      return (
        <h3 className="flex items-center text-[1.25em] font-bold text-slate-800 leading-[1.25] mt-6 mb-4 break-words">
          {icon}
          <span>{cleanChildren(children)}</span>
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="text-[1em] font-semibold text-slate-800 leading-[1.25] mt-6 mb-4 break-words">
        {cleanChildren(children)}
      </h4>
    ),
    
    // Custom paragraph
    p: ({ children }) => (
      <p className="mb-4 leading-[1.5] text-[#1F2328] break-words">
        {children}
      </p>
    ),
    
    // Custom links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-[#0969da] hover:underline break-words" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Custom lists
    ul: ({ children }) => (
      <ul className="pl-8 mb-4 list-disc break-words">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="pl-8 mb-4 list-decimal break-words">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mb-1 break-words">
        {children}
      </li>
    ),
    
    // Custom blockquotes
    blockquote: ({ children }) => (
      <blockquote className="pl-4 color-[#656d76] border-l-4 border-[#d0d7de] my-4 break-words">
        {children}
      </blockquote>
    ),
    
    // Custom code blocks
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-4 break-words">
          <SyntaxHighlighter
            language={match[1]}
            style={github}
            className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] !p-4"
            showLineNumbers
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="px-2 py-1 text-[85%] bg-[rgba(175,184,193,0.2)] rounded-md font-mono break-words"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Custom horizontal rule
    hr: () => (
      <hr className="h-1 my-6 bg-[#d0d7de] border-0 break-words" />
    ),
    
    // Custom table
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 break-words">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#f6f8fa]">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-t border-[#d0d7de] break-words">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-sm font-semibold border border-[#d0d7de] break-words">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-sm border border-[#d0d7de] break-words">
        {children}
      </td>
    ),
  };

  return (
    <div className="markdown-container font-sans max-w-[900px] mx-auto p-4 break-words">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
