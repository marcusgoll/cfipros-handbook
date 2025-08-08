'use client';

import type {
  LessonProgress,
  LessonStatus,
  SectionProgress,
  StudyRecommendation,
} from '@/types/progress';

// Local storage keys
const STORAGE_KEYS = {
  LESSON_PROGRESS: 'cfi_handbook_lesson_progress',
  SECTION_PROGRESS: 'cfi_handbook_section_progress',
  COURSE_PROGRESS: 'cfi_handbook_course_progress',
  STUDY_SESSIONS: 'cfi_handbook_study_sessions',
  LEARNING_GOALS: 'cfi_handbook_learning_goals',
  PREFERENCES: 'cfi_handbook_preferences',
} as const;

// Storage helpers
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to parse storage item ${key}:`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to store item ${key}:`, error);
  }
}

// Lesson Progress Management
export class LessonProgressManager {
  private lessons: Map<string, LessonProgress> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = getStorageItem<Record<string, LessonProgress>>(
      STORAGE_KEYS.LESSON_PROGRESS,
      {},
    );

    Object.entries(stored).forEach(([lessonId, progress]) => {
      this.lessons.set(lessonId, {
        ...progress,
        startedAt: progress.startedAt ? new Date(progress.startedAt) : undefined,
        completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
      });
    });
  }

  private saveToStorage(): void {
    const data: Record<string, LessonProgress> = {};
    this.lessons.forEach((progress, lessonId) => {
      data[lessonId] = progress;
    });
    setStorageItem(STORAGE_KEYS.LESSON_PROGRESS, data);
  }

  startLesson(lessonId: string): void {
    const existing = this.lessons.get(lessonId);
    const progress: LessonProgress = {
      ...existing,
      lessonId,
      status: 'in_progress',
      startedAt: existing?.startedAt || new Date(),
      bookmarked: existing?.bookmarked || false,
    };

    this.lessons.set(lessonId, progress);
    this.saveToStorage();
  }

  completeLesson(lessonId: string): void {
    const existing = this.lessons.get(lessonId);
    if (!existing) {
      this.startLesson(lessonId);
    }

    const progress: LessonProgress = {
      ...existing,
      lessonId,
      status: 'completed',
      completedAt: new Date(),
      startedAt: existing?.startedAt || new Date(),
      bookmarked: existing?.bookmarked || false,
    };

    this.lessons.set(lessonId, progress);
    this.saveToStorage();
  }

  updateTimeSpent(lessonId: string, additionalMinutes: number): void {
    const existing = this.lessons.get(lessonId);
    if (existing) {
      existing.timeSpent = (existing.timeSpent || 0) + additionalMinutes;
      this.lessons.set(lessonId, existing);
      this.saveToStorage();
    }
  }

  toggleBookmark(lessonId: string): boolean {
    const existing = this.lessons.get(lessonId) || {
      lessonId,
      status: 'not_started' as LessonStatus,
      bookmarked: false,
    };

    existing.bookmarked = !existing.bookmarked;
    this.lessons.set(lessonId, existing);
    this.saveToStorage();

    return existing.bookmarked;
  }

  addNote(lessonId: string, note: string): void {
    const existing = this.lessons.get(lessonId) || {
      lessonId,
      status: 'not_started' as LessonStatus,
      bookmarked: false,
    };

    existing.notes = note;
    this.lessons.set(lessonId, existing);
    this.saveToStorage();
  }

  updateKnowledgeCheck(lessonId: string, passed: number, total: number): void {
    const existing = this.lessons.get(lessonId);
    if (existing) {
      existing.knowledgeChecksPassed = passed;
      existing.knowledgeChecksTotal = total;
      this.lessons.set(lessonId, existing);
      this.saveToStorage();
    }
  }

  getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this.lessons.get(lessonId);
  }

  getAllProgress(): LessonProgress[] {
    return Array.from(this.lessons.values());
  }

  getBookmarkedLessons(): LessonProgress[] {
    return this.getAllProgress().filter(lesson => lesson.bookmarked);
  }

  getCompletedLessons(): LessonProgress[] {
    return this.getAllProgress().filter(lesson => lesson.status === 'completed');
  }

  getInProgressLessons(): LessonProgress[] {
    return this.getAllProgress().filter(lesson => lesson.status === 'in_progress');
  }
}

// Section Progress Management
export class SectionProgressManager {
  private sections: Map<string, SectionProgress> = new Map();
  private lessonManager: LessonProgressManager;

  constructor(lessonManager: LessonProgressManager) {
    this.lessonManager = lessonManager;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = getStorageItem<Record<string, SectionProgress>>(
      STORAGE_KEYS.SECTION_PROGRESS,
      {},
    );

    Object.entries(stored).forEach(([sectionId, progress]) => {
      this.sections.set(sectionId, progress);
    });
  }

  private saveToStorage(): void {
    const data: Record<string, SectionProgress> = {};
    this.sections.forEach((progress, sectionId) => {
      data[sectionId] = progress;
    });
    setStorageItem(STORAGE_KEYS.SECTION_PROGRESS, data);
  }

  calculateSectionProgress(sectionId: string, lessonIds: string[]): SectionProgress {
    const lessonProgresses = lessonIds.map(id => this.lessonManager.getLessonProgress(id));
    const completedLessons = lessonProgresses.filter(p => p?.status === 'completed').length;

    // Find the most recent lesson accessed
    const lastAccessedLesson = lessonProgresses
      .filter(p => p && (p.startedAt || p.completedAt))
      .sort((a, b) => {
        const aDate = a!.completedAt || a!.startedAt!;
        const bDate = b!.completedAt || b!.startedAt!;
        return bDate.getTime() - aDate.getTime();
      })[0]
      ?.lessonId;

    // Calculate estimated time remaining
    const avgTimePerLesson = 30; // minutes
    const remainingLessons = lessonIds.length - completedLessons;
    const estimatedTimeRemaining = remainingLessons * avgTimePerLesson;

    // Determine mastery level
    const completionPercentage = (completedLessons / lessonIds.length) * 100;
    let masteryLevel: SectionProgress['masteryLevel'] = 'beginner';
    if (completionPercentage >= 90) {
      masteryLevel = 'mastery';
    } else if (completionPercentage >= 70) {
      masteryLevel = 'advanced';
    } else if (completionPercentage >= 40) {
      masteryLevel = 'intermediate';
    }

    const sectionTitle = this.getSectionTitle(sectionId);

    const progress: SectionProgress = {
      sectionId,
      title: sectionTitle,
      lessonsCompleted: completedLessons,
      lessonsTotal: lessonIds.length,
      completionPercentage,
      estimatedTimeRemaining,
      lastAccessedLesson,
      masteryLevel,
    };

    this.sections.set(sectionId, progress);
    this.saveToStorage();

    return progress;
  }

  private getSectionTitle(sectionId: string): string {
    const titleMap: Record<string, string> = {
      'aircraft-systems': 'Aircraft Systems',
      'principles-of-flight': 'Principles of Flight',
      'flight-instruments': 'Flight Instruments',
      'flight-operations': 'Flight Operations',
      'weather': 'Weather',
      'navigation': 'Navigation',
      'regulations': 'Regulations',
      'airspace': 'Airspace',
      'communications': 'Communications',
      'performance': 'Performance',
      'flight-planning': 'Flight Planning',
      'emergency-procedures': 'Emergency Procedures',
      'practical-test': 'Practical Test',
    };

    return titleMap[sectionId] || sectionId;
  }

  getSectionProgress(sectionId: string): SectionProgress | undefined {
    return this.sections.get(sectionId);
  }

  getAllSectionProgress(): SectionProgress[] {
    return Array.from(this.sections.values());
  }
}

// Study Recommendations
export function generateStudyRecommendations(
  lessonManager: LessonProgressManager,
  _sectionManager: SectionProgressManager,
): StudyRecommendation[] {
  const inProgress = lessonManager.getInProgressLessons();
  const completed = lessonManager.getCompletedLessons();
  const recommendations: StudyRecommendation[] = [];

  // Continue in-progress lessons
  inProgress.forEach((lesson) => {
    recommendations.push({
      type: 'continue',
      lessonId: lesson.lessonId,
      title: `Continue: ${lesson.lessonId}`, // Would be actual title in real app
      reason: 'You started this lesson but haven\'t finished it yet.',
      estimatedTime: 15,
      priority: 9,
      category: 'In Progress',
    });
  });

  // Review recently completed lessons
  const recentlyCompleted = completed
    .filter((lesson) => {
      if (!lesson.completedAt) {
        return false;
      }
      const daysSince = (Date.now() - lesson.completedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 7 && daysSince <= 14; // Completed 1-2 weeks ago
    })
    .slice(0, 2);

  recentlyCompleted.forEach((lesson) => {
    recommendations.push({
      type: 'review',
      lessonId: lesson.lessonId,
      title: `Review: ${lesson.lessonId}`,
      reason: 'Review this lesson to strengthen your understanding.',
      estimatedTime: 10,
      priority: 6,
      category: 'Review',
    });
  });

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

// Singleton instances
let lessonManagerInstance: LessonProgressManager | null = null;
let sectionManagerInstance: SectionProgressManager | null = null;

export function getLessonProgressManager(): LessonProgressManager {
  if (!lessonManagerInstance) {
    lessonManagerInstance = new LessonProgressManager();
  }
  return lessonManagerInstance;
}

export function getSectionProgressManager(): SectionProgressManager {
  if (!sectionManagerInstance) {
    sectionManagerInstance = new SectionProgressManager(getLessonProgressManager());
  }
  return sectionManagerInstance;
}

// React hook for lesson progress
export function useLessonProgress(lessonId: string) {
  const manager = getLessonProgressManager();
  const progress = manager.getLessonProgress(lessonId);

  return {
    progress,
    startLesson: () => manager.startLesson(lessonId),
    completeLesson: () => manager.completeLesson(lessonId),
    toggleBookmark: () => manager.toggleBookmark(lessonId),
    addNote: (note: string) => manager.addNote(lessonId, note),
    updateTimeSpent: (minutes: number) => manager.updateTimeSpent(lessonId, minutes),
    updateKnowledgeCheck: (passed: number, total: number) =>
      manager.updateKnowledgeCheck(lessonId, passed, total),
  };
}

// React hook for section progress
export function useSectionProgress(sectionId: string, lessonIds: string[]) {
  const manager = getSectionProgressManager();
  const progress = manager.calculateSectionProgress(sectionId, lessonIds);

  return { progress };
}
