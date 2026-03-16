import React from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MarkdownRenderer = ({ content }) => {
  const components = {
    // Custom heading rendering
    h1: ({ children }) => (
      <h1 className="mt-6 mb-4 break-words border-b border-slate-300 pb-3 text-[2em] font-semibold leading-[1.25] text-slate-900 dark:border-slate-700 dark:text-slate-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-6 mb-4 break-words border-b border-slate-300 pb-3 text-[1.5em] font-semibold leading-[1.25] text-slate-900 dark:border-slate-700 dark:text-slate-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-4 break-words text-[1.25em] font-semibold leading-[1.25] text-slate-900 dark:text-slate-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-4 break-words text-[1em] font-semibold leading-[1.25] text-slate-900 dark:text-slate-100">
        {children}
      </h4>
    ),
    
    // Custom paragraph
    p: ({ children }) => (
      <p className="mb-4 break-words leading-[1.7] text-slate-700 dark:text-slate-200">
        {children}
      </p>
    ),
    
    // Custom links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="break-words text-primary hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Custom lists
    ul: ({ children }) => (
      <ul className="mb-4 list-disc break-words pl-8 text-slate-700 dark:text-slate-200">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal break-words pl-8 text-slate-700 dark:text-slate-200">
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
      <blockquote className="my-4 break-words border-l-4 border-primary pl-4 italic text-slate-600 dark:text-slate-300">
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
            className="rounded-md border border-slate-300 bg-slate-50 !p-4 dark:border-slate-700 dark:bg-slate-900"
            showLineNumbers
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="break-words rounded-md bg-slate-200/70 px-2 py-1 font-mono text-[85%] text-slate-900 dark:bg-slate-700/60 dark:text-slate-100"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Custom horizontal rule
    hr: () => (
      <hr className="my-6 h-px break-words border-0 bg-slate-300 dark:bg-slate-700" />
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
      <thead className="bg-slate-100 dark:bg-slate-800">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="break-words border-t border-slate-300 dark:border-slate-700">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="break-words border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="break-words border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
        {children}
      </td>
    ),
  };

  return (
    <div className="markdown-container mx-auto max-w-[900px] break-words p-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI','Noto_Sans',Helvetica,Arial,sans-serif] text-slate-700 dark:text-slate-200">
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
