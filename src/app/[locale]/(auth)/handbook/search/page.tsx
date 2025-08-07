'use client';

import type { SearchFilters, SearchResult } from '@/types/handbook';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Hash,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { HandbookLayout } from '@/components/handbook/HandbookLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock search results - replace with real API
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Principles of Flight',
    excerpt: 'Understanding how aircraft generate lift and the four forces of flight. This comprehensive lesson covers aerodynamics fundamentals...',
    type: 'lesson',
    url: '/handbook/private-pilot/principles-of-flight',
    handbook: 'private-pilot',
    category: 'Aerodynamics',
    relevance: 0.95,
    matchedTerms: ['flight', 'principles'],
  },
  {
    id: '2',
    title: 'Angle of Attack',
    excerpt: 'The angle between the wing chord line and relative wind. Critical for understanding lift generation and stall characteristics...',
    type: 'topic',
    url: '/handbook/private-pilot/principles-of-flight/angle-of-attack',
    handbook: 'private-pilot',
    category: 'Aerodynamics',
    relevance: 0.88,
    matchedTerms: ['angle', 'attack'],
  },
  {
    id: '3',
    title: 'PA.I.A.K1 - Pilot Certification',
    excerpt: 'Pilot certification requirements and eligibility for private pilot certificate...',
    type: 'acs-code',
    url: '/acs/PA.I.A.K1',
    handbook: 'private-pilot',
    category: 'Certification',
    relevance: 0.82,
    matchedTerms: ['pilot', 'certification'],
  },
  {
    id: '4',
    title: 'Emergency Procedures',
    excerpt: 'Critical procedures for handling in-flight emergencies including engine failure, electrical failures, and emergency landings...',
    type: 'lesson',
    url: '/handbook/private-pilot/emergency-procedures',
    handbook: 'private-pilot',
    category: 'Safety',
    relevance: 0.75,
    matchedTerms: ['emergency', 'procedures'],
  },
  {
    id: '5',
    title: 'Weather Minimums for VFR Flight',
    excerpt: 'Visual flight rules weather minimums for different airspace classes and operational requirements...',
    type: 'topic',
    url: '/handbook/private-pilot/weather/vfr-minimums',
    handbook: 'private-pilot',
    category: 'Weather',
    relevance: 0.70,
    matchedTerms: ['weather', 'minimums'],
  },
];

type SearchPageProps = {
  params: Promise<{ locale: string }>;
};

function SearchContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'recent'>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsLoading(true);

    // Mock search delay - replace with real API call
    setTimeout(() => {
      let filtered = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase())
        || result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      // Apply filters
      if (searchFilters.handbook) {
        filtered = filtered.filter(result => result.handbook === searchFilters.handbook);
      }
      if (searchFilters.category) {
        filtered = filtered.filter(result => result.category === searchFilters.category);
      }
      if (searchFilters.type) {
        filtered = filtered.filter(result => result.type === searchFilters.type);
      }

      // Sort results
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'recent':
            return 0; // Would sort by date in real implementation
          default:
            return b.relevance - a.relevance;
        }
      });

      setResults(filtered);
      setIsLoading(false);
    }, 300);
  }, [sortBy]);

  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlHandbook = searchParams.get('handbook') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlType = searchParams.get('type') as SearchResult['type'] || undefined;

    setQuery(urlQuery);
    setFilters({
      handbook: urlHandbook || undefined,
      category: urlCategory || undefined,
      type: urlType,
    });

    // Perform search if query exists
    if (urlQuery) {
      performSearch(urlQuery, {
        handbook: urlHandbook || undefined,
        category: urlCategory || undefined,
        type: urlType,
      });
    }
  }, [searchParams, performSearch]);

  const updateURL = useCallback((newQuery: string, newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newQuery) {
      params.set('q', newQuery);
    }
    if (newFilters.handbook) {
      params.set('handbook', newFilters.handbook);
    }
    if (newFilters.category) {
      params.set('category', newFilters.category);
    }
    if (newFilters.type) {
      params.set('type', newFilters.type);
    }

    const url = `/${locale}/handbook/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(url);
  }, [locale, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(query, filters);
    performSearch(query, filters);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    updateURL(query, newFilters);
    performSearch(query, newFilters);
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

  const highlightMatches = (text: string, terms: string[] = []) => {
    if (!terms.length) {
      return text;
    }

    let highlightedText = text;
    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <HandbookLayout locale={locale}>
      <div className="space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Search Handbook</h1>
            <p className="text-muted-foreground">
              Find lessons, topics, and ACS codes across all aviation training content
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for lessons, topics, ACS codes..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  )
                : (
                    <Search className="h-4 w-4" />
                  )}
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-muted')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      Handbook
                    </label>
                    <select
                      value={filters.handbook || ''}
                      onChange={e => handleFilterChange({ ...filters, handbook: e.target.value || undefined })}
                      className="w-full p-2 border border-input rounded-md text-sm bg-background"
                    >
                      <option value="">All Handbooks</option>
                      <option value="private-pilot">Private Pilot</option>
                      <option value="commercial-pilot">Commercial Pilot</option>
                      <option value="instrument-pilot">Instrument Pilot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      Content Type
                    </label>
                    <select
                      value={filters.type || ''}
                      onChange={e => handleFilterChange({ ...filters, type: (e.target.value as SearchResult['type']) || undefined })}
                      className="w-full p-2 border border-input rounded-md text-sm bg-background"
                    >
                      <option value="">All Types</option>
                      <option value="lesson">Lessons</option>
                      <option value="topic">Topics</option>
                      <option value="acs-code">ACS Codes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={e => handleFilterChange({ ...filters, category: e.target.value || undefined })}
                      className="w-full p-2 border border-input rounded-md text-sm bg-background"
                    >
                      <option value="">All Categories</option>
                      <option value="Aerodynamics">Aerodynamics</option>
                      <option value="Navigation">Navigation</option>
                      <option value="Weather">Weather</option>
                      <option value="Safety">Safety</option>
                      <option value="Certification">Certification</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Results Header */}
          {(query || results.length > 0) && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isLoading
                  ? (
                      'Searching...'
                    )
                  : (
                      <>
                        {results.length}
                        {' '}
                        results
                        {query && ` for "${query}"`}
                        {filters.handbook && ` in ${filters.handbook}`}
                      </>
                    )}
              </div>

              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="text-sm border border-input rounded px-2 py-1 bg-background"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="title">Title</option>
                    <option value="recent">Recent</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Results List */}
          <div className="space-y-3">
            {results.map(result => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground hover:text-primary">
                          <a href={`/${locale}${result.url}`} className="hover:underline">
                            {highlightMatches(result.title, result.matchedTerms)}
                          </a>
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {getResultTypeLabel(result.type)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.ceil(result.relevance * 5) }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-primary rounded-full opacity-60" />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {highlightMatches(result.excerpt, result.matchedTerms)}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{result.category}</span>
                        <span>•</span>
                        <span className="capitalize">{result.handbook.replace('-', ' ')}</span>
                        <div className="ml-auto">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/${locale}${result.url}`} className="flex items-center gap-1">
                              Read More
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <div>
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No results found
                    </h3>
                    <p className="text-muted-foreground">
                      We couldn't find any content matching "
                      {query}
                      ". Try different keywords or check your spelling.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['emergency procedures', 'weather minimums', 'stall recovery', 'navigation systems'].map(suggestion => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(suggestion);
                            performSearch(suggestion, filters);
                            updateURL(suggestion, filters);
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!query && !isLoading && (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Search CFI Interactive
                    </h3>
                    <p className="text-muted-foreground">
                      Enter keywords to search across all handbook content, lessons, and ACS codes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Popular searches:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['principles of flight', 'emergency procedures', 'weather minimums', 'acs codes'].map(popular => (
                        <Button
                          key={popular}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(popular);
                            performSearch(popular, filters);
                            updateURL(popular, filters);
                          }}
                        >
                          {popular}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </HandbookLayout>
  );
}

export default function SearchPage({ params }: SearchPageProps) {
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

  return (
    <Suspense fallback={(
      <HandbookLayout locale={locale}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Search Handbook</h1>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </HandbookLayout>
    )}
    >
      <SearchContent locale={locale} />
    </Suspense>
  );
}
