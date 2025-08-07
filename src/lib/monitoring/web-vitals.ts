import type { Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

// Core Web Vitals monitoring for the CFI Handbook
export type WebVitalsData = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
  entries?: PerformanceEntry[];
};

// Thresholds for Core Web Vitals (based on Google's recommendations)
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

// Get rating for a metric
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!thresholds) {
    return 'good';
  }

  if (value <= thresholds.good) {
    return 'good';
  }
  if (value <= thresholds.poor) {
    return 'needs-improvement';
  }
  return 'poor';
}

// Send metric to monitoring services
function sendToMonitoring(metric: Metric) {
  const vitalsData: WebVitalsData = {
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    entries: metric.entries,
  };

  // Send to Sentry
  Sentry.withScope((scope) => {
    scope.setTag('rating', vitalsData.rating);
    scope.setTag('page', window.location.pathname);
    scope.setTag('feature', 'web-vitals');
    // Disabled: scope.setMeasurement(`web_vitals_${metric.name.toLowerCase()}`, metric.value);
  });

  // Add breadcrumb for context
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value}`,
    level: vitalsData.rating === 'poor' ? 'warning' : 'info',
    data: vitalsData,
  });

  // Send to PostHog if available
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('web_vital_measured', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: vitalsData.rating,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
    });
  }

  // Report poor vitals as performance issues
  if (vitalsData.rating === 'poor') {
    Sentry.captureMessage(`Poor ${metric.name} detected`, {
      level: 'warning',
      tags: {
        feature: 'performance',
        metric: metric.name,
        rating: vitalsData.rating,
      },
      contexts: {
        performance: {
          metric: metric.name,
          value: metric.value,
          threshold: VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS]?.poor,
          page: window.location.pathname,
        },
      },
    });
  }
}

// Initialize Core Web Vitals monitoring
export function initWebVitalsMonitoring() {
  if (typeof window === 'undefined') {
    return;
  }

  // Monitor all Core Web Vitals
  onCLS(sendToMonitoring);
  onFCP(sendToMonitoring);
  onLCP(sendToMonitoring);
  onTTFB(sendToMonitoring);

  // Monitor FID (older metric) and INP (newer metric)
  onFID(sendToMonitoring);
  onINP(sendToMonitoring);
}

// Aviation-specific performance monitoring
export class HandbookPerformanceMonitor {
  private static startTimes = new Map<string, number>();

  // Monitor lesson loading time
  static startLessonLoad(lessonId: string) {
    this.startTimes.set(`lesson_${lessonId}`, performance.now());
  }

  static endLessonLoad(lessonId: string) {
    const startTime = this.startTimes.get(`lesson_${lessonId}`);
    if (!startTime) {
      return;
    }

    const loadTime = performance.now() - startTime;
    this.startTimes.delete(`lesson_${lessonId}`);

    // Send to monitoring
    Sentry.withScope((scope) => {
      scope.setTag('lesson_id', lessonId);
      scope.setTag('feature', 'handbook');
      // Disabled: scope.setMeasurement('lesson_load_time_ms', loadTime);
    });

    // Report slow lesson loads
    if (loadTime > 3000) {
      Sentry.captureMessage('Slow lesson load detected', {
        level: 'warning',
        tags: {
          feature: 'handbook',
          lesson_id: lessonId,
        },
        contexts: {
          performance: {
            load_time: loadTime,
            threshold: 3000,
          },
        },
      });
    }
  }

  // Monitor search performance
  static measureSearchTime(query: string, resultCount: number, searchTime: number) {
    Sentry.withScope((scope) => {
      scope.setTag('feature', 'search');
      scope.setTag('has_results', resultCount > 0 ? 'true' : 'false');
      // Disabled: scope.setMeasurement('search_response_time_ms', searchTime);
    });

    if (searchTime > 1000) {
      Sentry.captureMessage('Slow search detected', {
        level: 'warning',
        tags: {
          feature: 'search',
        },
        contexts: {
          search: {
            query: query.substring(0, 50),
            result_count: resultCount,
            response_time: searchTime,
          },
        },
      });
    }
  }

  // Monitor user interaction delays
  static measureInteractionDelay(interaction: string, delay: number) {
    Sentry.withScope((scope) => {
      scope.setTag('interaction_type', interaction);
      scope.setTag('feature', 'user-interaction');
      // Disabled: scope.setMeasurement('interaction_delay_ms', delay);
    });

    if (delay > 100) {
      Sentry.addBreadcrumb({
        category: 'user-interaction',
        message: `High interaction delay: ${interaction}`,
        level: 'warning',
        data: {
          interaction,
          delay,
        },
      });
    }
  }

  // Monitor page transitions
  static measurePageTransition(from: string, to: string, transitionTime: number) {
    Sentry.withScope((scope) => {
      scope.setTag('from_page', from);
      scope.setTag('to_page', to);
      scope.setTag('feature', 'navigation');
      // Disabled: scope.setMeasurement('page_transition_time_ms', transitionTime);
    });
  }
}

// User experience metrics
export class UserExperienceMonitor {
  // Track user engagement
  static trackEngagement(action: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'user-engagement',
      message: action,
      level: 'info',
      data: metadata,
    });

    // Send to PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('user_engagement', {
        action,
        ...metadata,
        timestamp: Date.now(),
        page_path: window.location.pathname,
      });
    }
  }

  // Track user frustration signals
  static trackFrustration(type: 'rage_click' | 'dead_click' | 'error_click', element?: string) {
    Sentry.captureMessage('User frustration detected', {
      level: 'warning',
      tags: {
        feature: 'user-experience',
        frustration_type: type,
      },
      contexts: {
        frustration: {
          type,
          element,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // Track task completion
  static trackTaskCompletion(task: string, success: boolean, duration?: number) {
    const level = success ? 'info' : 'warning';

    Sentry.addBreadcrumb({
      category: 'task-completion',
      message: `Task ${success ? 'completed' : 'failed'}: ${task}`,
      level,
      data: {
        task,
        success,
        duration,
      },
    });

    if (duration) {
      Sentry.withScope((scope) => {
        scope.setTag('task_name', task);
        scope.setTag('success', success.toString());
        scope.setTag('feature', 'user-task');
        // Disabled: scope.setMeasurement('task_completion_time_ms', duration);
      });
    }
  }
}

// Browser compatibility monitoring
export function monitorBrowserCapabilities() {
  if (typeof window === 'undefined') {
    return;
  }

  const capabilities = {
    webp_support: canUseWebP(),
    intersection_observer: 'IntersectionObserver' in window,
    resize_observer: 'ResizeObserver' in window,
    service_worker: 'serviceWorker' in navigator,
    local_storage: isLocalStorageAvailable(),
    session_storage: isSessionStorageAvailable(),
  };

  Sentry.setContext('browser_capabilities', capabilities);

  // Report missing critical capabilities
  const criticalCapabilities = ['intersection_observer', 'local_storage'];
  const missingCapabilities = criticalCapabilities.filter(cap => !capabilities[cap as keyof typeof capabilities]);

  if (missingCapabilities.length > 0) {
    Sentry.captureMessage('Missing critical browser capabilities', {
      level: 'warning',
      tags: { feature: 'browser-compatibility' },
      contexts: {
        missing_capabilities: {
          capabilities: missingCapabilities,
          user_agent: navigator.userAgent,
        },
      },
    });
  }
}

// Utility functions
function canUseWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function isSessionStorageAvailable(): boolean {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Initialize all monitoring on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initWebVitalsMonitoring();
    monitorBrowserCapabilities();
  });
}
