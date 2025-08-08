import type { GlossaryTerm } from '@/types/glossary';

// Core aviation glossary database
export const AVIATION_GLOSSARY: GlossaryTerm[] = [
  // Aircraft Systems
  {
    id: 'airfoil',
    term: 'Airfoil',
    definition: 'The cross-sectional shape of a wing, blade, or other surface designed to produce lift when air flows over it.',
    category: 'aircraft',
    synonyms: ['wing section', 'aerofoil'],
    relatedTerms: ['lift', 'camber', 'chord line', 'angle of attack'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/airfoil-theory', title: 'Airfoil Theory and Design' }
    ],
    acsRefs: ['PA.I.B.K1'],
    farRefs: [],
    priority: 'high',
    contexts: ['aerodynamics', 'flight theory', 'wing design']
  },
  {
    id: 'angle-of-attack',
    term: 'Angle of Attack',
    definition: 'The angle between the chord line of an airfoil and the relative wind.',
    category: 'aircraft',
    synonyms: ['AOA'],
    relatedTerms: ['airfoil', 'lift', 'stall', 'critical angle of attack'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/angle-of-attack', title: 'Angle of Attack' }
    ],
    acsRefs: ['PA.I.B.K2'],
    priority: 'high',
    contexts: ['flight controls', 'aerodynamics', 'performance']
  },
  {
    id: 'four-forces',
    term: 'Four Forces of Flight',
    definition: 'The four fundamental forces acting on an aircraft: lift, weight, thrust, and drag.',
    category: 'aircraft',
    synonyms: ['four forces'],
    relatedTerms: ['lift', 'weight', 'thrust', 'drag', 'equilibrium'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/four-forces', title: 'The Four Forces of Flight' }
    ],
    acsRefs: ['PA.I.B.K1'],
    priority: 'high',
    contexts: ['flight theory', 'aerodynamics']
  },
  {
    id: 'lift',
    term: 'Lift',
    definition: 'The force that acts perpendicular to the relative wind and supports the aircraft in flight.',
    category: 'aircraft',
    relatedTerms: ['airfoil', 'angle of attack', 'bernoulli principle', 'newton laws'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/four-forces', title: 'The Four Forces of Flight' },
      { path: '/handbook/private-pilot/principles-of-flight/airfoil-theory', title: 'Airfoil Theory and Design' }
    ],
    acsRefs: ['PA.I.B.K1'],
    priority: 'high',
    contexts: ['aerodynamics', 'flight theory']
  },
  {
    id: 'drag',
    term: 'Drag',
    definition: 'The force that opposes the motion of an aircraft through the air.',
    category: 'aircraft',
    synonyms: ['air resistance'],
    relatedTerms: ['induced drag', 'parasite drag', 'form drag', 'friction drag'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/four-forces', title: 'The Four Forces of Flight' }
    ],
    acsRefs: ['PA.I.B.K1'],
    priority: 'high',
    contexts: ['aerodynamics', 'performance']
  },
  {
    id: 'thrust',
    term: 'Thrust',
    definition: 'The force that moves an aircraft forward through the air.',
    category: 'aircraft',
    relatedTerms: ['propeller', 'engine', 'power', 'torque'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/four-forces', title: 'The Four Forces of Flight' }
    ],
    acsRefs: ['PA.I.B.K1'],
    priority: 'high',
    contexts: ['powerplant', 'performance']
  },
  {
    id: 'weight',
    term: 'Weight',
    definition: 'The force of gravity acting on the aircraft and its contents.',
    category: 'aircraft',
    synonyms: ['gravity'],
    relatedTerms: ['center of gravity', 'gross weight', 'useful load'],
    handbookRefs: [
      { path: '/handbook/private-pilot/principles-of-flight/four-forces', title: 'The Four Forces of Flight' }
    ],
    acsRefs: ['PA.I.B.K1'],
    priority: 'high',
    contexts: ['weight and balance', 'performance']
  },

  // Navigation Terms
  {
    id: 'vor',
    term: 'VOR',
    definition: 'VHF Omnidirectional Range - a radio navigation system that provides bearing information.',
    category: 'navigation',
    synonyms: ['VHF Omnidirectional Range'],
    relatedTerms: ['radial', 'bearing', 'course', 'OBS'],
    handbookRefs: [],
    acsRefs: ['PA.III.A.K1'],
    farRefs: ['14 CFR 91.205'],
    priority: 'high',
    contexts: ['navigation', 'instruments', 'cross-country']
  },
  {
    id: 'gps',
    term: 'GPS',
    definition: 'Global Positioning System - a satellite-based navigation system providing precise position information.',
    category: 'navigation',
    synonyms: ['Global Positioning System', 'GNSS'],
    relatedTerms: ['waypoint', 'fix', 'RNAV', 'WAAS'],
    acsRefs: ['PA.III.A.K2'],
    farRefs: ['14 CFR 91.205'],
    priority: 'high',
    contexts: ['navigation', 'modern avionics']
  },

  // Weather Terms
  {
    id: 'metar',
    term: 'METAR',
    definition: 'Meteorological Aerodrome Report - a standardized format for reporting weather information.',
    category: 'weather',
    synonyms: ['weather report'],
    relatedTerms: ['TAF', 'visibility', 'ceiling', 'wind'],
    acsRefs: ['PA.I.D.K1'],
    priority: 'high',
    contexts: ['weather', 'flight planning']
  },
  {
    id: 'taf',
    term: 'TAF',
    definition: 'Terminal Aerodrome Forecast - a weather forecast for a specific airport and its vicinity.',
    category: 'weather',
    synonyms: ['Terminal Aerodrome Forecast', 'terminal forecast'],
    relatedTerms: ['METAR', 'forecast', 'weather briefing'],
    acsRefs: ['PA.I.D.K1'],
    priority: 'high',
    contexts: ['weather', 'flight planning']
  },

  // Regulations
  {
    id: 'vfr',
    term: 'VFR',
    definition: 'Visual Flight Rules - regulations that allow pilots to operate aircraft by visual reference to the ground.',
    category: 'regulation',
    synonyms: ['Visual Flight Rules'],
    relatedTerms: ['IFR', 'visibility minimums', 'cloud clearance'],
    farRefs: ['14 CFR 91.155'],
    acsRefs: ['PA.I.C.K1'],
    priority: 'high',
    contexts: ['regulations', 'weather minimums', 'airspace']
  },
  {
    id: 'ifr',
    term: 'IFR',
    definition: 'Instrument Flight Rules - regulations that allow pilots to operate aircraft by reference to instruments.',
    category: 'regulation',
    synonyms: ['Instrument Flight Rules'],
    relatedTerms: ['VFR', 'instrument rating', 'clearance'],
    farRefs: ['14 CFR 91.167'],
    priority: 'medium',
    contexts: ['regulations', 'instrument flight']
  },

  // Operations
  {
    id: 'pattern',
    term: 'Traffic Pattern',
    definition: 'A standardized rectangular flight path around an airport for arriving and departing aircraft.',
    category: 'operation',
    synonyms: ['airport pattern', 'pattern'],
    relatedTerms: ['downwind', 'base', 'final', 'crosswind', 'upwind'],
    acsRefs: ['PA.II.E.K1'],
    priority: 'high',
    contexts: ['airport operations', 'landings', 'takeoffs']
  },
  {
    id: 'downwind',
    term: 'Downwind',
    definition: 'The leg of the traffic pattern parallel to the runway in the direction opposite to landing.',
    category: 'operation',
    relatedTerms: ['traffic pattern', 'base', 'final', 'abeam'],
    acsRefs: ['PA.II.E.K1'],
    priority: 'medium',
    contexts: ['airport operations', 'traffic pattern']
  },
  {
    id: 'base',
    term: 'Base Leg',
    definition: 'The leg of the traffic pattern perpendicular to the runway, preceding the final approach.',
    category: 'operation',
    synonyms: ['base'],
    relatedTerms: ['traffic pattern', 'downwind', 'final', 'turn to final'],
    acsRefs: ['PA.II.E.K1'],
    priority: 'medium',
    contexts: ['airport operations', 'traffic pattern']
  },
  {
    id: 'final',
    term: 'Final Approach',
    definition: 'The last leg of the traffic pattern, aligned with the runway for landing.',
    category: 'operation',
    synonyms: ['final'],
    relatedTerms: ['traffic pattern', 'base', 'approach', 'landing'],
    acsRefs: ['PA.II.E.K1'],
    priority: 'medium',
    contexts: ['airport operations', 'landing']
  }
];

// Create lookup maps for efficient searching
export const termLookup = new Map<string, GlossaryTerm>();
export const synonymLookup = new Map<string, GlossaryTerm>();

// Initialize lookup maps
AVIATION_GLOSSARY.forEach(term => {
  termLookup.set(term.term.toLowerCase(), term);
  
  if (term.synonyms) {
    term.synonyms.forEach(synonym => {
      synonymLookup.set(synonym.toLowerCase(), term);
    });
  }
});

// Search functions
export function findTermByText(text: string): GlossaryTerm | undefined {
  const normalized = text.toLowerCase().trim();
  return termLookup.get(normalized) || synonymLookup.get(normalized);
}

export function findTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return AVIATION_GLOSSARY.filter(term => term.category === category);
}

export function findTermsByContext(context: string): GlossaryTerm[] {
  return AVIATION_GLOSSARY.filter(term => 
    term.contexts?.some(ctx => ctx.toLowerCase().includes(context.toLowerCase()))
  );
}

export function getRelatedTerms(termId: string): GlossaryTerm[] {
  const term = AVIATION_GLOSSARY.find(t => t.id === termId);
  if (!term || !term.relatedTerms) return [];
  
  return term.relatedTerms
    .map(relatedId => AVIATION_GLOSSARY.find(t => t.id === relatedId || t.term.toLowerCase() === relatedId.toLowerCase()))
    .filter(Boolean) as GlossaryTerm[];
}

export function searchGlossary(query: string): GlossaryTerm[] {
  const normalized = query.toLowerCase();
  
  return AVIATION_GLOSSARY.filter(term => 
    term.term.toLowerCase().includes(normalized) ||
    term.definition.toLowerCase().includes(normalized) ||
    term.synonyms?.some(synonym => synonym.toLowerCase().includes(normalized)) ||
    term.relatedTerms?.some(related => related.toLowerCase().includes(normalized))
  ).sort((a, b) => {
    // Prioritize exact matches and high priority terms
    const aExact = a.term.toLowerCase() === normalized ? 10 : 0;
    const bExact = b.term.toLowerCase() === normalized ? 10 : 0;
    const aPriority = a.priority === 'high' ? 5 : a.priority === 'medium' ? 2 : 0;
    const bPriority = b.priority === 'high' ? 5 : b.priority === 'medium' ? 2 : 0;
    
    return (bExact + bPriority) - (aExact + aPriority);
  });
}