'use client';

import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Download,
  Lock,
  Rocket,
  Search,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FeatureShowcaseProps = {
  locale: string;
};

export function FeatureShowcase({ locale }: FeatureShowcaseProps) {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Handbook',
      description: 'Comprehensive aviation lessons with structured learning paths',
      benefits: [
        'Step-by-step lesson progression',
        'Bookmarking and progress tracking',
        'Mobile-optimized reading experience',
        'Quick navigation between topics',
      ],
      cta: {
        text: 'Start First Lesson',
        href: `/${locale}/handbook/private-pilot`,
        variant: 'default' as const,
      },
      preview: {
        type: 'lesson-preview',
        content: 'Private Pilot • Principles of Flight',
      },
      status: 'available',
    },
    {
      icon: Download,
      title: 'Resource Library',
      description: 'Downloadable checklists, references, and study materials',
      benefits: [
        'Free and premium resources',
        'PDF downloads and templates',
        'Search and filter functionality',
        'Regular content updates',
      ],
      cta: {
        text: 'Browse Resources',
        href: `/${locale}/resources`,
        variant: 'outline' as const,
      },
      preview: {
        type: 'resource-stats',
        content: '20+ resources available',
      },
      status: 'available',
      highlight: 'Free resources available',
    },
    {
      icon: BarChart3,
      title: 'ACS Knowledge Extractor',
      description: 'Analyze FAA test results and get personalized study recommendations',
      benefits: [
        'Upload CSV knowledge test results',
        'Identify knowledge gaps by ACS area',
        'Get targeted study suggestions',
        'Track improvement over time',
      ],
      cta: {
        text: 'Upload Test Results',
        href: `/${locale}/dashboard/acs-extractor`,
        variant: 'outline' as const,
      },
      preview: {
        type: 'upload-zone',
        content: 'Drop CSV file or click to browse',
      },
      status: 'available',
      badge: 'Free Tool',
    },
  ];

  const upcomingFeatures = [
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Collaborate with other aviation students',
      status: 'coming-soon',
      timeline: 'Q2 2025',
    },
    {
      icon: Star,
      title: 'Practice Tests',
      description: 'Interactive practice exams with detailed explanations',
      status: 'coming-soon',
      timeline: 'Q1 2025',
    },
  ];

  const FeaturePreview = ({ preview }: { preview: { type: string; content: string } }) => {
    switch (preview.type) {
      case 'lesson-preview':
        return (
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Lesson</span>
            </div>
            <p className="text-sm text-muted-foreground">{preview.content}</p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-1/3"></div>
            </div>
          </div>
        );
      case 'resource-stats':
        return (
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">5</div>
                <div className="text-xs text-muted-foreground">Free</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">15</div>
                <div className="text-xs text-muted-foreground">Premium</div>
              </div>
            </div>
          </div>
        );
      case 'upload-zone':
        return (
          <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{preview.content}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Features */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that make CFI Interactive the best choice for aviation education
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                {feature.highlight && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓
                    {' '}
                    {feature.highlight}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Preview */}
                <div className="mb-4">
                  <FeaturePreview preview={feature.preview} />
                </div>

                {/* Benefits */}
                <div className="mb-6 flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-3">Key Benefits:</h4>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  variant={feature.cta.variant}
                  className="w-full"
                >
                  <Link href={feature.cta.href} className="flex items-center justify-center gap-2">
                    {feature.cta.variant === 'default' && <Rocket className="h-4 w-4" />}
                    {feature.cta.text}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Features */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Exciting new features in development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <Card key={index} className="opacity-75 hover:opacity-90 transition-opacity">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {feature.timeline}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-4">
                  <Button disabled variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-muted-foreground mb-4">
              Browse our help center or contact support for personalized assistance
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm">
                Help Center
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
