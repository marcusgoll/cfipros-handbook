'use client';

import type { SearchFilters, SearchResult } from '@/types/handbook';
import { ArrowUpDown, BookOpen, FileText, Hash, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SearchResultsProps = {
  query: string;
  handbookFilter: string;
};

// Mock search results - in real app, this would come from API
const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'lesson',
    title: 'Airfoil Theory',
    excerpt: 'Understanding how airfoils generate lift through Bernoulli\'s principle and Newton\'s laws. This lesson covers the fundamental concepts of airflow over curved surfaces...',
    url: '/handbook/private-pilot/principles-of-flight/airfoil-theory',
    category: 'Principles of Flight',
    handbook: 'private-pilot',
    matchedTerms: ['airfoil', 'lift', 'bernoulli'],
    relevance: 0.95,
  },
  {
    id: '2',
    type: 'acs-code',
    title: 'PA.I.E.K1 - Lift Generation',
    excerpt: 'Knowledge of how lift is generated and factors that affect lift production including angle of attack, airspeed, and wing design...',
    url: '/handbook/private-pilot/principles-of-flight',
    category: 'ACS Reference',
    handbook: 'private-pilot',
    matchedTerms: ['lift', 'generation'],
    relevance: 0.88,
  },
  {
    id: '3',
    type: 'topic',
    title: 'Bernoulli\'s Principle',
    excerpt: 'The relationship between fluid velocity and pressure as it applies to airflow over an airfoil. Higher velocity air above the wing creates lower pressure...',
    url: '/handbook/private-pilot/principles-of-flight/airfoil-theory#bernoulli',
    category: 'Aerodynamics',
    handbook: 'private-pilot',
    matchedTerms: ['bernoulli', 'principle', 'airflow'],
    relevance: 0.82,
  },
];

export function SearchResults({ query, handbookFilter }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    handbook: handbookFilter === 'all' ? undefined : handbookFilter,
    sortBy: 'relevance',
  });
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    const searchContent = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      // Simulate API call
      setTimeout(() => {
        let filteredResults = mockResults;

        if (query) {
          filteredResults = mockResults.filter(result =>
            result.title.toLowerCase().includes(query.toLowerCase())
            || result.excerpt.toLowerCase().includes(query.toLowerCase())
            || result.matchedTerms?.some(term =>
              term.toLowerCase().includes(query.toLowerCase()),
            ),
          );
        }

        if (filters.handbook && filters.handbook !== 'all') {
          filteredResults = filteredResults.filter(result =>
            result.handbook === filters.handbook,
          );
        }

        if (filters.type) {
          filteredResults = filteredResults.filter(result =>
            result.type === filters.type,
          );
        }

        // Sort results
        if (filters.sortBy === 'title') {
          filteredResults.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filters.sortBy === 'relevance') {
          filteredResults.sort((a, b) => b.relevance - a.relevance);
        }

        setResults(filteredResults);
        setProcessingTime(Date.now() - startTime);
        setIsLoading(false);
      }, 500);
    };

    searchContent();
  }, [query, filters]);

  const getIconForType = (type: SearchResult['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'topic':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'acs-code':
        return <Hash className="w-4 h-4 text-purple-500" />;
      case 'section':
        return <BookOpen className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const highlightMatchedTerms = (text: string, terms: string[]) => {
    if (!terms.length) {
      return text;
    }

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (terms.some(term => term.toLowerCase() === part.toLowerCase())) {
        return <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</mark>;
      }
      return part;
    });
  };

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Search the CFI Handbook</h2>
        <p className="text-muted-foreground mb-4">
          Find lessons, topics, ACS codes, and more across all handbook content.
        </p>
        <div className="text-sm text-muted-foreground">
          Try searching for: "airfoil theory", "weight and balance", or "ACS PA.I.E"
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? (
                  'Searching...'
                )
              : (
                  <>
                    {results.length}
                    {' '}
                    results for "
                    {query}
                    "
                    {processingTime > 0 && (
                      <span className="ml-2 text-xs">
                        (
                        {processingTime}
                        ms)
                      </span>
                    )}
                  </>
                )}
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(prev => ({
              ...prev,
              sortBy: prev.sortBy === 'relevance' ? 'title' : 'relevance',
            }))}
            className="text-xs"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            {filters.sortBy === 'relevance' ? 'Relevance' : 'Title'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-muted-foreground">Filter by:</span>
        <Button
          variant={!filters.type ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, type: undefined }))}
        >
          All Types
        </Button>
        <Button
          variant={filters.type === 'lesson' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, type: 'lesson' }))}
        >
          Lessons
        </Button>
        <Button
          variant={filters.type === 'topic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, type: 'topic' }))}
        >
          Topics
        </Button>
        <Button
          variant={filters.type === 'acs-code' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, type: 'acs-code' }))}
        >
          ACS Codes
        </Button>
      </div>

      {/* Results */}
      {isLoading
        ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-muted rounded mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="space-y-1">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        : results.length === 0
          ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any content matching "
                  {query}
                  ".
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>Try:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Checking your spelling</li>
                    <li>Using different keywords</li>
                    <li>Removing filters</li>
                    <li>Searching for broader terms</li>
                  </ul>
                </div>
              </div>
            )
          : (
              <div className="space-y-4">
                {results.map(result => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className={cn(
                      'block p-4 border border-border rounded-lg transition-colors',
                      'hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIconForType(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {highlightMatchedTerms(result.title, result.matchedTerms || [])}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                            {result.type.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {result.category}
                          {' '}
                          •
                          {result.handbook.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <p className="text-sm leading-relaxed">
                          {highlightMatchedTerms(result.excerpt, result.matchedTerms || [])}
                        </p>
                        {result.relevance && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-20 bg-muted rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full transition-all"
                                style={{ width: `${result.relevance * 100}%` }}
                              />
                            </div>
                            <span>
                              {Math.round(result.relevance * 100)}
                              % match
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
    </div>
  );
}
