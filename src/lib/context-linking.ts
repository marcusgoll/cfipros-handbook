import type { ContextLinkConfig, ContextualLink, GlossaryTerm, LinkMatch } from '@/types/glossary';
import { AVIATION_GLOSSARY, findTermByText } from './aviation-glossary';

// Default configuration for context linking
export const DEFAULT_LINK_CONFIG: ContextLinkConfig = {
  enableAutoLinking: true,
  maxLinksPerParagraph: 3,
  excludeElements: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'a', 'title'],
  minTermLength: 3,
  caseSensitive: false,
};

// Pattern for matching aviation terms in text
function createTermPattern(terms: GlossaryTerm[]): RegExp {
  // Sort by length (longest first) to match longer terms before shorter ones
  const sortedTerms = [...terms]
    .flatMap(term => [term.term, ...(term.synonyms || [])])
    .sort((a, b) => b.length - a.length)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex special chars

  return new RegExp(`\\b(${sortedTerms.join('|')})\\b`, 'gi');
}

// Find potential terms to link in text
export function findTermMatches(text: string, config: ContextLinkConfig = DEFAULT_LINK_CONFIG): LinkMatch[] {
  if (!config.enableAutoLinking) {
    return [];
  }

  const matches: LinkMatch[] = [];
  const termPattern = createTermPattern(AVIATION_GLOSSARY);
  let match;
  while ((match = termPattern.exec(text)) !== null) {
    const matchedText = match[1];
    if (!matchedText) continue;
    
    const term = findTermByText(matchedText);
    if (term && matchedText.length >= config.minTermLength) {
      matches.push({
        term: matchedText,
        start: match.index,
        end: match.index + matchedText.length,
        glossaryId: term.id,
        confidence: calculateConfidence(term, matchedText),
      });
    }
  }

  return deduplicateMatches(matches, config);
}

// Calculate confidence score for a term match
function calculateConfidence(term: GlossaryTerm, matchedText: string): number {
  let confidence = 0.5; // Base confidence

  // Exact term match gets higher confidence
  if (term.term.toLowerCase() === matchedText.toLowerCase()) {
    confidence += 0.3;
  }

  // High priority terms get bonus
  if (term.priority === 'high') {
    confidence += 0.2;
  } else if (term.priority === 'medium') {
    confidence += 0.1;
  }

  // Longer terms generally more specific
  if (matchedText.length > 8) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

// Remove overlapping matches and limit per paragraph
function deduplicateMatches(matches: LinkMatch[], config: ContextLinkConfig): LinkMatch[] {
  // Sort by position and confidence
  matches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.confidence - a.confidence;
  });

  const filtered: LinkMatch[] = [];
  let lastEnd = -1;

  for (const match of matches) {
    // Skip overlapping matches
    if (match.start < lastEnd) {
      continue;
    }

    // Respect max links per paragraph limit
    if (filtered.length >= config.maxLinksPerParagraph) {
      break;
    }

    filtered.push(match);
    lastEnd = match.end;
  }

  return filtered;
}

// Convert matches to contextual links
export function createContextualLinks(matches: LinkMatch[]): ContextualLink[] {
  return matches.map((match) => {
    const term = AVIATION_GLOSSARY.find(t => t.id === match.glossaryId);
    if (!term) {
      throw new Error(`Term not found: ${match.glossaryId}`);
    }

    const primaryHandbookRef = term.handbookRefs?.[0];

    return {
      id: match.glossaryId,
      text: match.term,
      href: primaryHandbookRef?.path || `#${match.glossaryId}`,
      tooltip: term.definition,
      type: primaryHandbookRef ? 'handbook' : 'external',
      category: term.category,
    };
  });
}

// Process text and replace matches with link markup
export function processTextWithLinks(text: string, config: ContextLinkConfig = DEFAULT_LINK_CONFIG): {
  processedText: string;
  links: ContextualLink[];
} {
  const matches = findTermMatches(text, config);
  const links = createContextualLinks(matches);

  // Replace matches with placeholder tokens (process in reverse order to maintain positions)
  let processedText = text;
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);

  sortedMatches.forEach((match, index) => {
    const linkId = `__LINK_${matches.length - 1 - index}__`;
    processedText = processedText.slice(0, match.start)
      + linkId
      + processedText.slice(match.end);
  });

  return { processedText, links };
}

// Extract terms that should be highlighted in current context
export function getContextRelevantTerms(context: string, category?: GlossaryTerm['category']): GlossaryTerm[] {
  return AVIATION_GLOSSARY.filter((term) => {
    if (category && term.category !== category) {
      return false;
    }

    return term.contexts?.some(ctx =>
      ctx.toLowerCase().includes(context.toLowerCase())
      || context.toLowerCase().includes(ctx.toLowerCase()),
    ) || false;
  });
}

// Generate handbook page URL from term
export function generateHandbookUrl(term: GlossaryTerm, locale: string = 'en'): string | null {
  const handbookRef = term.handbookRefs?.[0];
  if (!handbookRef) {
    return null;
  }

  return `/${locale}${handbookRef.path}`;
}

// Check if element should be excluded from linking
export function shouldExcludeElement(elementType: string, config: ContextLinkConfig): boolean {
  return config.excludeElements.includes(elementType.toLowerCase());
}

// Utility for MDX components to check if auto-linking is enabled
export function isAutoLinkingEnabled(config: ContextLinkConfig = DEFAULT_LINK_CONFIG): boolean {
  return config.enableAutoLinking;
}

// Create regex for finding specific aviation patterns
export function createAviationPatterns() {
  return {
    acsCode: /\b[A-Z]{2}\.[IVX]+\.[A-Z]\.[SK]\d*\b/g,
    farReference: /\b14\s+CFR\s+\d+\.\d+\b/g,
    frequency: /\b\d{3}\.\d{1,3}\s*MHz?\b/gi,
    altitude: /\b\d{1,2},?\d{3}\s*(?:feet|ft|')\b/gi,
    airspeed: /\b\d{1,3}\s*(?:knots|kts|mph|kt)\b/gi,
  };
}

// Extract aviation-specific patterns from text
export function extractAviationPatterns(text: string): {
  acsCodes: string[];
  farReferences: string[];
  frequencies: string[];
  altitudes: string[];
  airspeeds: string[];
} {
  const patterns = createAviationPatterns();

  return {
    acsCodes: Array.from(text.match(patterns.acsCode) || []),
    farReferences: Array.from(text.match(patterns.farReference) || []),
    frequencies: Array.from(text.match(patterns.frequency) || []),
    altitudes: Array.from(text.match(patterns.altitude) || []),
    airspeeds: Array.from(text.match(patterns.airspeed) || []),
  };
}
