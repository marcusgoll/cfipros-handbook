"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// Simplified for MVP - removed complex progress tracking
import { CircularProgress } from "./ProgressIndicator";

type LessonLayoutProps = {
  children: React.ReactNode;
  metadata: {
    title: string;
    description: string;
    duration: string;
    category: string;
    order: number;
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedTime?: number;
    objectives?: string[];
    prerequisites?: string[];
  };
  locale: string;
  categoryTitle: string;
  unitId: string;
  lessonId: string;
  nextLesson?: {
    id: string;
    title: string;
  };
  previousLesson?: {
    id: string;
    title: string;
  };
  enableContextLinking?: boolean;
};

export function LessonLayout({
  children,
  metadata,
  locale,
  categoryTitle,
  unitId,
  lessonId,
  nextLesson,
  previousLesson,
  enableContextLinking: _ = true,
}: LessonLayoutProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);

  // Simplified progress tracking for MVP
  const progress = null;
  const startLesson = () => {};
  const completeLesson = () => {};
  const toggleBookmark = () => false;
  const updateTimeSpent = () => {};

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setReadingProgress(progress * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Start lesson on mount (simplified for MVP)
  useEffect(() => {
    // Basic lesson tracking
  }, [lessonId]);

  // Track time spent (simplified for MVP)
  useEffect(() => {
    // Basic time tracking would go here
  }, []);

  const handleBookmarkToggle = () => {
    const newBookmarked = toggleBookmark();
    setIsBookmarked(newBookmarked);
  };

  const handleCompleteLesson = () => {
    completeLesson();
    if (nextLesson) {
      // Auto-navigate to next lesson or show completion
    }
  };

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900/30",
    intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900/30",
  };

  return (
    <div
      className={`max-w-4xl mx-auto space-y-6 ${showFocusMode ? "focus-mode" : ""}`}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Focus Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFocusMode(!showFocusMode)}
          className="bg-background/80 backdrop-blur"
        >
          {showFocusMode ? "👁️ Normal" : "🎯 Focus"}
        </Button>
      </div>

      {!showFocusMode && (
        <>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/${locale}/handbook/private-pilot`}
              className="hover:text-foreground"
            >
              Private Pilot
            </Link>
            <span>›</span>
            <Link
              href={`/${locale}/handbook/private-pilot/${unitId}`}
              className="hover:text-foreground"
            >
              {categoryTitle}
            </Link>
            <span>›</span>
            <span>{metadata.title}</span>
          </div>

          {/* Lesson Header - Teachable Style */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{metadata.category}</Badge>
                    {metadata.difficulty && (
                      <Badge
                        variant="secondary"
                        className={difficultyColors[metadata.difficulty]}
                      >
                        {metadata.difficulty}
                      </Badge>
                    )}
                    <Badge variant="outline">⏱️ {metadata.duration}</Badge>
                  </div>

                  <CardTitle className="text-2xl font-bold mb-2">
                    {metadata.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {metadata.description}
                  </p>

                  {/* Learning Objectives */}
                  {metadata.objectives && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">What you'll learn:</h3>
                      <ul className="text-sm space-y-1">
                        {metadata.objectives.map((objective, objIndex) => (
                          <li
                            key={`objective-${objIndex}`}
                            className="flex items-center gap-2"
                          >
                            <span className="text-green-600">✓</span>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Progress Ring */}
                <div className="flex flex-col items-center gap-2 ml-6">
                  <CircularProgress
                    percentage={readingProgress}
                    size={60}
                    strokeWidth={4}
                    variant={
                      progress?.status === "completed" ? "success" : "default"
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Progress
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className={isBookmarked ? "bg-amber-50 border-amber-200" : ""}
                >
                  {isBookmarked ? "📑" : "🔖"}
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>

                {readingProgress > 80 && progress?.status !== "completed" && (
                  <Button
                    size="sm"
                    onClick={handleCompleteLesson}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✓ Mark Complete
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </>
      )}

      {/* MDX Content - Khan Academy Style */}
      <div className="prose prose-slate max-w-none">
        <Card className={showFocusMode ? "border-0 shadow-none" : ""}>
          <CardContent className={`p-8 ${showFocusMode ? "p-4" : ""}`}>
            {children}
          </CardContent>
        </Card>
      </div>

      {!showFocusMode && (
        <>
          {/* Lesson Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {previousLesson ? (
                    <Button asChild variant="outline">
                      <Link
                        href={`/${locale}/handbook/private-pilot/${unitId}/${previousLesson.id}`}
                      >
                        ← {previousLesson.title}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link
                        href={`/${locale}/handbook/private-pilot/${unitId}`}
                      >
                        ← Back to {categoryTitle}
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    Lesson Progress
                  </div>
                  <Progress value={readingProgress} className="w-32 h-2" />
                </div>

                <div className="flex items-center gap-4">
                  {nextLesson && (
                    <Button asChild>
                      <Link
                        href={`/${locale}/handbook/private-pilot/${unitId}/${nextLesson.id}`}
                      >
                        {nextLesson.title} →
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Recommendations */}
          {progress?.status === "completed" && (
            <Card className="bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-2xl">🎉</span>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Lesson Complete!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Great job! You've mastered this topic.
                    </p>
                  </div>
                </div>

                {nextLesson && (
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <Link
                        href={`/${locale}/handbook/private-pilot/${unitId}/${nextLesson.id}`}
                      >
                        Continue to: {nextLesson.title} →
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
