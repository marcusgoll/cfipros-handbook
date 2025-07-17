# Content Pipeline Architecture - Interactive Pilot Handbook

## Content Pipeline Philosophy

The content pipeline transforms aviation education materials from markdown sources into interactive, searchable, and offline-capable learning experiences. This system must handle version control, component integration, media optimization, and progressive content delivery.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Content Sources                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │     MDX      │  │    Media     │  │ Interactive  │            │
│  │   Content    │  │   Assets     │  │ Components   │            │
│  │              │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Processing Pipeline                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Content    │  │    Media     │  │  Component   │            │
│  │ Validation   │  │ Optimization │  │  Assembly    │            │
│  │              │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    Search    │  │   Version    │  │   Package    │            │
│  │   Indexing   │  │   Control    │  │  Generation  │            │
│  │              │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Output Generation                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    Static    │  │   Dynamic    │  │   Offline    │            │
│  │    Pages     │  │   Content    │  │   Packages   │            │
│  │              │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

## Content Source Management

### MDX File Structure

```
content/
├── modules/
│   ├── private-commercial/
│   │   ├── _module.yml              # Module metadata
│   │   ├── 01-aerodynamics/
│   │   │   ├── _chapter.yml         # Chapter metadata
│   │   │   ├── 01-four-forces.mdx   # Lesson content
│   │   │   ├── 02-airfoils.mdx
│   │   │   └── assets/              # Chapter-specific assets
│   │   ├── 02-aircraft-systems/
│   │   └── 03-weather/
│   ├── instrument/
│   └── commercial/
├── shared/
│   ├── components/                  # Reusable MDX components
│   ├── definitions/                 # Aviation term definitions
│   └── regulations/                 # Current FAR references
└── templates/
    ├── lesson-template.mdx
    └── chapter-template.mdx
```

### Content Metadata Schema

```yaml
# _module.yml
id: private-commercial
title: "Private & Commercial Pilot"
version: "2024.1"
description: "Comprehensive ground school for Private and Commercial pilot certification"
prerequisites: []
estimatedHours: 40
chapters:
  - id: aerodynamics
    title: "Aerodynamics"
    order: 1
    estimatedHours: 6
  - id: aircraft-systems
    title: "Aircraft Systems"
    order: 2
    estimatedHours: 8

# Lesson frontmatter in MDX
---
id: "four-forces-flight"
title: "Four Forces of Flight"
chapter: "aerodynamics"
order: 1
estimatedMinutes: 15
difficulty: "beginner"
learningObjectives:
  - "Understand the four fundamental forces acting on aircraft"
  - "Explain how lift is generated"
  - "Describe the relationship between forces in flight"
prerequisites:
  - "basic-physics-review"
interactives:
  - "four-forces-simulator"
  - "lift-demonstration"
keywords:
  - "lift"
  - "weight"
  - "thrust"
  - "drag"
faReferences:
  - "FAR 1.1"
  - "AC 61-21A Chapter 4"
lastUpdated: "2024-01-15"
reviewedBy: "CFI-12345"
---
```

## Content Processing Pipeline

### 1. Content Validation & Preprocessing

```javascript
// content-validator.js
class ContentValidator {
  constructor() {
    this.aviationTerms = new AviationGlossary();
    this.farDatabase = new FARDatabase();
  }
  
  async validateContent(mdxFile) {
    const validation = {
      frontmatter: await this.validateFrontmatter(mdxFile.frontmatter),
      content: await this.validateMarkdown(mdxFile.content),
      components: await this.validateComponents(mdxFile.components),
      references: await this.validateReferences(mdxFile.frontmatter.faReferences),
      accessibility: await this.validateAccessibility(mdxFile.content)
    };
    
    return {
      isValid: Object.values(validation).every(v => v.isValid),
      errors: this.collectErrors(validation),
      warnings: this.collectWarnings(validation)
    };
  }
  
  async validateComponents(components) {
    const results = await Promise.all(
      components.map(async component => {
        // Verify component exists and props are valid
        const definition = await this.getComponentDefinition(component.name);
        if (!definition) {
          return { error: `Unknown component: ${component.name}` };
        }
        
        // Validate props against schema
        return this.validateProps(component.props, definition.schema);
      })
    );
    
    return {
      isValid: results.every(r => !r.error),
      errors: results.filter(r => r.error).map(r => r.error)
    };
  }
}
```

### 2. Interactive Component Integration

```javascript
// component-processor.js
class ComponentProcessor {
  constructor() {
    this.componentRegistry = new ComponentRegistry();
    this.bundler = new ComponentBundler();
  }
  
  async processComponents(mdxContent) {
    // Extract component usage from MDX
    const components = this.extractComponents(mdxContent);
    
    // Build component bundles for offline use
    const bundles = await Promise.all(
      components.map(async component => {
        const definition = await this.componentRegistry.get(component.name);
        return {
          name: component.name,
          bundle: await this.bundler.createBundle(definition),
          dependencies: await this.resolveDependencies(definition),
          size: await this.calculateBundleSize(definition)
        };
      })
    );
    
    return {
      components: bundles,
      totalSize: bundles.reduce((sum, b) => sum + b.size, 0),
      loadingStrategy: this.determineLoadingStrategy(bundles)
    };
  }
  
  // Determine lazy vs eager loading based on component usage
  determineLoadingStrategy(components) {
    return components.map(component => ({
      name: component.name,
      strategy: component.size > 100000 ? 'lazy' : 'eager', // 100KB threshold
      priority: this.calculatePriority(component)
    }));
  }
}
```

### 3. Media Asset Optimization

```javascript
// media-processor.js
class MediaProcessor {
  constructor() {
    this.cloudinary = new CloudinaryClient();
    this.ffmpeg = new FFmpegProcessor();
  }
  
  async processMedia(assets) {
    return Promise.all(assets.map(asset => this.processAsset(asset)));
  }
  
  async processAsset(asset) {
    const optimized = {
      original: asset,
      variants: {}
    };
    
    switch(asset.type) {
      case 'image':
        optimized.variants = await this.optimizeImage(asset);
        break;
      case 'video':
        optimized.variants = await this.optimizeVideo(asset);
        break;
      case 'animation':
        optimized.variants = await this.optimizeAnimation(asset);
        break;
    }
    
    return optimized;
  }
  
  async optimizeImage(image) {
    return {
      // Responsive images
      webp: {
        small: await this.cloudinary.transform(image, 'w_640,f_webp,q_auto'),
        medium: await this.cloudinary.transform(image, 'w_1024,f_webp,q_auto'),
        large: await this.cloudinary.transform(image, 'w_1920,f_webp,q_auto')
      },
      // Fallback formats
      jpeg: {
        small: await this.cloudinary.transform(image, 'w_640,f_jpg,q_auto'),
        medium: await this.cloudinary.transform(image, 'w_1024,f_jpg,q_auto'),
        large: await this.cloudinary.transform(image, 'w_1920,f_jpg,q_auto')
      },
      // Placeholder for fast loading
      placeholder: await this.cloudinary.transform(image, 'w_32,h_32,c_fill,f_jpg,q_auto')
    };
  }
}
```

### 4. Search Index Generation

```javascript
// search-indexer.js
class SearchIndexer {
  constructor() {
    this.stemmer = new Stemmer();
    this.stopwords = new StopwordFilter();
    this.aviationTerms = new AviationGlossary();
  }
  
  async buildSearchIndex(modules) {
    const index = {
      documents: {},
      terms: {},
      definitions: {},
      regulations: {}
    };
    
    for (const module of modules) {
      for (const lesson of module.lessons) {
        const doc = await this.processDocument(lesson);
        index.documents[lesson.id] = doc;
        
        // Extract and index terms
        await this.indexTerms(doc, index.terms);
        
        // Index aviation definitions
        await this.indexDefinitions(doc, index.definitions);
        
        // Index regulation references
        await this.indexRegulations(doc, index.regulations);
      }
    }
    
    return this.optimizeIndex(index);
  }
  
  async processDocument(lesson) {
    const content = this.stripMarkdown(lesson.content);
    const tokens = this.tokenize(content);
    const filtered = this.stopwords.filter(tokens);
    const stemmed = filtered.map(token => this.stemmer.stem(token));
    
    return {
      id: lesson.id,
      title: lesson.frontmatter.title,
      content: stemmed,
      keywords: lesson.frontmatter.keywords,
      chapter: lesson.frontmatter.chapter,
      difficulty: lesson.frontmatter.difficulty,
      wordCount: tokens.length,
      readingTime: Math.ceil(tokens.length / 200) // 200 WPM average
    };
  }
}
```

## Build Pipeline Implementation

### Next.js 15+ Integration with Railway

```javascript
// next.config.js
const { withContentlayer } = require('next-contentlayer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering for better performance
    reactCompiler: true, // React 19 compiler
    turbo: {
      rules: {
        '*.mdx': ['mdx-loader']
      }
    }
  },
  
  // Railway-specific optimizations
  output: 'standalone',
  compress: true,
  
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheKeyWillBeUsed: async ({ request }) => {
            return `${request.url}?v=${process.env.BUILD_ID}`;
          }
        }
      }
    ]
  },
  
  // Content security
  async headers() {
    return [
      {
        source: '/api/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=3600'
          }
        ]
      }
    ];
  },
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};

module.exports = withContentlayer(nextConfig);
```

### Content Layer Configuration

```javascript
// contentlayer.config.js
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import { bundleMDX } from 'mdx-bundler';

const Lesson = defineDocumentType(() => ({
  name: 'Lesson',
  filePathPattern: `modules/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    chapter: { type: 'string', required: true },
    order: { type: 'number', required: true },
    estimatedMinutes: { type: 'number', required: true },
    difficulty: { type: 'enum', options: ['beginner', 'intermediate', 'advanced'], required: true },
    learningObjectives: { type: 'list', of: { type: 'string' }, required: true },
    prerequisites: { type: 'list', of: { type: 'string' } },
    interactives: { type: 'list', of: { type: 'string' } },
    keywords: { type: 'list', of: { type: 'string' } },
    faReferences: { type: 'list', of: { type: 'string' } },
    lastUpdated: { type: 'date', required: true },
    reviewedBy: { type: 'string', required: true }
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (lesson) => `/modules/${lesson.chapter}/${lesson._raw.flattenedPath.split('/').pop()}`
    },
    slug: {
      type: 'string',
      resolve: (lesson) => lesson._raw.flattenedPath.split('/').pop()
    },
    readingTime: {
      type: 'number',
      resolve: (lesson) => Math.ceil(lesson.body.raw.split(' ').length / 200)
    }
  }
}));

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Lesson],
  mdx: {
    remarkPlugins: [
      // Add aviation-specific plugins
      remarkAviationTerms,
      remarkFARReferences
    ],
    rehypePlugins: [
      // Add interactive component support
      rehypeInteractiveComponents,
      rehypeAccessibility
    ]
  }
});
```

## Version Control & Content Management

### Git-Based Content Workflow

```yaml
# .github/workflows/content-pipeline.yml
name: Content Pipeline

on:
  push:
    paths: ['content/**']
  pull_request:
    paths: ['content/**']

jobs:
  validate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate content
        run: npm run content:validate
      
      - name: Build search index
        run: npm run content:index
      
      - name: Generate offline packages
        run: npm run content:package
      
      - name: Run accessibility checks
        run: npm run content:a11y

  deploy-to-railway:
    needs: validate-content
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: pilot-handbook
```

### Content Versioning Strategy

```javascript
// content-versioner.js
class ContentVersioner {
  constructor() {
    this.semver = new SemVer();
    this.changeDetector = new ChangeDetector();
  }
  
  async determineVersionBump(changes) {
    const analysis = await this.analyzeChanges(changes);
    
    if (analysis.hasBreakingChanges) {
      return 'major'; // New module structure, removed content
    }
    
    if (analysis.hasNewContent || analysis.hasUpdatedRegulations) {
      return 'minor'; // New lessons, updated FAR references
    }
    
    return 'patch'; // Typo fixes, minor content updates
  }
  
  async packageContentVersion(version) {
    const modules = await this.getAllModules();
    const packages = {};
    
    for (const module of modules) {
      packages[module.id] = {
        version,
        content: await this.packageModule(module),
        checksum: await this.generateChecksum(module),
        size: await this.calculateSize(module),
        dependencies: await this.extractDependencies(module)
      };
    }
    
    return {
      version,
      packages,
      manifest: this.generateManifest(packages),
      migrationGuide: await this.generateMigrationGuide(version)
    };
  }
}
```

## Performance Optimization

### Build-Time Optimizations

```javascript
// build-optimizer.js
class BuildOptimizer {
  
  async optimizeBuild() {
    // Tree shake unused components
    await this.treeShakeComponents();
    
    // Generate critical CSS
    await this.generateCriticalCSS();
    
    // Create service worker with precache manifest
    await this.generateServiceWorker();
    
    // Build offline content packages
    await this.buildOfflinePackages();
    
    // Generate performance budget report
    await this.generatePerformanceBudget();
  }
  
  async treeShakeComponents() {
    const usedComponents = await this.analyzeComponentUsage();
    const componentLibrary = await this.getComponentLibrary();
    
    // Remove unused components from build
    const optimizedLibrary = componentLibrary.filter(
      component => usedComponents.includes(component.name)
    );
    
    await this.writeOptimizedLibrary(optimizedLibrary);
  }
  
  async generateCriticalCSS() {
    const pages = await this.getAllPages();
    const criticalCSS = {};
    
    for (const page of pages) {
      criticalCSS[page.route] = await this.extractCriticalCSS(page);
    }
    
    await this.writeCriticalCSS(criticalCSS);
  }
}
```

### Runtime Performance

```javascript
// content-delivery.js
class ContentDelivery {
  
  async deliverContent(lessonId, userContext) {
    // Check user's device capabilities
    const capabilities = await this.assessDeviceCapabilities();
    
    // Determine optimal content variant
    const variant = this.selectContentVariant(capabilities, userContext);
    
    // Progressive loading strategy
    const loadingPlan = this.createLoadingPlan(lessonId, variant);
    
    // Deliver content in phases
    return this.deliverProgressively(loadingPlan);
  }
  
  selectContentVariant(capabilities, userContext) {
    if (capabilities.connection === 'slow' || capabilities.storage < 100) {
      return 'lite'; // Reduced media, simplified interactions
    }
    
    if (capabilities.webgl && capabilities.storage > 500) {
      return 'enhanced'; // Full 3D interactions, HD media
    }
    
    return 'standard'; // Default experience
  }
}
```

---

This content pipeline architecture ensures your Interactive Pilot Handbook can efficiently transform educational content into engaging, interactive experiences while maintaining version control, optimizing performance, and supporting offline functionality. The system is designed to scale with your content growth while maintaining quality and performance standards.