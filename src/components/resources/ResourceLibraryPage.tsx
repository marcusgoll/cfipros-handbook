'use client';

import type { Resource, ResourceFilter, ResourceSearchResult } from '@/types/resources';
import { CheckCircle, FileText, Filter, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceCard } from './ResourceCard';
import { ResourceDownloadModal } from './ResourceDownloadModal';
import { ResourceFilterSidebar } from './ResourceFilterSidebar';

type ResourceLibraryPageProps = {
  locale: string;
};

export function ResourceLibraryPage({ locale }: ResourceLibraryPageProps) {
  const [searchResult, setSearchResult] = useState<ResourceSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ResourceFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category?.length && { category: filters.category[0] }),
        ...(filters.accessLevel?.length && { accessLevel: filters.accessLevel[0] }),
        ...(filters.tags?.length && { tags: filters.tags.join(',') }),
        sortBy: 'downloadCount',
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/resources?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const result: ResourceSearchResult = await response.json();
      setSearchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: ResourceFilter) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Close filters on mobile after applying a filter
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  const handleDownload = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && !searchResult) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array.from({ length: 6 })].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-800">
            <h2 className="text-lg font-semibold mb-2">Unable to Load Resources</h2>
            <p className="mb-4">{error}</p>
            <Button onClick={() => fetchResources()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Resources',
      value: searchResult?.total || 0,
      icon: FileText,
    },
    {
      label: 'Free Resources',
      value: searchResult?.resources.filter(r => r.accessLevel === 'free').length || 0,
      icon: CheckCircle,
    },
    {
      label: 'Premium Resources',
      value: searchResult?.resources.filter(r => r.accessLevel === 'premium').length || 0,
      icon: Star,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Resource Library</h1>
        <p className="text-muted-foreground mb-6">
          Comprehensive collection of aviation resources, checklists, and study materials
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.category?.map(cat => (
              <Badge key={cat} variant="secondary" className="capitalize">
                {cat.replace('-', ' ')}
              </Badge>
            ))}
            {filters.accessLevel?.map(level => (
              <Badge key={level} variant="secondary" className="capitalize">
                {level}
              </Badge>
            ))}
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary">
                #
                {tag}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-8 relative">
        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowFilters(false)} />
        )}

        {/* Sidebar Filters */}
        {showFilters && (
          <div className="fixed top-0 left-0 h-full w-80 bg-background z-50 overflow-y-auto shadow-xl md:static md:w-64 md:flex-shrink-0 md:bg-transparent md:shadow-none">
            <div className="p-4 md:p-0">
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ResourceFilterSidebar
                filters={filters}
                filterOptions={searchResult?.filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <div className="text-sm text-muted-foreground">
                Showing
                {' '}
                {searchResult?.resources.length || 0}
                {' '}
                of
                {' '}
                {searchResult?.total || 0}
                {' '}
                resources
              </div>
            </div>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResult?.resources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onDownload={() => handleDownload(resource)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {searchResult?.resources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onDownload={() => handleDownload(resource)}
                    layout="list"
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {searchResult && searchResult.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>

              {[...Array.from({ length: Math.min(5, searchResult.totalPages) })].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                disabled={currentPage === searchResult.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      {selectedResource && (
        <ResourceDownloadModal
          resource={selectedResource}
          open={!!selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}
