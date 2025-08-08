'use client';

import type { ContextLinkConfig } from '@/types/glossary';
import React from 'react';
import { DEFAULT_LINK_CONFIG, processTextWithLinks } from '@/lib/context-linking';
import { AutoLink } from './AutoLink';

type ContextualTextProps = {
  children: string;
  config?: Partial<ContextLinkConfig>;
  locale?: string;
  element?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export function ContextualText({
  children,
  config = {},
  locale = 'en',
  element = 'span',
  className,
}: ContextualTextProps) {
  const fullConfig = { ...DEFAULT_LINK_CONFIG, ...config };

  // Process the text to find terms and create links
  const { processedText, links } = processTextWithLinks(children, fullConfig);

  // If no links found, return plain text
  if (links.length === 0) {
    const Element = element as unknown as React.ComponentType<any>;
    return React.createElement(Element, { className }, children);
  }

  // Split processed text by link placeholders and create React elements
  const parts: React.ReactNode[] = [];
  let linkIndex = 0;

  // Find link placeholders and replace with AutoLink components
  const linkPattern = /__LINK_(\d+)__/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(processedText)) !== null) {
    const linkIdx = Number.parseInt(match[1] || '0', 10);
    const link = links[linkIdx];

    if (!link) {
      continue;
    }

    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }

    // Add the link component
    parts.push(
      <AutoLink key={`link-${linkIndex}`} link={link} locale={locale}>
        {link.text || match[0]}
      </AutoLink>,
    );

    lastIndex = match.index + match[0].length;
    linkIndex++;
  }

  // Add remaining text
  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex));
  }

  const Element = element as unknown as React.ComponentType<any>;
  return React.createElement(Element, { className }, parts);
}

// Helper component for processing paragraph content
export function ContextualParagraph({
  children,
  config,
  locale,
  className,
}: Omit<ContextualTextProps, 'element'>) {
  // Handle both string children and mixed content
  if (typeof children === 'string') {
    return (
      <ContextualText
        element="p"
        config={config}
        locale={locale}
        className={className}
      >
        {children}
      </ContextualText>
    );
  }

  // For mixed content, process only text nodes
  const processChildren = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return (
        <ContextualText config={config} locale={locale}>
          {node}
        </ContextualText>
      );
    }

    if (React.isValidElement(node)) {
      const props = node.props as any;
      if (props?.children) {
        return React.cloneElement(node, {
          ...props,
          children: React.Children.map(props.children, processChildren),
        });
      }
    }

    return node;
  };

  return (
    <p className={className}>
      {React.Children.map(children, processChildren)}
    </p>
  );
}
