# Interactive Pilot Handbook - Brownfield Architecture Document

## Introduction

### Enhancement Scope Overview

**Project Type**: Complete application implementation from comprehensive specifications
**Enhancement Classification**: Major greenfield-to-implementation transition
**Integration Complexity**: High - Building complete system from detailed planning documents

**Key Integration Points**:
- Next.js 15+ framework as foundation
- Custom interactive aviation component library
- Stripe payment system integration
- PWA offline-first architecture
- MDX content management pipeline

### Relationship to Existing Architecture

**Current State**: Pre-implementation with exceptional planning foundation
- Comprehensive PRD (607 lines) with complete user stories and technical requirements
- Detailed UI Analysis (469 lines) with component hierarchy and performance specifications
- Frontend Specification (592 lines) with complete design system and UX guidelines
- SuperClaude development configuration for optimized AI-assisted workflow

**Target State**: Production-ready Interactive Pilot Handbook PWA with 10+ interactive components, offline functionality, and educational content management system.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| Initial Architecture | 2025-06-24 | 1.0.0 | Complete brownfield architecture for implementation | Winston (Architect) |

## Existing Project Analysis

### Current Project Structure

**Project Root**: `/mnt/c/Users/Marcus Gollahon/OneDrive/Documents/Coding/cfi-interactive/`

**Existing Assets**:
```
/
├── .docs/                      # Complete planning documentation
│   ├── PRD.md                 # Original comprehensive PRD
│   ├── ui-analysis.md         # UI architecture analysis
│   ├── brownfield-prd.md      # Implementation roadmap
│   └── front-end-spec.md      # UX/UI specifications
├── .bmad-core/                # BMAD workflow system
│   ├── agents/                # Specialized AI agents
│   ├── workflows/             # Development workflows
│   ├── tasks/                 # Reusable task templates
│   └── templates/             # Document templates
├── CLAUDE.md                  # AI development configuration
├── RULES.md                   # Development standards
├── PERSONAS.md                # AI agent personas
└── README.md                  # SuperClaude framework documentation
```

**Planning Quality Assessment**: Exceptional
- Complete user stories with acceptance criteria
- Detailed technical requirements and performance targets
- Comprehensive UX/UI specifications with design system
- Risk assessment and mitigation strategies
- Success metrics and validation criteria

### Available Documentation Analysis

**Comprehensive Planning Documentation** ✅:
- **PRD**: Complete with 7 epics, 43+ user stories, technical architecture
- **UI Analysis**: Component hierarchy, performance requirements, development phases
- **Implementation PRD**: 11 sequential stories, integration strategy, risk mitigation
- **Frontend Spec**: Design system, accessibility requirements, responsive strategy

**Technical Implementation Documentation** (To Be Created):
- [ ] Source tree structure and file organization
- [ ] Database schema and migration strategy
- [ ] API specification and integration patterns
- [ ] Component library architecture
- [ ] Build and deployment configuration
- [ ] Testing strategy and automation setup

### Architectural Constraints from Planning

**Performance Requirements**:
- <3 seconds page load on 3G connection
- 60fps interactive component animations
- >90 Lighthouse scores across all categories
- <500KB initial JavaScript bundle

**Security Requirements**:
- WCAG 2.1 AA accessibility compliance
- PCI DSS compliance for payment processing
- GDPR compliance for user data
- Multi-layer content protection strategy

**Integration Requirements**:
- Next.js 15+ with App Router architecture
- Stripe API v3+ with webhook handling
- NextAuth.js authentication system
- Progressive Web App (PWA) capabilities
- Offline-first architecture with IndexedDB

## Enhancement Scope and Integration Strategy

### Enhancement Type Classification

**Primary Enhancement**: Complete application development from specifications
**Secondary Enhancements**: 
- Interactive aviation component library creation
- MDX content processing pipeline
- Offline functionality implementation
- Payment and access control system

### Integration Approach

**Foundation-First Strategy**:
1. **Infrastructure Setup** - Next.js application with essential tooling
2. **Core Systems** - Authentication, database, basic content processing
3. **Payment Integration** - Stripe checkout and access control
4. **Component Development** - Interactive aviation components (simple→complex)
5. **PWA Implementation** - Service worker and offline functionality
6. **Performance Optimization** - Bundle optimization and performance tuning

**Risk Mitigation Approach**:
- Start with simpler interactive components to establish patterns
- Implement performance monitoring from day one
- Create fallback strategies for complex components
- Establish testing framework before complex feature development

## Tech Stack Alignment

### Core Technology Decisions

**Framework**: Next.js 15+ with App Router
- **Rationale**: Built-in MDX support, API routes, performance optimizations, PWA support
- **Version**: Latest stable (15.x) for newest features and performance improvements
- **Configuration**: TypeScript strict mode, App Router for modern patterns

**Styling**: Tailwind CSS with Custom Design System
- **Rationale**: Utility-first approach, excellent performance, design system compatibility
- **Configuration**: Custom color palette, typography scale, component variants
- **Extensions**: Custom animation utilities, aviation-specific design tokens

**Database**: PostgreSQL with Prisma ORM
- **Rationale**: Relational data model, excellent TypeScript integration, migration support
- **Schema**: User management, purchase tracking, progress analytics
- **Deployment**: Vercel Postgres for seamless integration

**Authentication**: NextAuth.js v4+
- **Providers**: Email/password, Google OAuth, Apple OAuth
- **Session**: JWT with database session storage
- **Security**: CSRF protection, secure cookie configuration

### Development Tool Stack

**Code Quality**:
- **TypeScript**: Strict configuration with no implicit any
- **ESLint**: Extended configuration with accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

**Testing Framework**:
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Playwright for end-to-end scenarios
- **Performance Tests**: Lighthouse CI for automated performance regression
- **Accessibility Tests**: axe-core integration for automated accessibility testing

**Development Environment**:
- **Package Manager**: npm (Node.js ecosystem standard)
- **Build Tool**: Next.js built-in Turbopack for fast builds
- **Environment Management**: dotenv for configuration
- **Git Workflow**: Feature branches with automated PR testing

### External Service Integration

**Payment Processing**: Stripe API v3+
- **Integration**: Server-side webhook handling for security
- **Products**: One-time purchases with optional payment plans
- **Security**: PCI DSS compliance through Stripe, no card data storage

**Content Delivery**: Vercel Edge Network
- **Static Assets**: Optimized image delivery with Next.js Image component
- **Dynamic Content**: MDX processing with edge-side rendering
- **Performance**: Global CDN with intelligent caching strategies

**Analytics**: Vercel Analytics + Custom Privacy-First Tracking
- **Performance Monitoring**: Core Web Vitals tracking
- **User Behavior**: Privacy-compliant learning analytics
- **Error Tracking**: Structured error logging with user context

## Data Models and Schema Changes

### Database Schema Design

**User Management Schema**:
```sql
-- Users table with authentication and profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    email_verified TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account linking for OAuth providers
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- Session management
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purchase and Access Control Schema**:
```sql
-- Purchase tracking with Stripe integration
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- 'private_commercial', 'instrument', 'bundle'
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Additional purchase details
);

-- Content access permissions
CREATE TABLE content_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_module VARCHAR(50) NOT NULL, -- 'private_commercial', 'instrument'
    access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_expires_at TIMESTAMP, -- NULL for lifetime access
    purchase_id UUID REFERENCES purchases(id),
    UNIQUE(user_id, content_module)
);
```

**Learning Progress Schema**:
```sql
-- Progress tracking for lessons and components
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL, -- lesson path or component identifier
    content_type VARCHAR(50) NOT NULL, -- 'lesson', 'interactive_component', 'chapter'
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interaction_data JSONB, -- Store component-specific progress data
    UNIQUE(user_id, content_id)
);

-- Bookmark and favorites system
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    bookmark_type VARCHAR(50) DEFAULT 'lesson', -- 'lesson', 'section', 'interactive'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);
```

### Data Migration Strategy

**Phase 1: Core Schema Creation**
- User authentication and session management
- Basic purchase tracking
- Initial progress tracking structure

**Phase 2: Enhanced Features**
- Detailed progress analytics
- Bookmark and favorites system
- Content versioning support

**Phase 3: Advanced Analytics**
- Learning pattern analysis
- Performance metrics tracking
- A/B testing data structure

### Offline Data Strategy

**IndexedDB Schema** (Client-side):
```javascript
// Offline content storage structure
const offlineSchema = {
  version: 1,
  stores: {
    lessons: {
      keyPath: 'id',
      indexes: ['module', 'chapter', 'lastModified']
    },
    progress: {
      keyPath: 'contentId',
      indexes: ['userId', 'lastSync', 'pendingSync']
    },
    media: {
      keyPath: 'url',
      indexes: ['contentId', 'size', 'downloadDate']
    },
    userPreferences: {
      keyPath: 'key',
      indexes: ['lastModified']
    }
  }
};
```

**Sync Strategy**:
- Background sync for progress updates
- Conflict resolution with server-side timestamps
- Incremental content updates with versioning

## Component Architecture

### Interactive Component System

**Base Component Architecture**:
```typescript
// Base interface for all interactive components
interface InteractiveComponentProps {
  id: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  learningObjectives: string[];
  onProgressUpdate: (progress: ComponentProgress) => void;
  onComplete: (results: ComponentResults) => void;
  accessibilityMode?: boolean;
  offlineMode?: boolean;
}

interface ComponentProgress {
  componentId: string;
  progressPercentage: number;
  interactionCount: number;
  timeSpent: number;
  currentState: Record<string, any>;
}

interface ComponentResults {
  componentId: string;
  completed: boolean;
  score?: number;
  interactions: InteractionEvent[];
  learningOutcomes: string[];
}
```

**Component Implementation Pattern**:
```typescript
// Example: HypoxiaSimulator component structure
interface HypoxiaSimulatorProps extends InteractiveComponentProps {
  initialAltitude?: number;
  showRespiratoryRate?: boolean;
  enableTimeAcceleration?: boolean;
}

interface HypoxiaSimulatorState {
  altitude: number;
  oxygenSaturation: number;
  consciousnessTime: number;
  respiratoryRate: number;
  isSimulationRunning: boolean;
  timeAcceleration: number;
}

const HypoxiaSimulator: React.FC<HypoxiaSimulatorProps> = ({
  onProgressUpdate,
  onComplete,
  accessibilityMode = false,
  ...props
}) => {
  // Component implementation with performance optimization
  const [state, setState] = useState<HypoxiaSimulatorState>(initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker>();

  // Web Worker for calculations to maintain 60fps
  useEffect(() => {
    workerRef.current = new Worker('/workers/hypoxia-calculations.js');
    return () => workerRef.current?.terminate();
  }, []);

  // Performance monitoring
  const performanceMonitor = useCallback((frameDuration: number) => {
    if (frameDuration > 16.67) { // Below 60fps
      console.warn(`HypoxiaSimulator: Frame took ${frameDuration}ms`);
    }
  }, []);

  return (
    <div className="interactive-component hypoxia-simulator">
      {/* Component implementation */}
    </div>
  );
};
```

### Component Library Architecture

**Component Categories**:

**1. Aviation Simulation Components**:
- `HypoxiaSimulator` - Altitude effects on consciousness
- `WeatherBuilder` - Interactive weather pattern creation
- `AirspaceViewer` - 3D airspace visualization
- `VORTrainer` - Navigation radio practice
- `WeightBalanceCalculator` - Aircraft loading simulation

**2. Educational Interface Components**:
- `KeyPointsGrid` - Concept organization
- `ImportantCallout` - Safety highlights
- `DefinitionTooltip` - Term explanations
- `ProgressTracker` - Learning progress visualization
- `VideoEmbed` - Media integration

**3. Content Management Components**:
- `MDXRenderer` - Markdown with component integration
- `LessonNavigation` - Chapter and lesson browsing
- `SearchInterface` - Content discovery
- `BookmarkManager` - Saved content organization
- `OfflineManager` - Download and sync control

### Component Performance Architecture

**Optimization Strategies**:
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Cache expensive calculations
- **useCallback**: Stabilize function references
- **Web Workers**: Offload complex calculations
- **Intersection Observer**: Lazy load components
- **Canvas/WebGL**: High-performance graphics rendering

**Performance Monitoring**:
```typescript
// Performance monitoring hook for interactive components
const usePerformanceMonitor = (componentName: string) => {
  const frameTimeRef = useRef<number>();
  const performanceObserver = useRef<PerformanceObserver>();

  useEffect(() => {
    performanceObserver.current = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
          if (entry.duration > 16.67) { // Below 60fps threshold
            console.warn(`${componentName}: Performance issue - ${entry.duration}ms`);
          }
        }
      });
    });

    performanceObserver.current.observe({ entryTypes: ['measure'] });

    return () => performanceObserver.current?.disconnect();
  }, [componentName]);

  const markInteraction = useCallback((interactionType: string) => {
    performance.mark(`${componentName}-${interactionType}-start`);
  }, [componentName]);

  const measureInteraction = useCallback((interactionType: string) => {
    performance.mark(`${componentName}-${interactionType}-end`);
    performance.measure(
      `${componentName}-${interactionType}`,
      `${componentName}-${interactionType}-start`,
      `${componentName}-${interactionType}-end`
    );
  }, [componentName]);

  return { markInteraction, measureInteraction };
};
```

## API Design and Integration

### API Architecture Strategy

**Next.js API Routes Structure**:
```
/pages/api/
├── auth/               # NextAuth.js authentication endpoints
│   ├── [...nextauth].ts
│   └── verify-email.ts
├── payments/           # Stripe payment integration
│   ├── create-checkout.ts
│   ├── webhooks.ts
│   └── purchase-history.ts
├── content/            # Content management and access
│   ├── [module]/
│   │   ├── lessons.ts
│   │   └── progress.ts
│   └── search.ts
├── user/               # User profile and preferences
│   ├── profile.ts
│   ├── preferences.ts
│   └── progress.ts
└── admin/              # Administrative functions
    ├── analytics.ts
    └── content-management.ts
```

### REST API Specification

**Content Access API**:
```typescript
// GET /api/content/[module]/lessons
interface LessonListResponse {
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    chapter: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    hasAccess: boolean;
    completed: boolean;
    progressPercentage: number;
    prerequisites: string[];
    learningObjectives: string[];
  }>;
  totalLessons: number;
  userProgress: {
    completedLessons: number;
    totalTimeSpent: number;
    lastAccessDate: string;
  };
}

// POST /api/user/progress
interface ProgressUpdateRequest {
  contentId: string;
  contentType: 'lesson' | 'interactive_component' | 'chapter';
  progressPercentage: number;
  timeSpent: number; // in minutes
  interactionData?: Record<string, any>;
  completed?: boolean;
}

interface ProgressUpdateResponse {
  success: boolean;
  updatedProgress: {
    contentId: string;
    progressPercentage: number;
    totalTimeSpent: number;
    lastAccessed: string;
  };
  achievements?: Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: string;
  }>;
}
```

**Payment Integration API**:
```typescript
// POST /api/payments/create-checkout
interface CheckoutRequest {
  productType: 'private_commercial' | 'instrument' | 'bundle';
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

// POST /api/payments/webhooks (Stripe webhook handler)
interface WebhookHandler {
  'payment_intent.succeeded': (data: Stripe.PaymentIntent) => Promise<void>;
  'payment_intent.payment_failed': (data: Stripe.PaymentIntent) => Promise<void>;
  'invoice.payment_succeeded': (data: Stripe.Invoice) => Promise<void>;
  'customer.subscription.updated': (data: Stripe.Subscription) => Promise<void>;
}
```

### GraphQL Consideration

**Decision: REST API First**
- **Rationale**: Simpler implementation, better caching, easier debugging
- **Future Migration**: GraphQL can be added later for complex queries
- **Trade-offs**: More API endpoints, potential over-fetching

### API Security Strategy

**Authentication Middleware**:
```typescript
// Middleware for protected API routes
export const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Add user context to request
    req.user = session.user;
    return handler(req, res);
  };
};

// Access control middleware
export const withAccess = (requiredAccess: string[]) => {
  return (handler: NextApiHandler) => {
    return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
      const userAccess = await getUserAccess(req.user.id);
      
      const hasAccess = requiredAccess.some(access => 
        userAccess.includes(access)
      );

      if (!hasAccess) {
        return res.status(403).json({ error: 'Insufficient access' });
      }

      return handler(req, res);
    });
  };
};
```

**Rate Limiting Strategy**:
```typescript
// API rate limiting configuration
const rateLimitConfig = {
  '/api/content/*': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  '/api/payments/*': {
    windowMs: 15 * 60 * 1000,
    max: 10, // stricter limits for payment endpoints
  },
  '/api/user/progress': {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // allow frequent progress updates
  },
};
```

## Source Tree Integration

### Project Structure Design

**Recommended Source Tree**:
```
/
├── .next/                      # Next.js build output (auto-generated)
├── .bmad-core/                 # BMAD workflow system (existing)
├── .docs/                      # Project documentation (existing)
├── public/                     # Static assets
│   ├── icons/                  # PWA icons and favicons
│   ├── images/                 # Static images and graphics
│   ├── workers/                # Web Workers for heavy calculations
│   └── manifest.json           # PWA manifest
├── src/                        # Main application source
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Dashboard group
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── (learning)/        # Learning content group
│   │   │   ├── [module]/
│   │   │   │   ├── [chapter]/
│   │   │   │   │   └── [lesson]/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── content/
│   │   │   ├── payments/
│   │   │   └── user/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── auth/              # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── learning/          # Learning-specific components
│   │       ├── LessonCard.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── ChapterNavigation.tsx
│   │       └── ContentRenderer.tsx
│   ├── interactive/           # Interactive aviation components
│   │   ├── components/        # Individual interactive components
│   │   │   ├── HypoxiaSimulator/
│   │   │   │   ├── HypoxiaSimulator.tsx
│   │   │   │   ├── HypoxiaSimulator.module.css
│   │   │   │   ├── calculations.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── WeatherBuilder/
│   │   │   ├── AirspaceViewer/
│   │   │   ├── VORTrainer/
│   │   │   └── WeightBalanceCalculator/
│   │   ├── shared/            # Shared interactive utilities
│   │   │   ├── InteractiveBase.tsx
│   │   │   ├── PerformanceMonitor.tsx
│   │   │   ├── AccessibilityWrapper.tsx
│   │   │   └── types.ts
│   │   └── index.ts           # Component registry
│   ├── lib/                   # Utility functions and configurations
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Database connection (Prisma)
│   │   ├── stripe.ts          # Stripe configuration
│   │   ├── mdx.ts             # MDX processing utilities
│   │   ├── analytics.ts       # Analytics utilities
│   │   ├── offline.ts         # Offline functionality
│   │   └── utils.ts           # General utilities
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useProgress.ts     # Progress tracking hook
│   │   ├── useOffline.ts      # Offline state hook
│   │   ├── usePerformance.ts  # Performance monitoring hook
│   │   └── useLocalStorage.ts # Local storage hook
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   ├── ThemeContext.tsx   # Theme and preferences context
│   │   ├── OfflineContext.tsx # Offline state context
│   │   └── ProgressContext.tsx # Learning progress context
│   ├── styles/                # Styling and design system
│   │   ├── globals.css        # Global styles
│   │   ├── components.css     # Component-specific styles
│   │   ├── interactive.css    # Interactive component styles
│   │   └── tailwind.config.js # Tailwind configuration
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── content.ts         # Content and lesson types
│   │   ├── interactive.ts     # Interactive component types
│   │   ├── payments.ts        # Payment and purchase types
│   │   └── index.ts           # Exported types
│   └── workers/               # Web Worker implementations
│       ├── calculations.worker.ts  # Heavy calculation worker
│       ├── offline-sync.worker.ts  # Background sync worker
│       └── analytics.worker.ts     # Analytics processing worker
├── content/                   # MDX content files
│   ├── private-commercial/    # Private pilot module
│   │   ├── aerodynamics/
│   │   ├── weather/
│   │   ├── navigation/
│   │   ├── regulations/
│   │   └── medical/
│   ├── instrument/            # Instrument rating module
│   │   ├── ifr-regulations/
│   │   ├── navigation/
│   │   ├── approaches/
│   │   └── weather/
│   └── shared/                # Shared content resources
│       ├── images/
│       ├── videos/
│       └── definitions/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database migration files
│   └── seed.ts                # Database seeding script
├── tests/                     # Test files
│   ├── __mocks__/             # Mock implementations
│   ├── components/            # Component tests
│   ├── interactive/           # Interactive component tests
│   ├── api/                   # API endpoint tests
│   ├── e2e/                   # End-to-end tests
│   └── setup.ts               # Test setup configuration
├── .env.local                 # Environment variables (local)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore configuration
├── next.config.js             # Next.js configuration
├── package.json               # Node.js dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest testing configuration
├── playwright.config.ts       # Playwright E2E testing configuration
└── README.md                  # Project documentation
```

### File Organization Principles

**Colocation Strategy**:
- Related files grouped together (component + styles + tests)
- Feature-based organization over file-type organization
- Clear separation between reusable and feature-specific code

**Import Path Strategy**:
```typescript
// Absolute imports with TypeScript path mapping
import { Button } from '@/components/ui';
import { HypoxiaSimulator } from '@/interactive/components';
import { useAuth } from '@/hooks/useAuth';
import { InteractiveComponentProps } from '@/types/interactive';
```

**Naming Conventions**:
- **PascalCase**: React components, TypeScript interfaces
- **camelCase**: Functions, variables, hooks
- **kebab-case**: File names, URLs, CSS classes
- **UPPER_CASE**: Constants, environment variables

## Infrastructure and Deployment Integration

### Deployment Architecture

**Vercel Platform Integration**:
- **Framework**: Next.js optimized deployment
- **Edge Network**: Global CDN for static assets
- **Serverless Functions**: API routes with auto-scaling
- **Database**: Vercel Postgres with connection pooling

**Environment Configuration**:
```yaml
# Production Environment
NODE_ENV: production
NEXTAUTH_URL: https://interactivepilothandbook.com
NEXTAUTH_SECRET: [secure-random-string]
DATABASE_URL: [vercel-postgres-connection-string]
STRIPE_SECRET_KEY: [stripe-production-key]
STRIPE_WEBHOOK_SECRET: [stripe-webhook-endpoint-secret]

# Development Environment
NODE_ENV: development
NEXTAUTH_URL: http://localhost:3000
NEXTAUTH_SECRET: [development-secret]
DATABASE_URL: [local-postgres-connection-string]
STRIPE_SECRET_KEY: [stripe-test-key]
STRIPE_WEBHOOK_SECRET: [stripe-test-webhook-secret]
```

### Performance Optimization Strategy

**Build Optimization**:
```javascript
// next.config.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Performance optimizations
  swcMinify: true,
  compress: true,
  
  // PWA configuration
  withPWA: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
    ],
  },

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'assets.vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Monitoring and Analytics

**Performance Monitoring Setup**:
```typescript
// lib/analytics.ts - Performance and user analytics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Core Web Vitals monitoring
  trackWebVitals(metric: any) {
    const { id, name, label, value } = metric;
    
    // Send to analytics service
    if (typeof window !== 'undefined') {
      // Vercel Analytics
      window.va?.track('Web Vital', {
        metric_name: name,
        metric_value: value,
        metric_label: label,
        metric_id: id,
      });
    }
  }

  // Interactive component performance tracking
  trackComponentPerformance(componentName: string, duration: number) {
    if (duration > 16.67) { // Below 60fps
      this.reportPerformanceIssue({
        type: 'component_performance',
        component: componentName,
        duration,
        timestamp: Date.now(),
      });
    }
  }

  private reportPerformanceIssue(issue: any) {
    // Log to monitoring service
    console.warn('Performance Issue:', issue);
    
    // Send to error tracking (optional)
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  }
}
```

**Error Tracking and Logging**:
```typescript
// lib/error-tracking.ts
export class ErrorTracker {
  static captureException(error: Error, context?: Record<string, any>) {
    // Log error with context
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Integration with error tracking service
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console[level](`[${level.toUpperCase()}] ${message}`);
    
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // Send important messages to monitoring
    }
  }
}
```

## Coding Standards and Conventions

### TypeScript Configuration

**Strict TypeScript Setup**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/interactive/*": ["./src/interactive/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Code Quality Standards

**ESLint Configuration**:
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["@typescript-eslint", "jsx-a11y"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "react/no-unescaped-entities": "off",
    "prefer-const": "error",
    "no-var": "error"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

**Prettier Configuration**:
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
}
```

### Component Development Standards

**Component Structure Template**:
```typescript
// Interactive component template
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InteractiveComponentProps, ComponentProgress } from '@/types/interactive';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface ComponentNameProps extends InteractiveComponentProps {
  // Component-specific props
  specificProp?: string;
  onSpecificEvent?: (data: any) => void;
}

interface ComponentNameState {
  // Component state definition
  isActive: boolean;
  currentValue: number;
}

/**
 * ComponentName - Brief description of the component's educational purpose
 * 
 * @param props - Component props including base interactive component props
 * @returns React component for interactive aviation learning
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  id,
  title,
  onProgressUpdate,
  onComplete,
  accessibilityMode = false,
  ...props
}) => {
  // State management
  const [state, setState] = useState<ComponentNameState>({
    isActive: false,
    currentValue: 0,
  });

  // Performance monitoring
  const { markInteraction, measureInteraction } = usePerformanceMonitor(
    `ComponentName-${id}`
  );

  // Refs for performance-critical elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Performance-optimized event handlers
  const handleInteraction = useCallback((event: React.MouseEvent) => {
    markInteraction('user-interaction');
    
    // Handle interaction logic
    setState(prevState => ({
      ...prevState,
      isActive: !prevState.isActive,
    }));

    // Report progress
    onProgressUpdate({
      componentId: id,
      progressPercentage: 50, // Calculate based on interaction
      interactionCount: 1,
      timeSpent: 1,
      currentState: state,
    });

    measureInteraction('user-interaction');
  }, [id, state, markInteraction, measureInteraction, onProgressUpdate]);

  // Accessibility support
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleInteraction(event as any);
    }
  }, [handleInteraction]);

  return (
    <ErrorBoundary>
      <div 
        className="interactive-component component-name"
        role="application"
        aria-label={`${title} - Interactive aviation learning component`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <h3 className="component-title">{title}</h3>
        
        {/* Component content */}
        <div className="component-content">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleInteraction}
            aria-label="Interactive visualization"
          />
        </div>

        {/* Accessibility alternative */}
        {accessibilityMode && (
          <div className="accessibility-alternative">
            <p>Text-based alternative for screen readers</p>
            {/* Provide equivalent information in text form */}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Default export with error boundary
export default ComponentName;
```

### Documentation Standards

**JSDoc Comment Requirements**:
```typescript
/**
 * Calculates oxygen saturation at a given altitude
 * Used by HypoxiaSimulator to provide realistic physiological modeling
 * 
 * @param altitude - Altitude in feet above sea level
 * @param individualFactor - Individual variation factor (0.8-1.2)
 * @returns Oxygen saturation percentage (0-100)
 * 
 * @example
 * ```typescript
 * const saturation = calculateOxygenSaturation(10000, 1.0);
 * console.log(saturation); // ~87%
 * ```
 */
export function calculateOxygenSaturation(
  altitude: number,
  individualFactor: number = 1.0
): number {
  // Implementation with clear variable names and comments
  const seaLevelSaturation = 98;
  const altitudeFactor = Math.pow(0.9999, altitude * individualFactor);
  
  return Math.max(0, Math.min(100, seaLevelSaturation * altitudeFactor));
}
```

## Testing Strategy

### Testing Architecture

**Testing Pyramid Implementation**:
```
                    E2E Tests (10%)
                 ┌─────────────────┐
                 │  User Flows     │
                 │  Payment Flow   │
                 │  Learning Path  │
                 └─────────────────┘
                
              Integration Tests (20%)
            ┌─────────────────────────┐
            │  API Route Testing      │
            │  Component Integration  │
            │  Database Operations    │
            └─────────────────────────┘
            
          Unit Tests (70%)
    ┌─────────────────────────────────┐
    │  Component Logic               │
    │  Utility Functions             │
    │  Interactive Calculations      │
    │  Hooks and Context             │
    └─────────────────────────────────┘
```

### Test Configuration

**Jest Configuration**:
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
```

**Playwright E2E Configuration**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Interactive Component Testing Strategy

**Performance Testing Example**:
```typescript
// tests/interactive/HypoxiaSimulator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HypoxiaSimulator } from '@/interactive/components/HypoxiaSimulator';
import { PerformanceMonitor } from '@/lib/performance';

describe('HypoxiaSimulator', () => {
  const mockProps = {
    id: 'test-hypoxia-sim',
    title: 'Hypoxia Effects Simulator',
    difficulty: 'beginner' as const,
    estimatedTime: 10,
    learningObjectives: ['Understand hypoxia effects'],
    onProgressUpdate: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HypoxiaSimulator {...mockProps} />);
    expect(screen.getByText('Hypoxia Effects Simulator')).toBeInTheDocument();
  });

  it('maintains 60fps performance during interactions', async () => {
    const performanceMonitor = jest.spyOn(PerformanceMonitor.prototype, 'trackComponentPerformance');
    
    render(<HypoxiaSimulator {...mockProps} />);
    
    const canvas = screen.getByRole('application');
    
    // Simulate rapid interactions
    for (let i = 0; i < 10; i++) {
      fireEvent.click(canvas);
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps timing
    }

    await waitFor(() => {
      // Check that no performance issues were reported
      expect(performanceMonitor).not.toHaveBeenCalledWith(
        expect.stringContaining('HypoxiaSimulator'),
        expect.any(Number)
      );
    });
  });

  it('reports progress updates correctly', async () => {
    render(<HypoxiaSimulator {...mockProps} />);
    
    const canvas = screen.getByRole('application');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(mockProps.onProgressUpdate).toHaveBeenCalledWith({
        componentId: 'test-hypoxia-sim',
        progressPercentage: expect.any(Number),
        interactionCount: expect.any(Number),
        timeSpent: expect.any(Number),
        currentState: expect.any(Object),
      });
    });
  });

  it('supports keyboard navigation', async () => {
    render(<HypoxiaSimulator {...mockProps} />);
    
    const component = screen.getByRole('application');
    component.focus();
    
    fireEvent.keyDown(component, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockProps.onProgressUpdate).toHaveBeenCalled();
    });
  });

  it('provides accessibility alternative when enabled', () => {
    render(<HypoxiaSimulator {...mockProps} accessibilityMode={true} />);
    
    expect(screen.getByText(/text-based alternative/i)).toBeInTheDocument();
  });
});
```

## Security Integration

### Security Architecture

**Multi-Layer Security Strategy**:

**1. Application Layer Security**:
```typescript
// lib/security.ts - Application security utilities
export class SecurityManager {
  // Content access validation
  static async validateContentAccess(
    userId: string,
    contentId: string
  ): Promise<boolean> {
    try {
      const userAccess = await prisma.contentAccess.findFirst({
        where: {
          userId,
          contentModule: this.extractModuleFromContentId(contentId),
          OR: [
            { accessExpiresAt: null }, // Lifetime access
            { accessExpiresAt: { gt: new Date() } }, // Not expired
          ],
        },
      });

      return !!userAccess;
    } catch (error) {
      // Log security check failure
      console.error('Content access validation failed:', error);
      return false; // Fail secure
    }
  }

  // Rate limiting for API endpoints
  static createRateLimit(windowMs: number, max: number) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < windowStart) {
          requests.delete(key);
        }
      }

      const current = requests.get(identifier) || { count: 0, resetTime: now + windowMs };
      
      if (current.count >= max) {
        return false; // Rate limit exceeded
      }

      requests.set(identifier, { ...current, count: current.count + 1 });
      return true;
    };
  }

  // Input sanitization for user-generated content
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim()
      .slice(0, 1000); // Limit length
  }
}
```

**2. API Security Middleware**:
```typescript
// lib/middleware/security.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.stripe.com;"
  );

  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check for authentication on protected routes
    if (request.nextUrl.pathname.startsWith('/api/user') || 
        request.nextUrl.pathname.startsWith('/api/content')) {
      
      const token = await getToken({ req: request });
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Rate limiting by IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `api:${ip}:${request.nextUrl.pathname}`;
    
    if (!SecurityManager.checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests' }, 
        { status: 429 }
      );
    }
  }

  return response;
}
```

**3. Payment Security**:
```typescript
// lib/payments/security.ts
import Stripe from 'stripe';
import { buffer } from 'micro';

export class PaymentSecurity {
  private static stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  // Webhook signature verification
  static async verifyWebhookSignature(
    body: Buffer,
    signature: string
  ): Promise<Stripe.Event | null> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  // Prevent payment replay attacks
  static async validatePaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      // Check if payment has already been processed
      const existingPurchase = await prisma.purchase.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      return !existingPurchase; // Return false if already processed
    } catch (error) {
      console.error('Payment validation failed:', error);
      return false; // Fail secure
    }
  }

  // Validate payment amount matches expected price
  static validatePaymentAmount(
    productType: string,
    amountReceived: number
  ): boolean {
    const expectedPrices = {
      'private_commercial': 5900, // $59.00 in cents
      'instrument': 5900,
      'bundle': 14900, // $149.00 in cents
    };

    const expectedAmount = expectedPrices[productType as keyof typeof expectedPrices];
    return expectedAmount === amountReceived;
  }
}
```

### Data Protection Strategy

**Encryption and Data Handling**:
```typescript
// lib/encryption.ts
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

export class DataProtection {
  private static scryptAsync = promisify(scrypt);

  // Hash sensitive data (passwords, API keys)
  static async hashData(data: string): Promise<string> {
    const salt = randomBytes(32).toString('hex');
    const derivedKey = await this.scryptAsync(data, salt, 64) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  // Verify hashed data
  static async verifyHash(data: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(':');
    const derivedKey = await this.scryptAsync(data, salt, 64) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    
    return timingSafeEqual(derivedKey, storedHashBuffer);
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  // Anonymize user data for analytics
  static anonymizeUserId(userId: string): string {
    return createHash('sha256').update(userId + process.env.ANALYTICS_SALT).digest('hex');
  }

  // Sanitize data for logging
  static sanitizeForLogging(data: any): any {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'email'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeForLogging(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
}
```

## Risk Assessment and Mitigation

### Technical Risk Analysis

**High-Risk Areas**:

**1. Interactive Component Performance**
- **Risk**: 60fps requirement with complex aviation calculations
- **Probability**: Medium
- **Impact**: High (poor user experience, negative reviews)
- **Mitigation Strategy**:
  - Implement Web Workers for heavy calculations from day one
  - Create performance monitoring framework early in development
  - Develop fallback simple animations for low-performance devices
  - Regular performance testing with realistic user scenarios

**2. Offline Functionality Complexity**
- **Risk**: Data synchronization conflicts and storage limitations
- **Probability**: Medium
- **Impact**: High (core feature failure)
- **Mitigation Strategy**:
  - Design offline-first architecture with conflict resolution
  - Implement progressive data sync with user notification
  - Create storage management UI with clear user control
  - Comprehensive testing of offline/online transitions

**3. Payment Integration Security**
- **Risk**: Payment failures, fraud, or data breaches
- **Probability**: Low
- **Impact**: Critical (business and legal consequences)
- **Mitigation Strategy**:
  - Use Stripe's secure tokenization (no card data storage)
  - Implement comprehensive webhook validation
  - Regular security audits and penetration testing
  - Compliance with PCI DSS standards

**Medium-Risk Areas**:

**4. Content Access Control**
- **Risk**: Unauthorized access to premium content
- **Probability**: Medium
- **Impact**: Medium (revenue loss)
- **Mitigation Strategy**:
  - Multi-layer access validation (client + server + database)
  - Regular security reviews of access control logic
  - Device limits and session management
  - User activity monitoring for suspicious patterns

**5. Browser Compatibility**
- **Risk**: Interactive components failing on specific browsers
- **Probability**: Medium
- **Impact**: Medium (user accessibility issues)
- **Mitigation Strategy**:
  - Progressive enhancement with graceful degradation
  - Comprehensive cross-browser testing automation
  - Feature detection rather than browser detection
  - Clear browser requirement communication

**6. Scalability Under Load**
- **Risk**: Performance degradation with user growth
- **Probability**: Low (early stage)
- **Impact**: High (system failure during growth)
- **Mitigation Strategy**:
  - Vercel auto-scaling capabilities
  - Database connection pooling and optimization
  - CDN for static asset delivery
  - Load testing before major launches

### Operational Risk Mitigation

**Development Process Risks**:
- **Code Quality**: Automated testing, code reviews, linting
- **Deployment Failures**: Staged deployments, rollback procedures
- **Data Loss**: Regular backups, migration testing
- **Security Vulnerabilities**: Security scanning, dependency updates

**Business Continuity**:
- **Service Outages**: Multi-region deployment, status page
- **Payment Processing**: Multiple payment method support
- **Content Updates**: Version control, content approval workflows
- **User Support**: Clear documentation, support ticket system

### Monitoring and Alerting Strategy

**Performance Monitoring**:
```typescript
// lib/monitoring.ts
export class MonitoringSystem {
  // Critical metric thresholds
  private static readonly THRESHOLDS = {
    pageLoadTime: 3000, // 3 seconds
    interactiveComponentLoad: 5000, // 5 seconds
    apiResponseTime: 1000, // 1 second
    errorRate: 0.001, // 0.1%
    offlineTransitionTime: 1000, // 1 second
  };

  static trackCriticalMetric(metricName: string, value: number) {
    const threshold = this.THRESHOLDS[metricName as keyof typeof this.THRESHOLDS];
    
    if (threshold && value > threshold) {
      this.alertCriticalIssue({
        metric: metricName,
        value,
        threshold,
        timestamp: new Date().toISOString(),
      });
    }

    // Log to analytics
    if (typeof window !== 'undefined') {
      window.va?.track('Performance Metric', {
        metric_name: metricName,
        metric_value: value,
        threshold_exceeded: threshold ? value > threshold : false,
      });
    }
  }

  private static alertCriticalIssue(issue: any) {
    console.error('Critical Performance Issue:', issue);
    
    // In production, trigger alerts
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      // Send notifications to development team
    }
  }

  // Health check endpoint
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
  }> {
    const checks = {
      database: await this.checkDatabaseConnection(),
      stripe: await this.checkStripeConnection(),
      authentication: await this.checkAuthenticationService(),
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.values(checks).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyChecks === 0) {
      status = 'unhealthy';
    } else if (healthyChecks < totalChecks) {
      status = 'degraded';
    }

    return { status, checks };
  }

  private static async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private static async checkStripeConnection(): Promise<boolean> {
    try {
      // Basic Stripe API test
      return true; // Simplified for example
    } catch {
      return false;
    }
  }

  private static async checkAuthenticationService(): Promise<boolean> {
    try {
      // Test NextAuth.js configuration
      return true; // Simplified for example
    } catch {
      return false;
    }
  }
}
```

---

## Next Steps and Implementation Roadmap

### Immediate Actions (Week 1-2)

**Technical Foundation**:
1. **Initialize Next.js 15+ project** with TypeScript and App Router
2. **Configure development environment** with ESLint, Prettier, and testing framework
3. **Set up database** with Prisma schema and initial migrations
4. **Implement basic authentication** with NextAuth.js
5. **Create project structure** following the defined source tree organization

**Development Setup**:
1. **Configure Vercel deployment** with preview environments
2. **Set up monitoring tools** and performance tracking
3. **Implement security middleware** and basic rate limiting
4. **Create development documentation** and coding standards guide

### Phase 1: Foundation (Weeks 3-6)

**Core Infrastructure**:
- Complete authentication system with all providers
- Database schema implementation and testing
- Basic MDX content processing pipeline
- Initial design system and component library
- Payment integration with Stripe (basic implementation)

### Phase 2: Interactive Components (Weeks 7-14)

**Component Development Priority**:
1. **HypoxiaSimulator** (simplest calculations)
2. **VORTrainer** (moderate complexity)
3. **WeatherBuilder** (complex visualizations)
4. **AirspaceViewer** (most complex 3D implementation)
5. **WeightBalanceCalculator** (advanced physics calculations)

### Phase 3: PWA and Advanced Features (Weeks 15-20)

**Progressive Web App**:
- Service worker implementation
- Offline content synchronization
- Push notification system
- Installation prompts and native app experience

### Phase 4: Optimization and Launch (Weeks 21-24)

**Performance and Quality**:
- Comprehensive performance optimization
- Accessibility testing and compliance
- Cross-browser compatibility verification
- Load testing and scalability validation
- Production deployment and monitoring setup

### Success Criteria

**Technical Metrics**:
- [ ] <3 second page load times achieved
- [ ] 60fps performance maintained in all interactive components  
- [ ] >90 Lighthouse scores across all categories
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] Cross-browser compatibility confirmed

**Functional Criteria**:
- [ ] All 11 user stories from PRD implemented and tested
- [ ] Payment integration fully functional with webhook handling
- [ ] Offline functionality provides complete feature parity
- [ ] Content management system supports easy lesson creation
- [ ] User progress tracking accurate and reliable

**Security and Performance**:
- [ ] Security audit completed with no critical issues
- [ ] Performance testing validates scalability requirements
- [ ] Error monitoring and alerting systems operational
- [ ] Backup and disaster recovery procedures tested

---

*Brownfield Architecture completed by Winston (Architect Agent)*  
*Date: 2025-06-24*  
*Next: Product Owner Agent for Final Validation*