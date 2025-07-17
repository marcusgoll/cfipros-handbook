# System Architecture - Interactive Pilot Handbook

## Architecture Overview

The Interactive Pilot Handbook is built as a Progressive Web App (PWA) using Next.js 14+ with a focus on offline-first design, interactive learning components, and secure content delivery.

### Core Architecture Principles

1. **Offline-First**: All purchased content available offline with seamless sync
2. **Component-Driven**: Reusable interactive components embedded in MDX content
3. **Performance-Focused**: Sub-3s load times, optimized assets, code splitting
4. **Security by Design**: Content protection, secure payments, user privacy
5. **Progressive Enhancement**: Core content works everywhere, enhanced features when possible

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     PWA     │  │   React UI   │  │  Offline     │              │
│  │  Service    │  │  Components  │  │  Storage     │              │
│  │  Worker     │  │  (Next.js)   │  │  (IndexedDB) │              │
│  └─────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌─────────────────────────────────────────────────┐               │
│  │           Interactive Components Library          │               │
│  │  (D3.js, Three.js, Custom Aviation Components)   │               │
│  └─────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Next.js    │  │     API      │  │   Content    │            │
│  │  App Router  │  │   Routes     │  │   Pipeline   │            │
│  │              │  │              │  │    (MDX)     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   NextAuth   │  │   Business   │  │   Caching    │            │
│  │    (Auth)    │  │    Logic     │  │   Strategy   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Data Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  PostgreSQL  │  │    Redis     │  │     CDN      │            │
│  │  (Primary)   │  │   (Cache)    │  │  (Static)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Prisma     │  │   Stripe     │  │  Cloudinary  │            │
│  │    (ORM)     │  │  (Payments)  │  │   (Media)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture

```
src/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Auth-related pages
│   ├── (marketing)/         # Public pages
│   ├── (app)/               # Protected app pages
│   │   ├── modules/         # Module content pages
│   │   ├── dashboard/       # User dashboard
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Base UI components
│   ├── aviation/            # Aviation-specific components
│   │   ├── HypoxiaSimulator.tsx
│   │   ├── WeatherBuilder.tsx
│   │   ├── AirspaceViewer.tsx
│   │   └── ...
│   ├── mdx/                 # MDX components
│   └── layout/              # Layout components
├── lib/
│   ├── auth/                # Auth utilities
│   ├── api/                 # API client
│   ├── offline/             # Offline utilities
│   └── utils/               # General utilities
├── content/                 # MDX content files
│   ├── private-commercial/
│   ├── instrument/
│   └── shared/
└── public/                  # Static assets
```

### 2. Backend Architecture

```
API Routes Structure:
/api/
├── auth/
│   ├── [...nextauth].ts    # NextAuth handler
│   └── verify-email.ts      # Email verification
├── payments/
│   ├── create-checkout.ts   # Stripe checkout
│   ├── webhook.ts           # Stripe webhooks
│   └── verify-purchase.ts   # Purchase verification
├── content/
│   ├── access.ts            # Content access check
│   ├── download.ts          # Offline content package
│   └── progress.ts          # Progress tracking
├── user/
│   ├── profile.ts           # User profile management
│   └── preferences.ts       # User preferences
└── admin/
    ├── analytics.ts         # Usage analytics
    └── content-update.ts    # Content versioning
```

### 3. Data Flow Architecture

```
User Action → React Component → API Route → Business Logic → Database
     ↑                                                          ↓
     └──────────── Response with Data ←─────────────────────────┘

Offline Flow:
User Action → React Component → IndexedDB Check
     ↓                              ↓ (miss)
     ↓ (hit)                       API Route
     ↓                              ↓
  Return Cached               Fetch & Cache
```

## Technology Stack Decisions

### Core Framework: Next.js 15+
- **Why**: Full-stack React framework with excellent PWA support and latest performance improvements
- **Benefits**: Turbopack dev server, React 19 support, enhanced caching, improved App Router performance
- **New Features**: Partial Prerendering (PPR), enhanced `next/form`, improved TypeScript support
- **Trade-offs**: Bleeding edge features → Mitigated by stable API compatibility

### Content: MDX
- **Why**: Markdown + React components = perfect for interactive content
- **Benefits**: Version control friendly, component embedding, easy authoring
- **Trade-offs**: Build time processing → Mitigated by incremental builds

### Database: PostgreSQL + Prisma
- **Why**: Robust relational database with excellent TypeScript support
- **Benefits**: ACID compliance, complex queries, proven reliability
- **Trade-offs**: Operational overhead → Mitigated by managed services

### Authentication: NextAuth.js
- **Why**: Native Next.js integration, extensive provider support
- **Benefits**: Session management, JWT/Database sessions, social logins
- **Trade-offs**: Limited customization → Extended with custom handlers

### Payments: Stripe
- **Why**: Industry standard, excellent developer experience
- **Benefits**: PCI compliance, subscription support, webhook reliability
- **Trade-offs**: Transaction fees → Offset by reduced development cost

### Interactive Graphics: D3.js + Three.js
- **Why**: D3 for 2D data viz, Three.js for 3D experiences
- **Benefits**: Powerful, flexible, large ecosystem
- **Trade-offs**: Bundle size → Mitigated by code splitting

### Styling: Tailwind CSS
- **Why**: Utility-first, excellent DX, consistent design
- **Benefits**: Small production bundle, responsive utilities
- **Trade-offs**: Learning curve → Offset by component library

### State Management: Zustand + React Context
- **Why**: Lightweight, TypeScript-first, simple API
- **Benefits**: No boilerplate, devtools support, persistence
- **Trade-offs**: Less ecosystem than Redux → Simpler is better here

### Offline Storage: IndexedDB + Service Workers
- **Why**: Large storage capacity, background sync
- **Benefits**: True offline capability, automatic updates
- **Trade-offs**: Browser compatibility → Progressive enhancement

### Deployment: Vercel
- **Why**: Native Next.js support, global CDN, preview deployments
- **Benefits**: Zero-config deployment, excellent performance
- **Trade-offs**: Vendor lock-in → Mitigated by containerization option

## Security Architecture

### Authentication Flow
```
1. User Login → NextAuth → JWT/Session Creation
2. JWT includes: userId, purchasedModules[], roles[]
3. Each request validates JWT → Checks module access
4. Refresh tokens for extended sessions
```

### Content Protection
```
1. Server-side rendering for paid content
2. API routes verify purchase before serving
3. Offline content encrypted with user-specific key
4. Device fingerprinting for reasonable limits
```

### Payment Security
```
1. Stripe Checkout → Never handle card details
2. Webhook validation with signing secret
3. Idempotent payment processing
4. Audit log for all transactions
```

## Performance Architecture

### Optimization Strategy
1. **Static Generation**: Landing pages, marketing content
2. **ISR**: Lesson content with 24-hour revalidation
3. **Dynamic**: User-specific data, progress tracking
4. **Edge Caching**: API responses, static assets

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@aviation/components']
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200]
  }
}
```

### Critical Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90
- Bundle Size: <200KB initial

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes
- Database connection pooling
- Redis for session management
- CDN for static assets

### Vertical Scaling
- Database read replicas
- Dedicated media server
- Background job processing
- Analytics data warehouse

## Monitoring & Observability

### Application Monitoring
- Vercel Analytics for performance
- Sentry for error tracking
- Custom metrics for business KPIs
- Real User Monitoring (RUM)

### Infrastructure Monitoring
- Database query performance
- API response times
- Cache hit rates
- Offline sync success rates

---

This architecture provides a solid foundation that:
- Supports offline-first requirements
- Enables rich interactive content
- Scales with user growth
- Maintains security and performance
- Allows rapid iteration

Next steps would be to detail specific subsystems or create implementation guides for critical components.