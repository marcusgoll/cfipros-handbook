import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ACSExtractorLoading() {
  return (
    <DashboardLayout locale="en">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-md w-64 mb-2" />
            <div className="h-4 bg-muted rounded-md w-96" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading ACS Knowledge Extractor</span>
            </CardTitle>
            <CardDescription>
              Setting up the interface for analyzing your test results...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded-lg" />
                </div>
                <div className="lg:col-span-2 animate-pulse">
                  <div className="h-64 bg-muted rounded-lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
