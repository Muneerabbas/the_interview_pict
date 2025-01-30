// MarkdownRenderer.jsx
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
      <h1 className="text-[2em] font-semibold leading-[1.25] mt-6 mb-4 pb-3 border-b border-[#d0d7de]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-[1.5em] font-semibold leading-[1.25] mt-6 mb-4 pb-3 border-b border-[#d0d7de]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[1.25em] font-semibold leading-[1.25] mt-6 mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-[1em] font-semibold leading-[1.25] mt-6 mb-4">
        {children}
      </h4>
    ),
    
    // Custom paragraph
    p: ({ children }) => (
      <p className="mb-4 leading-[1.5] text-[#1F2328]">
        {children}
      </p>
    ),
    
    // Custom links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-[#0969da] hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Custom lists
    ul: ({ children }) => (
      <ul className="pl-8 mb-4 list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="pl-8 mb-4 list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mb-1">
        {children}
      </li>
    ),
    
    // Custom blockquotes
    blockquote: ({ children }) => (
      <blockquote className="pl-4 color-[#656d76] border-l-4 border-[#d0d7de] my-4">
        {children}
      </blockquote>
    ),
    
    // Custom code blocks
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-4">
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
          className="px-2 py-1 text-[85%] bg-[rgba(175,184,193,0.2)] rounded-md font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Custom horizontal rule
    hr: () => (
      <hr className="h-1 my-6 bg-[#d0d7de] border-0" />
    ),
    
    // Custom table
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
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
      <tr className="border-t border-[#d0d7de]">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-sm font-semibold border border-[#d0d7de]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-sm border border-[#d0d7de]">
        {children}
      </td>
    ),
  };

  return (
    <div className="markdown-container font-[-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif] max-w-[900px] mx-auto p-4">
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