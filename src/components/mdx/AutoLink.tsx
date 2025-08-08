'use client';

import type { ContextualLink } from '@/types/glossary';
import Link from 'next/link';
import { useState } from 'react';

type AutoLinkProps = {
  link: ContextualLink;
  children: React.ReactNode;
  locale?: string;
};

const categoryColors = {
  aircraft: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
  navigation: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
  weather: 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200',
  regulation: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
  operation: 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200',
  instrument: 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200',
};

const categoryIcons = {
  aircraft: '✈️',
  navigation: '🧭',
  weather: '🌤️',
  regulation: '📋',
  operation: '🛩️',
  instrument: '📊',
};

export function AutoLink({ link, children, locale = 'en' }: AutoLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClass = categoryColors[link.category] || 'text-blue-600 hover:text-blue-800';
  const icon = categoryIcons[link.category] || '📖';

  // Determine if this is an internal handbook link
  const isInternalLink = link.type === 'handbook' && link.href.startsWith('/handbook');
  const fullHref = isInternalLink ? `/${locale}${link.href}` : link.href;

  const linkContent = (
    <span
      className={`relative underline decoration-dotted underline-offset-2 cursor-pointer ${colorClass}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {children}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 max-w-xs whitespace-normal">
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">{icon}</span>
            <div>
              <div className="font-semibold text-xs text-gray-300 uppercase tracking-wide mb-1">
                {link.category}
              </div>
              <div>{link.tooltip}</div>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );

  if (isInternalLink) {
    return (
      <Link href={fullHref} className="no-underline">
        {linkContent}
      </Link>
    );
  }

  return (
    <a
      href={fullHref}
      target={link.type === 'external' ? '_blank' : undefined}
      rel={link.type === 'external' ? 'noopener noreferrer' : undefined}
      className="no-underline"
    >
      {linkContent}
    </a>
  );
}
