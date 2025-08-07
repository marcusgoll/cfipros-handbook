'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileSearch,
  RefreshCw,
  Settings,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

type ProcessingStatusProps = {
  state: ProcessingState;
  progress?: number;
  fileName?: string;
  className?: string;
};

type ProcessingStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
};

export function ProcessingStatus({
  state,
  progress = 0,
  fileName,
  className,
}: ProcessingStatusProps) {
  // Define processing steps based on current state
  const getProcessingSteps = (): ProcessingStep[] => {
    const steps: ProcessingStep[] = [
      {
        id: 'upload',
        title: 'Upload File',
        description: 'Securely uploading your test results',
        icon: <Upload className="h-5 w-5" />,
        status: state === 'uploading'
          ? 'active'
          : ['processing', 'complete'].includes(state) ? 'completed' : 'pending',
      },
      {
        id: 'extract',
        title: 'Extract Text',
        description: 'Reading and extracting text from your document',
        icon: <FileSearch className="h-5 w-5" />,
        status: state === 'processing'
          ? 'active'
          : state === 'complete' ? 'completed' : 'pending',
      },
      {
        id: 'analyze',
        title: 'Analyze ACS Codes',
        description: 'Identifying ACS codes and performance patterns',
        icon: <Settings className="h-5 w-5" />,
        status: state === 'processing'
          ? 'active'
          : state === 'complete' ? 'completed' : 'pending',
      },
      {
        id: 'generate',
        title: 'Generate Analytics',
        description: 'Creating performance insights and recommendations',
        icon: <CheckCircle className="h-5 w-5" />,
        status: state === 'complete' ? 'completed' : 'pending',
      },
    ];

    // Handle error state
    if (state === 'error') {
      return steps.map(step => ({
        ...step,
        status: step.status === 'active' ? 'error' : step.status,
      }));
    }

    return steps;
  };

  const steps = getProcessingSteps();

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'active':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getStatusMessage = () => {
    switch (state) {
      case 'uploading':
        return 'Uploading your test results...';
      case 'processing':
        return 'Processing and analyzing your results...';
      case 'complete':
        return 'Analysis complete! View your results below.';
      case 'error':
        return 'Processing failed. Please try uploading again.';
      default:
        return 'Ready to process your test results.';
    }
  };

  const getEstimatedTime = () => {
    switch (state) {
      case 'uploading':
        return 'About 30 seconds remaining';
      case 'processing':
        return 'About 2-3 minutes remaining';
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant={state === 'error'
              ? 'destructive'
              : state === 'complete' ? 'default' : 'secondary'}
            className="px-3 py-1"
          >
            {state === 'uploading' && <Upload className="h-3 w-3 mr-1" />}
            {state === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
            {state === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
            {state === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold">{getStatusMessage()}</h3>

        {fileName && (
          <p className="text-sm text-muted-foreground">
            Processing:
            {' '}
            <span className="font-medium">{fileName}</span>
          </p>
        )}

        {getEstimatedTime() && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getEstimatedTime()}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(state === 'uploading' || state === 'processing') && (
        <div className="space-y-2">
          <Progress
            value={state === 'uploading' ? progress : 75}
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {state === 'uploading' ? 'Uploading...' : 'Processing...'}
            </span>
            <span>
              {state === 'uploading' ? `${progress}%` : '75%'}
            </span>
          </div>
        </div>
      )}

      {/* Processing Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Processing Steps
            </h4>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className={cn(
                        'font-medium text-sm',
                        step.status === 'completed' && 'text-green-700',
                        step.status === 'active' && 'text-blue-700',
                        step.status === 'error' && 'text-red-700',
                      )}
                      >
                        {step.title}
                      </h5>

                      {step.status === 'active' && (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[22px] mt-6 w-0.5 h-4 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      {state === 'processing' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h5 className="font-medium text-sm text-blue-900">
                  Advanced Analysis in Progress
                </h5>
                <p className="text-xs text-blue-700">
                  We're analyzing your test results against ACS standards to provide
                  detailed insights into your knowledge areas and performance patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {state === 'error' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-red-900">
                  Processing Failed
                </h5>
                <p className="text-xs text-red-700">
                  We encountered an issue while processing your test results.
                  This could be due to file format, quality, or network issues.
                </p>
                <div className="text-xs text-red-600 space-y-1">
                  <p>• Ensure your file is a clear PDF, image, or text document</p>
                  <p>• Check that test results are clearly visible and readable</p>
                  <p>• Try uploading a different format if available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
