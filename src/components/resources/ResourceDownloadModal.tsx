'use client';

import type { Resource } from '@/types/resources';
import {
  AlertTriangle,
  CheckCircle,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Star,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatFileSize } from '@/lib/utils';

type ResourceDownloadModalProps = {
  resource: Resource;
  open: boolean;
  onClose: () => void;
};

export function ResourceDownloadModal({ resource, open, onClose }: ResourceDownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/resources/${resource.id}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Download failed');
      }

      const result = await response.json();

      // Complete the progress
      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadComplete(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setDownloadComplete(false);
        setDownloadProgress(0);
      }, 2000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
      setDownloadProgress(0);
    } finally {
      setIsDownloading(false);
    }
  };

  const getAccessLevelInfo = () => {
    switch (resource.accessLevel) {
      case 'free':
        return {
          icon: null,
          label: 'Free Resource',
          description: 'Available to all users',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
        };
      case 'premium':
        return {
          icon: <Star className="h-4 w-4" />,
          label: 'Premium Resource',
          description: 'Requires premium subscription',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
        };
      case 'exclusive':
        return {
          icon: <Crown className="h-4 w-4" />,
          label: 'Exclusive Resource',
          description: 'Lifetime members only',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
        };
      default:
        return {
          icon: null,
          label: 'Resource',
          description: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const accessInfo = getAccessLevelInfo();

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow
    window.open('/pricing', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {resource.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Preview */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${accessInfo.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                {accessInfo.icon}
                <span className={`font-medium ${accessInfo.color}`}>
                  {accessInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{accessInfo.description}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {resource.description}
            </p>

            {/* Resource Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>
                  {resource.downloadCount}
                  {' '}
                  downloads
                </span>
              </div>
              <div className="text-gray-600">
                {formatFileSize(resource.fileSize)}
              </div>
              <div className="text-gray-600">
                Updated
                {' '}
                {formatDate(resource.updatedAt)}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {resource.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Additional Metadata */}
            {resource.metadata.aircraftType && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Aircraft Types: </span>
                  <span className="text-gray-600">
                    {resource.metadata.aircraftType.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Download Status */}
          {downloadError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {downloadError}
                {downloadError.includes('Premium subscription') && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleUpgrade}
                    className="ml-2 text-red-800 underline p-0 h-auto"
                  >
                    Upgrade Now
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {downloadComplete && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Download completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading...</span>
                <span>
                  {downloadProgress}
                  %
                </span>
              </div>
              <Progress value={downloadProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <div className="flex gap-2">
              {resource.metadata.sourceUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(resource.metadata.sourceUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source
                </Button>
              )}

              <Button
                onClick={handleDownload}
                disabled={isDownloading || downloadComplete}
                className="flex items-center gap-2"
              >
                {resource.accessLevel !== 'free' && <Lock className="h-4 w-4" />}
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>

          {/* Related Resources Preview */}
          {resource.metadata.relatedAcsCodes && resource.metadata.relatedAcsCodes.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Related ACS Codes</h4>
              <div className="flex flex-wrap gap-2">
                {resource.metadata.relatedAcsCodes.map(code => (
                  <Badge key={code} variant="secondary" className="text-xs">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
