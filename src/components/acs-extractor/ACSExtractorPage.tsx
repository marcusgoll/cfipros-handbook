'use client';

import { BarChart3, FileText, RefreshCw, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { FeatureLimitsNotice } from './FeatureLimitsNotice';
import { FileUploadZone } from './FileUploadZone';
import { ProcessingStatus } from './ProcessingStatus';
import { ResultsDisplay } from './ResultsDisplay';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

type ExtractedResult = {
  id: string;
  fileName: string;
  extractedCodes: ACSCode[];
  analytics: Analytics;
  uploadedAt: Date;
};

type ACSCode = {
  code: string;
  title: string;
  description: string;
  category: string;
  performance: 'excellent' | 'proficient' | 'needs-improvement' | 'unsatisfactory';
  score?: number;
};

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

type ACSExtractorPageProps = {
  locale: string;
};

export function ACSExtractorPage({ locale }: ACSExtractorPageProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [currentResult, setCurrentResult] = useState<ExtractedResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = async (files: File[]) => {
    setProcessingState('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProcessingState('processing');

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result data
      const mockResult: ExtractedResult = {
        id: Date.now().toString(),
        fileName: files[0].name,
        extractedCodes: [
          {
            code: 'PA.I.A.K1',
            title: 'Certification requirements, recent flight experience, and recordkeeping',
            description: 'The applicant demonstrates understanding of certification requirements for pilots.',
            category: 'Pilot Certification',
            performance: 'excellent',
            score: 95,
          },
          {
            code: 'PA.I.B.K2',
            title: 'Airworthiness requirements',
            description: 'Understanding of aircraft airworthiness requirements and inspections.',
            category: 'Airworthiness',
            performance: 'proficient',
            score: 85,
          },
          {
            code: 'PA.II.A.K1',
            title: 'Weather theory',
            description: 'Knowledge of weather theory, hazards, and interpretation.',
            category: 'Weather Systems',
            performance: 'needs-improvement',
            score: 72,
          },
        ],
        analytics: {
          overallScore: 84,
          totalQuestions: 60,
          correctAnswers: 50,
          knowledgeAreas: [
            { area: 'Pilot Certification', score: 95, performance: 'excellent' },
            { area: 'Airworthiness', score: 85, performance: 'proficient' },
            { area: 'Weather Systems', score: 72, performance: 'needs-improvement' },
            { area: 'Navigation', score: 88, performance: 'proficient' },
          ],
        },
        uploadedAt: new Date(),
      };

      setCurrentResult(mockResult);
      setProcessingState('complete');
      setActiveTab('results');
    } catch (err) {
      setError('Failed to process file. Please try again.');
      setProcessingState('error');
    }
  };

  const handleReset = () => {
    setProcessingState('idle');
    setCurrentResult(null);
    setUploadProgress(0);
    setError(null);
    setActiveTab('upload');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ACS Knowledge Extractor</h1>
        <p className="text-muted-foreground mt-2">
          Upload your FAA Knowledge Test results to analyze performance and identify knowledge gaps
        </p>
      </div>

      {/* Free Tier Notice */}
      <FeatureLimitsNotice className="mb-6" />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            disabled={processingState === 'idle'}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${processingState === 'processing' ? 'animate-spin' : ''}`} />
            Processing
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            disabled={!currentResult}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={!currentResult}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Test Results</CardTitle>
              <CardDescription>
                Upload your FAA Knowledge Test results in PDF, image, or text format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFileUpload={handleFileUpload}
                disabled={processingState === 'uploading' || processingState === 'processing'}
                maxFiles={3}
              />
              {error && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>
                Analyzing your test results and extracting ACS codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessingStatus
                state={processingState}
                progress={uploadProgress}
                fileName={currentResult?.fileName}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {currentResult && (
            <AnalyticsDashboard analytics={currentResult.analytics} />
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {currentResult && (
            <ResultsDisplay result={currentResult} />
          )}
        </TabsContent>
      </Tabs>

      {/* Reset/New Analysis Button */}
      {processingState === 'complete' && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleReset} variant="outline" size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Analyze New Test Results
          </Button>
        </div>
      )}
    </div>
  );
}
