'use client';

import { PageFeedback } from '@/components/handbook/PageFeedback';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FeedbackShowcasePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">PageFeedback Component Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Aviation-themed feedback system for educational content
        </p>
      </div>

      <Tabs defaultValue="variants" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minimal Variant</CardTitle>
              <CardDescription>
                Compact inline version for tight spaces and sidebars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <PageFeedback
                  pageId="showcase-minimal-1"
                  variant="minimal"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Features thumbs up/down, expandable star rating, and aviation-themed icons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Variant</CardTitle>
              <CardDescription>
                Enhanced card version with multiple feedback options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PageFeedback
                pageId="showcase-default-1"
                variant="default"
                showProgressSuggestions={true}
                showDetailedFeedback={true}
              />
              <p className="text-sm text-muted-foreground">
                Includes thumbs up/down, 5-star rating, and optional detailed feedback form
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expanded Variant</CardTitle>
              <CardDescription>
                Full-featured "Flight Debrief" experience with emoji reactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PageFeedback
                pageId="showcase-expanded-1"
                variant="expanded"
                showProgressSuggestions={true}
                showDetailedFeedback={true}
              />
              <p className="text-sm text-muted-foreground">
                Aviation-themed emoji reactions, detailed feedback form, and comprehensive thank you experience
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Aviation Theme
                  <Badge variant="secondary">✈️</Badge>
                </CardTitle>
                <CardDescription>
                  Pilot-centric language and aviation-inspired design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  <li>• 🤔 "Needs clarification"</li>
                  <li>• ✈️ "Ready to fly"</li>
                  <li>• 🎯 "Nailed the landing"</li>
                  <li>• 🛠️ "Needs maintenance"</li>
                </ul>
                <PageFeedback
                  pageId="showcase-aviation-theme"
                  variant="minimal"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Progress Suggestions
                  <Badge variant="secondary">Smart</Badge>
                </CardTitle>
                <CardDescription>
                  Contextual next steps based on feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Positive feedback:</strong>
                    {' '}
                    Continue Learning, Practice Quiz
                  </p>
                  <p>
                    <strong>Negative feedback:</strong>
                    {' '}
                    Review Basics, Get Help
                  </p>
                </div>
                <PageFeedback
                  pageId="showcase-progress-suggestions"
                  variant="default"
                  showProgressSuggestions={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Star Ratings
                  <Badge variant="secondary">Interactive</Badge>
                </CardTitle>
                <CardDescription>
                  Hover effects and visual feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Smooth hover animations and immediate visual feedback
                </p>
                <PageFeedback
                  pageId="showcase-star-ratings"
                  variant="default"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Detailed Feedback
                  <Badge variant="secondary">Comprehensive</Badge>
                </CardTitle>
                <CardDescription>
                  Multi-step feedback with difficulty assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Collects difficulty level, comments, and structured feedback
                </p>
                <PageFeedback
                  pageId="showcase-detailed-feedback"
                  variant="default"
                  showDetailedFeedback={true}
                />
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-World Usage Examples</CardTitle>
              <CardDescription>
                How the feedback component appears in different contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              {/* Lesson Page Example */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">End of Lesson Page</h3>
                <div className="border rounded-lg p-6 bg-background">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold">Principles of Flight - Complete!</h4>
                    <p className="text-muted-foreground">
                      You've completed the fundamentals of how aircraft generate lift and maintain flight.
                    </p>
                    <div className="border-t pt-4">
                      <PageFeedback
                        pageId="lesson-principles-of-flight"
                        variant="default"
                        showProgressSuggestions={true}
                        showDetailedFeedback={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Example */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sidebar Quick Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 border rounded-lg p-4 bg-background">
                    <h4 className="font-semibold mb-2">Main Content Area</h4>
                    <p className="text-sm text-muted-foreground">
                      This represents the main lesson content where users are reading and learning...
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h5 className="text-sm font-medium mb-3">Quick Actions</h5>
                    <div className="space-y-3">
                      <PageFeedback
                        pageId="sidebar-quick-feedback"
                        variant="minimal"
                      />
                      <div className="text-xs text-muted-foreground">
                        Other sidebar content...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Debrief Example */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Flight Training Debrief</h3>
                <div className="border rounded-lg p-6 bg-background">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🛩️</span>
                      <div>
                        <h4 className="text-xl font-bold">Emergency Procedures Training</h4>
                        <p className="text-sm text-muted-foreground">Module 3: Engine Failure Scenarios</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <PageFeedback
                        pageId="flight-debrief-emergency-procedures"
                        variant="expanded"
                        showProgressSuggestions={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Technical Features */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Features</CardTitle>
              <CardDescription>
                Advanced functionality and accessibility features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Enhanced UX</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Smooth micro-animations</li>
                    <li>• Loading states with spinners</li>
                    <li>• Hover effects and scale transforms</li>
                    <li>• Auto-dismiss with smart timing</li>
                    <li>• Visual confirmation feedback</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Accessibility</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full keyboard navigation</li>
                    <li>• Screen reader optimized</li>
                    <li>• ARIA labels and descriptions</li>
                    <li>• High contrast mode support</li>
                    <li>• Reduced motion respect</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Data Collection</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Star ratings (1-5)</li>
                    <li>• Emoji reactions</li>
                    <li>• Written comments</li>
                    <li>• Difficulty assessment</li>
                    <li>• Completion tracking</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Persistence</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• localStorage caching</li>
                    <li>• Session restoration</li>
                    <li>• Cross-page consistency</li>
                    <li>• Data structure versioning</li>
                    <li>• Error recovery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
