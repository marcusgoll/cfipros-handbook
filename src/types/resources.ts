export type Resource = {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  subcategory?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  accessLevel: AccessLevel;
  downloadCount: number;
  tags: string[];
  metadata: ResourceMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResourceMetadata = {
  aircraftType?: string[];
  lastUpdated?: string;
  version?: string;
  sourceUrl?: string;
  relatedAcsCodes?: string[];
  difficulty?: string;
};

export type ResourceCategory
  = | 'checklist'
    | 'reference'
    | 'study-guide'
    | 'weather'
    | 'airport-diagrams'
    | 'regulations'
    | 'interactive'
    | 'mnemonics';

export type AccessLevel = 'free' | 'premium' | 'exclusive';

export type ResourceDownload = {
  id: string;
  resourceId: string;
  userId: string;
  downloadTimestamp: string;
  userAgent?: string;
  ipAddress?: string;
};

export type UserResourceFavorite = {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
};

export type ResourceFilter = {
  category?: ResourceCategory[];
  accessLevel?: AccessLevel[];
  tags?: string[];
  search?: string;
  aircraftType?: string[];
};

export type ResourceSearchResult = {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    categories: { value: ResourceCategory; count: number }[];
    tags: { value: string; count: number }[];
    accessLevels: { value: AccessLevel; count: number }[];
  };
};

export type UserResourceStats = {
  totalDownloads: number;
  monthlyDownloads: number;
  favoriteCount: number;
  recentDownloads: Resource[];
  downloadHistory: ResourceDownload[];
  remainingFreeDownloads?: number;
};

export type ResourceAnalytics = {
  totalResources: number;
  totalDownloads: number;
  popularResources: (Resource & { downloadCount: number })[];
  downloadsByCategory: { category: ResourceCategory; count: number }[];
  downloadsByAccessLevel: { accessLevel: AccessLevel; count: number }[];
  recentDownloads: ResourceDownload[];
  userEngagement: {
    activeUsers: number;
    returningUsers: number;
    averageDownloadsPerUser: number;
  };
};

export type CreateResourceRequest = {
  title: string;
  description: string;
  category: ResourceCategory;
  subcategory?: string;
  file: File;
  accessLevel: AccessLevel;
  tags: string[];
  metadata: ResourceMetadata;
};

export type UpdateResourceRequest = {
  title?: string;
  description?: string;
  category?: ResourceCategory;
  subcategory?: string;
  accessLevel?: AccessLevel;
  tags?: string[];
  metadata?: ResourceMetadata;
  isActive?: boolean;
};
