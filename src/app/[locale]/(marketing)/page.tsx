import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: 'CFIPros - Master Aviation Knowledge 10x Faster',
    description: 'Fast-loading, comprehensive aviation content with ACS integration for professional flight training.',
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-14 pb-20 sm:pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20">
                <span className="mr-2">🚀</span>
                Trusted by 10,000+ aviation professionals
              </div>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
              Master Aviation Knowledge
              {' '}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>

            <p className="mt-8 text-xl font-medium text-pretty text-muted-foreground sm:text-2xl/8">
              The most comprehensive aviation study platform with ACS integration,
              interactive learning, and AI-powered progress tracking.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-4 h-auto">
                <Link href="/sign-up">
                  Start Free Trial
                  <span className="ml-2">→</span>
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                <Link href="#demo">
                  <span className="mr-2">▶</span>
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                14-day free trial
              </div>
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                No credit card required
              </div>
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 sm:mt-20">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10"></div>

              <div className="relative rounded-2xl bg-background/80 backdrop-blur-sm border shadow-2xl">
                <div className="px-6 py-8 sm:px-8 sm:py-12">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left: ACS Extractor Preview */}
                    <div className="space-y-6">
                      <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        <span className="mr-2">📊</span>
                        ACS Code Extractor
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Knowledge Test Analysis</span>
                            <span className="text-xs text-primary">LIVE</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="text-2xl font-bold text-foreground">92%</div>
                              <div className="text-xs text-muted-foreground">Overall Score</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-primary">15</div>
                              <div className="text-xs text-muted-foreground">ACS Areas</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-accent">3</div>
                              <div className="text-xs text-muted-foreground">Focus Areas</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="text-sm">PA.I.A.K1 - Certification</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Strong</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="text-sm">PA.II.A.K2 - Weather</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Review</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="text-sm">PA.III.B.K1 - Navigation</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Focus</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Interactive Learning Preview */}
                    <div className="space-y-6">
                      <div className="inline-flex items-center rounded-lg bg-accent/10 px-3 py-1 text-sm font-medium text-accent-foreground">
                        <span className="mr-2">🛩️</span>
                        Interactive Learning
                      </div>

                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border overflow-hidden">
                          <div className="p-6 h-full flex flex-col justify-center items-center text-center">
                            <div className="text-6xl mb-4 animate-pulse">⚡</div>
                            <div className="text-lg font-semibold text-foreground mb-2">
                              Flight Dynamics Simulator
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Interactive aircraft performance calculations
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                            </div>
                          </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="mt-4 flex items-center justify-center space-x-4 p-3 bg-background rounded-lg border">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <span className="text-sm">⏮</span>
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <span className="text-sm">▶</span>
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <span className="text-sm">⏸</span>
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <span className="text-sm">⏭</span>
                          </button>
                          <div className="flex-1 mx-4">
                            <div className="h-1 bg-muted rounded-full">
                              <div className="h-1 bg-primary rounded-full w-1/3"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 sm:mt-20">
            <div className="mx-auto max-w-4xl">
              <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                Trusted by aviation professionals at
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">ATP</div>
                  <div className="text-xs text-muted-foreground">Flight School</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">CAE</div>
                  <div className="text-xs text-muted-foreground">Training Centers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">Delta</div>
                  <div className="text-xs text-muted-foreground">Air Lines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">Embry-Riddle</div>
                  <div className="text-xs text-muted-foreground">University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACS Extractor Feature Showcase */}
      <section id="acs-extractor" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 mb-6">
                <span className="mr-2">🔍</span>
                Featured Tool
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ACS Knowledge
                {' '}
                <span className="text-primary">Extractor</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Automatically extract and analyze ACS codes from your study materials.
                Identify knowledge gaps and create personalized study plans instantly.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Feature 1 */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-3xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold mb-3">Document Analysis</h3>
                  <p className="text-muted-foreground">
                    Upload PDFs, documents, or paste text. Our AI instantly identifies all ACS codes
                    and cross-references them with our comprehensive database.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-3">Gap Analysis</h3>
                  <p className="text-muted-foreground">
                    Compare extracted codes against your current knowledge level.
                    Get detailed reports on what you know and what needs attention.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-3xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-3">Study Plans</h3>
                  <p className="text-muted-foreground">
                    Generate personalized study schedules based on your identified gaps.
                    Focus your time on areas that matter most for your checkride.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Demo */}
            <div className="bg-background rounded-2xl border shadow-xl p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Try it now</h3>
                    <p className="text-muted-foreground">
                      Paste any aviation study material and see the ACS extractor in action.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Sample Input:</p>
                      <p className="text-sm font-mono bg-background p-3 rounded border">
                        "The pilot must demonstrate knowledge of certification requirements (PA.I.A.K1),
                        weather systems (PA.II.A.K2), and navigation principles (PA.III.B.K1)..."
                      </p>
                    </div>

                    <Button className="w-full" size="lg">
                      <span className="mr-2">🔍</span>
                      Extract ACS Codes
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Extracted Codes</span>
                      <span className="text-xs text-green-600">3 found</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-mono">PA.I.A.K1</span>
                        <span className="text-xs text-green-600">Certification</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-mono">PA.II.A.K2</span>
                        <span className="text-xs text-blue-600">Weather Systems</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-mono">PA.III.B.K1</span>
                        <span className="text-xs text-purple-600">Navigation</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Recommendation</p>
                    <p className="text-sm text-blue-700">
                      Focus on PA.III.B.K1 (Navigation) - this appears in 68% of practical exam scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link href="/acs-extractor">
                  Try ACS Extractor Free
                  <span className="ml-2">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">

          {/* Interactive Learning Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="text-primary">Interactive</span>
                {' '}
                Learning.
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  All concepts in the handbook are discussed succinctly and in a manner that flows logically.
                </p>
                <p>
                  Each topic is accompanied by rich interactive visualizers that let you experiment and play with aviation concepts.
                </p>
                <p>
                  Modify and experiment with custom inputs for weather conditions, aircraft performance, and navigation scenarios.
                </p>
                <p>
                  All interactive elements are dynamic and are procedurally generated based on your inputs.
                </p>
                <p>
                  A playback system lets you pause, rewind and step through any part of the visualization.
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg border p-8">
              <div className="bg-background rounded-md p-6">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛩️</div>
                    <p className="text-muted-foreground">Interactive Flight Simulation</p>
                    <p className="text-sm text-muted-foreground mt-2">Adjust altitude, airspeed, weather conditions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACS Code Analysis Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-muted rounded-lg border p-8">
                <div className="bg-background rounded-md p-6">
                  <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-muted-foreground">ACS Code Extractor</p>
                      <p className="text-sm text-muted-foreground mt-2">Upload test results → Get instant analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="text-primary">ACS Code</span>
                {' '}
                Analysis.
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Upload your FAA Knowledge Test results and get instant analysis of your performance across all ACS codes.
                </p>
                <p>
                  Every step is visualized, and you can see exactly how each ACS code maps to specific knowledge areas and practical skills.
                </p>
                <p>
                  With custom inputs, you're not limited to pre-filled examples. You can provide your own test results, analyze edge cases, and simulate different scenarios.
                </p>
                <p>
                  Track your progress over time and identify knowledge gaps before your practical test.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Big Numbers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-muted-foreground">Interactive Pages</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Study Units</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">ACS Codes w/ desc.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground ring-1 ring-accent/20 mb-6">
                <span className="mr-2">📚</span>
                Study Resources
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything You Need to
                {' '}
                <span className="text-primary">Succeed</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive study materials, practice tests, and reference guides
                designed specifically for aviation professionals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Practice Tests */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-3">Practice Tests</h3>
                  <p className="text-muted-foreground mb-4">
                    Realistic practice exams that mirror actual FAA knowledge tests.
                    Track your progress and identify weak areas.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• 2000+ current FAA questions</li>
                    <li>• Detailed explanations for each answer</li>
                    <li>• Performance analytics and reporting</li>
                    <li>• Timed and untimed practice modes</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Study Guides */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold mb-3">Study Guides</h3>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive study materials covering all ACS knowledge areas
                    with clear explanations and examples.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Complete ACS coverage</li>
                    <li>• Interactive diagrams and charts</li>
                    <li>• Quick reference summaries</li>
                    <li>• Mobile-friendly format</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Reference Tools */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🛠️</div>
                  <h3 className="text-xl font-semibold mb-3">Reference Tools</h3>
                  <p className="text-muted-foreground mb-4">
                    Essential aviation calculators, converters, and quick-reference
                    tools for both study and real-world use.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Performance calculators</li>
                    <li>• Weather decoder tools</li>
                    <li>• Unit converters</li>
                    <li>• Navigation utilities</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Video Library */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🎥</div>
                  <h3 className="text-xl font-semibold mb-3">Video Library</h3>
                  <p className="text-muted-foreground mb-4">
                    Expert-led video tutorials covering complex aviation concepts
                    with visual demonstrations and examples.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• 200+ instructional videos</li>
                    <li>• Step-by-step walkthroughs</li>
                    <li>• Real-world scenarios</li>
                    <li>• HD quality with subtitles</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Flashcards */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">🃏</div>
                  <h3 className="text-xl font-semibold mb-3">Digital Flashcards</h3>
                  <p className="text-muted-foreground mb-4">
                    Spaced repetition flashcards for memorizing key facts,
                    procedures, and regulations efficiently.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Intelligent spacing algorithm</li>
                    <li>• Custom deck creation</li>
                    <li>• Progress tracking</li>
                    <li>• Offline access available</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Community Forum */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-3">Community Forum</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with fellow aviators, ask questions, and share
                    knowledge in our active community forum.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Expert instructor support</li>
                    <li>• Peer-to-peer learning</li>
                    <li>• Q&A database</li>
                    <li>• Study group coordination</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="mb-4">
                <Link href="/sign-up">
                  Access All Resources
                  <span className="ml-2">→</span>
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Start your 14-day free trial • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-5xl font-bold text-center mb-12 text-foreground">
            Table of Contents
          </h2>

          <div className="bg-background rounded-lg border p-8">
            <Accordion type="single" collapsible className="w-full space-y-0">
              <AccordionItem value="introduction" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">1. Introduction to Flight</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Learn about the history of aviation, basic principles of flight, and the regulatory framework governing aviation in the United States.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="airplanes-engines" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">2. Airplanes and Engines</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Understanding aircraft systems including powerplants, propellers, fuel systems, electrical systems, and flight controls.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="flight-instruments" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">3. Flight Instruments</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Comprehensive coverage of flight instruments, engine instruments, and navigation equipment essential for safe flight operations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="airports-airspace" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">4. Airports, Airspace, and Flight Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Learn about different types of airports, airspace classifications, NOTAMs, and flight information services.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="procedures-communications" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">5. Procedures and Airport Operations</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Radio communications, airport traffic patterns, runway incursion avoidance, and standard operating procedures.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="regulations" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">6. Regulations and Procedures</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Federal Aviation Regulations including Parts 61, 91, and NTSB 830. Pilot certification requirements and operating rules.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="performance-weight-balance" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">7. Performance and Weight and Balance</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Aircraft performance calculations, weight and balance computations, and factors affecting aircraft performance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="weather" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">8. Weather Theory and Reports</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Meteorology fundamentals, weather systems, reading weather reports and forecasts, and weather-related decision making.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="navigation" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">9. Navigation: Charts and Publications</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Pilotage, dead reckoning, radio navigation, GPS navigation, and understanding aeronautical charts and publications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="flight-operations" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">10. Flight Operations</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Preflight planning, risk management, aeronautical decision making, and crew resource management principles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="human-factors" className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">11. Human Factors</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Aviation physiology, spatial disorientation, hypoxia, fatigue, stress, and maintaining peak performance in flight.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="practical-test-standards" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-4 px-2 text-left cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=open]:hidden">+</span>
                    <span className="text-lg font-medium text-muted-foreground group-data-[state=closed]:hidden">×</span>
                    <span className="text-lg font-medium text-foreground">12. Practical Test Standards</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-4 text-muted-foreground">
                  Understanding the ACS requirements, checkride preparation, and demonstrating proficiency in all required areas of operation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base/7 font-semibold text-primary">Pricing</h2>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
              Pricing that grows with you
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-muted-foreground">
            Choose an affordable plan that's packed with the best features for mastering aviation knowledge,
            passing your exams, and advancing your career.
          </p>

          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">

            {/* Free Tier */}
            <div className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-border xl:p-10 lg:mt-8">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg/8 font-semibold text-foreground">Free</h3>
                </div>
                <p className="mt-4 text-sm/6 text-muted-foreground">
                  Perfect for getting started with aviation study materials and basic ACS analysis.
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">$0</span>
                  <span className="text-sm/6 font-semibold text-muted-foreground">/forever</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm/6 text-muted-foreground">
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Basic ACS code extraction
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    5 handbook pages per month
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Community support
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Basic search functionality
                  </li>
                </ul>
              </div>
              <Button asChild className="mt-8 w-full" variant="outline">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </div>

            {/* Pro Tier - Most Popular */}
            <div className="lg:z-10 lg:rounded-b-none flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-border xl:p-10">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg/8 font-semibold text-primary">Pro</h3>
                  <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs/5 font-semibold text-primary">
                    Most popular
                  </p>
                </div>
                <p className="mt-4 text-sm/6 text-muted-foreground">
                  Everything you need for comprehensive aviation training and exam preparation.
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">$19.99</span>
                  <span className="text-sm/6 font-semibold text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  $16.58 per month if paid annually
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm/6 text-muted-foreground">
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Everything in Free
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Unlimited handbook access
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Advanced ACS analytics
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Practice quizzes & tests
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Progress tracking & history
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Mobile app access
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Priority email support
                  </li>
                </ul>
              </div>
              <Button asChild className="mt-8 w-full">
                <Link href="/sign-up">Start free trial</Link>
              </Button>
            </div>

            {/* Institution Tier */}
            <div className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-border xl:p-10 lg:mt-8">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg/8 font-semibold text-foreground">Institution</h3>
                </div>
                <p className="mt-4 text-sm/6 text-muted-foreground">
                  Dedicated support and infrastructure for flight schools and training organizations.
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">$299</span>
                  <span className="text-sm/6 font-semibold text-muted-foreground">/month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  $249 per month if paid annually
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm/6 text-muted-foreground">
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Everything in Pro
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    White-label branding
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Multi-instructor accounts
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Student progress dashboard
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Custom content uploads
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    API access & integrations
                  </li>
                  <li className="flex gap-x-3">
                    <span className="h-6 w-5 flex-none text-primary">✓</span>
                    Dedicated account manager
                  </li>
                </ul>
              </div>
              <Button asChild className="mt-8 w-full" variant="outline">
                <Link href="/contact">Contact sales</Link>
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              14-day free trial • No setup fees • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>

          {/* Lifetime Membership Card */}
          <div className="mx-auto mt-20 max-w-2xl rounded-3xl ring-1 ring-border sm:mt-24 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-3xl font-semibold tracking-tight text-foreground">Lifetime membership</h3>
              <p className="mt-6 text-base/7 text-muted-foreground">
                Invest in your aviation career with lifetime access to all CFIPros content, features, and future updates.
                Perfect for serious pilots and instructors who want comprehensive training resources forever.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm/6 font-semibold text-primary">What's included</h4>
                <div className="h-px flex-auto bg-border" />
              </div>
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-muted-foreground sm:grid-cols-2 sm:gap-6">
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Everything in Pro forever
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Lifetime content updates
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Exclusive CFI community access
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Priority feature requests
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Early access to new ratings
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Grandfathered pricing protection
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  VIP support channel
                </li>
                <li className="flex gap-x-3">
                  <span className="h-6 w-5 flex-none text-primary">✓</span>
                  Annual CFI conference invitation
                </li>
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
              <div className="rounded-2xl bg-muted/50 py-10 text-center ring-1 ring-border ring-inset lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-muted-foreground">Pay once, own it forever</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-semibold tracking-tight text-foreground">$499</span>
                    <span className="text-sm/6 font-semibold tracking-wide text-muted-foreground">USD</span>
                  </p>
                  <Button asChild className="mt-10 w-full">
                    <Link href="/sign-up">Get lifetime access</Link>
                  </Button>
                  <p className="mt-6 text-xs/5 text-muted-foreground">
                    Invoices and receipts available for easy company reimbursement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-base/7 font-semibold text-primary">Support</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Frequently asked questions
              </p>
              <p className="mt-6 text-lg font-medium text-muted-foreground">
                Everything you need to know about CFIPros. Can't find the answer you're looking for?
                <Link href="/contact" className="text-primary hover:underline ml-1">
                  Chat with our team
                </Link>
                .
              </p>
            </div>

            <div className="bg-background rounded-2xl border p-8 lg:p-10">
              <Accordion type="single" collapsible className="w-full space-y-0">
                <AccordionItem value="what-is-acs" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        What is ACS and how does CFIPros help with it?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>
                        The Airman Certification Standards (ACS) are the official FAA standards
                        that define what pilots must know and be able to do during practical tests.
                        CFIPros helps you understand and master these requirements by:
                      </p>
                      <ul className="mt-3 space-y-1">
                        <li>• Extracting ACS codes from your knowledge test results</li>
                        <li>• Mapping each code to specific learning materials</li>
                        <li>• Providing targeted study recommendations</li>
                        <li>• Tracking your progress across all ACS areas</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="free-vs-paid" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        How does the free tier differ from Pro?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>
                        The free tier gives you a taste of what CFIPros offers, while Pro unlocks
                        the full learning experience:
                      </p>
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Free includes:</h4>
                          <ul className="space-y-1">
                            <li>• Basic ACS extraction</li>
                            <li>• 5 handbook pages/month</li>
                            <li>• Community support</li>
                            <li>• Basic search</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Pro adds:</h4>
                          <ul className="space-y-1">
                            <li>• Unlimited handbook access</li>
                            <li>• Advanced analytics</li>
                            <li>• Practice quizzes</li>
                            <li>• Mobile app access</li>
                            <li>• Priority support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment-options" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        What payment options and plans are available?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>We offer flexible pricing to fit every aviation professional's needs:</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span>Monthly Pro</span>
                          <span className="font-semibold">$19.99/month</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span>
                            Annual Pro
                            <span className="text-sm text-primary">(Save 17%)</span>
                          </span>
                          <span className="font-semibold">$199/year</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span>Lifetime Access</span>
                          <span className="font-semibold">$499 one-time</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span>Institutions</span>
                          <span className="font-semibold">From $299/month</span>
                        </div>
                      </div>
                      <p className="mt-4">
                        All paid plans include a 14-day free trial and can be canceled anytime.
                        We accept all major credit cards and offer invoicing for institutional customers.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mobile-access" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        Can I access content offline and on mobile?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>
                        Yes! Pro subscribers get full mobile access with offline capabilities:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li>
                          •
                          <strong>Mobile app</strong>
                          {' '}
                          - Available for iOS and Android
                        </li>
                        <li>
                          •
                          <strong>Offline reading</strong>
                          {' '}
                          - Download lessons for studying anywhere
                        </li>
                        <li>
                          •
                          <strong>Sync across devices</strong>
                          {' '}
                          - Progress tracked across all platforms
                        </li>
                        <li>
                          •
                          <strong>Touch-optimized</strong>
                          {' '}
                          - Designed for easy mobile navigation
                        </li>
                        <li>
                          •
                          <strong>Fast loading</strong>
                          {' '}
                          - Optimized for cellular connections
                        </li>
                      </ul>
                      <p className="mt-4">
                        Perfect for studying during flight training, commuting, or anywhere you have
                        a few minutes to advance your aviation knowledge.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="institutional" className="border-b border-border">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        Do you offer institutional licenses for flight schools?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>
                        Absolutely! Our institutional licenses are designed specifically for flight
                        schools and training organizations:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li>
                          •
                          <strong>White-label branding</strong>
                          {' '}
                          - Customize with your school's logo and colors
                        </li>
                        <li>
                          •
                          <strong>Multi-instructor accounts</strong>
                          {' '}
                          - Manage multiple CFI accounts
                        </li>
                        <li>
                          •
                          <strong>Student progress tracking</strong>
                          {' '}
                          - Monitor all student advancement
                        </li>
                        <li>
                          •
                          <strong>Custom content uploads</strong>
                          {' '}
                          - Add your own training materials
                        </li>
                        <li>
                          •
                          <strong>API access</strong>
                          {' '}
                          - Integrate with your existing systems
                        </li>
                        <li>
                          •
                          <strong>Dedicated support</strong>
                          {' '}
                          - Priority assistance and account management
                        </li>
                      </ul>
                      <p className="mt-4">
                        Pricing starts at $299/month ($249/month annually) and scales with your organization size.
                        <Link href="/contact" className="text-primary hover:underline ml-1">
                          Contact our team
                        </Link>
                        {' '}
                        for a custom quote and demo.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="getting-started" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 text-left cursor-pointer group data-[state=open]:pb-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold text-foreground pr-4">
                        How do I get started with CFIPros?
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-muted-foreground">
                    <div className="prose prose-sm max-w-none">
                      <p>Getting started is easy and takes less than 2 minutes:</p>
                      <ol className="mt-3 space-y-2">
                        <li>
                          1.
                          <strong>Sign up</strong>
                          {' '}
                          - Create your free account with email or Google
                        </li>
                        <li>
                          2.
                          <strong>Choose your focus</strong>
                          {' '}
                          - Select your current rating and goals
                        </li>
                        <li>
                          3.
                          <strong>Upload test results</strong>
                          {' '}
                          - (Optional) Upload knowledge test results for ACS analysis
                        </li>
                        <li>
                          4.
                          <strong>Start learning</strong>
                          {' '}
                          - Explore handbook content and interactive features
                        </li>
                        <li>
                          5.
                          <strong>Upgrade when ready</strong>
                          {' '}
                          - Unlock full features with our 14-day free trial
                        </li>
                      </ol>
                      <p className="mt-4">
                        No credit card required to start, and you can upgrade or cancel anytime.
                        Our onboarding process is designed to get you studying in minutes, not hours.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last updated: January 18, 2025</span>
                  <Link href="/contact" className="text-primary hover:underline">
                    Still have questions? Contact support →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Crafted with ♥ by Marcus Gollahon /
            <a href="https://x.com/marcusgoll" className="text-primary hover:underline ml-1">
              @marcusgoll
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © 2025 Marcus Gollahon
          </p>
        </div>
      </footer>
    </div>
  );
};
