'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CircularProgress } from '@/components/mdx/ProgressIndicator';
import { Checkbox } from '@/components/ui/checkbox';

type MasteryGoal = {
  id: string;
  title: string;
  description: string;
  category: 'knowledge' | 'skill' | 'application';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  requirements: Array<{
    id: string;
    description: string;
    completed: boolean;
    type: 'lesson' | 'practice' | 'assessment';
  }>;
  timeEstimate: number; // in minutes
  prerequisiteGoals?: string[];
  rewards?: Array<{
    type: 'badge' | 'certificate' | 'unlock';
    title: string;
    description: string;
  }>;
};

type MasteryGoalsProps = {
  goals: MasteryGoal[];
  onGoalUpdate?: (goalId: string, requirementId: string, completed: boolean) => void;
};

export function MasteryGoals({ goals, onGoalUpdate }: MasteryGoalsProps) {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  
  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleRequirementToggle = (goalId: string, requirementId: string, completed: boolean) => {
    if (onGoalUpdate) {
      onGoalUpdate(goalId, requirementId, completed);
    }
  };

  // Calculate overall mastery progress
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => 
    goal.requirements.every(req => req.completed)
  ).length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">🎯</span>
                Mastery Goals
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Track your learning objectives and skill development
              </p>
            </div>
            <CircularProgress 
              percentage={overallProgress} 
              size={80} 
              strokeWidth={6}
              variant={overallProgress === 100 ? 'success' : 'default'}
            />
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{completedGoals}/{totalGoals} goals completed</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <MasteryGoalCard
            key={goal.id}
            goal={goal}
            isExpanded={expandedGoals.has(goal.id)}
            onToggleExpansion={() => toggleGoalExpansion(goal.id)}
            onRequirementToggle={(reqId, completed) => 
              handleRequirementToggle(goal.id, reqId, completed)
            }
          />
        ))}
      </div>
    </div>
  );
}

function MasteryGoalCard({
  goal,
  isExpanded,
  onToggleExpansion,
  onRequirementToggle
}: {
  goal: MasteryGoal;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRequirementToggle: (requirementId: string, completed: boolean) => void;
}) {
  const completedRequirements = goal.requirements.filter(req => req.completed).length;
  const progressPercentage = (completedRequirements / goal.requirements.length) * 100;
  const isCompleted = completedRequirements === goal.requirements.length;
  
  const categoryColors = {
    knowledge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
    skill: 'bg-green-100 text-green-800 dark:bg-green-900/30',
    application: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30'
  };

  const difficultyColors = {
    basic: 'border-green-300 text-green-700',
    intermediate: 'border-amber-300 text-amber-700',
    advanced: 'border-red-300 text-red-700'
  };

  return (
    <Card className={`transition-all ${isCompleted ? 'border-green-300 bg-green-50/30 dark:bg-green-950/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Completion Indicator */}
            <div className="mt-1">
              {isCompleted ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : (
                <CircularProgress 
                  percentage={progressPercentage} 
                  size={24} 
                  strokeWidth={2}
                  variant="default"
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className={`text-lg ${isCompleted ? 'text-green-800 dark:text-green-200' : ''}`}>
                  {goal.title}
                </CardTitle>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Mastered
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {goal.description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className={categoryColors[goal.category]}>
                  {goal.category}
                </Badge>
                <Badge variant="outline" className={`text-xs ${difficultyColors[goal.difficulty]}`}>
                  {goal.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ⏱️ {goal.timeEstimate} min
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedRequirements}/{goal.requirements.length} requirements</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpansion}
            className="ml-2"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Requirements List */}
          <div>
            <h4 className="font-medium mb-3">Requirements</h4>
            <div className="space-y-2">
              {goal.requirements.map((requirement) => (
                <RequirementItem
                  key={requirement.id}
                  requirement={requirement}
                  onToggle={(completed) => onRequirementToggle(requirement.id, completed)}
                />
              ))}
            </div>
          </div>

          {/* Rewards */}
          {goal.rewards && goal.rewards.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goal.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {reward.type === 'badge' ? '🏆' : reward.type === 'certificate' ? '📜' : '🔓'}
                      </span>
                      <div>
                        <div className={`font-medium text-sm ${
                          isCompleted ? 'text-green-800 dark:text-green-200' : ''
                        }`}>
                          {reward.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reward.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {goal.prerequisiteGoals && goal.prerequisiteGoals.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Prerequisites</h4>
              <div className="text-sm text-muted-foreground">
                Complete these goals first: {goal.prerequisiteGoals.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function RequirementItem({
  requirement,
  onToggle
}: {
  requirement: MasteryGoal['requirements'][0];
  onToggle: (completed: boolean) => void;
}) {
  const typeIcons = {
    lesson: '📖',
    practice: '🎯',
    assessment: '✅'
  };

  const typeColors = {
    lesson: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
    practice: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30',
    assessment: 'bg-green-100 text-green-800 dark:bg-green-900/30'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      requirement.completed 
        ? 'bg-green-50 border border-green-200 dark:bg-green-950/20' 
        : 'bg-muted/30 hover:bg-muted/50'
    }`}>
      <Checkbox
        checked={requirement.completed}
        onCheckedChange={(checked) => onToggle(!!checked)}
      />
      
      <span className="text-lg">{typeIcons[requirement.type]}</span>
      
      <div className="flex-1">
        <div className={`text-sm font-medium ${
          requirement.completed ? 'line-through text-muted-foreground' : ''
        }`}>
          {requirement.description}
        </div>
      </div>
      
      <Badge variant="secondary" className={`${typeColors[requirement.type]} text-xs`}>
        {requirement.type}
      </Badge>
    </div>
  );
}