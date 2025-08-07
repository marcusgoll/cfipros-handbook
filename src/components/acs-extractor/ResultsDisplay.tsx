'use client';

import {
  AlertCircle,
  Award,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type ACSCode = {
  code: string;
  title: string;
  description: string;
  category: string;
  performance: 'excellent' | 'proficient' | 'needs-improvement' | 'unsatisfactory';
  score?: number;
};

type ExtractedResult = {
  id: string;
  fileName: string;
  extractedCodes: ACSCode[];
  analytics: {
    overallScore: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  uploadedAt: Date;
};

type ResultsDisplayProps = {
  result: ExtractedResult;
  className?: string;
};

export function ResultsDisplay({ result, className }: ResultsDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  // Filter codes based on search and filters
  const filteredCodes = result.extractedCodes.filter((code) => {
    const matchesSearch = searchTerm === ''
      || code.code.toLowerCase().includes(searchTerm.toLowerCase())
      || code.title.toLowerCase().includes(searchTerm.toLowerCase())
      || code.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    const matchesPerformance = selectedPerformance === 'all' || code.performance === selectedPerformance;

    return matchesSearch && matchesCategory && matchesPerformance;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(result.extractedCodes.map(code => code.category)))];
  const performances = ['all', 'excellent', 'proficient', 'needs-improvement', 'unsatisfactory'];

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'proficient':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unsatisfactory':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Award className="h-4 w-4" />;
      case 'proficient':
        return <Target className="h-4 w-4" />;
      case 'needs-improvement':
        return <TrendingUp className="h-4 w-4" />;
      case 'unsatisfactory':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.uploadedAt.toLocaleDateString()}
                  {' '}
                  at
                  {result.uploadedAt.toLocaleTimeString()}
                </div>
                <span>•</span>
                <span>
                  {result.extractedCodes.length}
                  {' '}
                  ACS codes identified
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
                <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Save Results
                <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ACS codes, titles, or descriptions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedPerformance}
                onChange={e => setSelectedPerformance(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {performances.map(performance => (
                  <option key={performance} value={performance}>
                    {performance === 'all'
                      ? 'All Performance'
                      : performance.charAt(0).toUpperCase() + performance.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedCategory !== 'all' || selectedPerformance !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-3 w-3" />
              Showing
              {' '}
              {filteredCodes.length}
              {' '}
              of
              {' '}
              {result.extractedCodes.length}
              {' '}
              codes
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedPerformance('all');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACS Codes List */}
      <div className="space-y-4">
        {filteredCodes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No ACS codes match your current filters.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedPerformance('all');
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCodes.map((code, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Code Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {code.code}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {code.category}
                        </Badge>
                        <Badge
                          className={cn('text-xs', getPerformanceColor(code.performance))}
                        >
                          {getPerformanceIcon(code.performance)}
                          <span className="ml-1 capitalize">
                            {code.performance.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{code.title}</h3>
                    </div>

                    {code.score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {code.score}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {code.description}
                  </p>

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View ACS Details
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Study Materials
                        <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
                      </Button>
                    </div>

                    {code.performance === 'needs-improvement' || code.performance === 'unsatisfactory'
                      ? (
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Focus Area
                          </Badge>
                        )
                      : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Premium Upgrade Notice */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-orange-900">Unlock Premium Features</h4>
              <p className="text-sm text-orange-700">
                Save your results, export detailed reports, and access study materials for each ACS code.
              </p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
