export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export type LessonProgress = {
  lessonId: string;
  status: LessonStatus;
  completedAt?: Date;
  startedAt?: Date;
  timeSpent?: number; // in minutes
  bookmarked: boolean;
  notes?: string;
  knowledgeChecksPassed?: number;
  knowledgeChecksTotal?: number;
};

export type SectionProgress = {
  sectionId: string;
  title: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  completionPercentage: number;
  estimatedTimeRemaining?: number; // in minutes
  lastAccessedLesson?: string;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastery';
};

export type CourseProgress = {
  courseId: string;
  title: string;
  sectionsCompleted: number;
  sectionsTotal: number;
  completionPercentage: number;
  totalTimeSpent: number;
  currentStreak: number; // days
  longestStreak: number;
  startedAt: Date;
  lastAccessedAt: Date;
  estimatedCompletionDate?: Date;
};

export type StudySession = {
  sessionId: string;
  lessonId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activitiesCompleted: string[];
  knowledgeChecksAttempted: number;
  knowledgeChecksPassed: number;
};

export type LearningGoal = {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  priority: 'high' | 'medium' | 'low';
  relatedLessons: string[];
  completed: boolean;
  completedAt?: Date;
};

export type StudyRecommendation = {
  type: 'continue' | 'review' | 'practice' | 'next';
  lessonId: string;
  title: string;
  reason: string;
  estimatedTime: number;
  priority: number; // 1-10
  category: string;
};
