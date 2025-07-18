# Lean API Architecture - Interactive Pilot Handbook

## Solo Dev Philosophy: Done > Perfect

Simple, pragmatic API design focused on shipping quickly with minimal complexity. Start lean, add complexity only when needed.

## Core Principles

1. **Keep It Simple**: Use Next.js API routes - no separate backend needed
2. **Start Basic**: Simple auth, basic rate limiting, minimal versioning
3. **Ship Fast**: Working MVP over enterprise patterns
4. **Scale Later**: Add complexity when user base demands it

## Simple Architecture

```
PWA (Next.js) → API Routes → Database
                    ↓
               NextAuth.js
               Prisma ORM
               Railway PostgreSQL
```

**That's it!** No microservices, no API gateway, no complex layers.

## No Versioning (MVP)

Skip versioning initially. Just use `/api/...` routes. Add versioning later if breaking changes are needed.

**YAGNI principle**: You aren't gonna need it (yet).

## Simple Auth with NextAuth.js

Use NextAuth.js - it handles everything. No custom JWT logic needed.

```javascript
// lib/auth.js - One simple helper
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export async function getUser(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user || null;
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = await getUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Login required' });
    }
    req.user = user;
    return handler(req, res);
  };
}
```

**Simple permission check**:
```javascript
// Just check if user has purchased the module
async function hasPurchased(userId, moduleId) {
  const purchase = await prisma.purchase.findFirst({
    where: { userId, moduleType: moduleId, status: 'completed' }
  });
  return !!purchase;
}
```

## Minimal API Routes

Start with just what you need:

```
/api/
├── auth/[...nextauth].js        # NextAuth handles this
├── modules/[id].js              # Get module content
├── lessons/[id].js              # Get lesson content + update progress
├── payments/
│   ├── checkout.js              # Create Stripe session
│   └── webhook.js               # Stripe webhook
└── user/profile.js              # User settings
```

**That's it for MVP!** Add more routes when you actually need them.

## Simple Route Examples

### Module Content API
```javascript
// pages/api/modules/[id].js
import { hasPurchased, requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  // Check if user purchased this module
  if (!await hasPurchased(req.user.id, id)) {
    return res.status(403).json({ error: 'Purchase required' });
  }

  // Get module content (simplified)
  const module = await prisma.module.findUnique({
    where: { id },
    include: { lessons: true }
  });

  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  res.json(module);
});
```

### Simple Progress Tracking
```javascript
// pages/api/lessons/[id].js
import { requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get lesson content
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    res.json(lesson);
  }

  if (req.method === 'POST') {
    // Update progress
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: id } },
      update: { completed: req.body.completed, timeSpent: req.body.timeSpent },
      create: { userId: req.user.id, lessonId: id, ...req.body }
    });
    res.json({ success: true });
  }
});
```

## Basic Rate Limiting (Optional)

Only add if you get abused:

```javascript
// lib/rate-limit.js (simple in-memory version)
const limits = new Map();

export function rateLimit(req, limit = 100) {
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const hour = Math.floor(now / 3600000);
  const key = `${ip}-${hour}`;

  const current = limits.get(key) || 0;
  if (current >= limit) {
    throw new Error('Rate limit exceeded');
  }

  limits.set(key, current + 1);

  // Clean old entries occasionally
  if (Math.random() < 0.01) {
    for (const [k] of limits) {
      if (k.split('-')[1] < hour - 1) {
        limits.delete(k);
      }
    }
  }
}
```

## Error Handling (Keep Simple)

```javascript
// lib/api-utils.js
export function handleError(error, res) {
  console.error('API Error:', error);

  if (error.message === 'Rate limit exceeded') {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (error.message === 'Login required') {
    return res.status(401).json({ error: 'Login required' });
  }

  // Default error
  res.status(500).json({ error: 'Something went wrong' });
}

// Usage in routes
export default async function handler(req, res) {
  try {
    // Your logic here
  } catch (error) {
    return handleError(error, res);
  }
}
```

## MVP Implementation Priority

1. **Week 1**: Auth + Basic content delivery
   - NextAuth.js setup
   - Simple module/lesson API routes
   - Basic Prisma schema

2. **Week 2**: Payments + Content protection
   - Stripe checkout
   - Purchase verification
   - Content access control

3. **Week 3**: Progress tracking + Polish
   - Simple progress updates
   - Basic error handling
   - Deploy to Railway

**Ship it, then iterate!**

## What to Skip Initially

- Complex rate limiting (start with none)
- Elaborate error codes (use simple messages)
- API versioning (just `/api/...`)
- Batch operations (YAGNI)
- Complex caching (Railway Redis later)
- Detailed analytics (focus on core features)

## When to Add Complexity

- **Rate limiting**: When you get your first abuse
- **Caching**: When pages load slowly
- **API versioning**: When you need breaking changes
- **Analytics**: When you have paying users who ask for it
- **Admin features**: When content management becomes painful

---

**Remember**: A working simple app beats a perfect unfinished one every time.
