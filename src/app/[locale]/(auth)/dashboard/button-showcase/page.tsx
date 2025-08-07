'use client';

import {
  Plane,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ButtonShowcasePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Button Component Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Aviation-inspired button design system for CFI Interactive
        </p>
      </div>

      <Tabs defaultValue="variants" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Variants */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Primary Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="default">
                    <Plane className="mr-2 h-4 w-4" />
                    Cockpit Style
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Status Variants */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Status Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="secondary">
                    Success
                  </Button>
                  <Button variant="secondary">
                    Warning
                  </Button>
                  <Button variant="destructive">
                    Destructive
                  </Button>
                  <Button variant="secondary">
                    Info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sizes Tab */}
        <TabsContent value="sizes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>
                Various sizes for different contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="lg">Extra Large</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Icon Buttons</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="icon" variant="outline">
                    <Settings />
                  </Button>
                  <Button size="icon">
                    <Settings />
                  </Button>
                  <Button size="icon" variant="default">
                    <Plane />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
              <CardDescription>
                Loading, disabled, and icon states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loading States */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Loading States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Loading</Button>
                  <Button variant="default">
                    Processing
                  </Button>
                  <Button
                    variant="secondary"
                  >
                    Click to Load
                  </Button>
                </div>
              </div>

              {/* Disabled States */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Disabled States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled</Button>
                  <Button variant="default" disabled>
                    Disabled Cockpit
                  </Button>
                  <Button variant="outline" disabled>
                    Disabled Outline
                  </Button>
                </div>
              </div>

              {/* Icon States */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">With Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>
                    Download
                  </Button>
                  <Button>
                    Continue
                  </Button>
                  <Button>
                    Take Flight
                  </Button>
                  <Button
                    variant="default"
                  >
                    Launch Mission
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-World Examples</CardTitle>
              <CardDescription>
                Common button patterns in aviation context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flight Planning */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Flight Planning</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">
                    Plan Route
                  </Button>
                  <Button variant="secondary">
                    Add Waypoint
                  </Button>
                  <Button variant="secondary">
                    File Flight Plan
                  </Button>
                  <Button variant="secondary">
                    Check Weather
                  </Button>
                </div>
              </div>

              {/* Pre-Flight */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Pre-Flight Operations</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>
                    Download Checklist
                  </Button>
                  <Button variant="outline">
                    Calculate W&B
                  </Button>
                  <Button variant="secondary">
                    Complete Pre-Flight
                  </Button>
                  <Button variant="destructive">
                    Cancel Flight
                  </Button>
                </div>
              </div>

              {/* Learning Platform */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Learning Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" variant="default">
                    Start Course
                  </Button>
                  <Button variant="secondary">
                    Save Lesson
                  </Button>
                  <Button variant="outline" size="sm">
                    Add to Favorites
                  </Button>
                  <Button variant="link">
                    Continue Reading
                  </Button>
                </div>
              </div>

              {/* Mixed Sizes */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Responsive Layouts</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm" variant="outline">
                    XS Button
                  </Button>
                  <Button size="sm" variant="secondary">
                    Small Action
                  </Button>
                  <Button variant="default">
                    Primary Action
                  </Button>
                  <Button size="lg" variant="secondary">
                    Complete Task
                  </Button>
                  <Button size="lg" variant="secondary">
                    Begin Flight Training
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
