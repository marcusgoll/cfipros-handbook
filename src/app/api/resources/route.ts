import type { NextRequest } from 'next/server';
import type { Resource, ResourceSearchResult } from '@/types/resources';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';
import { mockResources } from '@/lib/mock-resources';

const resourceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  category: z.string().optional(),
  accessLevel: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  aircraftType: z.string().optional(),
  difficulty: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'downloadCount', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // For development, skip auth to avoid middleware conflicts
    const userId = 'dev-user'; // await auth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries());
    const queryResult = resourceQuerySchema.safeParse(queryParams);

    if (!queryResult.success) {
      throw ErrorHandler.handleValidationError(queryResult.error);
    }

    const query = queryResult.data;

    // Determine user access level
    const userAccessLevel = getUserAccessLevel(userId);

    // Filter resources based on access level
    let filteredResources = mockResources.filter((resource) => {
      if (!resource.isActive) {
        return false;
      }

      // Access control
      if (resource.accessLevel === 'premium' && userAccessLevel === 'free') {
        return false;
      }
      if (resource.accessLevel === 'exclusive' && userAccessLevel !== 'lifetime') {
        return false;
      }

      return true;
    });

    // Apply filters
    if (query.category) {
      filteredResources = filteredResources.filter(r => r.category === query.category);
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredResources = filteredResources.filter(r =>
        r.title.toLowerCase().includes(searchLower)
        || r.description.toLowerCase().includes(searchLower)
        || r.tags.some(tag => tag.toLowerCase().includes(searchLower)),
      );
    }

    if (query.tags) {
      const tagList = query.tags.split(',').map(t => t.trim().toLowerCase());
      filteredResources = filteredResources.filter(r =>
        tagList.some(tag => r.tags.some(rTag => rTag.toLowerCase().includes(tag))),
      );
    }

    if (query.aircraftType && query.aircraftType !== 'all') {
      filteredResources = filteredResources.filter(r =>
        r.metadata.aircraftType?.some(type =>
          type.toLowerCase().includes(query.aircraftType!.toLowerCase()),
        ),
      );
    }

    if (query.difficulty && query.difficulty !== 'all') {
      filteredResources = filteredResources.filter(r =>
        r.metadata.difficulty?.toLowerCase() === query.difficulty!.toLowerCase(),
      );
    }

    // Sort resources
    filteredResources.sort((a, b) => {
      let aValue, bValue;

      switch (query.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'downloadCount':
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (query.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Pagination
    const total = filteredResources.length;
    const totalPages = Math.ceil(total / query.pageSize);
    const startIndex = (query.page - 1) * query.pageSize;
    const paginatedResources = filteredResources.slice(startIndex, startIndex + query.pageSize);

    // Generate filter aggregations
    const categories = getFilterCounts(mockResources, 'category');
    const tags = getTagCounts(mockResources);
    const accessLevels = getFilterCounts(mockResources, 'accessLevel');

    const result: ResourceSearchResult = {
      resources: paginatedResources,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages,
      filters: {
        categories,
        tags,
        accessLevels,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}

function getUserAccessLevel(userId: string | null): 'free' | 'premium' | 'lifetime' {
  // TODO: Implement actual user subscription check
  if (!userId) {
    return 'free';
  }

  // Mock implementation - in reality, check user's subscription status
  return 'premium'; // For development, assume premium access
}

function getFilterCounts(resources: Resource[], field: keyof Resource) {
  const counts = new Map();
  resources.forEach((resource) => {
    const value = resource[field];
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([value, count]) => ({ value, count }));
}

function getTagCounts(resources: Resource[]) {
  const tagCounts = new Map();
  resources.forEach((resource) => {
    resource.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 tags
}
