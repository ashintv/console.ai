"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-dark.css"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold tracking-tight mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold tracking-tight mb-3 mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold tracking-tight mb-2 mt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="leading-7 mb-4">{children}</p>
          ),
          code: ({ inline, className = "", children, ...props }: any) => {
            if (inline) {
              return (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
                  {children}
                </code>
              )
            }

            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const codeString = String(children).replace(/\n$/, "")

            let highlighted = codeString
            if (language) {
              try {
                highlighted = hljs.highlight(codeString, { language, ignoreIllegals: true }).value
              } catch (e) {
                // Fallback to plain text
              }
            }

            return (
              <code
                className={`block whitespace-pre-wrap break-words ${language ? `language-${language} hljs` : ""}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            )
          },
          pre: ({ children }: any) => {
            return (
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">
                {children}
              </pre>
            )
          },
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc [&>li]:mt-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
