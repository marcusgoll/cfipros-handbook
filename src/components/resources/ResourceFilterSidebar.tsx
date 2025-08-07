'use client';

import type { AccessLevel, ResourceCategory, ResourceFilter } from '@/types/resources';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type FilterSection = {
  categories: { value: string; count: number }[];
  tags: { value: string; count: number }[];
  accessLevels: { value: string; count: number }[];
};

type ResourceFilterSidebarProps = {
  filters: ResourceFilter;
  filterOptions?: FilterSection;
  onFilterChange: (filters: ResourceFilter) => void;
};

export function ResourceFilterSidebar({
  filters,
  filterOptions,
  onFilterChange,
}: ResourceFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    accessLevel: true,
    tags: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const categories = filters.category || [];
    const updated = checked
      ? [...categories, category as ResourceCategory]
      : categories.filter(c => c !== category);

    onFilterChange({
      ...filters,
      category: updated.length > 0 ? (updated as ResourceCategory[]) : undefined,
    });
  };

  const handleAccessLevelChange = (level: string, checked: boolean) => {
    const levels = filters.accessLevel || [];
    const updated = checked
      ? [...levels, level as AccessLevel]
      : levels.filter(l => l !== level);

    onFilterChange({
      ...filters,
      accessLevel: updated.length > 0 ? (updated as AccessLevel[]) : undefined,
    });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const tags = filters.tags || [];
    const updated = checked
      ? [...tags, tag]
      : tags.filter(t => t !== tag);

    onFilterChange({
      ...filters,
      tags: updated.length > 0 ? updated : undefined,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const categories = [
    { value: 'checklist', label: 'Checklists', count: filterOptions?.categories.find(c => c.value === 'checklist')?.count || 0 },
    { value: 'reference', label: 'Quick Reference', count: filterOptions?.categories.find(c => c.value === 'reference')?.count || 0 },
    { value: 'study-guide', label: 'Study Guides', count: filterOptions?.categories.find(c => c.value === 'study-guide')?.count || 0 },
    { value: 'weather', label: 'Weather Charts', count: filterOptions?.categories.find(c => c.value === 'weather')?.count || 0 },
    { value: 'airport-diagrams', label: 'Airport Diagrams', count: filterOptions?.categories.find(c => c.value === 'airport-diagrams')?.count || 0 },
    { value: 'regulations', label: 'Regulations', count: filterOptions?.categories.find(c => c.value === 'regulations')?.count || 0 },
    { value: 'mnemonics', label: 'Mnemonics', count: filterOptions?.categories.find(c => c.value === 'mnemonics')?.count || 0 },
  ];

  const accessLevels = [
    { value: 'free', label: 'Free', count: filterOptions?.accessLevels.find(a => a.value === 'free')?.count || 0 },
    { value: 'premium', label: 'Premium', count: filterOptions?.accessLevels.find(a => a.value === 'premium')?.count || 0 },
    { value: 'exclusive', label: 'Exclusive', count: filterOptions?.accessLevels.find(a => a.value === 'exclusive')?.count || 0 },
  ];

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 pb-4">
      <Button
        variant="ghost"
        onClick={() => toggleSection(sectionKey)}
        className="w-full justify-between p-0 h-auto font-medium text-left"
      >
        <span>{title}</span>
        {expandedSections[sectionKey]
          ? (
              <ChevronDown className="h-4 w-4" />
            )
          : (
              <ChevronRight className="h-4 w-4" />
            )}
      </Button>

      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const filterValue = filters[key as keyof ResourceFilter];
    return Array.isArray(filterValue) ? filterValue.length > 0 : !!filterValue;
  });

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <FilterSection title="Category" sectionKey="category">
          {categories.map(category => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.value}`}
                checked={filters.category?.includes(category.value as ResourceCategory) || false}
                onCheckedChange={checked =>
                  handleCategoryChange(category.value, checked as boolean)}
              />
              <Label
                htmlFor={`category-${category.value}`}
                className="flex-1 text-sm cursor-pointer"
              >
                {category.label}
              </Label>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </div>
          ))}
        </FilterSection>

        {/* Access Level */}
        <FilterSection title="Access Level" sectionKey="accessLevel">
          {accessLevels.map(level => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`access-${level.value}`}
                checked={filters.accessLevel?.includes(level.value as AccessLevel) || false}
                onCheckedChange={checked =>
                  handleAccessLevelChange(level.value, checked as boolean)}
              />
              <Label
                htmlFor={`access-${level.value}`}
                className="flex-1 text-sm cursor-pointer capitalize"
              >
                {level.label}
              </Label>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  level.value === 'free'
                    ? 'bg-green-100 text-green-800'
                    : level.value === 'premium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                }`}
              >
                {level.count}
              </Badge>
            </div>
          ))}
        </FilterSection>

        {/* Popular Tags */}
        <FilterSection title="Popular Tags" sectionKey="tags">
          {filterOptions?.tags.slice(0, 10).map(tag => (
            <div key={tag.value} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.value}`}
                checked={filters.tags?.includes(tag.value) || false}
                onCheckedChange={checked =>
                  handleTagChange(tag.value, checked as boolean)}
              />
              <Label
                htmlFor={`tag-${tag.value}`}
                className="flex-1 text-sm cursor-pointer"
              >
                #
                {tag.value}
              </Label>
              <Badge variant="outline" className="text-xs">
                {tag.count}
              </Badge>
            </div>
          ))}
        </FilterSection>
      </CardContent>
    </Card>
  );
}
