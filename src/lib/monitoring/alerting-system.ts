/**
 * Alerting System for Performance Monitoring
 *
 * Intelligent alerting system that monitors performance metrics,
 * reduces alert fatigue, and provides actionable notifications
 * for performance degradations and system issues.
 */

import * as Sentry from '@sentry/nextjs';

// Alert types and severity levels
export type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  context: Record<string, any>;
  actions?: AlertAction[];
  escalationLevel: number;
  acknowledgments: Acknowledgment[];
  suppressUntil?: number;
};

export type AlertType
  = | 'performance_degradation'
    | 'high_error_rate'
    | 'slow_response_time'
    | 'database_issues'
    | 'memory_usage'
    | 'cpu_usage'
    | 'disk_usage'
    | 'connection_pool_exhaustion'
    | 'failed_health_check'
    | 'deployment_issues'
    | 'security_incident'
    | 'custom_threshold_breach';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AlertAction = {
  label: string;
  action: string;
  parameters?: Record<string, any>;
};

export type Acknowledgment = {
  userId: string;
  timestamp: number;
  comment?: string;
};

export type AlertRule = {
  id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  conditions: AlertCondition[];
  severity: AlertSeverity;
  cooldownPeriod: number; // minutes
  escalationRules: EscalationRule[];
  suppressionRules: SuppressionRule[];
  actions: AlertAction[];
};

export type AlertCondition = {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
  threshold: number;
  duration: number; // minutes - how long condition must be true
  aggregation: 'avg' | 'max' | 'min' | 'sum' | 'count';
};

export type EscalationRule = {
  level: number;
  delayMinutes: number;
  channels: string[];
  severity: AlertSeverity;
};

export type SuppressionRule = {
  conditions: AlertCondition[];
  duration: number; // minutes
  reason: string;
};

// Alert configuration
export const ALERT_CONFIG = {
  // Default cooldown periods (minutes)
  cooldownPeriods: {
    critical: 15,
    high: 30,
    medium: 60,
    low: 120,
    info: 240,
  },

  // Maximum alerts per hour to prevent spam
  rateLimits: {
    critical: 10,
    high: 8,
    medium: 5,
    low: 3,
    info: 2,
  },

  // Auto-resolution timeouts (minutes)
  autoResolveTimeouts: {
    performance_degradation: 30,
    high_error_rate: 20,
    slow_response_time: 25,
    database_issues: 15,
    memory_usage: 45,
    cpu_usage: 45,
    disk_usage: 60,
    connection_pool_exhaustion: 10,
    failed_health_check: 5,
    deployment_issues: 60,
    security_incident: 0, // Never auto-resolve
    custom_threshold_breach: 30,
  },
} as const;

class AlertingSystem {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private metricBuffer: Map<string, Array<{ value: number; timestamp: number }>> = new Map();
  private isEnabled: boolean = true;
  private lastAlertTimes: Map<string, number> = new Map();
  private alertCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.startPeriodicEvaluation();
    this.startAutoResolution();
    this.startMetricCleanup();
  }

  /**
   * Initialize default alerting rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'slow-api-response',
        name: 'Slow API Response Times',
        type: 'slow_response_time',
        enabled: true,
        conditions: [
          {
            metric: 'api.response_time.p95',
            operator: 'gt',
            threshold: 1000,
            duration: 5,
            aggregation: 'avg',
          },
        ],
        severity: 'high',
        cooldownPeriod: 15,
        escalationRules: [
          { level: 1, delayMinutes: 0, channels: ['sentry'], severity: 'high' },
          { level: 2, delayMinutes: 10, channels: ['sentry', 'webhook'], severity: 'critical' },
        ],
        suppressionRules: [],
        actions: [
          { label: 'Check API Health', action: 'health_check' },
          { label: 'View API Metrics', action: 'view_metrics', parameters: { type: 'api' } },
        ],
      },
      {
        id: 'high-error-rate',
        name: 'High API Error Rate',
        type: 'high_error_rate',
        enabled: true,
        conditions: [
          {
            metric: 'api.error_rate',
            operator: 'gt',
            threshold: 5.0, // 5%
            duration: 3,
            aggregation: 'avg',
          },
        ],
        severity: 'critical',
        cooldownPeriod: 10,
        escalationRules: [
          { level: 1, delayMinutes: 0, channels: ['sentry'], severity: 'critical' },
        ],
        suppressionRules: [],
        actions: [
          { label: 'View Error Details', action: 'view_errors' },
          { label: 'Check Service Health', action: 'health_check' },
        ],
      },
      {
        id: 'slow-database-queries',
        name: 'Slow Database Queries',
        type: 'database_issues',
        enabled: true,
        conditions: [
          {
            metric: 'db.query.duration.p95',
            operator: 'gt',
            threshold: 500,
            duration: 5,
            aggregation: 'avg',
          },
        ],
        severity: 'medium',
        cooldownPeriod: 20,
        escalationRules: [
          { level: 1, delayMinutes: 0, channels: ['sentry'], severity: 'medium' },
          { level: 2, delayMinutes: 15, channels: ['sentry'], severity: 'high' },
        ],
        suppressionRules: [],
        actions: [
          { label: 'View Slow Queries', action: 'view_slow_queries' },
          { label: 'Check DB Health', action: 'db_health_check' },
        ],
      },
      {
        id: 'poor-core-web-vitals',
        name: 'Poor Core Web Vitals',
        type: 'performance_degradation',
        enabled: true,
        conditions: [
          {
            metric: 'web_vitals.lcp',
            operator: 'gt',
            threshold: 4000,
            duration: 10,
            aggregation: 'avg',
          },
        ],
        severity: 'medium',
        cooldownPeriod: 30,
        escalationRules: [
          { level: 1, delayMinutes: 0, channels: ['sentry'], severity: 'medium' },
        ],
        suppressionRules: [
          {
            conditions: [
              { metric: 'deployment.in_progress', operator: 'eq', threshold: 1, duration: 1, aggregation: 'max' },
            ],
            duration: 15,
            reason: 'Deployment in progress',
          },
        ],
        actions: [
          { label: 'View Performance Metrics', action: 'view_performance' },
          { label: 'Check Recent Deployments', action: 'view_deployments' },
        ],
      },
      {
        id: 'failed-health-checks',
        name: 'Failed Health Checks',
        type: 'failed_health_check',
        enabled: true,
        conditions: [
          {
            metric: 'health_check.failure_rate',
            operator: 'gt',
            threshold: 0,
            duration: 1,
            aggregation: 'max',
          },
        ],
        severity: 'critical',
        cooldownPeriod: 5,
        escalationRules: [
          { level: 1, delayMinutes: 0, channels: ['sentry'], severity: 'critical' },
        ],
        suppressionRules: [],
        actions: [
          { label: 'Check Service Status', action: 'health_check' },
          { label: 'View Recent Logs', action: 'view_logs' },
        ],
      },
    ];

    defaultRules.forEach((rule) => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Start periodic evaluation of alert rules
   */
  private startPeriodicEvaluation(): void {
    setInterval(() => {
      this.evaluateAllRules();
    }, 30000); // Evaluate every 30 seconds
  }

  /**
   * Start auto-resolution of stale alerts
   */
  private startAutoResolution(): void {
    setInterval(() => {
      this.autoResolveStaleAlerts();
    }, 60000); // Check every minute
  }

  /**
   * Start cleanup of old metrics
   */
  private startMetricCleanup(): void {
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Cleanup every 5 minutes
  }

  /**
   * Record a metric value for alert evaluation
   */
  public recordMetric(name: string, value: number, timestamp?: number): void {
    if (!this.isEnabled) {
      return;
    }

    const metricTimestamp = timestamp || Date.now();

    if (!this.metricBuffer.has(name)) {
      this.metricBuffer.set(name, []);
    }

    const buffer = this.metricBuffer.get(name)!;
    buffer.push({ value, timestamp: metricTimestamp });

    // Keep only last hour of data
    const oneHourAgo = metricTimestamp - (60 * 60 * 1000);
    const filtered = buffer.filter(entry => entry.timestamp > oneHourAgo);
    this.metricBuffer.set(name, filtered);
  }

  /**
   * Evaluate all alert rules
   */
  private evaluateAllRules(): void {
    for (const [ruleId, rule] of this.alertRules.entries()) {
      if (!rule.enabled) {
        continue;
      }

      // Check if rule is in cooldown
      if (this.isInCooldown(ruleId, rule.severity)) {
        continue;
      }

      // Check suppression rules
      if (this.isRuleSuppressed(rule)) {
        continue;
      }

      // Evaluate rule conditions
      if (this.evaluateRuleConditions(rule)) {
        this.triggerAlert(rule);
      }
    }
  }

  /**
   * Check if a rule is in cooldown period
   */
  private isInCooldown(ruleId: string, severity: AlertSeverity): boolean {
    const lastAlertTime = this.lastAlertTimes.get(ruleId);
    if (!lastAlertTime) {
      return false;
    }

    const cooldownMs = ALERT_CONFIG.cooldownPeriods[severity] * 60 * 1000;
    return Date.now() - lastAlertTime < cooldownMs;
  }

  /**
   * Check if a rule is currently suppressed
   */
  private isRuleSuppressed(rule: AlertRule): boolean {
    for (const suppressionRule of rule.suppressionRules) {
      if (this.evaluateConditions(suppressionRule.conditions)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(rule: AlertRule): boolean {
    return this.evaluateConditions(rule.conditions);
  }

  /**
   * Evaluate a set of conditions (all must be true)
   */
  private evaluateConditions(conditions: AlertCondition[]): boolean {
    return conditions.every(condition => this.evaluateCondition(condition));
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: AlertCondition): boolean {
    const metricData = this.metricBuffer.get(condition.metric);
    if (!metricData || metricData.length === 0) {
      return false;
    }

    // Filter data for the specified duration
    const durationMs = condition.duration * 60 * 1000;
    const cutoffTime = Date.now() - durationMs;
    const relevantData = metricData.filter(entry => entry.timestamp >= cutoffTime);

    if (relevantData.length === 0) {
      return false;
    }

    // Apply aggregation
    let aggregatedValue: number;
    const values = relevantData.map(entry => entry.value);

    switch (condition.aggregation) {
      case 'avg':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      default:
        return false;
    }

    // Apply operator
    switch (condition.operator) {
      case 'gt': return aggregatedValue > condition.threshold;
      case 'gte': return aggregatedValue >= condition.threshold;
      case 'lt': return aggregatedValue < condition.threshold;
      case 'lte': return aggregatedValue <= condition.threshold;
      case 'eq': return aggregatedValue === condition.threshold;
      case 'ne': return aggregatedValue !== condition.threshold;
      default: return false;
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule): void {
    // Check rate limiting
    if (this.isRateLimited(rule.type, rule.severity)) {
      return;
    }

    const alertId = this.generateAlertId(rule);
    const alert: Alert = {
      id: alertId,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: this.generateAlertMessage(rule),
      timestamp: Date.now(),
      resolved: false,
      context: this.getAlertContext(rule),
      actions: rule.actions,
      escalationLevel: 0,
      acknowledgments: [],
    };

    this.alerts.set(alertId, alert);
    this.lastAlertTimes.set(rule.id, Date.now());
    this.incrementAlertCount(rule.type);

    // Send alert through channels
    this.sendAlert(alert, rule);

    // Schedule escalation if configured
    this.scheduleEscalation(alert, rule);
  }

  /**
   * Check if alert type is rate limited
   */
  private isRateLimited(type: AlertType, severity: AlertSeverity): boolean {
    const hourlyLimit = ALERT_CONFIG.rateLimits[severity];
    const count = this.alertCounts.get(`${type}_${severity}`) || 0;
    return count >= hourlyLimit;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(rule: AlertRule): string {
    return `${rule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert message based on rule conditions
   */
  private generateAlertMessage(rule: AlertRule): string {
    const condition = rule.conditions[0]; // Use first condition for message
    const metricData = this.metricBuffer.get(condition.metric);

    if (metricData && metricData.length > 0) {
      const latestValue = metricData[metricData.length - 1].value;
      return `${rule.name}: ${condition.metric} is ${latestValue} (threshold: ${condition.threshold})`;
    }

    return `${rule.name}: Alert condition triggered`;
  }

  /**
   * Get context information for the alert
   */
  private getAlertContext(rule: AlertRule): Record<string, any> {
    const context: Record<string, any> = {
      ruleId: rule.id,
      conditions: rule.conditions,
      timestamp: new Date().toISOString(),
    };

    // Add metric values for context
    rule.conditions.forEach((condition) => {
      const metricData = this.metricBuffer.get(condition.metric);
      if (metricData && metricData.length > 0) {
        context[`${condition.metric}_current`] = metricData[metricData.length - 1].value;
        context[`${condition.metric}_threshold`] = condition.threshold;
      }
    });

    return context;
  }

  /**
   * Send alert through configured channels
   */
  private sendAlert(alert: Alert, rule: AlertRule): void {
    const escalationRule = rule.escalationRules[alert.escalationLevel];
    if (!escalationRule) {
      return;
    }

    escalationRule.channels.forEach((channel) => {
      switch (channel) {
        case 'sentry':
          this.sendToSentry(alert);
          break;
        case 'webhook':
          this.sendToWebhook(alert);
          break;
        case 'email':
          this.sendToEmail(alert);
          break;
        case 'slack':
          this.sendToSlack(alert);
          break;
        default:
          console.warn(`Unknown alert channel: ${channel}`);
      }
    });
  }

  /**
   * Send alert to Sentry
   */
  private sendToSentry(alert: Alert): void {
    Sentry.withScope((scope) => {
      scope.setTag('alert_id', alert.id);
      scope.setTag('alert_type', alert.type);
      scope.setTag('alert_severity', alert.severity);
      scope.setLevel(alert.severity === 'critical'
        ? 'error'
        : alert.severity === 'high' ? 'warning' : 'info');

      scope.setContext('alert_details', {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        timestamp: new Date(alert.timestamp).toISOString(),
        context: alert.context,
        actions: alert.actions,
      });

      scope.captureMessage(`Performance Alert: ${alert.title}`, alert.severity === 'critical' ? 'error' : 'warning');
    });
  }

  /**
   * Send alert to webhook
   */
  private sendToWebhook(alert: Alert): void {
    // Implementation would depend on webhook configuration
    console.log('Webhook alert:', alert);
  }

  /**
   * Send alert to email
   */
  private sendToEmail(alert: Alert): void {
    // Implementation would depend on email service configuration
    console.log('Email alert:', alert);
  }

  /**
   * Send alert to Slack
   */
  private sendToSlack(alert: Alert): void {
    // Implementation would depend on Slack integration
    console.log('Slack alert:', alert);
  }

  /**
   * Schedule alert escalation
   */
  private scheduleEscalation(alert: Alert, rule: AlertRule): void {
    const nextLevel = alert.escalationLevel + 1;
    const escalationRule = rule.escalationRules[nextLevel];

    if (!escalationRule) {
      return;
    }

    setTimeout(() => {
      const currentAlert = this.alerts.get(alert.id);
      if (currentAlert && !currentAlert.resolved && currentAlert.acknowledgments.length === 0) {
        currentAlert.escalationLevel = nextLevel;
        currentAlert.severity = escalationRule.severity;
        this.sendAlert(currentAlert, rule);
        this.scheduleEscalation(currentAlert, rule);
      }
    }, escalationRule.delayMinutes * 60 * 1000);
  }

  /**
   * Increment alert count for rate limiting
   */
  private incrementAlertCount(type: AlertType): void {
    const key = `${type}_hourly`;
    const count = this.alertCounts.get(key) || 0;
    this.alertCounts.set(key, count + 1);

    // Reset count after an hour
    setTimeout(() => {
      const currentCount = this.alertCounts.get(key) || 0;
      this.alertCounts.set(key, Math.max(0, currentCount - 1));
    }, 60 * 60 * 1000);
  }

  /**
   * Auto-resolve stale alerts
   */
  private autoResolveStaleAlerts(): void {
    const now = Date.now();

    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.resolved) {
        continue;
      }

      const autoResolveTimeout = ALERT_CONFIG.autoResolveTimeouts[alert.type];
      if (autoResolveTimeout === 0) {
        continue;
      } // Never auto-resolve

      const age = now - alert.timestamp;
      const timeoutMs = autoResolveTimeout * 60 * 1000;

      if (age > timeoutMs) {
        this.resolveAlert(alertId, 'system', 'Auto-resolved due to timeout');
      }
    }
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string, userId: string, comment?: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.resolved) {
      return;
    }

    alert.resolved = true;
    alert.resolvedAt = Date.now();
    alert.acknowledgments.push({
      userId,
      timestamp: Date.now(),
      comment,
    });

    // Report resolution to Sentry
    Sentry.addBreadcrumb({
      category: 'alert',
      message: `Alert resolved: ${alert.title}`,
      level: 'info',
      data: {
        alertId,
        userId,
        comment,
        duration: alert.resolvedAt - alert.timestamp,
      },
    });
  }

  /**
   * Acknowledge an alert without resolving
   */
  public acknowledgeAlert(alertId: string, userId: string, comment?: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.resolved) {
      return;
    }

    alert.acknowledgments.push({
      userId,
      timestamp: Date.now(),
      comment,
    });

    // Report acknowledgment to Sentry
    Sentry.addBreadcrumb({
      category: 'alert',
      message: `Alert acknowledged: ${alert.title}`,
      level: 'info',
      data: {
        alertId,
        userId,
        comment,
      },
    });
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

    for (const [metricName, buffer] of this.metricBuffer.entries()) {
      const filtered = buffer.filter(entry => entry.timestamp > twoHoursAgo);
      if (filtered.length === 0) {
        this.metricBuffer.delete(metricName);
      } else {
        this.metricBuffer.set(metricName, filtered);
      }
    }

    // Clean up old alerts
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.timestamp < oneDayAgo) {
        this.alerts.delete(alertId);
      }
    }
  }

  /**
   * Get all active alerts
   */
  public getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts (including resolved)
   */
  public getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alert by ID
   */
  public getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Add or update an alert rule
   */
  public setAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  /**
   * Remove an alert rule
   */
  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Get all alert rules
   */
  public getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Enable or disable the alerting system
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get alerting system status
   */
  public getStatus(): {
    enabled: boolean;
    activeAlerts: number;
    totalRules: number;
    enabledRules: number;
    metricsTracked: number;
  } {
    return {
      enabled: this.isEnabled,
      activeAlerts: this.getActiveAlerts().length,
      totalRules: this.alertRules.size,
      enabledRules: Array.from(this.alertRules.values()).filter(rule => rule.enabled).length,
      metricsTracked: this.metricBuffer.size,
    };
  }
}

// Global alerting system instance
export const alertingSystem = new AlertingSystem();

// Convenience functions
export const recordAlertMetric = (name: string, value: number, timestamp?: number) => {
  alertingSystem.recordMetric(name, value, timestamp);
};

export const resolveAlert = (alertId: string, userId: string, comment?: string) => {
  alertingSystem.resolveAlert(alertId, userId, comment);
};

export const acknowledgeAlert = (alertId: string, userId: string, comment?: string) => {
  alertingSystem.acknowledgeAlert(alertId, userId, comment);
};

export const getActiveAlerts = () => {
  return alertingSystem.getActiveAlerts();
};

// Export for cleanup
export const cleanupAlertingSystem = () => {
  alertingSystem.setEnabled(false);
};
