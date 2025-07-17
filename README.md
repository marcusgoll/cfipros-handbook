# CFIPros - Aviation Knowledge Base Platform

<p align="center">
  <strong>Master the Skies with Professional Aviation Knowledge</strong>
</p>

<p align="center">
  CFIPros is a comprehensive aviation knowledge base platform designed for certified flight instructors, pilots, and aviation professionals. Built with Next.js 15, TypeScript, and optimized for high-performance content delivery.
</p>

<p align="center">
  <a href="https://cfipros.com">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 🚁 About CFIPros

CFIPros transforms aviation education by providing instant access to comprehensive, up-to-date aviation knowledge. Our platform serves as the definitive resource for:

- **Certified Flight Instructors (CFI)** - Master teaching techniques and stay current with regulations
- **Pilot Training** - Access structured learning paths for all certificate levels
- **Aviation Professionals** - Quick reference for regulations, procedures, and best practices
- **Flight Schools** - Comprehensive curriculum support and resources

## ✈️ Key Features

### 📚 Comprehensive Knowledge Base
- **10,000+ Aviation Topics** - Covering regulations, procedures, aircraft systems, and more
- **MDX-Powered Content** - Rich, interactive content with embedded components
- **Real-time Updates** - Always current with latest FAA regulations and procedures
- **Cross-Referenced Materials** - Seamless navigation between related topics

### 🔍 Advanced Search & Discovery
- **Instant Search** - Find any topic in milliseconds
- **Regulation-Specific Filters** - Search by FAR parts, AIM sections, or advisory circulars
- **Smart Suggestions** - AI-powered content recommendations
- **Mobile-Optimized** - Full functionality on all devices

### 🔐 Professional Access Control
- **Subscription-Based Access** - Tiered access for different user levels
- **Clerk Authentication** - Secure, passwordless login with MFA support
- **Progress Tracking** - Monitor learning progress and completion
- **Offline Access** - Download content for offline study

### 🚀 Performance & Scalability
- **Sub-second Page Loads** - Optimized static generation
- **CDN-Powered Delivery** - Global content distribution
- **Mobile-First Design** - Responsive across all devices
- **Railway Deployment** - Scalable cloud infrastructure

## 🛠️ Technical Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **MDX** - Markdown with React components

### Backend & Database
- **PostgreSQL** - Robust relational database
- **DrizzleORM** - Type-safe database queries
- **Railway** - Cloud deployment platform
- **Clerk** - Authentication and user management

### Development Tools
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Storybook** - Component development

### Monitoring & Analytics
- **Sentry** - Error tracking and monitoring
- **PostHog** - User analytics and insights
- **Arcjet** - Security and bot protection
- **LogTape** - Structured logging

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/marcusgoll/cfipros-handbook.git
   cd cfipros-handbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cfipros"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Security (Arcjet)
ARCJET_KEY="ajkey_..."

# Monitoring (Sentry)
SENTRY_DSN="https://..."

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."

# Logging (Better Stack)
BETTER_STACK_SOURCE_TOKEN="..."
```

## 📖 Content Management

### Content Structure
```
content/
├── handbook/
│   ├── regulations/
│   │   ├── far-part-61.mdx
│   │   ├── far-part-91.mdx
│   │   └── ...
│   ├── procedures/
│   │   ├── preflight-procedures.mdx
│   │   ├── emergency-procedures.mdx
│   │   └── ...
│   ├── reference/
│   │   ├── weather-codes.mdx
│   │   ├── radio-procedures.mdx
│   │   └── ...
│   └── aircraft-systems/
│       ├── engine-systems.mdx
│       ├── electrical-systems.mdx
│       └── ...
```

### Content Scripts
```bash
# Validate content
npm run content:validate

# Build content indexes
npm run content:build

# Generate search index
npm run search:index
```

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   railway login
   railway link
   ```

2. **Add PostgreSQL service**
   ```bash
   railway add postgresql
   ```

3. **Set environment variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
   # Add other environment variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Content validated and indexed
- [ ] SSL certificate configured
- [ ] CDN settings optimized
- [ ] Monitoring and logging active
- [ ] Performance metrics validated

## 📊 Performance Targets

- **Page Load Time**: < 1 second (95th percentile)
- **Search Response**: < 100ms
- **Mobile Performance**: > 90 Lighthouse score
- **Accessibility**: > 95 Lighthouse score
- **SEO**: > 95 Lighthouse score

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
npm run test:lighthouse
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛟 Support

- **Issues**: [GitHub Issues](https://github.com/marcusgoll/cfipros-handbook/issues)
- **Email**: [support@cfipros.com](mailto:support@cfipros.com)

## 🙏 Acknowledgments

- **Aviation Community** - For continuous feedback and support
- **FAA** - For providing comprehensive aviation regulations and guidance
- **Next.js Team** - For the excellent React framework
- **Clerk** - For secure authentication solutions
- **Railway** - For reliable cloud deployment platform

---

<p align="center">
  <strong>Ready to Master the Skies? Join CFIPros Today!</strong>
</p>

<p align="center">
  Made with ❤️ by the CFIPros Team
</p>