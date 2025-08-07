'use client';

import type { Resource } from '@/types/resources';
import {
  Crown,
  Download,
  File,
  FileText,
  Heart,
  Image,
  Lock,
  Star,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, formatFileSize } from '@/lib/utils';

type ResourceCardProps = {
  resource: Resource;
  onDownload: () => void;
  layout?: 'grid' | 'list';
};

export function ResourceCard({ resource, onDownload, layout = 'grid' }: ResourceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'free':
        return null;
      case 'premium':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'exclusive':
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'premium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'exclusive':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType.includes('image')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'checklist': 'bg-blue-100 text-blue-800',
      'reference': 'bg-green-100 text-green-800',
      'study-guide': 'bg-purple-100 text-purple-800',
      'weather': 'bg-indigo-100 text-indigo-800',
      'airport-diagrams': 'bg-orange-100 text-orange-800',
      'regulations': 'bg-red-100 text-red-800',
      'interactive': 'bg-pink-100 text-pink-800',
      'mnemonics': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorite toggle API call
    setIsFavorited(!isFavorited);
  };

  if (layout === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {getFileTypeIcon(resource.fileType)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {resource.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <Badge className={getCategoryColor(resource.category)}>
                  {resource.category.replace('-', ' ')}
                </Badge>

                <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getAccessLevelColor(resource.accessLevel)}`}>
                  {getAccessLevelIcon(resource.accessLevel)}
                  <span className="capitalize">{resource.accessLevel}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {resource.downloadCount}
                </div>

                <span className="text-sm text-gray-500">
                  {formatFileSize(resource.fileSize)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {resource.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +
                    {resource.tags.length - 4}
                    {' '}
                    more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className={isFavorited ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-gray-600'}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>

              <Button onClick={onDownload} className="flex items-center gap-2">
                {resource.accessLevel !== 'free' && <Lock className="h-4 w-4" />}
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid layout
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getFileTypeIcon(resource.fileType)}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getAccessLevelColor(resource.accessLevel)}`}>
              {getAccessLevelIcon(resource.accessLevel)}
              <span className="capitalize">{resource.accessLevel}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isFavorited ? 'text-red-500 hover:text-red-700 opacity-100' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
          {resource.title}
        </h3>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-1">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
          {resource.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Badge className={getCategoryColor(resource.category)}>
              {resource.category.replace('-', ' ')}
            </Badge>
            <span className="text-gray-500">{formatFileSize(resource.fileSize)}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {resource.downloadCount}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +
                {resource.tags.length - 3}
              </Badge>
            )}
          </div>

          <Button
            onClick={onDownload}
            className="w-full flex items-center gap-2"
            size="sm"
          >
            {resource.accessLevel !== 'free' && <Lock className="h-4 w-4" />}
            <Download className="h-4 w-4" />
            Download
          </Button>

          <div className="text-xs text-gray-500 text-center">
            Updated
            {' '}
            {formatDate(resource.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
