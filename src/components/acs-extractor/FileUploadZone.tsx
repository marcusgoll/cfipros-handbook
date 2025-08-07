'use client';

import {
  AlertCircle,
  CheckCircle,
  Cloud,
  File,
  FileText,
  Image,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type FileUploadZoneProps = {
  onFileUpload: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
};

type UploadFile = {
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
} & File;

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({
  onFileUpload,
  disabled = false,
  maxFiles = 3,
  className,
}: FileUploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled) {
      return;
    }

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file =>
        `${file.file.name}: ${file.errors.map((e: any) => e.message).join(', ')}`,
      );
      console.error('Rejected files:', errors);
      return;
    }

    // Check total file limit
    if (uploadFiles.length + acceptedFiles.length > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Convert to UploadFile objects
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: `${Date.now()}-${Math.random()}`,
      status: 'pending' as const,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Auto-upload if only one file or start upload process
    if (newFiles.length === 1 && uploadFiles.length === 0) {
      handleUpload([...uploadFiles, ...newFiles]);
    }
  }, [disabled, maxFiles, uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: maxFiles - uploadFiles.length,
    disabled: disabled || isUploading,
  });

  const handleUpload = async (filesToUpload: UploadFile[]) => {
    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      // Start upload for each file
      const updatedFiles = filesToUpload.map(file => ({
        ...file,
        status: 'uploading' as const,
      }));
      setUploadFiles(updatedFiles);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadFiles(prev => prev.map(file => ({
          ...file,
          progress: file.status === 'uploading' ? progress : file.progress,
        })));
      }

      // Mark as successful
      setUploadFiles(prev => prev.map(file => ({
        ...file,
        status: file.status === 'uploading' ? 'success' : file.status,
        progress: 100,
      })));

      // Call the upload handler with original File objects
      onFileUpload(filesToUpload);
    } catch (error) {
      setUploadFiles(prev => prev.map(file => ({
        ...file,
        status: 'error' as const,
        error: 'Upload failed',
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => {
      const updated = prev.filter(file => file.id !== fileId);
      // Clean up preview URLs
      const removed = prev.find(file => file.id === fileId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-6 w-6" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-6 w-6" />;
    }
    return <File className="h-6 w-6" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive && 'border-primary bg-primary/5',
              !isDragActive && 'border-muted-foreground/25 hover:border-muted-foreground/50',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <Cloud className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? 'Drop files here' : 'Upload Test Results'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag & drop your files here, or click to browse
                </p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: PDF, JPG, PNG, TXT</p>
                <p>Maximum file size: 10MB</p>
                <p>
                  Maximum files:
                  {maxFiles}
                  {' '}
                  (
                  {maxFiles - uploadFiles.length}
                  {' '}
                  remaining)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                Files (
                {uploadFiles.length}
                )
              </h4>

              {uploadFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)}
                      {' '}
                      MB
                    </p>

                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2 h-2" />
                    )}

                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {file.preview && (
                    <div className="flex-shrink-0">
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="h-12 w-12 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            {uploadFiles.length > 0 && !uploadFiles.some(f => f.status === 'success') && !isUploading && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleUpload(uploadFiles)}
                  disabled={disabled || uploadFiles.length === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Process
                  {' '}
                  {uploadFiles.length}
                  {' '}
                  File
                  {uploadFiles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Free Tier Limitation Notice */}
      {uploadFiles.length >= maxFiles && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached the free tier limit of
            {' '}
            {maxFiles}
            {' '}
            files.
            <Button variant="link" className="p-0 h-auto ml-1">
              Upgrade to Premium
            </Button>
            {' '}
            for unlimited file uploads and result history.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
