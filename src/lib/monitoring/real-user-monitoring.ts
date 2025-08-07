/**
 * Real User Monitoring (RUM)
 *
 * Comprehensive real user monitoring that tracks actual user interactions,
 * session behavior, and performance metrics from real users in production.
 */

import * as Sentry from '@sentry/nextjs';

// RUM metric types
export type UserSession = {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  actions: UserAction[];
  performance: SessionPerformance;
  userAgent: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
  device: DeviceInfo;
  errors: SessionError[];
  customEvents: CustomEvent[];
};

export type UserAction = {
  type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'search' | 'custom';
  target: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
};

export type SessionPerformance = {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay?: number;
  interactionToNextPaint?: number;
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    timeToFirstByte: number;
  };
  resourceMetrics: {
    totalRequests: number;
    totalSize: number;
    cacheHitRate: number;
  };
};

export type DeviceInfo = {
  type: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  pixelRatio: number;
  connectionType?: string;
  effectiveConnectionType?: string;
  memorySize?: number;
  cores?: number;
};

export type SessionError = {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  lineNumber?: number;
  colNumber?: number;
  source: 'javascript' | 'network' | 'console' | 'unhandledrejection';
};

export type CustomEvent = {
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
  value?: number;
};

// RUM configuration
export const RUM_CONFIG = {
  // Session settings
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxSessionDuration: 4 * 60 * 60 * 1000, // 4 hours
  maxActionsPerSession: 1000,
  maxErrorsPerSession: 50,

  // Sampling rates
  sampling: {
    sessions: 0.1, // 10% of sessions
    errors: 1.0, // 100% of errors
    performance: 0.05, // 5% for detailed performance
  },

  // Performance thresholds
  performanceThresholds: {
    pageLoadTime: { good: 2000, poor: 4000 },
    timeToInteractive: { good: 3000, poor: 6000 },
    firstContentfulPaint: { good: 1500, poor: 3000 },
    largestContentfulPaint: { good: 2500, poor: 4000 },
    cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
    firstInputDelay: { good: 100, poor: 300 },
  },

  // Feature flags
  features: {
    trackClicks: true,
    trackScrolling: true,
    trackFormSubmissions: true,
    trackNavigations: true,
    trackErrors: true,
    trackPerformance: true,
    trackResourceTiming: true,
    recordUserInteractions: true,
  },
} as const;

class RealUserMonitor {
  private currentSession: UserSession | null = null;
  private isEnabled: boolean = true;
  private observers: Map<string, any> = new Map();
  private eventListeners: Array<{ element: any; event: string; handler: any }> = [];
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient && this.shouldStartMonitoring()) {
      this.initializeSession();
      this.setupEventListeners();
      this.setupPerformanceObservers();
      this.setupErrorHandling();
      this.startSessionManagement();
    }
  }

  /**
   * Determine if monitoring should start based on sampling
   */
  private shouldStartMonitoring(): boolean {
    return Math.random() < RUM_CONFIG.sampling.sessions;
  }

  /**
   * Initialize a new user session
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();

    this.currentSession = {
      sessionId,
      userId: this.getCurrentUserId(),
      startTime,
      lastActivity: startTime,
      pageViews: 1,
      actions: [],
      performance: this.initializeSessionPerformance(),
      userAgent: navigator.userAgent,
      location: this.getLocationInfo(),
      device: this.getDeviceInfo(),
      errors: [],
      customEvents: [],
    };

    // Report session start to Sentry
    Sentry.addBreadcrumb({
      category: 'rum',
      message: 'Session started',
      level: 'info',
      data: {
        sessionId,
        device: this.currentSession.device.type,
        userId: this.currentSession.userId,
      },
    });

    // Set user context
    Sentry.setUser({
      id: this.currentSession.userId,
    });

    // Set session tags
    Sentry.setTag('session_id', sessionId);
    Sentry.setTag('device_type', this.currentSession.device.type);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID from authentication context
   */
  private getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from Clerk
      if ((window as any).Clerk?.user) {
        return (window as any).Clerk.user.id;
      }

      // Fallback to any stored user context
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.id;
      }
    } catch (error) {
      console.warn('Could not retrieve user ID:', error);
    }
    return undefined;
  }

  /**
   * Initialize session performance metrics
   */
  private initializeSessionPerformance(): SessionPerformance {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      timeToInteractive: 0, // Will be updated
      firstContentfulPaint: 0, // Will be updated
      largestContentfulPaint: 0, // Will be updated
      cumulativeLayoutShift: 0, // Will be updated
      navigationTiming: {
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        timeToFirstByte: navigation ? navigation.responseStart - navigation.fetchStart : 0,
      },
      resourceMetrics: {
        totalRequests: 0,
        totalSize: 0,
        cacheHitRate: 0,
      },
    };
  }

  /**
   * Get location information (approximate)
   */
  private getLocationInfo(): UserSession['location'] {
    // This would typically be populated by server-side GeoIP
    // or a client-side service
    return {
      country: undefined,
      region: undefined,
      city: undefined,
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const screen = window.screen;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Determine device type
    let deviceType: DeviceInfo['type'] = 'desktop';
    if (viewport.width <= 768) {
      deviceType = 'mobile';
    } else if (viewport.width <= 1024) {
      deviceType = 'tablet';
    }

    const deviceInfo: DeviceInfo = {
      type: deviceType,
      screenSize: { width: screen.width, height: screen.height },
      viewportSize: viewport,
      pixelRatio: window.devicePixelRatio || 1,
    };

    // Add connection information if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      deviceInfo.connectionType = connection.type;
      deviceInfo.effectiveConnectionType = connection.effectiveType;
    }

    // Add hardware information if available
    if ((navigator as any).deviceMemory) {
      deviceInfo.memorySize = (navigator as any).deviceMemory;
    }
    if ((navigator as any).hardwareConcurrency) {
      deviceInfo.cores = (navigator as any).hardwareConcurrency;
    }

    return deviceInfo;
  }

  /**
   * Setup event listeners for user interactions
   */
  private setupEventListeners(): void {
    if (!this.currentSession) {
      return;
    }

    // Click tracking
    if (RUM_CONFIG.features.trackClicks) {
      const clickHandler = (event: MouseEvent) => {
        this.recordUserAction('click', this.getElementSelector(event.target), {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        });
      };
      document.addEventListener('click', clickHandler, true);
      this.eventListeners.push({ element: document, event: 'click', handler: clickHandler });
    }

    // Scroll tracking
    if (RUM_CONFIG.features.trackScrolling) {
      let scrollTimeout: number;
      const scrollHandler = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          this.recordUserAction('scroll', 'window', {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            maxScroll: Math.max(document.body.scrollHeight - window.innerHeight, 0),
          });
        }, 100);
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      this.eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler });
    }

    // Form submission tracking
    if (RUM_CONFIG.features.trackFormSubmissions) {
      const formHandler = (event: Event) => {
        const form = event.target as HTMLFormElement;
        this.recordUserAction('form_submit', this.getElementSelector(form), {
          action: form.action,
          method: form.method,
          elementCount: form.elements.length,
        });
      };
      document.addEventListener('submit', formHandler, true);
      this.eventListeners.push({ element: document, event: 'submit', handler: formHandler });
    }

    // Page visibility changes
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        this.updateLastActivity();
        this.reportSessionData();
      } else if (document.visibilityState === 'visible') {
        this.updateLastActivity();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    this.eventListeners.push({ element: document, event: 'visibilitychange', handler: visibilityHandler });

    // Beforeunload to capture session end
    const beforeUnloadHandler = () => {
      this.endSession();
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
    this.eventListeners.push({ element: window, event: 'beforeunload', handler: beforeUnloadHandler });
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    if (!this.currentSession || !('PerformanceObserver' in window)) {
      return;
    }

    // Web Vitals observer
    const webVitalsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          this.currentSession!.performance.firstContentfulPaint = entry.startTime;
        } else if (entry.entryType === 'largest-contentful-paint') {
          this.currentSession!.performance.largestContentfulPaint = entry.startTime;
        } else if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.currentSession!.performance.cumulativeLayoutShift += (entry as any).value;
        } else if (entry.entryType === 'first-input') {
          this.currentSession!.performance.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });

      this.checkPerformanceThresholds();
    });

    // Observe different entry types
    const entryTypes = ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'];
    entryTypes.forEach((type) => {
      try {
        webVitalsObserver.observe({ type, buffered: true });
      } catch (e) {
        console.warn(`Cannot observe ${type}:`, e);
      }
    });

    this.observers.set('webVitals', webVitalsObserver);

    // Resource timing observer
    if (RUM_CONFIG.features.trackResourceTiming) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];

        entries.forEach((entry) => {
          this.currentSession!.performance.resourceMetrics.totalRequests++;
          this.currentSession!.performance.resourceMetrics.totalSize += entry.transferSize || 0;

          if (entry.transferSize === 0) {
            this.currentSession!.performance.resourceMetrics.cacheHitRate++;
          }
        });

        // Calculate cache hit rate
        const { totalRequests, cacheHitRate } = this.currentSession!.performance.resourceMetrics;
        this.currentSession!.performance.resourceMetrics.cacheHitRate
          = totalRequests > 0 ? (cacheHitRate / totalRequests) * 100 : 0;
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    if (!this.currentSession || !RUM_CONFIG.features.trackErrors) {
      return;
    }

    // JavaScript errors
    const errorHandler = (event: ErrorEvent) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: event.filename,
        lineNumber: event.lineno,
        colNumber: event.colno,
        source: 'javascript',
      });
    };
    window.addEventListener('error', errorHandler);
    this.eventListeners.push({ element: window, event: 'error', handler: errorHandler });

    // Unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        source: 'unhandledrejection',
      });
    };
    window.addEventListener('unhandledrejection', rejectionHandler);
    this.eventListeners.push({ element: window, event: 'unhandledrejection', handler: rejectionHandler });
  }

  /**
   * Start session management
   */
  private startSessionManagement(): void {
    // Update activity and check session timeout
    setInterval(() => {
      if (this.currentSession) {
        const now = Date.now();
        const inactiveTime = now - this.currentSession.lastActivity;

        if (inactiveTime > RUM_CONFIG.sessionTimeout) {
          this.endSession();
          this.initializeSession();
        } else if (now - this.currentSession.startTime > RUM_CONFIG.maxSessionDuration) {
          this.endSession();
          this.initializeSession();
        }
      }
    }, 60000); // Check every minute

    // Periodic session data reporting
    setInterval(() => {
      this.reportSessionData();
    }, 5 * 60 * 1000); // Report every 5 minutes
  }

  /**
   * Record user action
   */
  public recordUserAction(
    type: UserAction['type'],
    target: string,
    metadata?: Record<string, any>,
  ): void {
    if (!this.currentSession || !this.isEnabled) {
      return;
    }

    const action: UserAction = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    };

    this.currentSession.actions.push(action);
    this.updateLastActivity();

    // Limit actions per session
    if (this.currentSession.actions.length > RUM_CONFIG.maxActionsPerSession) {
      this.currentSession.actions = this.currentSession.actions.slice(-RUM_CONFIG.maxActionsPerSession / 2);
    }

    // Report to Sentry
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: `${type}: ${target}`,
      level: 'info',
      data: metadata,
    });
  }

  /**
   * Record custom event
   */
  public recordCustomEvent(name: string, properties?: Record<string, any>, value?: number): void {
    if (!this.currentSession || !this.isEnabled) {
      return;
    }

    const customEvent: CustomEvent = {
      name,
      timestamp: Date.now(),
      properties,
      value,
    };

    this.currentSession.customEvents.push(customEvent);
    this.updateLastActivity();

    // Report to Sentry
    Sentry.withScope((scope) => {
      Object.entries(properties).forEach(([key, val]) => {
        scope.setTag(key, val);
      });
      // Disabled: scope.setMeasurement(`custom_${name}`, 1);

      if (value !== undefined) {
        // Disabled: scope.setMeasurement(`custom_${name}_value`, value);
      }
    });
  }

  /**
   * Record session error
   */
  private recordError(error: SessionError): void {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.errors.push(error);

    // Limit errors per session
    if (this.currentSession.errors.length > RUM_CONFIG.maxErrorsPerSession) {
      this.currentSession.errors = this.currentSession.errors.slice(-RUM_CONFIG.maxErrorsPerSession / 2);
    }

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('source', error.source);
      scope.setTag('session_id', this.currentSession!.sessionId);
      scope.setContext('error_details', {
        url: error.url,
        lineNumber: error.lineNumber,
        colNumber: error.colNumber,
        timestamp: new Date(error.timestamp).toISOString(),
      });
      scope.captureMessage(`RUM Error: ${error.message}`, 'error');
    });
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
    }
  }

  /**
   * Get element selector for tracking
   */
  private getElementSelector(element: any): string {
    if (!element || element === document) {
      return 'document';
    }
    if (element === window) {
      return 'window';
    }

    try {
      if (element.id) {
        return `#${element.id}`;
      }
      if (element.className) {
        return `.${element.className.split(' ')[0]}`;
      }
      if (element.tagName) {
        return element.tagName.toLowerCase();
      }
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Check performance thresholds and alert
   */
  private checkPerformanceThresholds(): void {
    if (!this.currentSession) {
      return;
    }

    const perf = this.currentSession.performance;
    const thresholds = RUM_CONFIG.performanceThresholds;

    // Check each metric against thresholds
    const checks = [
      { name: 'pageLoadTime', value: perf.pageLoadTime, threshold: thresholds.pageLoadTime },
      { name: 'firstContentfulPaint', value: perf.firstContentfulPaint, threshold: thresholds.firstContentfulPaint },
      { name: 'largestContentfulPaint', value: perf.largestContentfulPaint, threshold: thresholds.largestContentfulPaint },
      { name: 'cumulativeLayoutShift', value: perf.cumulativeLayoutShift, threshold: thresholds.cumulativeLayoutShift },
    ];

    checks.forEach((check) => {
      if (check.value > check.threshold.poor) {
        Sentry.withScope((scope) => {
          scope.setTag('performance_issue', check.name);
          scope.setTag('session_id', this.currentSession!.sessionId);
          scope.setTag('device_type', this.currentSession!.device.type);

          scope.setContext('performance_context', {
            metric: check.name,
            value: check.value,
            threshold: check.threshold,
            sessionId: this.currentSession!.sessionId,
            device: this.currentSession!.device,
          });

          scope.captureMessage(`Poor RUM performance: ${check.name}`, 'warning');
        });
      }
    });
  }

  /**
   * Report session data to analytics
   */
  private reportSessionData(): void {
    if (!this.currentSession) {
      return;
    }

    const sessionData = {
      sessionId: this.currentSession.sessionId,
      duration: Date.now() - this.currentSession.startTime,
      pageViews: this.currentSession.pageViews,
      actionCount: this.currentSession.actions.length,
      errorCount: this.currentSession.errors.length,
      customEventCount: this.currentSession.customEvents.length,
      performance: this.currentSession.performance,
      device: this.currentSession.device,
    };

    // Report session metrics to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('device_type', this.currentSession.device.type);
      scope.setTag('session_id', this.currentSession.sessionId);
      // Disabled: scope.setMeasurement('session_duration_ms', sessionData.duration);
      // Disabled: scope.setMeasurement('session_page_views', sessionData.pageViews);
      // Disabled: scope.setMeasurement('session_actions', sessionData.actionCount);

      // Report performance metrics
      Object.entries(this.currentSession.performance).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0) {
          // Disabled: scope.setMeasurement(`performance_${key}`, value);
        }
      });
    });
  }

  /**
   * End current session
   */
  private endSession(): void {
    if (!this.currentSession) {
      return;
    }

    // Final session report
    this.reportSessionData();

    // Report session summary
    Sentry.addBreadcrumb({
      category: 'rum',
      message: 'Session ended',
      level: 'info',
      data: {
        sessionId: this.currentSession.sessionId,
        duration: Date.now() - this.currentSession.startTime,
        pageViews: this.currentSession.pageViews,
        actions: this.currentSession.actions.length,
        errors: this.currentSession.errors.length,
      },
    });

    this.currentSession = null;
  }

  /**
   * Get current session data
   */
  public getCurrentSession(): UserSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Enable or disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled && this.currentSession) {
      this.endSession();
    }
  }

  /**
   * Clean up observers and event listeners
   */
  public cleanup(): void {
    // Disconnect observers
    this.observers.forEach((observer) => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers.clear();

    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {
        console.warn('Error removing event listener:', e);
      }
    });
    this.eventListeners = [];

    // End session
    if (this.currentSession) {
      this.endSession();
    }

    this.isEnabled = false;
  }
}

// Global RUM instance
export const realUserMonitor = new RealUserMonitor();

// Convenience functions
export const trackCustomEvent = (name: string, properties?: Record<string, any>, value?: number) => {
  realUserMonitor.recordCustomEvent(name, properties, value);
};

export const trackUserAction = (type: UserAction['type'], target: string, metadata?: Record<string, any>) => {
  realUserMonitor.recordUserAction(type, target, metadata);
};

// Export for cleanup
export const cleanupRealUserMonitoring = () => {
  realUserMonitor.cleanup();
};
