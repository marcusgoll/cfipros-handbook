'use client';

import {
  BarChart3,
  CheckCircle,
  Crown,
  Download,
  History,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type FeatureLimitsNoticeProps = {
  className?: string;
};

type FeatureComparison = {
  feature: string;
  free: React.ReactNode;
  premium: React.ReactNode;
  icon: React.ReactNode;
};

export function FeatureLimitsNotice({ className }: FeatureLimitsNoticeProps) {
  const features: FeatureComparison[] = [
    {
      feature: 'File Uploads',
      free: <span className="text-muted-foreground">3 files max</span>,
      premium: <span className="text-green-600 font-medium">Unlimited</span>,
      icon: <Upload className="h-4 w-4" />,
    },
    {
      feature: 'Basic Analytics',
      free: <CheckCircle className="h-4 w-4 text-green-500" />,
      premium: <CheckCircle className="h-4 w-4 text-green-500" />,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      feature: 'Result History',
      free: <X className="h-4 w-4 text-red-500" />,
      premium: <CheckCircle className="h-4 w-4 text-green-500" />,
      icon: <History className="h-4 w-4" />,
    },
    {
      feature: 'Export Results',
      free: <X className="h-4 w-4 text-red-500" />,
      premium: <CheckCircle className="h-4 w-4 text-green-500" />,
      icon: <Download className="h-4 w-4" />,
    },
    {
      feature: 'Advanced Analytics',
      free: <X className="h-4 w-4 text-red-500" />,
      premium: <CheckCircle className="h-4 w-4 text-green-500" />,
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <Card className={cn('border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <Crown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-orange-900">
                Free Tier - ACS Knowledge Extractor
              </CardTitle>
              <p className="text-sm text-orange-700 mt-1">
                You're using the free version with limited features
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Free Plan
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Usage */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">File Upload Limit</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">0 / 3 files used</p>
            <p className="text-xs text-muted-foreground">Resets after each analysis</p>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-orange-900">Feature Comparison</h4>

          <div className="bg-white/60 rounded-lg border border-orange-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-3 bg-orange-100/50 border-b border-orange-200">
              <div className="font-medium text-xs text-orange-900">Feature</div>
              <div className="font-medium text-xs text-orange-900 text-center">Free</div>
              <div className="font-medium text-xs text-orange-900 text-center">Premium</div>
              <div className="font-medium text-xs text-orange-900 text-center">Status</div>
            </div>

            {features.map((feature, index) => (
              <div key={feature.feature}>
                <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="font-medium">{feature.feature}</span>
                  </div>
                  <div className="text-center flex justify-center">
                    {feature.free}
                  </div>
                  <div className="text-center flex justify-center">
                    {feature.premium}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {feature.feature === 'File Uploads' || feature.feature === 'Basic Analytics'
                        ? 'Available'
                        : 'Upgrade Required'}
                    </Badge>
                  </div>
                </div>
                {index < features.length - 1 && (
                  <Separator className="bg-orange-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium - $19.99/month
          </Button>
          <Button variant="outline" className="sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50">
            View Pricing Details
          </Button>
        </div>

        {/* Benefits Summary */}
        <div className="p-3 bg-white/60 rounded-lg border border-orange-200">
          <h5 className="font-medium text-sm text-orange-900 mb-2">Premium Benefits</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-orange-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Unlimited file uploads
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Save & export results
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Track progress over time
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Advanced performance insights
            </div>
          </div>
        </div>

        {/* Free Tier Value Proposition */}
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Try it free!</strong>
            {' '}
            Upload up to 3 test results to see how our ACS Knowledge Extractor
            helps identify your knowledge gaps and study areas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
