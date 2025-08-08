export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: 'aircraft' | 'navigation' | 'weather' | 'regulation' | 'operation' | 'instrument';
  synonyms?: string[];
  relatedTerms?: string[];
  handbookRefs?: {
    path: string;
    title: string;
    section?: string;
  }[];
  acsRefs?: string[];
  farRefs?: string[];
  priority: 'high' | 'medium' | 'low'; // Linking priority
  contexts?: string[]; // Context where this term should be linked
};

export type ContextLinkConfig = {
  enableAutoLinking: boolean;
  maxLinksPerParagraph: number;
  excludeElements: string[]; // HTML elements to skip linking
  minTermLength: number;
  caseSensitive: boolean;
};

export type LinkMatch = {
  term: string;
  start: number;
  end: number;
  glossaryId: string;
  confidence: number;
};

export type ContextualLink = {
  id: string;
  text: string;
  href: string;
  tooltip: string;
  type: 'handbook' | 'acs' | 'far' | 'external';
  category: GlossaryTerm['category'];
};