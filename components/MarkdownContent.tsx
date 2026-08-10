'use client';

import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { childrenToText, slugify } from '@/lib/utils';

export default function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2({ children }: { children?: ReactNode }) {
            const text = childrenToText(children);
            return <h2 id={slugify(text)}>{children}</h2>;
          },
          h3({ children }: { children?: ReactNode }) {
            const text = childrenToText(children);
            return <h3 id={slugify(text)}>{children}</h3>;
          },
          code(props: { className?: string; children?: ReactNode }) {
            const { className, children } = props;
            const match = /language-(\w+)/.exec(className || '');
            const raw = childrenToText(children).replace(/\n$/, '');

            if (match && match[1]) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  style={oneDark as Record<string, React.CSSProperties>}
                  PreTag="div"
                  customStyle={{
                    borderRadius: '0.6rem',
                    fontSize: '0.875rem',
                    margin: '1.5rem 0',
                    padding: '1.1rem 1.25rem',
                  }}
                >
                  {raw}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-gray-800">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
