export type ACSCode = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  section?: string;
  subsection?: string;
  level: 'Knowledge' | 'Risk Management' | 'Skill';
  keywords: string[];
};

export class ACSCodeDatabase {
  private static codes: ACSCode[] = [
    {
      id: 'PA.I.A.K1',
      code: 'PA.I.A.K1',
      title: 'Certification and documents',
      description: 'Required pilot and aircraft certificates, documents, and records',
      category: 'Preflight Preparation',
      section: 'Pilot Qualifications',
      level: 'Knowledge',
      keywords: ['certificate', 'license', 'medical', 'logbook', 'currency', 'endorsement'],
    },
    {
      id: 'PA.I.A.K2',
      code: 'PA.I.A.K2',
      title: 'Privilege and limitations',
      description: 'Privileges and limitations of pilot certificates',
      category: 'Preflight Preparation',
      section: 'Pilot Qualifications',
      level: 'Knowledge',
      keywords: ['privileges', 'limitations', 'restrictions', 'certificate', 'rating'],
    },
    {
      id: 'PA.I.B.K1',
      code: 'PA.I.B.K1',
      title: 'Airworthiness requirements',
      description: 'Aircraft airworthiness requirements and certificates',
      category: 'Preflight Preparation',
      section: 'Airworthiness Requirements',
      level: 'Knowledge',
      keywords: ['airworthiness', 'inspection', 'annual', '100-hour', 'maintenance', 'AD'],
    },
    {
      id: 'PA.I.C.K1',
      code: 'PA.I.C.K1',
      title: 'Weather information',
      description: 'Sources of weather data for flight planning',
      category: 'Preflight Preparation',
      section: 'Weather Information',
      level: 'Knowledge',
      keywords: ['weather', 'METAR', 'TAF', 'briefing', 'forecast', 'conditions'],
    },
    {
      id: 'PA.I.C.K2',
      code: 'PA.I.C.K2',
      title: 'Weather hazards',
      description: 'Hazardous weather phenomena',
      category: 'Preflight Preparation',
      section: 'Weather Information',
      level: 'Knowledge',
      keywords: ['turbulence', 'icing', 'thunderstorm', 'fog', 'wind shear', 'microburst'],
    },
    {
      id: 'PA.I.D.K1',
      code: 'PA.I.D.K1',
      title: 'Navigation charts',
      description: 'Use of aeronautical charts and navigation publications',
      category: 'Preflight Preparation',
      section: 'Cross-Country Flight Planning',
      level: 'Knowledge',
      keywords: ['chart', 'sectional', 'navigation', 'symbols', 'scale', 'coordinates'],
    },
    {
      id: 'PA.I.D.K2',
      code: 'PA.I.D.K2',
      title: 'Navigation systems',
      description: 'Navigation systems and radar services',
      category: 'Preflight Preparation',
      section: 'Cross-Country Flight Planning',
      level: 'Knowledge',
      keywords: ['GPS', 'VOR', 'ADF', 'DME', 'radar', 'navigation'],
    },
    {
      id: 'PA.I.E.K1',
      code: 'PA.I.E.K1',
      title: 'National airspace system',
      description: 'National airspace system and pilot/controller glossary',
      category: 'Preflight Preparation',
      section: 'National Airspace System',
      level: 'Knowledge',
      keywords: ['airspace', 'class', 'controlled', 'uncontrolled', 'special use', 'NOTAM'],
    },
    {
      id: 'PA.I.F.K1',
      code: 'PA.I.F.K1',
      title: 'Performance and limitations',
      description: 'Elements related to performance and limitations',
      category: 'Preflight Preparation',
      section: 'Performance and Limitations',
      level: 'Knowledge',
      keywords: ['performance', 'weight', 'balance', 'density altitude', 'takeoff', 'landing'],
    },
    {
      id: 'PA.II.A.K1',
      code: 'PA.II.A.K1',
      title: 'Preflight inspection',
      description: 'Purpose and general procedures for preflight inspection',
      category: 'Preflight Procedures',
      section: 'Preflight Assessment',
      level: 'Knowledge',
      keywords: ['preflight', 'inspection', 'checklist', 'walkaround', 'squawks', 'discrepancies'],
    },
    {
      id: 'PA.III.A.K1',
      code: 'PA.III.A.K1',
      title: 'Radio communications',
      description: 'Effective radio communications and phraseology',
      category: 'Airport Operations',
      section: 'Communications, Light Signals, and Runway Lighting Systems',
      level: 'Knowledge',
      keywords: ['radio', 'communication', 'phraseology', 'ATC', 'frequency', 'tower'],
    },
    {
      id: 'PA.III.B.K1',
      code: 'PA.III.B.K1',
      title: 'Traffic patterns',
      description: 'Airport traffic patterns and procedures',
      category: 'Airport Operations',
      section: 'Traffic Patterns',
      level: 'Knowledge',
      keywords: ['traffic pattern', 'downwind', 'base', 'final', 'crosswind', 'departure'],
    },
    {
      id: 'PA.IV.A.K1',
      code: 'PA.IV.A.K1',
      title: 'Normal takeoff',
      description: 'Elements related to normal and crosswind takeoff',
      category: 'Takeoffs, Landings, and Go-Arounds',
      section: 'Normal Takeoff and Climb',
      level: 'Knowledge',
      keywords: ['takeoff', 'rotation', 'climb', 'crosswind', 'ground roll', 'obstacles'],
    },
    {
      id: 'PA.IV.B.K1',
      code: 'PA.IV.B.K1',
      title: 'Normal landing',
      description: 'Elements related to normal and crosswind landing',
      category: 'Takeoffs, Landings, and Go-Arounds',
      section: 'Normal Approach and Landing',
      level: 'Knowledge',
      keywords: ['landing', 'approach', 'final', 'flare', 'touchdown', 'rollout'],
    },
    {
      id: 'PA.V.A.K1',
      code: 'PA.V.A.K1',
      title: 'Straight-and-level flight',
      description: 'Relationship of pitch, bank, power, trim, and airspeed',
      category: 'Performance and Ground Reference Maneuvers',
      section: 'Straight-and-Level Flight',
      level: 'Knowledge',
      keywords: ['straight', 'level', 'attitude', 'trim', 'airspeed', 'altitude'],
    },
    {
      id: 'PA.VI.A.K1',
      code: 'PA.VI.A.K1',
      title: 'Navigation systems',
      description: 'Ground-based and satellite-based navigation',
      category: 'Navigation',
      section: 'Pilotage and Dead Reckoning',
      level: 'Knowledge',
      keywords: ['pilotage', 'dead reckoning', 'GPS', 'VOR', 'checkpoints', 'course'],
    },
    {
      id: 'PA.VII.A.K1',
      code: 'PA.VII.A.K1',
      title: 'Slow flight',
      description: 'Aerodynamics associated with slow flight',
      category: 'Slow Flight and Stalls',
      section: 'Maneuvering During Slow Flight',
      level: 'Knowledge',
      keywords: ['slow flight', 'minimum controllable airspeed', 'drag', 'power', 'control'],
    },
    {
      id: 'PA.VII.B.K1',
      code: 'PA.VII.B.K1',
      title: 'Power-off stalls',
      description: 'Aerodynamics of power-off stalls',
      category: 'Slow Flight and Stalls',
      section: 'Power-Off Stalls',
      level: 'Knowledge',
      keywords: ['stall', 'power-off', 'approach', 'recovery', 'angle of attack', 'critical'],
    },
    {
      id: 'PA.VIII.A.K1',
      code: 'PA.VIII.A.K1',
      title: 'Basic instrument flight',
      description: 'Instruments used for attitude and directional reference',
      category: 'Basic Instrument Maneuvers',
      section: 'Straight-and-Level Flight',
      level: 'Knowledge',
      keywords: ['instruments', 'attitude', 'heading', 'altitude', 'airspeed', 'scan'],
    },
    {
      id: 'PA.IX.A.K1',
      code: 'PA.IX.A.K1',
      title: 'Emergency procedures',
      description: 'Emergency procedures and equipment',
      category: 'Emergency Operations',
      section: 'Emergency Descent',
      level: 'Knowledge',
      keywords: ['emergency', 'descent', 'procedures', 'checklist', 'malfunction', 'failure'],
    },
    {
      id: 'PA.IX.B.K1',
      code: 'PA.IX.B.K1',
      title: 'Emergency approach and landing',
      description: 'Procedures for emergency approach and landing',
      category: 'Emergency Operations',
      section: 'Emergency Approach and Landing',
      level: 'Knowledge',
      keywords: ['emergency landing', 'forced landing', 'engine failure', 'glide', 'field selection'],
    },
    {
      id: 'PA.X.A.K1',
      code: 'PA.X.A.K1',
      title: 'Principles of flight',
      description: 'Relationship between angle of attack, airspeed, lift, and drag',
      category: 'Multiengine Operations',
      section: 'Maneuvering with One Engine Inoperative',
      level: 'Knowledge',
      keywords: ['principles', 'lift', 'drag', 'thrust', 'weight', 'forces', 'aerodynamics'],
    },
  ];

  static findMatchingCodes(text: string, limit: number = 5): ACSCode[] {
    const searchText = text.toLowerCase();
    const matches: { code: ACSCode; score: number }[] = [];

    for (const code of this.codes) {
      let score = 0;

      // Check for exact keyword matches
      for (const keyword of code.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Check for partial matches in title and description
      if (code.title.toLowerCase().includes(searchText)) {
        score += 5;
      }

      if (code.description.toLowerCase().includes(searchText)) {
        score += 3;
      }

      // Check for category/section matches
      if (code.category.toLowerCase().includes(searchText)) {
        score += 2;
      }

      if (code.section?.toLowerCase().includes(searchText)) {
        score += 2;
      }

      if (score > 0) {
        matches.push({ code, score });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(match => match.code);
  }

  static getCodeById(id: string): ACSCode | undefined {
    return this.codes.find(code => code.id === id || code.code === id);
  }

  static getCodesByCategory(category: string): ACSCode[] {
    return this.codes.filter(code =>
      code.category.toLowerCase() === category.toLowerCase(),
    );
  }

  static getAllCategories(): string[] {
    return [...new Set(this.codes.map(code => code.category))];
  }

  static getAllCodes(): ACSCode[] {
    return [...this.codes];
  }

  static searchCodes(query: string): ACSCode[] {
    const searchTerm = query.toLowerCase();

    return this.codes.filter(code =>
      code.code.toLowerCase().includes(searchTerm)
      || code.title.toLowerCase().includes(searchTerm)
      || code.description.toLowerCase().includes(searchTerm)
      || code.category.toLowerCase().includes(searchTerm)
      || code.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)),
    );
  }

  static getRandomCodes(count: number = 5): ACSCode[] {
    const shuffled = [...this.codes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const code of this.codes) {
      stats[code.category] = (stats[code.category] || 0) + 1;
    }

    return stats;
  }
}
