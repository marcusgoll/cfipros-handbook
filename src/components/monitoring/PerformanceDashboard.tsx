/**
 * Performance Dashboard Component
 *
 * Real-time performance monitoring dashboard that displays
 * system health, metrics, and alerts in a comprehensive view.
 */

'use client';

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Database,
  Eye,
  Globe,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Performance data interfaces
type MetricData = {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  threshold?: { warning: number; critical: number };
  history: Array<{ timestamp: number; value: number }>;
};

type AlertData = {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
};

type SystemHealth = {
  overall: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  frontend: 'healthy' | 'degraded' | 'down';
  railway: 'healthy' | 'degraded' | 'down';
};

const PerformanceDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    api: 'healthy',
    database: 'healthy',
    frontend: 'healthy',
    railway: 'healthy',
  });

  const [coreMetrics, setCoreMetrics] = useState<MetricData[]>([]);
  const [webVitals, setWebVitals] = useState<MetricData[]>([]);
  const [apiMetrics, setApiMetrics] = useState<MetricData[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<MetricData[]>([]);
  const [railwayMetrics, setRailwayMetrics] = useState<MetricData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertData[]>([]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  /**
   * Fetch performance data from monitoring APIs
   */
  const fetchPerformanceData = useCallback(async () => {
    try {
      setIsLoading(true);

      // In a real implementation, these would be API calls
      // For now, we'll simulate the data structure

      // Core Web Vitals
      setWebVitals([
        {
          name: 'Largest Contentful Paint',
          value: 2400,
          unit: 'ms',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 2500, critical: 4000 },
          history: generateMockHistory(2400, 24),
        },
        {
          name: 'First Input Delay',
          value: 85,
          unit: 'ms',
          trend: 'down',
          status: 'good',
          threshold: { warning: 100, critical: 300 },
          history: generateMockHistory(85, 24),
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.08,
          unit: '',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 0.1, critical: 0.25 },
          history: generateMockHistory(0.08, 24),
        },
        {
          name: 'Time to First Byte',
          value: 650,
          unit: 'ms',
          trend: 'up',
          status: 'warning',
          threshold: { warning: 800, critical: 1800 },
          history: generateMockHistory(650, 24),
        },
      ]);

      // API Metrics
      setApiMetrics([
        {
          name: 'Average Response Time',
          value: 245,
          unit: 'ms',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 500, critical: 1000 },
          history: generateMockHistory(245, 24),
        },
        {
          name: 'Error Rate',
          value: 1.2,
          unit: '%',
          trend: 'down',
          status: 'good',
          threshold: { warning: 2.0, critical: 5.0 },
          history: generateMockHistory(1.2, 24),
        },
        {
          name: 'Throughput',
          value: 1250,
          unit: 'req/min',
          trend: 'up',
          status: 'good',
          history: generateMockHistory(1250, 24),
        },
        {
          name: 'P95 Response Time',
          value: 580,
          unit: 'ms',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 800, critical: 1500 },
          history: generateMockHistory(580, 24),
        },
      ]);

      // Database Metrics
      setDatabaseMetrics([
        {
          name: 'Query Response Time',
          value: 125,
          unit: 'ms',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 300, critical: 1000 },
          history: generateMockHistory(125, 24),
        },
        {
          name: 'Connection Pool Usage',
          value: 65,
          unit: '%',
          trend: 'up',
          status: 'good',
          threshold: { warning: 80, critical: 95 },
          history: generateMockHistory(65, 24),
        },
        {
          name: 'Slow Queries',
          value: 3,
          unit: 'count',
          trend: 'down',
          status: 'good',
          threshold: { warning: 10, critical: 25 },
          history: generateMockHistory(3, 24),
        },
      ]);

      // Railway Metrics
      setRailwayMetrics([
        {
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          trend: 'stable',
          status: 'good',
          threshold: { warning: 70, critical: 85 },
          history: generateMockHistory(45, 24),
        },
        {
          name: 'Memory Usage',
          value: 68,
          unit: '%',
          trend: 'up',
          status: 'good',
          threshold: { warning: 80, critical: 90 },
          history: generateMockHistory(68, 24),
        },
        {
          name: 'Deployment Health',
          value: 100,
          unit: '%',
          trend: 'stable',
          status: 'good',
          history: generateMockHistory(100, 24),
        },
      ]);

      // Mock alerts
      setActiveAlerts([
        {
          id: '1',
          type: 'performance_degradation',
          severity: 'medium',
          title: 'Increased Response Time',
          message: 'API response time has increased by 15% over the last hour',
          timestamp: Date.now() - 900000, // 15 minutes ago
          resolved: false,
        },
      ]);

      // Update system health based on metrics
      updateSystemHealth();

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate mock historical data
   */
  const generateMockHistory = (baseValue: number, hours: number): Array<{ timestamp: number; value: number }> => {
    const history = [];
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    for (let i = hours; i >= 0; i--) {
      const timestamp = now - (i * hourMs);
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const value = baseValue * (1 + variation);
      history.push({ timestamp, value });
    }

    return history;
  };

  /**
   * Update system health based on current metrics
   */
  const updateSystemHealth = useCallback(() => {
    // This would analyze actual metrics to determine health
    setSystemHealth({
      overall: 'healthy',
      api: 'healthy',
      database: 'healthy',
      frontend: 'healthy',
      railway: 'healthy',
    });
  }, []);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  /**
   * Set up auto-refresh
   */
  useEffect(() => {
    fetchPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPerformanceData, autoRefresh, refreshInterval]);

  /**
   * Get status color for metrics
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  /**
   * Get trend icon
   */
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  /**
   * Render metric card
   */
  const renderMetricCard = (metric: MetricData) => (
    <Card key={metric.name} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          {getTrendIcon(metric.trend)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </span>
            <span className="text-sm text-gray-500">{metric.unit}</span>
          </div>

          {metric.threshold && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Threshold</span>
                <span>
                  {metric.threshold.warning}
                  {metric.unit}
                </span>
              </div>
              <Progress
                value={(metric.value / metric.threshold.critical) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render system health overview
   */
  const renderSystemHealth = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Overall system status and component health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(systemHealth).map(([component, status]) => (
            <div key={component} className="text-center">
              <div className="flex items-center justify-center mb-2">
                {status === 'healthy'
                  ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    )
                  : status === 'degraded'
                    ? (
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      )
                    : (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      )}
              </div>
              <p className="text-sm font-medium capitalize">{component}</p>
              <p className={`text-xs ${
                status === 'healthy'
                  ? 'text-green-600'
                  : status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}
              >
                {status}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render active alerts
   */
  const renderActiveAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Active Alerts (
          {activeAlerts.length}
          )
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0
          ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No active alerts. System is running normally.
              </p>
            )
          : (
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <Alert
                    key={alert.id}
                    className={
                      alert.severity === 'critical'
                        ? 'border-red-200 bg-red-50'
                        : alert.severity === 'high'
                          ? 'border-orange-200 bg-orange-50'
                          : alert.severity === 'medium'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-blue-200 bg-blue-50'
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <Badge variant={
                        alert.severity === 'critical'
                          ? 'destructive'
                          : alert.severity === 'high'
                            ? 'destructive'
                            : alert.severity === 'medium'
                              ? 'secondary'
                              : 'outline'
                      }
                      >
                        {alert.severity}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
      </CardContent>
    </Card>
  );

  /**
   * Render dashboard controls
   */
  const renderControls = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Last updated:
          {' '}
          {lastUpdated.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm">Auto-refresh:</span>
          <Badge variant={autoRefresh ? 'default' : 'secondary'}>
            {autoRefresh ? 'On' : 'Off'}
          </Badge>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {renderControls()}

      <div className="space-y-6">
        {/* System Health Overview */}
        {renderSystemHealth()}

        {/* Active Alerts */}
        {renderActiveAlerts()}

        {/* Performance Metrics Tabs */}
        <Tabs defaultValue="web-vitals" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="web-vitals" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Web Vitals
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="railway" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Railway
            </TabsTrigger>
          </TabsList>

          <TabsContent value="web-vitals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {webVitals.map(renderMetricCard)}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apiMetrics.map(renderMetricCard)}
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {databaseMetrics.map(renderMetricCard)}
            </div>
          </TabsContent>

          <TabsContent value="railway" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {railwayMetrics.map(renderMetricCard)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
