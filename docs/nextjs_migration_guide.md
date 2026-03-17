# 100Cr Engine - Next.js Migration Guide

## Overview

This guide outlines the steps to migrate the 100Cr Engine frontend from Create React App (CRA) to Next.js for improved performance, SEO, and developer experience.

## Why Migrate to Next.js?

### Current Limitations (CRA)
- Client-side rendering only
- No built-in SEO optimization
- No automatic code splitting beyond routes
- Manual configuration for environment variables
- No built-in API routes

### Next.js Benefits
- **Server-Side Rendering (SSR)**: Better SEO, faster initial load
- **Static Site Generation (SSG)**: Pre-render landing page at build time
- **API Routes**: Can consolidate backend in monorepo
- **Image Optimization**: Automatic image optimization
- **File-based Routing**: Cleaner route structure
- **Built-in CSS/Font Optimization**

## Migration Plan

### Phase 1: Project Setup

```bash
# Create new Next.js project alongside existing
npx create-next-app@latest frontend-next --typescript --tailwind --app

# Copy key configurations
cp frontend/.env frontend-next/.env.local
```

### Phase 2: Directory Structure

**Current (CRA):**
```
frontend/src/
├── App.js
├── components/
├── pages/
├── lib/
└── context/
```

**Target (Next.js App Router):**
```
frontend-next/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── (auth)/
│   │   └── auth/callback/
│   │       └── page.tsx
│   ├── tools/
│   │   ├── 100cr-calculator/
│   │   │   └── page.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   ├── page.tsx        # Command Centre
│   │   ├── revenue/
│   │   │   └── page.tsx
│   │   └── ...
│   └── api/                # Optional: API routes
├── components/
├── lib/
└── context/
```

### Phase 3: Component Migration

#### 3.1 Root Layout

**app/layout.tsx:**
```tsx
import { Inter, Manrope } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata = {
  title: '100Cr Engine - When Will You Reach ₹100 Crore?',
  description: 'Revenue milestone prediction for Indian founders',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### 3.2 Landing Page (SSG)

**app/page.tsx:**
```tsx
import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FounderDNAQuiz } from '@/components/landing/FounderDNAQuiz'
// ... other imports

// This page is statically generated at build time
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FounderDNAQuiz />
        {/* ... other sections */}
      </main>
      <Footer />
    </>
  )
}
```

#### 3.3 Protected Routes

**middleware.ts:**
```ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/?login=true', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

#### 3.4 Dashboard Layout

**app/dashboard/layout.tsx:**
```tsx
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

### Phase 4: API Integration

#### Option A: Keep Separate Backend
Keep the FastAPI backend separate and call it from Next.js client/server components.

**lib/api.ts:**
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchProjection(inputs: ProjectionInputs) {
  const res = await fetch(`${API_URL}/api/engine/projection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  })
  return res.json()
}
```

#### Option B: Migrate to API Routes
Move FastAPI logic to Next.js API routes for a unified deployment.

**app/api/engine/projection/route.ts:**
```ts
import { NextRequest, NextResponse } from 'next/server'
import { predictTrajectory } from '@/lib/engine/projection'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = predictTrajectory(body)
  return NextResponse.json(result)
}
```

### Phase 5: Component Updates

#### 5.1 Client Components
Add `'use client'` directive to interactive components:

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function HeroSection() {
  // Component with hooks/interactivity
}
```

#### 5.2 Server Components
Keep data-fetching components as server components:

```tsx
// No 'use client' - this is a server component
import { fetchBenchmarks } from '@/lib/api'

export async function BenchmarkDisplay({ stage }: { stage: string }) {
  const data = await fetchBenchmarks(stage)
  return <div>{/* render data */}</div>
}
```

### Phase 6: Environment Variables

**Rename and update:**
```env
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=https://api.100crengine.in
```

### Phase 7: Build & Deploy

```bash
# Build
npm run build

# Test production
npm run start

# Deploy to Vercel
vercel deploy --prod
```

## Migration Checklist

### Pre-Migration
- [ ] Audit current components for client/server split
- [ ] Document all environment variables
- [ ] List third-party dependencies
- [ ] Plan URL structure for routes

### During Migration
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Migrate context providers
- [ ] Migrate components (client/server split)
- [ ] Set up Supabase auth helpers
- [ ] Configure middleware for protected routes
- [ ] Migrate API calls
- [ ] Test all routes

### Post-Migration
- [ ] Performance testing (Lighthouse)
- [ ] SEO audit
- [ ] Verify auth flows
- [ ] Update deployment pipeline
- [ ] Update documentation

## Breaking Changes to Handle

### 1. React Router → Next.js Router
```tsx
// Before (React Router)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')

// After (Next.js)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')
```

### 2. Environment Variables
```tsx
// Before
process.env.REACT_APP_BACKEND_URL

// After
process.env.NEXT_PUBLIC_API_URL
```

### 3. CSS Imports
```tsx
// Before (CRA)
import './styles.css'
import '@/index.css'

// After (Next.js)
// Import in layout.tsx or use CSS modules
import styles from './styles.module.css'
```

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Setup | 1 day | None |
| Core migration | 3-4 days | Setup |
| Auth integration | 1-2 days | Core |
| Testing | 2 days | Auth |
| Deployment | 1 day | Testing |
| **Total** | **8-10 days** | |

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
