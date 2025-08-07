'use client';

import type { HandbookToc, TocItem } from '@/lib/handbook-content';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type HandbookTableOfContentsProps = {
  locale: string;
  handbookType: string; // e.g., 'private-pilot'
};

export function HandbookTableOfContents({ locale, handbookType }: HandbookTableOfContentsProps) {
  const [toc, setToc] = useState<HandbookToc>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [animatingHeights, setAnimatingHeights] = useState<Map<string, number>>(new Map());
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pathname = usePathname();

  const toggleSection = (itemId: string) => {
    const contentElement = contentRefs.current.get(itemId);
    const isCurrentlyExpanded = expandedSections.has(itemId);

    if (contentElement) {
      const scrollHeight = contentElement.scrollHeight;

      if (isCurrentlyExpanded) {
        // Collapsing: set height to current scrollHeight, then animate to 0
        setAnimatingHeights(prev => new Map(prev.set(itemId, scrollHeight)));
        requestAnimationFrame(() => {
          setAnimatingHeights(prev => new Map(prev.set(itemId, 0)));
        });
      } else {
        // Expanding: start at 0, measure content, then animate to scrollHeight
        setAnimatingHeights(prev => new Map(prev.set(itemId, 0)));
        requestAnimationFrame(() => {
          const newScrollHeight = contentElement.scrollHeight;
          setAnimatingHeights(prev => new Map(prev.set(itemId, newScrollHeight)));
        });
      }

      // Clean up animation state after transition
      setTimeout(() => {
        setAnimatingHeights((prev) => {
          const newMap = new Map(prev);
          newMap.delete(itemId);
          return newMap;
        });
      }, 350);
    }

    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    async function loadToc() {
      try {
        // For now, provide a fallback TOC structure
        const fallbackToc: HandbookToc = {
          'private-pilot': {
            title: 'Private Pilot',
            items: [
              {
                title: 'Principles of Flight',
                href: `/handbook/private-pilot/principles-of-flight`,
                items: [
                  {
                    title: 'The Four Forces of Flight',
                    href: `/handbook/private-pilot/principles-of-flight/four-forces`,
                    items: [],
                    order: 1,
                  },
                  {
                    title: 'Airfoil Theory and Design',
                    href: `/handbook/private-pilot/principles-of-flight/airfoil-theory`,
                    items: [],
                    order: 2,
                  },
                  {
                    title: 'Angle of Attack',
                    href: `/handbook/private-pilot/principles-of-flight/angle-of-attack`,
                    items: [],
                    order: 3,
                  },
                ],
                order: 1,
                category: 'principles-of-flight',
              },
              {
                title: 'Aircraft Systems',
                href: `/handbook/private-pilot/aircraft-systems`,
                items: [],
                order: 2,
                category: 'aircraft-systems',
              },
              {
                title: 'Federal Aviation Regulations',
                href: `/handbook/private-pilot/regulations`,
                items: [],
                order: 3,
                category: 'regulations',
              },
              {
                title: 'Weather Systems',
                href: `/handbook/private-pilot/weather`,
                items: [],
                order: 4,
                category: 'weather',
              },
              {
                title: 'Navigation',
                href: `/handbook/private-pilot/navigation`,
                items: [],
                order: 5,
                category: 'navigation',
              },
              {
                title: 'Airspace',
                href: `/handbook/private-pilot/airspace`,
                items: [],
                order: 6,
                category: 'airspace',
              },
              {
                title: 'Aircraft Performance',
                href: `/handbook/private-pilot/performance`,
                items: [],
                order: 7,
                category: 'performance',
              },
              {
                title: 'Flight Operations',
                href: `/handbook/private-pilot/flight-operations`,
                items: [],
                order: 8,
                category: 'flight-operations',
              },
            ],
          },
        };

        // Add locale prefix to all hrefs
        const tocWithLocale = { ...fallbackToc };
        Object.keys(tocWithLocale).forEach((handbookKey) => {
          const handbook = tocWithLocale[handbookKey];
          if (!handbook) {
            return;
          }
          handbook.items.forEach((item) => {
            item.href = `/${locale}${item.href}`;
            item.items?.forEach((subItem) => {
              subItem.href = `/${locale}${subItem.href}`;
            });
          });
        });

        setToc(tocWithLocale);

        // Expand sections that contain the current page or have children
        const newExpanded = new Set<string>();
        Object.values(tocWithLocale).forEach((handbook) => {
          handbook.items.forEach((item) => {
            if (item.items && item.items.length > 0) {
              // Strip locale for comparison
              const itemPath = item.href.startsWith(`/${locale}/`)
                ? item.href.substring(`/${locale}`.length)
                : item.href;

              // Check if current path is within this section or its children
              const isCurrentSection = pathname === itemPath
                || pathname.startsWith(itemPath)
                || pathname.includes(item.category || '')
                || item.items.some((subItem) => {
                  const subItemPath = subItem.href.startsWith(`/${locale}/`)
                    ? subItem.href.substring(`/${locale}`.length)
                    : subItem.href;
                  return pathname === subItemPath || pathname.startsWith(subItemPath);
                });

              if (isCurrentSection) {
                newExpanded.add(item.href);
              }
            }
          });
        });
        setExpandedSections(newExpanded);
      } catch (error) {
        console.error('Failed to load handbook TOC:', error);
        setToc({});
      }
    }

    loadToc();
  }, [handbookType, pathname, locale]);

  const renderTocItem = (item: TocItem, level = 0) => {
    // Strip locale from item.href for comparison if pathname doesn't include locale
    const itemPath = item.href.startsWith(`/${locale}/`)
      ? item.href.substring(`/${locale}`.length)
      : item.href;

    // More flexible active detection - compare without locale prefix
    const isActive = pathname === item.href || pathname === itemPath
      || (itemPath !== '/' && pathname.startsWith(itemPath));

    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedSections.has(item.href);
    const itemId = item.href;

    // Check if this section contains the active page (for parent highlighting)
    const containsActivePage = hasChildren && item.items.some((subItem) => {
      const subItemPath = subItem.href.startsWith(`/${locale}/`)
        ? subItem.href.substring(`/${locale}`.length)
        : subItem.href;
      return pathname === subItem.href || pathname === subItemPath || pathname.startsWith(subItemPath);
    });

    if (hasChildren) {
      // Collapsible section header
      return (
        <div key={itemId} className="space-y-1 overflow-x-hidden">
          <div
            className={cn(
              'flex items-center justify-between w-full px-3 py-2.5 text-left transition-all duration-200 cursor-pointer group',
              'hover:bg-primary/10 hover:text-primary rounded-md',
              'active:scale-[0.98] active:bg-primary/20',
              level === 0 ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground',
              containsActivePage && 'bg-primary/5 text-primary/90 font-medium',
            )}
            onClick={() => toggleSection(itemId)}
          >
            <span className="flex-1 transition-colors">{item.title}</span>
            <ChevronRight className={cn(
              'h-4 w-4 text-muted-foreground transition-all duration-300 ease-out group-hover:text-primary',
              isExpanded && 'rotate-90 text-primary',
            )}
            />
          </div>

          <div
            ref={(el) => {
              if (el && hasChildren) {
                contentRefs.current.set(itemId, el);
              }
            }}
            className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            style={{
              height: animatingHeights.has(itemId)
                ? `${animatingHeights.get(itemId)}px`
                : isExpanded ? 'auto' : '0px',
            }}
          >
            <div className="space-y-1 py-1">
              {item.items.map(subItem => renderTocItem(subItem, level + 1))}
            </div>
          </div>
        </div>
      );
    } else {
      // Regular link item
      return (
        <Link
          key={itemId}
          href={item.href}
          className={cn(
            'block w-full px-3 py-2 text-left transition-all duration-200 relative group rounded-md',
            'hover:bg-primary/10 hover:text-primary',
            'active:scale-[0.98] active:bg-primary/20',
            level === 0 ? 'text-sm text-foreground' : 'text-sm text-muted-foreground pl-6',
            isActive && 'bg-primary/15 text-primary font-medium shadow-sm',
            isActive && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r',
          )}
        >
          <span className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary">
            {item.title}
          </span>
        </Link>
      );
    }
  };

  const handbookToc = toc[handbookType];

  if (!handbookToc) {
    return (
      <div className="h-full bg-card border-r border-border">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-secondary flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-4">
        <div className="flex items-center justify-between mb-2 group">
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{handbookToc.title}</h2>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-200 group-hover:rotate-180" />
        </div>
        <div className="text-xs text-muted-foreground">
          <Link href={`/${locale}/handbook`} className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
            ← All Handbooks
          </Link>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="py-2">
          {handbookToc.items.map(item => renderTocItem(item, 0))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3">
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 rounded-md group active:scale-[0.98]">
            <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
              🔖 Bookmarks
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
