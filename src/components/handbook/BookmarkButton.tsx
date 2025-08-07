'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BookmarkButtonProps = {
  lessonId: string;
  title: string;
  className?: string;
};

type BookmarkData = {
  id: string;
  title: string;
  timestamp: string;
};

export function BookmarkButton({ lessonId, title, className }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this lesson is already bookmarked
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.some(bookmark => bookmark.id === lessonId));
    setIsLoading(false);
  }, [lessonId]);

  const getBookmarks = (): BookmarkData[] => {
    try {
      const stored = localStorage.getItem('handbook-bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveBookmarks = (bookmarks: BookmarkData[]) => {
    try {
      localStorage.setItem('handbook-bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const toggleBookmark = () => {
    const bookmarks = getBookmarks();

    if (isBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== lessonId);
      saveBookmarks(updatedBookmarks);
      setIsBookmarked(false);
    } else {
      // Add bookmark
      const newBookmark: BookmarkData = {
        id: lessonId,
        title,
        timestamp: new Date().toISOString(),
      };
      bookmarks.push(newBookmark);
      saveBookmarks(bookmarks);
      setIsBookmarked(true);

      // Show confirmation toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Bookmark className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={isBookmarked ? 'default' : 'ghost'}
        size="sm"
        onClick={toggleBookmark}
        className={cn(
          'transition-all duration-200 hover:scale-105 active:scale-95',
          isBookmarked && 'bg-primary text-primary-foreground shadow-md',
          className,
        )}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked
          ? (
              <>
                <BookmarkCheck className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                <span className="ml-2 hidden sm:inline">Bookmarked</span>
              </>
            )
          : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Bookmark</span>
              </>
            )}
      </Button>

      {/* Toast notification */}
      {showToast && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-3 w-3" />
            <span>Bookmarked!</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      )}
    </div>
  );
}
