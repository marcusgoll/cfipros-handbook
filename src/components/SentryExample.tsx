// Example component showing proper Sentry integration for CFIPros
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export function SentryExample() {
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);

    try {
      // Example API call with Sentry instrumentation
      const results = await Sentry.startSpan(
        {
          op: 'http.client',
          name: 'GET /api/search',
        },
        async (span) => {
          span?.setAttribute('search.term', searchTerm);

          const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);

          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }

          const data = await response.json();
          span?.setAttribute('search.results_count', data.results?.length || 0);

          return data;
        },
      );

      // Log successful search
      const { logger } = Sentry;
      logger.info('Search completed successfully', {
        searchTerm,
        resultsCount: results.results?.length || 0,
        responseTime: results.responseTime,
      });
    } catch (error) {
      // Capture exception with context
      Sentry.captureException(error, {
        tags: {
          section: 'search',
          feature: 'handbook_search',
        },
        contexts: {
          search: {
            term: searchTerm,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Log error with structured data
      const { logger } = Sentry;
      logger.error('Search failed', {
        searchTerm,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegulationError = () => {
    try {
      // Simulate a regulation parsing error
      throw new Error('Failed to parse FAR Part 61.23 - Medical Certificate Requirements');
    } catch (error) {
      // Capture with aviation-specific context
      Sentry.captureException(error, {
        tags: {
          section: 'regulations',
          regulation: 'FAR_61_23',
          feature: 'regulation_parser',
        },
        contexts: {
          regulation: {
            part: '61',
            section: '23',
            title: 'Medical Certificate Requirements',
          },
        },
      });
    }
  };

  const handleSearchClick = () => {
    // Create a span to measure search performance
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Aviation Handbook Search',
      },
      (span) => {
        const searchTerm = 'FAR Part 61';
        const userRole = 'cfi'; // Could come from user context

        // Add relevant attributes to the span
        span.setAttribute('search.term', searchTerm);
        span.setAttribute('user.role', userRole);
        span.setAttribute('section', 'regulations');

        performSearch(searchTerm);
      },
    );
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Sentry Integration Example</h3>

      <div className="space-y-4">
        <button
          onClick={handleSearchClick}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Test Aviation Search'}
        </button>

        <button
          onClick={handleRegulationError}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Test Error Handling
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>This component demonstrates:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Performance tracking with custom spans</li>
          <li>Error capture with aviation-specific context</li>
          <li>Structured logging for search operations</li>
          <li>Attribute tagging for better error categorization</li>
        </ul>
      </div>
    </div>
  );
}
