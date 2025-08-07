'use client';

import {
  AlertCircle,
  Award,
  CheckCircle,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Analytics = {
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  knowledgeAreas: {
    area: string;
    score: number;
    performance: 'excellent' | 'proficient' | 'needs-improvement' | 'unsatisfactory';
  }[];
};

type AnalyticsDashboardProps = {
  analytics: Analytics;
  className?: string;
};

export function AnalyticsDashboard({ analytics, className }: AnalyticsDashboardProps) {
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'proficient':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unsatisfactory':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Award className="h-4 w-4" />;
      case 'proficient':
        return <Target className="h-4 w-4" />;
      case 'needs-improvement':
        return <TrendingUp className="h-4 w-4" />;
      case 'unsatisfactory':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics.overallScore}
                %
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{analytics.correctAnswers}</div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{analytics.totalQuestions}</div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </div>

          <div className="mt-6">
            <Progress value={analytics.overallScore} className="h-3" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {analytics.overallScore >= 80
                ? 'Excellent performance!'
                : analytics.overallScore >= 70
                  ? 'Good performance with room for improvement'
                  : 'Needs improvement in several areas'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Areas Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Areas Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.knowledgeAreas.map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{area.area}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getPerformanceColor(area.performance))}
                    >
                      {getPerformanceIcon(area.performance)}
                      <span className="ml-1 capitalize">{area.performance.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                  <span className="font-semibold">
                    {area.score}
                    %
                  </span>
                </div>
                <Progress value={area.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Study Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.knowledgeAreas
              .filter(area => area.performance === 'needs-improvement' || area.performance === 'unsatisfactory')
              .map((area, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">{area.area}</p>
                      <p className="text-sm text-yellow-700">
                        Score:
                        {' '}
                        {area.score}
                        % - Focus on improving this knowledge area
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {analytics.knowledgeAreas.every(area =>
              area.performance === 'excellent' || area.performance === 'proficient',
            ) && (
              <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Great job!</p>
                    <p className="text-sm text-green-700">
                      All knowledge areas show proficient or excellent performance.
                      Continue reviewing to maintain your strong foundation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
