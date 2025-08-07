'use client';

import type { PageFeedbackSubmission } from '@/types/page-feedback';
import {
  ArrowRight,
  Award,
  CheckCircle,
  ChevronRight,
  MessageSquare,
  Navigation,
  RotateCcw,
  Target,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitPageFeedback } from '@/lib/feedback-api';
import { cn } from '@/lib/utils';

// Enhanced feedback data structure
type FeedbackData = {
  type: FeedbackType;
  emoji?: EmojiFeedback;
  comment?: string;
  helpful?: boolean;
  difficulty?: 'too-easy' | 'just-right' | 'too-hard';
  completionTime?: number;
  timestamp: string;
  pageId: string;
};

type FeedbackType = 'positive' | 'negative' | 'detailed' | null;
type EmojiFeedback = 'confused' | 'ready' | 'perfect' | 'needs-work';

type PageFeedbackProps = {
  pageId: string;
  variant?: 'default' | 'minimal' | 'expanded';
  className?: string;
  showProgressSuggestions?: boolean;
  showDetailedFeedback?: boolean;
};

type FeedbackState = 'idle' | 'selecting' | 'submitting' | 'thanking' | 'detailed';

// Aviation-themed emoji feedback options
const emojiOptions = [
  { id: 'confused' as const, emoji: '🤔', label: 'Needs clarification', description: 'This topic could use more explanation' },
  { id: 'ready' as const, emoji: '✈️', label: 'Ready to fly', description: 'Clear and ready for next step' },
  { id: 'perfect' as const, emoji: '🎯', label: 'Nailed the landing', description: 'Perfect explanation!' },
  { id: 'needs-work' as const, emoji: '🛠️', label: 'Needs maintenance', description: 'Could be improved' },
];

export function PageFeedback({
  pageId,
  variant = 'default',
  className,
  showProgressSuggestions = false,
  showDetailedFeedback = false,
}: PageFeedbackProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [state, setState] = useState<FeedbackState>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingDetailed, setIsSubmittingDetailed] = useState(false);
  const [comment, setComment] = useState('');
  const [difficulty, setDifficulty] = useState<'too-easy' | 'just-right' | 'too-hard' | undefined>(undefined);
  const [pageLoadTime] = useState<number>(Date.now());

  useEffect(() => {
    // Load existing feedback for this page
    const stored = localStorage.getItem(`page-feedback-${pageId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored) as FeedbackData;
        setFeedbackData(data);
        if (data.type) {
          setState('thanking');
        }
      } catch {
        // Invalid data, ignore
      }
    }
    setIsLoading(false);
  }, [pageId]);

  const saveFeedback = useCallback(async (data: Partial<FeedbackData>) => {
    const newFeedbackData: FeedbackData = {
      ...feedbackData,
      ...data,
      timestamp: new Date().toISOString(),
      pageId,
    } as FeedbackData;

    // Save to localStorage for immediate UI feedback
    setFeedbackData(newFeedbackData);
    localStorage.setItem(`page-feedback-${pageId}`, JSON.stringify(newFeedbackData));

    // Calculate completion time
    const completionTime = Math.round((Date.now() - pageLoadTime) / 1000);

    // Submit to database
    try {
      const submission: PageFeedbackSubmission = {
        pageId,
        feedbackType: newFeedbackData.type as 'positive' | 'negative' | 'detailed',
        helpful: newFeedbackData.helpful,
        emoji: newFeedbackData.emoji,
        comment: newFeedbackData.comment,
        difficulty: newFeedbackData.difficulty,
        completionTime,
      };

      const result = await submitPageFeedback(submission);
      if (!result.success) {
        console.warn('Failed to submit feedback to database:', result.error);
      }
    } catch (error) {
      console.warn('Error submitting feedback to database:', error);
    }

    return newFeedbackData;
  }, [feedbackData, pageId, pageLoadTime]);

  const clearFeedback = () => {
    setFeedbackData(null);
    setState('idle');
    setComment('');
    setDifficulty(undefined);
    localStorage.removeItem(`page-feedback-${pageId}`);
  };

  const handleQuickFeedback = async (type: 'positive' | 'negative') => {
    if (feedbackData?.type === type) {
      // Toggle off
      clearFeedback();
      return;
    }

    setState('submitting');

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief loading state
      const data = await saveFeedback({
        type,
        helpful: type === 'positive',
      });
      setState('thanking');

      // Auto-hide thanks after 4 seconds
      setTimeout(() => {
        if (feedbackData?.type === data.type) {
          setState('idle');
        }
      }, 4000);
    } catch (error) {
      console.error('Error handling feedback:', error);
      setState('idle');
    }
  };

  const handleEmojiReaction = async (emoji: EmojiFeedback) => {
    setState('submitting');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await saveFeedback({
        type: emoji === 'confused' || emoji === 'needs-work' ? 'negative' : 'positive',
        emoji,
        helpful: emoji === 'ready' || emoji === 'perfect',
      });
      setState('thanking');

      setTimeout(() => {
        setState('idle');
      }, 4000);
    } catch (error) {
      console.error('Error handling emoji reaction:', error);
      setState('idle');
    }
  };

  const handleDetailedSubmit = async () => {
    setIsSubmittingDetailed(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await saveFeedback({
        type: 'detailed',
        comment: comment.trim(),
        difficulty,
        helpful: difficulty === 'just-right',
      });
      setState('thanking');
      setComment('');
      setDifficulty(undefined);

      setTimeout(() => {
        setState('idle');
      }, 5000);
    } catch (error) {
      console.error('Error handling detailed submit:', error);
      setState('idle');
    } finally {
      setIsSubmittingDetailed(false);
    }
  };

  const getProgressSuggestion = () => {
    if (!feedbackData || !showProgressSuggestions) {
      return null;
    }

    const isPositive = feedbackData.helpful || feedbackData.type === 'positive';

    if (isPositive) {
      return (
        <div className="flex gap-2 mt-4 justify-center">
          <Button variant="default" size="sm">
            <ArrowRight className="w-4 h-4 mr-1" />
            Continue Learning
          </Button>
          <Button variant="secondary" size="sm">
            <Target className="w-4 h-4 mr-1" />
            Practice Quiz
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" size="sm">
            <Navigation className="w-4 h-4 mr-1" />
            Review Basics
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            Get Help
          </Button>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded-md"></div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-3 p-3 text-center', className)} data-testid="page-feedback">
        {state === 'thanking' && feedbackData
          ? (
              <div className="flex flex-col items-center gap-2 text-sm text-primary">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Thanks for the feedback!</span>
                  {feedbackData.emoji && (
                    <span className="text-lg">{emojiOptions.find(e => e.id === feedbackData.emoji)?.emoji}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFeedback}
                  className="h-6 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </div>
            )
          : (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Helpful?
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickFeedback('positive')}
                    disabled={state === 'submitting'}
                    className={cn(
                      'h-8 w-8 p-0 transition-colors',
                      feedbackData?.helpful === true && 'bg-green-100 text-green-700 hover:bg-green-100',
                    )}
                    aria-label="This page was helpful"
                  >
                    {state === 'submitting' && feedbackData?.helpful === true
                      ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )
                      : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickFeedback('negative')}
                    disabled={state === 'submitting'}
                    className={cn(
                      'h-8 w-8 p-0 transition-colors',
                      feedbackData?.helpful === false && 'bg-red-100 text-red-700 hover:bg-red-100',
                    )}
                    aria-label="This page was not helpful"
                  >
                    {state === 'submitting' && feedbackData?.helpful === false
                      ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        )
                      : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                  </Button>
                </div>
              </>
            )}
      </div>
    );
  }

  // Expanded variant
  if (variant === 'expanded') {
    return (
      <Card className={cn('border bg-background', className)} data-testid="page-feedback">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Flight Debrief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {state === 'thanking' && feedbackData ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Award className="h-6 w-6" />
                <span className="text-lg font-semibold">Mission Complete!</span>
              </div>

              <div className="space-y-3">
                {feedbackData.emoji && (
                  <div className="text-3xl">
                    {emojiOptions.find(e => e.id === feedbackData.emoji)?.emoji}
                  </div>
                )}
                <p className="text-muted-foreground text-sm">
                  {feedbackData.helpful
                    ? 'Thanks for confirming this content helped with your flight training!'
                    : 'We\'ll improve this lesson based on your feedback.'}
                </p>
              </div>

              {getProgressSuggestion()}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFeedback}
                className="text-xs mt-4"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Update feedback
              </Button>
            </div>
          ) : state === 'detailed' ? (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Detailed Feedback
              </h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">How was the difficulty level?</Label>
                  <div className="flex justify-center gap-2 mt-2">
                    {[
                      { value: 'too-easy', label: 'Too Easy', icon: '😴' },
                      { value: 'just-right', label: 'Just Right', icon: '🎯' },
                      { value: 'too-hard', label: 'Too Hard', icon: '😓' },
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={difficulty === option.value ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setDifficulty(option.value as any)}
                        className={cn(
                          'flex items-center gap-2',
                          difficulty === option.value && 'bg-secondary/80 border-secondary',
                        )}
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment" className="text-sm">Additional comments (optional)</Label>
                  <Input
                    id="comment"
                    value={comment}
                    onChange={e => setComment(e.target.value.slice(0, 500))}
                    placeholder="What would make this lesson better?"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.length}
                    /500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={handleDetailedSubmit}
                  disabled={isSubmittingDetailed}
                >
                  {!isSubmittingDetailed && <Target className="w-4 h-4 mr-1" />}
                  {isSubmittingDetailed ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setState('idle')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Emoji Reactions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-center">Quick reaction</h4>
                <div className="grid grid-cols-2 gap-2">
                  {emojiOptions.map(option => (
                    <Button
                      key={option.id}
                      variant={feedbackData?.emoji === option.id ? 'secondary' : 'outline'}
                      onClick={() => handleEmojiReaction(option.id)}
                      disabled={state === 'submitting'}
                      className={cn(
                        'flex items-center gap-2 justify-start p-3 h-auto transition-colors',
                        feedbackData?.emoji === option.id && 'bg-secondary/80 border-secondary',
                      )}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setState('detailed')}
                  className="text-sm"
                >
                  Give detailed feedback
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant (enhanced)
  return (
    <Card className={cn('border bg-background', className)} data-testid="page-feedback">
      <CardContent className="p-5">
        {state === 'thanking' && feedbackData ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Thanks for your feedback!</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {feedbackData.emoji && (
                <span className="text-2xl">
                  {emojiOptions.find(e => e.id === feedbackData.emoji)?.emoji}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {feedbackData.helpful
                ? 'Glad this helped with your aviation training!'
                : 'We\'ll work on improving this content.'}
            </p>

            {getProgressSuggestion()}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFeedback}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Change feedback
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium flex items-center justify-center gap-2 mb-3">
                <Navigation className="h-4 w-4 text-primary" />
                How was this lesson?
              </h3>
            </div>

            {/* Thumbs Only */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickFeedback('positive')}
                disabled={state === 'submitting'}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  feedbackData?.helpful === true && 'bg-green-50 border-green-500 text-green-700',
                )}
                aria-label="This page was helpful"
              >
                {state === 'submitting' && feedbackData?.helpful === true
                  ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    )
                  : (
                      <ThumbsUp className="h-4 w-4 sm:inline mr-2" />
                    )}
                <span className="hidden sm:inline">Helpful</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickFeedback('negative')}
                disabled={state === 'submitting'}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  feedbackData?.helpful === false && 'bg-red-50 border-red-500 text-red-700',
                )}
                aria-label="This page was not helpful"
              >
                {state === 'submitting' && feedbackData?.helpful === false
                  ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    )
                  : (
                      <ThumbsDown className="h-4 w-4 sm:inline mr-2" />
                    )}
                <span className="hidden sm:inline">Not helpful</span>
              </Button>
            </div>

            {showDetailedFeedback && (
              <div className="text-center pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState('detailed')}
                  className="text-xs"
                >
                  Detailed feedback
                  <MessageSquare className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Your feedback helps improve our aviation training content
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
