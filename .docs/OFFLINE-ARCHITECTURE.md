# Offline-First Architecture - Interactive Pilot Handbook

## Offline-First Design Philosophy

The Interactive Pilot Handbook treats offline as the primary state, with online connectivity as an enhancement. This ensures pilots can study effectively regardless of network conditions - critical for mobile learning scenarios.

## Core Offline Principles

1. **Local-First Data**: All purchased content stored locally with server as sync point
2. **Progressive Sync**: Intelligent background synchronization without blocking UX
3. **Conflict Resolution**: Deterministic handling of offline/online data conflicts
4. **Storage Efficiency**: Compressed content with selective downloading
5. **Graceful Degradation**: Full functionality offline, enhanced features online

## Service Worker Architecture

### Service Worker Strategy Matrix

```javascript
// sw-strategies.js
const STRATEGIES = {
  // Static assets - Cache First (long-term cache)
  static: 'CacheFirst',
  
  // API responses - Network First with fallback
  api: 'NetworkFirst',
  
  // Content pages - Stale While Revalidate
  content: 'StaleWhileRevalidate',
  
  // User-generated data - Network Only (with queue)
  userdata: 'NetworkOnly',
  
  // Media assets - Cache First with network fallback
  media: 'CacheFirst'
};
```

### Multi-Layer Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser Cache                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Memory     │  │    HTTP      │  │   Service    │            │
│  │   Cache      │  │   Cache      │  │   Worker     │            │
│  │   (React)    │  │   (Browser)  │  │   Cache      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Persistent Storage                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   IndexedDB  │  │   LocalStorage│  │  Cache API   │            │
│  │   (Content)  │  │  (Settings)  │  │  (Assets)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

## Content Storage Architecture

### IndexedDB Schema Design

```javascript
// offline-db-schema.js
const DB_SCHEMA = {
  name: 'PilotHandbookDB',
  version: 1,
  stores: {
    // Module content with versioning
    modules: {
      keyPath: 'id',
      indexes: {
        moduleType: 'moduleType',
        version: 'version',
        lastUpdated: 'lastUpdated'
      }
    },
    
    // Individual lessons
    lessons: {
      keyPath: 'id',
      indexes: {
        moduleId: 'moduleId',
        chapterOrder: 'chapterOrder',
        size: 'contentSize'
      }
    },
    
    // Media assets (images, videos, animations)
    media: {
      keyPath: 'id',
      indexes: {
        lessonId: 'lessonId',
        type: 'mediaType',
        size: 'fileSize'
      }
    },
    
    // User progress (offline-capable)
    progress: {
      keyPath: ['userId', 'lessonId'],
      indexes: {
        lastAccess: 'lastAccessTime',
        syncStatus: 'needsSync'
      }
    },
    
    // Sync queue for offline actions
    syncQueue: {
      keyPath: 'id',
      indexes: {
        priority: 'priority',
        timestamp: 'createdAt',
        action: 'actionType'
      }
    }
  }
};
```

### Content Packaging Strategy

```javascript
// content-packager.js
class ContentPackager {
  async packageModule(moduleId, compressionLevel = 'medium') {
    const module = await this.getModuleContent(moduleId);
    
    return {
      metadata: {
        id: moduleId,
        version: module.version,
        size: this.calculateSize(module),
        checksum: this.generateChecksum(module),
        dependencies: this.extractDependencies(module)
      },
      
      content: {
        // Compressed lesson content
        lessons: await this.compressLessons(module.lessons),
        
        // Optimized media assets
        media: await this.optimizeMedia(module.media),
        
        // Interactive component definitions
        components: await this.bundleComponents(module.components),
        
        // Offline search index
        searchIndex: await this.buildSearchIndex(module.lessons)
      },
      
      manifest: this.generateManifest(module)
    };
  }
}
```

## Sync Mechanisms

### Background Sync Strategy

```javascript
// background-sync.js
class BackgroundSync {
  constructor() {
    this.syncQueue = new SyncQueue();
    this.conflictResolver = new ConflictResolver();
  }
  
  // Register background sync events
  async registerSync(tag, data) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      
      // Queue the sync request
      await this.syncQueue.add({
        tag,
        data,
        timestamp: Date.now(),
        retryCount: 0
      });
      
      // Register with browser's background sync
      return registration.sync.register(tag);
    }
    
    // Fallback for unsupported browsers
    return this.performImmediateSync(tag, data);
  }
  
  // Handle sync events in service worker
  async handleSync(event) {
    switch(event.tag) {
      case 'progress-sync':
        return this.syncProgress();
      case 'content-update':
        return this.updateContent();
      case 'user-preferences':
        return this.syncPreferences();
      default:
        console.warn(`Unknown sync tag: ${event.tag}`);
    }
  }
}
```

### Intelligent Sync Scheduling

```javascript
// sync-scheduler.js
class SyncScheduler {
  constructor() {
    this.networkObserver = new NetworkObserver();
    this.batteryObserver = new BatteryObserver();
    this.usageTracker = new UsageTracker();
  }
  
  // Smart sync timing based on user behavior and device state
  async scheduleSync() {
    const conditions = await this.assessConditions();
    
    if (conditions.isOptimal) {
      return this.performFullSync();
    }
    
    if (conditions.isAcceptable) {
      return this.performPrioritySync();
    }
    
    // Defer sync until better conditions
    return this.deferSync(conditions.nextOptimalTime);
  }
  
  async assessConditions() {
    const [network, battery, usage] = await Promise.all([
      this.networkObserver.getStatus(),
      this.batteryObserver.getStatus(),
      this.usageTracker.getPredictedUsage()
    ]);
    
    return {
      isOptimal: network.speed > 'fast' && battery.level > 0.5 && !usage.heavyUsagePredicted,
      isAcceptable: network.connected && battery.level > 0.2,
      nextOptimalTime: this.calculateOptimalTime(network, battery, usage)
    };
  }
}
```

## Conflict Resolution

### Progress Tracking Conflicts

```javascript
// conflict-resolver.js
class ConflictResolver {
  
  // Progress conflicts: Always prefer latest completion
  resolveProgressConflict(localProgress, serverProgress) {
    return {
      completed: localProgress.completed || serverProgress.completed,
      timeSpent: Math.max(localProgress.timeSpent, serverProgress.timeSpent),
      lastAccess: Math.max(localProgress.lastAccess, serverProgress.lastAccess),
      bookmarks: this.mergeArrays(localProgress.bookmarks, serverProgress.bookmarks),
      
      // Merge notes with conflict markers if different
      notes: this.mergeNotes(localProgress.notes, serverProgress.notes)
    };
  }
  
  // Content conflicts: Server always wins for lesson content
  resolveContentConflict(localContent, serverContent) {
    if (serverContent.version > localContent.version) {
      return {
        ...serverContent,
        // Preserve local user customizations
        userPreferences: localContent.userPreferences,
        localSettings: localContent.localSettings
      };
    }
    
    return localContent;
  }
  
  // Settings conflicts: Merge with timestamp precedence
  resolveSettingsConflict(localSettings, serverSettings) {
    const merged = { ...localSettings };
    
    Object.keys(serverSettings).forEach(key => {
      if (serverSettings[key].timestamp > (localSettings[key]?.timestamp || 0)) {
        merged[key] = serverSettings[key];
      }
    });
    
    return merged;
  }
}
```

## Storage Management

### Intelligent Cache Eviction

```javascript
// cache-manager.js
class CacheManager {
  constructor() {
    this.maxStorage = 50 * 1024 * 1024; // 50MB default
    this.urgentEvictionThreshold = 0.9; // 90% full
    this.normalEvictionThreshold = 0.8; // 80% full
  }
  
  async manageStorage() {
    const usage = await this.getStorageUsage();
    
    if (usage.ratio > this.urgentEvictionThreshold) {
      return this.urgentEviction();
    }
    
    if (usage.ratio > this.normalEvictionThreshold) {
      return this.scheduledEviction();
    }
    
    return this.maintenance();
  }
  
  // Eviction priority: LRU with content value weighting
  async calculateEvictionCandidates() {
    const items = await this.getAllCachedItems();
    
    return items
      .map(item => ({
        ...item,
        score: this.calculateEvictionScore(item)
      }))
      .sort((a, b) => a.score - b.score); // Lower score = higher eviction priority
  }
  
  calculateEvictionScore(item) {
    const recencyScore = (Date.now() - item.lastAccess) / (1000 * 60 * 60 * 24); // Days
    const frequencyScore = 1 / (item.accessCount || 1);
    const valueScore = item.isPurchased ? 0.1 : 1; // Purchased content has lower eviction priority
    const sizeScore = item.size / (1024 * 1024); // MB
    
    return recencyScore * frequencyScore * valueScore * sizeScore;
  }
}
```

### Progressive Loading Strategy

```javascript
// progressive-loader.js
class ProgressiveLoader {
  
  // Load content in order of importance
  async loadModuleProgressively(moduleId) {
    const loadingPlan = await this.createLoadingPlan(moduleId);
    
    // Phase 1: Essential content (text, basic images)
    await this.loadPhase(loadingPlan.essential);
    this.notifyReady('basic');
    
    // Phase 2: Interactive components
    await this.loadPhase(loadingPlan.interactive);
    this.notifyReady('interactive');
    
    // Phase 3: Media assets (videos, animations)
    await this.loadPhase(loadingPlan.media);
    this.notifyReady('complete');
    
    // Phase 4: Prefetch related content
    this.scheduleBackgroundLoad(loadingPlan.prefetch);
  }
  
  async createLoadingPlan(moduleId) {
    const module = await this.getModuleMetadata(moduleId);
    const userProgress = await this.getUserProgress(moduleId);
    
    return {
      essential: this.identifyEssentialContent(module, userProgress),
      interactive: this.identifyInteractiveContent(module),
      media: this.identifyMediaContent(module),
      prefetch: this.identifyPrefetchContent(module, userProgress)
    };
  }
}
```

## Network State Management

### Connection-Aware Operations

```javascript
// network-manager.js
class NetworkManager {
  constructor() {
    this.connectionState = this.detectConnection();
    this.operationQueue = new OperationQueue();
    
    // Monitor connection changes
    this.setupConnectionMonitoring();
  }
  
  async performOperation(operation) {
    if (this.connectionState.effective === 'offline') {
      return this.queueOfflineOperation(operation);
    }
    
    if (this.connectionState.speed === 'slow') {
      return this.optimizeForSlowConnection(operation);
    }
    
    return this.performOnlineOperation(operation);
  }
  
  optimizeForSlowConnection(operation) {
    // Reduce payload size
    if (operation.type === 'content-sync') {
      operation.data = this.compressPayload(operation.data);
    }
    
    // Use delta sync instead of full sync
    if (operation.type === 'progress-sync') {
      operation.data = this.createDelta(operation.data);
    }
    
    // Prioritize critical operations
    operation.priority = this.calculatePriority(operation);
    
    return this.performOnlineOperation(operation);
  }
}
```

## Error Handling & Recovery

### Robust Error Recovery

```javascript
// error-recovery.js
class ErrorRecovery {
  
  async handleSyncError(error, operation) {
    switch(error.type) {
      case 'NETWORK_ERROR':
        return this.handleNetworkError(error, operation);
      
      case 'STORAGE_FULL':
        return this.handleStorageError(error, operation);
      
      case 'VERSION_CONFLICT':
        return this.handleVersionConflict(error, operation);
      
      case 'AUTH_ERROR':
        return this.handleAuthError(error, operation);
      
      default:
        return this.handleGenericError(error, operation);
    }
  }
  
  async handleNetworkError(error, operation) {
    // Exponential backoff retry
    const retryDelay = Math.min(1000 * Math.pow(2, operation.retryCount), 30000);
    
    if (operation.retryCount < 5) {
      setTimeout(() => {
        this.retryOperation({...operation, retryCount: operation.retryCount + 1});
      }, retryDelay);
    } else {
      // Give up and queue for later
      this.queueForLaterRetry(operation);
    }
  }
  
  async handleStorageError(error, operation) {
    // Free up space and retry
    await this.cacheManager.urgentEviction();
    return this.retryOperation(operation);
  }
}
```

## Performance Optimization

### Lazy Loading & Code Splitting

```javascript
// lazy-components.js
// Dynamic imports for interactive components
const LazyComponents = {
  HypoxiaSimulator: lazy(() => import('../components/aviation/HypoxiaSimulator')),
  WeatherBuilder: lazy(() => import('../components/aviation/WeatherBuilder')),
  AirspaceViewer: lazy(() => import('../components/aviation/AirspaceViewer')),
  VORTrainer: lazy(() => import('../components/aviation/VORTrainer'))
};

// Intersection Observer for smart loading
class LazyComponentLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { rootMargin: '50px' }
    );
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const component = entry.target.dataset.component;
        this.loadComponent(component);
        this.observer.unobserve(entry.target);
      }
    });
  }
}
```

## Monitoring & Analytics

### Offline Usage Analytics

```javascript
// offline-analytics.js
class OfflineAnalytics {
  constructor() {
    this.eventQueue = [];
    this.batchSize = 50;
    this.flushInterval = 300000; // 5 minutes
  }
  
  // Track events offline, sync when online
  track(event, properties = {}) {
    this.eventQueue.push({
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        offline: !navigator.onLine,
        sessionId: this.getSessionId()
      }
    });
    
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      await this.sendEvents(events);
    } catch (error) {
      // Re-queue events if send fails
      this.eventQueue.unshift(...events);
    }
  }
}
```

---

This offline-first architecture ensures your Interactive Pilot Handbook provides a seamless learning experience regardless of network conditions, with intelligent sync, robust conflict resolution, and efficient storage management.

The system gracefully handles the transition between online and offline states while maintaining data integrity and user experience quality.