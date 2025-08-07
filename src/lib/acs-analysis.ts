import type { QuestionData } from './text-extraction';

export type AnalysisResult = {
  sessionId: string;
  overallPerformance: PerformanceMetrics;
  categoryBreakdown: CategoryPerformance[];
  weakAreas: WeakArea[];
  recommendations: StudyRecommendation[];
  acsCodeAnalysis: ACSCodeAnalysis[];
  progress: ProgressTracking;
};

export type PerformanceMetrics = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  overallScore: number;
  averageConfidence: number;
  averageTimePerQuestion: number;
};

export type CategoryPerformance = {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  masteryLevel: 'Needs Improvement' | 'Developing' | 'Proficient' | 'Mastered';
};

export type WeakArea = {
  category: string;
  acsCode: string;
  score: number;
  attempts: number;
  commonMistakes: string[];
  priority: 'High' | 'Medium' | 'Low';
};

export type StudyRecommendation = {
  category: string;
  acsCode: string;
  recommendation: string;
  resources: StudyResource[];
  estimatedStudyTime: number;
  priority: number;
};

export type StudyResource = {
  type: 'handbook' | 'video' | 'practice' | 'reference';
  title: string;
  url?: string;
  description: string;
};

export type ACSCodeAnalysis = {
  code: string;
  title: string;
  category: string;
  performance: number;
  attempts: number;
  lastAttempt: string;
  trend: 'improving' | 'declining' | 'stable';
  masteryLevel: 'Needs Improvement' | 'Developing' | 'Proficient' | 'Mastered';
};

export type ProgressTracking = {
  currentLevel: string;
  progressPercentage: number;
  milestones: Milestone[];
  nextGoals: string[];
  strengths: string[];
  areasForImprovement: string[];
};

export type Milestone = {
  title: string;
  description: string;
  achieved: boolean;
  date?: string;
};

export class ACSAnalyzer {
  static analyzeQuestions(
    questions: QuestionData[],
    sessionId: string,
    _userId: string,
  ): AnalysisResult {
    const performance = this.calculatePerformance(questions);
    const categoryBreakdown = this.analyzeCategoryPerformance(questions);
    const weakAreas = this.identifyWeakAreas(categoryBreakdown);
    const recommendations = this.generateRecommendations(weakAreas, categoryBreakdown);
    const acsCodeAnalysis = this.analyzeACSCodes(questions);
    const progress = this.trackProgress(performance, categoryBreakdown);

    return {
      sessionId,
      overallPerformance: performance,
      categoryBreakdown,
      weakAreas,
      recommendations,
      acsCodeAnalysis,
      progress,
    };
  }

  private static calculatePerformance(questions: QuestionData[]): PerformanceMetrics {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(q =>
      q.userAnswer === q.correctAnswer,
    ).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const overallScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      overallScore,
      averageConfidence: 75, // Mock value
      averageTimePerQuestion: 45, // Mock value in seconds
    };
  }

  private static analyzeCategoryPerformance(questions: QuestionData[]): CategoryPerformance[] {
    const categories = [...new Set(questions.map(q => q.category || 'General'))];

    return categories.map((category) => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const correctAnswers = categoryQuestions.filter(q =>
        q.userAnswer === q.correctAnswer,
      ).length;
      const score = categoryQuestions.length > 0
        ? Math.round((correctAnswers / categoryQuestions.length) * 100)
        : 0;

      let masteryLevel: CategoryPerformance['masteryLevel'];
      if (score >= 90) {
        masteryLevel = 'Mastered';
      } else if (score >= 75) {
        masteryLevel = 'Proficient';
      } else if (score >= 60) {
        masteryLevel = 'Developing';
      } else {
        masteryLevel = 'Needs Improvement';
      }

      return {
        category,
        totalQuestions: categoryQuestions.length,
        correctAnswers,
        score,
        difficulty: this.determineCategoryDifficulty(categoryQuestions),
        masteryLevel,
      };
    });
  }

  private static determineCategoryDifficulty(questions: QuestionData[]): 'Easy' | 'Medium' | 'Hard' {
    const difficulties = questions.map(q => q.difficulty || 'Medium');
    const hardCount = difficulties.filter(d => d === 'Hard').length;
    const mediumCount = difficulties.filter(d => d === 'Medium').length;

    if (hardCount > questions.length * 0.5) {
      return 'Hard';
    }
    if (mediumCount > questions.length * 0.5) {
      return 'Medium';
    }
    return 'Easy';
  }

  private static identifyWeakAreas(categoryBreakdown: CategoryPerformance[]): WeakArea[] {
    return categoryBreakdown
      .filter(cat => cat.score < 70)
      .map(cat => ({
        category: cat.category,
        acsCode: this.getCategoryACSCode(cat.category),
        score: cat.score,
        attempts: cat.totalQuestions,
        commonMistakes: this.getCommonMistakes(cat.category),
        priority: (cat.score < 50 ? 'High' : cat.score < 65 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      }))
      .sort((a, b) => a.score - b.score);
  }

  private static getCategoryACSCode(category: string): string {
    const codeMap: Record<string, string> = {
      'Flight Planning': 'PA.I.C',
      'Airspace and Traffic Patterns': 'PA.I.B',
      'Weather': 'PA.II.A',
      'Navigation': 'PA.I.D',
      'Emergency Procedures': 'PA.IX.A',
      'Regulations': 'PA.I.A',
      'Aircraft Performance': 'PA.IV.A',
      'Aircraft Systems': 'PA.V.A',
    };
    return codeMap[category] || 'PA.I.A';
  }

  private static getCommonMistakes(category: string): string[] {
    const mistakeMap: Record<string, string[]> = {
      'Flight Planning': [
        'Fuel calculation errors',
        'Weight and balance miscalculations',
        'Performance chart misinterpretation',
      ],
      'Airspace and Traffic Patterns': [
        'Airspace classification confusion',
        'Altitude requirement errors',
        'Communication procedure mistakes',
      ],
      'Weather': [
        'METAR interpretation errors',
        'Weather minimums confusion',
        'Hazardous weather recognition',
      ],
      'Navigation': [
        'Chart reading errors',
        'Dead reckoning mistakes',
        'Radio navigation confusion',
      ],
      'Emergency Procedures': [
        'Incorrect emergency priorities',
        'Improper emergency communication',
        'Wrong emergency checklist usage',
      ],
    };
    return mistakeMap[category] || ['General knowledge gaps', 'Conceptual understanding issues'];
  }

  private static generateRecommendations(
    weakAreas: WeakArea[],
    categoryBreakdown: CategoryPerformance[],
  ): StudyRecommendation[] {
    return weakAreas.map((area, index) => ({
      category: area.category,
      acsCode: area.acsCode,
      recommendation: this.getRecommendationText(area),
      resources: this.getStudyResources(area.category),
      estimatedStudyTime: this.calculateStudyTime(area.score),
      priority: index + 1,
    }));
  }

  private static getRecommendationText(area: WeakArea): string {
    const recommendations: Record<string, string> = {
      'Flight Planning': 'Focus on fuel calculations, weight and balance, and performance charts. Practice cross-country flight planning scenarios.',
      'Airspace and Traffic Patterns': 'Review airspace classifications, altitude requirements, and communication procedures. Study sectional charts thoroughly.',
      'Weather': 'Practice reading METARs and TAFs. Study weather hazards and VFR weather minimums.',
      'Navigation': 'Practice pilotage and dead reckoning. Review chart symbols and radio navigation procedures.',
      'Emergency Procedures': 'Memorize emergency checklists and practice emergency scenarios. Focus on proper prioritization.',
      'Regulations': 'Review Part 61 and Part 91 regulations. Focus on pilot currency and aircraft requirements.',
      'Aircraft Performance': 'Study performance charts and factors affecting aircraft performance.',
      'Aircraft Systems': 'Review aircraft systems operation and limitations.',
    };
    return recommendations[area.category] || 'Review fundamental concepts and practice related questions.';
  }

  private static getStudyResources(category: string): StudyResource[] {
    const resourceMap: Record<string, StudyResource[]> = {
      'Flight Planning': [
        {
          type: 'handbook',
          title: 'Pilot\'s Handbook of Aeronautical Knowledge - Chapter 10',
          description: 'Weight and Balance calculations',
        },
        {
          type: 'practice',
          title: 'Flight Planning Practice Problems',
          description: 'Interactive fuel and performance calculations',
        },
      ],
      'Weather': [
        {
          type: 'handbook',
          title: 'Aviation Weather Handbook',
          description: 'Comprehensive weather theory and application',
        },
        {
          type: 'video',
          title: 'Weather Briefing Interpretation',
          description: 'How to read and interpret weather products',
        },
      ],
    };

    return resourceMap[category] || [
      {
        type: 'handbook',
        title: 'Pilot\'s Handbook of Aeronautical Knowledge',
        description: 'Comprehensive aviation knowledge reference',
      },
    ];
  }

  private static calculateStudyTime(score: number): number {
    if (score < 50) {
      return 120;
    } // 2 hours
    if (score < 65) {
      return 90;
    } // 1.5 hours
    return 60; // 1 hour
  }

  private static analyzeACSCodes(questions: QuestionData[]): ACSCodeAnalysis[] {
    const codes = [...new Set(questions.map(q => q.acsCode).filter(Boolean))];

    return codes.map((code) => {
      const codeQuestions = questions.filter(q => q.acsCode === code);
      const correctAnswers = codeQuestions.filter(q =>
        q.userAnswer === q.correctAnswer,
      ).length;
      const performance = codeQuestions.length > 0
        ? Math.round((correctAnswers / codeQuestions.length) * 100)
        : 0;

      let masteryLevel: ACSCodeAnalysis['masteryLevel'];
      if (performance >= 90) {
        masteryLevel = 'Mastered';
      } else if (performance >= 75) {
        masteryLevel = 'Proficient';
      } else if (performance >= 60) {
        masteryLevel = 'Developing';
      } else {
        masteryLevel = 'Needs Improvement';
      }

      return {
        code: code!,
        title: this.getACSTitle(code!),
        category: this.getACSCategory(code!),
        performance,
        attempts: codeQuestions.length,
        lastAttempt: new Date().toISOString().split('T')[0],
        trend: 'stable' as const,
        masteryLevel,
      };
    });
  }

  private static getACSTitle(code: string): string {
    const titles: Record<string, string> = {
      'PA.I.A.K1': 'Certification and Documentation',
      'PA.I.B.K1': 'Airspace and Traffic Patterns',
      'PA.I.C.K1': 'Flight Planning',
      'PA.I.D.K1': 'Navigation Systems',
      'PA.II.A.K1': 'Weather Information',
      'PA.IV.A.K1': 'Aircraft Performance',
      'PA.IX.A.K1': 'Emergency Procedures',
    };
    return titles[code] || 'General Knowledge';
  }

  private static getACSCategory(code: string): string {
    if (code.startsWith('PA.I')) {
      return 'Preflight Preparation';
    }
    if (code.startsWith('PA.II')) {
      return 'Preflight Procedures';
    }
    if (code.startsWith('PA.III')) {
      return 'Airport Operations';
    }
    if (code.startsWith('PA.IV')) {
      return 'Takeoffs and Landings';
    }
    if (code.startsWith('PA.IX')) {
      return 'Emergency Operations';
    }
    return 'General';
  }

  private static trackProgress(
    performance: PerformanceMetrics,
    categoryBreakdown: CategoryPerformance[],
  ): ProgressTracking {
    const averageScore = performance.overallScore;
    const masteredCategories = categoryBreakdown.filter(c => c.masteryLevel === 'Mastered').length;
    const totalCategories = categoryBreakdown.length;

    let currentLevel: string;
    if (averageScore >= 90) {
      currentLevel = 'Advanced';
    } else if (averageScore >= 75) {
      currentLevel = 'Intermediate';
    } else if (averageScore >= 60) {
      currentLevel = 'Developing';
    } else {
      currentLevel = 'Beginner';
    }

    const progressPercentage = Math.round((masteredCategories / totalCategories) * 100);

    return {
      currentLevel,
      progressPercentage,
      milestones: [
        {
          title: 'First Flight Assessment',
          description: 'Complete your first knowledge assessment',
          achieved: true,
          date: new Date().toISOString().split('T')[0],
        },
        {
          title: 'Intermediate Level',
          description: 'Achieve 75% average score across all categories',
          achieved: averageScore >= 75,
        },
        {
          title: 'Advanced Level',
          description: 'Achieve 90% average score across all categories',
          achieved: averageScore >= 90,
        },
      ],
      nextGoals: this.generateNextGoals(categoryBreakdown),
      strengths: categoryBreakdown
        .filter(c => c.masteryLevel === 'Mastered' || c.masteryLevel === 'Proficient')
        .map(c => c.category),
      areasForImprovement: categoryBreakdown
        .filter(c => c.masteryLevel === 'Needs Improvement' || c.masteryLevel === 'Developing')
        .map(c => c.category),
    };
  }

  private static generateNextGoals(categoryBreakdown: CategoryPerformance[]): string[] {
    const goals: string[] = [];

    const needsImprovement = categoryBreakdown.filter(c => c.masteryLevel === 'Needs Improvement');
    const developing = categoryBreakdown.filter(c => c.masteryLevel === 'Developing');

    if (needsImprovement.length > 0) {
      goals.push(`Improve ${needsImprovement[0].category} to 60% proficiency`);
    }

    if (developing.length > 0) {
      goals.push(`Advance ${developing[0].category} to 75% proficiency`);
    }

    if (goals.length === 0) {
      goals.push('Maintain proficiency across all knowledge areas');
    }

    return goals;
  }
}
