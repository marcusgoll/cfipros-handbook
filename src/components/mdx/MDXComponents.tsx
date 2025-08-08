import type { MDXComponents } from 'mdx/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextualParagraph } from './ContextualText';
import { ProgressIndicator, CircularProgress, LessonProgressRing } from './ProgressIndicator';
import { InteractiveElements } from './InteractiveElements';

type MDXComponentsProps = {
  locale?: string;
  enableContextLinking?: boolean;
};

export function useMDXComponents(
  components: MDXComponents, 
  options: MDXComponentsProps = {}
): MDXComponents {
  const { locale = 'en', enableContextLinking = true } = options;
  
  return {
    ...components,
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight mb-6">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2">{children}</h4>
    ),
    // Enhanced paragraph with context linking
    p: ({ children }) => {
      if (!enableContextLinking || typeof children !== 'string') {
        return <p className="text-base leading-7 mb-4">{children}</p>;
      }
      
      return (
        <ContextualParagraph 
          locale={locale}
          className="text-base leading-7 mb-4"
          config={{ maxLinksPerParagraph: 2 }}
        >
          {children}
        </ContextualParagraph>
      );
    },
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-base leading-7">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/20 pl-4 my-4 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    hr: () => (
      <hr className="border-t border-border my-8" />
    ),
    
    // Aviation-specific components
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    
    // Progress tracking components
    ProgressIndicator,
    CircularProgress,
    LessonProgressRing,
    
    // Interactive learning components
    ...InteractiveElements,
  };
}
