export type TocItem = {
  id?: string;
  title: string;
  href: string;
  items: TocItem[];
  order?: number;
  category?: string;
  section?: string;
  subsection?: string;
  description?: string;
  icon?: string;
};

export type HandbookToc = {
  [handbookType: string]: {
    title: string;
    items: TocItem[];
  };
};

// Search-related interfaces
export type SearchResult = {
  id: string;
  type: 'lesson' | 'topic' | 'acs-code' | 'section';
  title: string;
  excerpt: string;
  url: string;
  category: string;
  handbook: string;
  relevance: number;
  matchedTerms?: string[];
};

export type SearchSuggestion = {
  type: 'lesson' | 'topic' | 'acs-code';
  title: string;
  href: string;
  category?: string;
};

export type SearchFilters = {
  handbook?: string;
  category?: string;
  type?: SearchResult['type'];
  sortBy?: 'relevance' | 'title' | 'recent';
};

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
  filters: SearchFilters;
  suggestions: SearchSuggestion[];
  processingTime: number;
};

export type HandbookSearchScope = {
  handbook: string;
  title: string;
};
