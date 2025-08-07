'use client';

import {
  BarChart3,
  BookOpen,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Search,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type QuickActionsProps = {
  locale: string;
};

export function QuickActions({ locale }: QuickActionsProps) {
  const primaryActions = [
    {
      icon: BookOpen,
      title: 'Start Learning',
      description: 'Begin with Private Pilot lessons',
      href: `/${locale}/handbook/private-pilot`,
      variant: 'default' as const,
      featured: true,
    },
    {
      icon: Download,
      title: 'Free Resources',
      description: 'Download checklists and references',
      href: `/${locale}/resources`,
      variant: 'outline' as const,
      badge: 'Free',
    },
    {
      icon: BarChart3,
      title: 'Upload Test Results',
      description: 'Get personalized study plan',
      href: `/${locale}/dashboard/acs-extractor`,
      variant: 'outline' as const,
    },
  ];

  const quickLinks = [
    {
      icon: Search,
      title: 'Search Content',
      description: 'Find specific topics quickly',
      action: () => {
        // Focus search bar or open search modal
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      icon: FileText,
      title: 'Study Guides',
      description: 'Comprehensive topic overviews',
      href: `/${locale}/handbook/private-pilot/principles-of-flight`,
    },
    {
      icon: Clock,
      title: 'Recent Activity',
      description: 'Continue where you left off',
      href: `/${locale}/dashboard`,
    },
    {
      icon: TrendingUp,
      title: 'Progress Report',
      description: 'View your learning analytics',
      href: `/${locale}/dashboard`,
    },
  ];

  const recentResources = [
    {
      title: 'Cessna 172 Preflight Checklist',
      type: 'PDF',
      downloads: 1250,
      href: `/${locale}/resources`,
    },
    {
      title: 'Aviation Phonetic Alphabet',
      type: 'PDF',
      downloads: 2100,
      href: `/${locale}/resources`,
    },
    {
      title: 'VFR Weather Minimums Chart',
      type: 'PDF',
      downloads: 1890,
      href: `/${locale}/resources`,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Primary Actions */}
      <div>
        <h2 className="text-responsive-2xl font-bold text-premium mb-8 animate-slide-up">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryActions.map((action, index) => (
            <Card
              key={index}
              className={cn(
                'card-premium group cursor-pointer relative overflow-hidden',
                action.featured && 'ring-2 ring-primary/30 glow-primary bg-gradient-surface',
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardContent className="pt-8 pb-6">
                <div className="text-center space-y-6">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl',
                    action.featured
                      ? 'gradient-primary text-primary-foreground glow-primary'
                      : 'bg-muted/50 backdrop-blur-sm group-hover:bg-primary/10',
                  )}
                  >
                    <action.icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-premium group-hover:text-primary transition-colors duration-200">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <Badge
                          variant="secondary"
                          className="text-xs animate-pulse-ring bg-green-100 text-green-700 border-green-200"
                        >
                          {action.badge}
                        </Badge>
                      )}
                      {action.featured && (
                        <Badge className="text-xs gradient-accent text-white animate-glow">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {action.description}
                    </p>
                  </div>

                  <Button
                    asChild
                    variant={action.featured ? 'default' : action.variant}
                    className="w-full interactive-lift"
                    size="default"
                  >
                    <Link href={action.href} className="group">
                      <span className="flex items-center gap-2">
                        {action.title}
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                </div>

                {/* Premium shimmer effect */}
                {action.featured && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h3 className="text-responsive-lg font-semibold text-premium mb-6 animate-slide-up">
          Quick Links
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              className="card-premium group cursor-pointer interactive-lift border-premium"
              style={{
                animationDelay: `${(index + 3) * 50}ms`,
              }}
            >
              <CardContent className="p-5">
                {link.href
                  ? (
                      <Link href={link.href} className="block">
                        <div className="text-center space-y-3">
                          <div className="w-10 h-10 bg-gradient-surface rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-200 shadow-sm group-hover:shadow-md">
                            <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-premium group-hover:text-primary transition-colors duration-200">
                              {link.title}
                            </h4>
                            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  : (
                      <button
                        onClick={link.action}
                        className="w-full interactive-press"
                      >
                        <div className="text-center space-y-3">
                          <div className="w-10 h-10 bg-gradient-surface rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-200 shadow-sm group-hover:shadow-md">
                            <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-premium group-hover:text-primary transition-colors duration-200">
                              {link.title}
                            </h4>
                            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Resources */}
      <Card className="card-premium border-premium animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-responsive-lg text-premium">Popular Resources</CardTitle>
            <Button variant="ghost" size="sm" asChild className="interactive-lift">
              <Link href={`/${locale}/resources`} className="flex items-center gap-2 group">
                <span>View All</span>
                <ExternalLink className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentResources.map((resource, index) => (
            <Link
              key={index}
              href={resource.href}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-surface transition-all duration-200 group interactive-lift border border-transparent hover:border-primary/20"
              style={{
                animationDelay: `${(index + 8) * 50}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-110">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-premium group-hover:text-primary transition-colors duration-200">
                    {resource.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    <span className="font-medium">{resource.type}</span>
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    <span>
                      {resource.downloads.toLocaleString()}
                      {' '}
                      downloads
                    </span>
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-200 group-hover:scale-110" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card className="card-premium bg-gradient-surface border-premium animate-slide-up">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg glow-primary">
              <Search className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-premium mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground">
                Get answers to common questions or contact our support team for personalized assistance
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                size="default"
                className="interactive-lift"
              >
                Help Center
              </Button>
              <Button
                variant="default"
                size="default"
                className="interactive-lift"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
