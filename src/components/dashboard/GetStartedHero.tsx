'use client';

import { BookOpen, Rocket, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type GetStartedHeroProps = {
  locale: string;
  userName?: string;
};

export function GetStartedHero({ locale, userName }: GetStartedHeroProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {userName ? `Welcome back, ${userName}!` : 'Welcome to CFI Interactive'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive aviation knowledge platform. Master flight training concepts,
            track your progress, and excel in your aviation career.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">100+</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Rocket className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">20+</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">5000+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Primary CTA */}
        <div className="space-y-4">
          <Button asChild size="xl" variant="cockpit">
            <Link href={`/${locale}/handbook/private-pilot`} className="flex items-center gap-3">
              <Rocket className="h-5 w-5" />
              Start Learning Now
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Begin with our comprehensive Private Pilot handbook
          </p>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comprehensive Content</h3>
            <p className="text-sm text-muted-foreground">
              Structured lessons covering all aviation knowledge areas from basic to advanced concepts.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Performance</h3>
            <p className="text-sm text-muted-foreground">
              Lightning-fast loading times and mobile-optimized experience for study anywhere.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your learning journey and identify knowledge gaps with detailed analytics.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <Badge className="mb-3">New Feature</Badge>
              <h3 className="text-xl font-semibold mb-2">ACS Knowledge Extractor</h3>
              <p className="text-muted-foreground mb-4">
                Upload your FAA Knowledge Test results and get personalized study recommendations
                based on your performance in specific ACS areas.
              </p>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/dashboard/acs-extractor`}>
                  Try It Now
                </Link>
              </Button>
            </div>
            <div className="w-full md:w-1/3">
              <div className="bg-white/50 rounded-lg p-4 border border-dashed border-primary/30">
                <div className="text-center text-muted-foreground">
                  <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm">Drop CSV file here</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
