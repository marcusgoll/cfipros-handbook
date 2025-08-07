'use client';

import {
  BarChart3,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Target,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ProgressChecklistProps = {
  locale: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  points: number;
};

export function ProgressChecklist({ locale }: ProgressChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Add your aviation background and learning goals',
      icon: User,
      completed: false,
      action: {
        text: 'Complete Profile',
        href: `/${locale}/dashboard/user-profile`,
      },
      points: 10,
    },
    {
      id: 'first-lesson',
      title: 'Start Your First Lesson',
      description: 'Begin with Private Pilot fundamentals',
      icon: BookOpen,
      completed: false,
      action: {
        text: 'Start Learning',
        href: `/${locale}/handbook/private-pilot`,
      },
      points: 25,
    },
    {
      id: 'bookmark-lesson',
      title: 'Bookmark Important Content',
      description: 'Save lessons for quick reference later',
      icon: Bookmark,
      completed: false,
      action: {
        text: 'Learn How',
        href: `/${locale}/handbook/private-pilot`,
      },
      points: 5,
    },
    {
      id: 'download-resource',
      title: 'Download Free Resources',
      description: 'Get helpful checklists and reference materials',
      icon: Download,
      completed: false,
      action: {
        text: 'Browse Resources',
        href: `/${locale}/resources`,
      },
      points: 15,
    },
    {
      id: 'upload-test-results',
      title: 'Upload Knowledge Test Results',
      description: 'Get personalized study recommendations',
      icon: BarChart3,
      completed: false,
      action: {
        text: 'Upload Results',
        href: `/${locale}/dashboard/acs-extractor`,
      },
      points: 20,
    },
    {
      id: 'set-goals',
      title: 'Set Learning Goals',
      description: 'Define your aviation training objectives',
      icon: Target,
      completed: false,
      action: {
        text: 'Set Goals',
        onClick: () => {
          // TODO: Implement goals modal
        },
      },
      points: 10,
    },
  ]);

  const completedItems = checklistItems.filter(item => item.completed);
  const totalPoints = checklistItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = (earnedPoints / totalPoints) * 100;

  const handleItemComplete = (itemId: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, completed: true } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Your Learning Journey</CardTitle>
            <Badge variant="outline" className="text-sm">
              {completedItems.length}
              {' '}
              /
              {checklistItems.length}
              {' '}
              Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}
                %
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {earnedPoints}
                {' '}
                /
                {totalPoints}
                {' '}
                points earned
              </p>
              {progressPercentage === 100 && (
                <Badge className="mt-2">
                  🎉 Onboarding Complete!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <Card
            key={item.id}
            className={`transition-all duration-200 ${
              item.completed
                ? 'bg-green-50 border-green-200'
                : 'hover:shadow-md cursor-pointer'
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-muted-foreground/30 bg-background'
                }`}
                >
                  {item.completed
                    ? (
                        <Check className="h-4 w-4" />
                      )
                    : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className={`h-4 w-4 ${
                          item.completed ? 'text-green-600' : 'text-primary'
                        }`}
                        />
                        <h3 className={`font-medium ${
                          item.completed ? 'text-green-800 line-through' : 'text-foreground'
                        }`}
                        >
                          {item.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          +
                          {item.points}
                          {' '}
                          pts
                        </Badge>
                      </div>
                      <p className={`text-sm ${
                        item.completed ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    {!item.completed && item.action && (
                      <div className="flex-shrink-0">
                        {item.action.href
                          ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                onClick={() => handleItemComplete(item.id)}
                              >
                                <Link href={item.action.href} className="flex items-center gap-1">
                                  {item.action.text}
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </Button>
                            )
                          : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  item.action?.onClick?.();
                                  handleItemComplete(item.id);
                                }}
                                className="flex items-center gap-1"
                              >
                                {item.action.text}
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            )}
                      </div>
                    )}

                    {item.completed && (
                      <Badge variant="secondary" className="text-green-600">
                        ✓ Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Rewards */}
      {progressPercentage >= 50 && progressPercentage < 100 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-foreground mb-1">Great Progress!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You're halfway through your onboarding. Keep going to unlock all features!
              </p>
              <div className="text-xs text-primary font-medium">
                Complete
                {' '}
                {checklistItems.length - completedItems.length}
                {' '}
                more steps to finish
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {progressPercentage === 100 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-green-700 mb-4">
                You've completed your onboarding and earned
                {' '}
                {totalPoints}
                {' '}
                points!
                You're ready to make the most of CFI Interactive.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href={`/${locale}/handbook/private-pilot`}>
                  Continue Learning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
