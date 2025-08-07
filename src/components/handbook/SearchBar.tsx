'use client';

import type { SearchResult } from '@/types/handbook';
import { BookOpen, Clock, Command, FileText, Hash, Search, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  locale: string;
  currentHandbook?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

// Mock search suggestions - replace with real API call
const mockSuggestions: SearchResult[] = [
  {
    id: '1',
    title: 'Principles of Flight',
    excerpt: 'Understanding how aircraft generate lift and the four forces of flight',
    type: 'lesson',
    url: '/handbook/private-pilot/principles-of-flight',
    handbook: 'private-pilot',
    category: 'Aerodynamics',
    relevance: 0.95,
  },
  {
    id: '2',
    title: 'Angle of Attack',
    excerpt: 'The angle between the wing chord line and relative wind',
    type: 'topic',
    url: '/handbook/private-pilot/principles-of-flight/angle-of-attack',
    handbook: 'private-pilot',
    category: 'Aerodynamics',
    relevance: 0.88,
  },
  {
    id: '3',
    title: 'PA.I.A.K1',
    excerpt: 'Pilot certification requirements and eligibility',
    type: 'acs-code',
    url: '/acs/PA.I.A.K1',
    handbook: 'private-pilot',
    category: 'Certification',
    relevance: 0.82,
  },
  {
    id: '4',
    title: 'Navigation Systems',
    excerpt: 'GPS, VOR, and other navigation instruments',
    type: 'lesson',
    url: '/handbook/private-pilot/navigation-systems',
    handbook: 'private-pilot',
    category: 'Navigation',
    relevance: 0.75,
  },
];

const recentSearches = [
  'stall recovery',
  'weather minimums',
  'emergency procedures',
];

export function SearchBar({
  locale,
  currentHandbook,
  placeholder = 'Search handbook...',
  className,
  disabled = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }

      // Escape to clear and unfocus
      if (e.key === 'Escape') {
        setQuery('');
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      // Mock search - replace with real API call
      const filtered = mockSuggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
        || item.excerpt.toLowerCase().includes(query.toLowerCase()),
      );
      setSuggestions(filtered);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) {
      return;
    }

    const params = new URLSearchParams({
      q: finalQuery.trim(),
      ...(currentHandbook && { handbook: currentHandbook }),
    });

    router.push(`/${locale}/handbook/search?${params.toString()}`);
    setShowSuggestions(false);
  }, [query, currentHandbook, locale, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    router.push(`/${locale}${suggestion.url}`);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'topic': return <FileText className="h-4 w-4" />;
      case 'acs-code': return <Hash className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'lesson': return 'Lesson';
      case 'topic': return 'Topic';
      case 'acs-code': return 'ACS Code';
      default: return 'Content';
    }
  };

  // Detect platform for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'pl-10 pr-16 h-9 text-sm bg-muted/30 border-border/50 focus:bg-background transition-all',
              isFocused && 'ring-2 ring-primary/20',
            )}
            aria-label="Search handbook content"
            role="searchbox"
          />

          {/* Keyboard shortcut hint */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Badge variant="outline" className="h-6 px-1.5 text-xs bg-muted/50 border-border/30">
              <Command className="h-3 w-3 mr-1" />
              {shortcutKey}
              K
            </Badge>
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border border-border bg-background">
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Searching...
                </div>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && query.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Search Results
                </div>
                <div className="space-y-1">
                  {suggestions.slice(0, 6).map(suggestion => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getResultIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {suggestion.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getResultTypeLabel(suggestion.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {suggestion.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {suggestion.category}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(suggestion.relevance * 5) }).map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-primary rounded-full opacity-60" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <div className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  No results found for "
                  {query}
                  "
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch()}
                  className="text-xs"
                >
                  Search all content
                </Button>
              </div>
            )}

            {/* Recent Searches & Quick Actions */}
            {!isLoading && query.length < 2 && (
              <div className="p-2 space-y-3">
                {/* Quick Actions */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Quick Access
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSearch('emergency procedures')}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <BookOpen className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Emergency Procedures</span>
                    </button>
                    <button
                      onClick={() => handleSearch('weather minimums')}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Weather Minimums</span>
                    </button>
                    <button
                      onClick={() => handleSearch('acs codes')}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <Hash className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ACS Codes</span>
                    </button>
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search All CTA */}
            {query.length > 0 && (
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch()}
                  className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-3 w-3 mr-2" />
                  Search all content for "
                  {query}
                  "
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
