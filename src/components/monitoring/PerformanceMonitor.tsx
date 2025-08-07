'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HandbookPerformanceMonitor, UserExperienceMonitor } from '@/lib/monitoring/web-vitals';

type PerformanceMonitorProps = {
  children: React.ReactNode;
};

// Client-side performance monitoring component
export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  const router = useRouter();

  useEffect(() => {
    let pageLoadStart = performance.now();
    let currentPath = window.location.pathname;

    // Monitor page transitions
    const handleRouteChange = () => {
      const newPath = window.location.pathname;
      const transitionTime = performance.now() - pageLoadStart;

      HandbookPerformanceMonitor.measurePageTransition(
        currentPath,
        newPath,
        transitionTime,
      );

      currentPath = newPath;
      pageLoadStart = performance.now();
    };

    // Monitor user interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const startTime = performance.now();

      // Check for dead clicks (clicks that don't lead to any action)
      const checkForDeadClick = () => {
        setTimeout(() => {
          const interactionDelay = performance.now() - startTime;

          // If the page hasn't changed and no visual feedback occurred, it might be a dead click
          if (window.location.pathname === currentPath && interactionDelay > 200) {
            UserExperienceMonitor.trackFrustration(
              'dead_click',
              target.tagName + (target.className ? `.${target.className}` : ''),
            );
          }
        }, 300);
      };

      checkForDeadClick();
    };

    // Monitor rage clicks (multiple rapid clicks)
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    const handleRageClick = (event: MouseEvent) => {
      clickCount++;

      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        if (clickCount >= 3) {
          const target = event.target as HTMLElement;
          UserExperienceMonitor.trackFrustration(
            'rage_click',
            target.tagName + (target.className ? `.${target.className}` : ''),
          );
        }
        clickCount = 0;
      }, 1000);
    };

    // Monitor form interactions
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formName = form.name || form.id || 'unnamed_form';
      const startTime = performance.now();

      UserExperienceMonitor.trackEngagement('form_submit', {
        form_name: formName,
        form_action: form.action,
      });

      // Monitor form submission time
      form.addEventListener('submit', () => {
        const submissionTime = performance.now() - startTime;
        HandbookPerformanceMonitor.measureInteractionDelay('form_submit', submissionTime);
      }, { once: true });
    };

    // Monitor scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    let maxScrollDepth = 0;

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
      );

      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        UserExperienceMonitor.trackEngagement('scroll_depth', {
          max_scroll_depth: maxScrollDepth,
          page_path: window.location.pathname,
        });
      }, 1000);
    };

    // Monitor visibility changes (tab switching)
    const handleVisibilityChange = () => {
      UserExperienceMonitor.trackEngagement(
        document.hidden ? 'page_hidden' : 'page_visible',
        {
          timestamp: Date.now(),
        },
      );
    };

    // Add event listeners
    window.addEventListener('popstate', handleRouteChange);
    document.addEventListener('click', handleClick);
    document.addEventListener('click', handleRageClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Monitor performance observer entries
    if ('PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              HandbookPerformanceMonitor.measureInteractionDelay('long_task', entry.duration);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        return () => {
          longTaskObserver.disconnect();
        };
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }

      // Monitor layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if ((entry as any).hadRecentInput) {
              return;
            } // Ignore user-triggered shifts

            UserExperienceMonitor.trackEngagement('layout_shift', {
              value: (entry as any).value,
              sources: (entry as any).sources?.length || 0,
            });
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          layoutShiftObserver.disconnect();
        };
      } catch (error) {
        console.warn('Layout shift monitoring not supported:', error);
      }
    }

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('click', handleRageClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(clickTimer);
      clearTimeout(scrollTimeout);
    };
  }, [router]);

  return <>{children}</>;
}

// Hook for monitoring specific operations
export function usePerformanceMonitoring() {
  return {
    startLessonLoad: HandbookPerformanceMonitor.startLessonLoad,
    endLessonLoad: HandbookPerformanceMonitor.endLessonLoad,
    measureSearchTime: HandbookPerformanceMonitor.measureSearchTime,
    measureInteractionDelay: HandbookPerformanceMonitor.measureInteractionDelay,
    trackEngagement: UserExperienceMonitor.trackEngagement,
    trackTaskCompletion: UserExperienceMonitor.trackTaskCompletion,
  };
}
