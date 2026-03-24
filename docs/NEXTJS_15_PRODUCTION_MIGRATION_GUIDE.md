# Centurion 100Cr Engine — Next.js 15 Production Migration Guide

**Version:** 1.0.0  
**Last Updated:** March 24, 2026  
**Target Next.js Version:** 15.1.x (Latest Stable)  
**Migration Model:** Parallel app (`frontend-next`) with phased cutover

---

## Executive Summary

This guide provides end-to-end instructions to migrate the 100Cr Engine from CRA + React Router to Next.js 15 with App Router. The migration prioritizes:

- **Performance**: React Server Components, streaming, edge-optimized
- **Security**: Middleware-based auth, server-only code, env isolation
- **AI Capabilities**: Server Actions for AI streaming, optimized API routes
- **Backend Integration**: Precise mapping to FastAPI endpoints

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Phase-by-Phase Migration Plan](#3-phase-by-phase-migration-plan)
4. [Frontend ↔ Backend Integration Map](#4-frontend--backend-integration-map)
5. [Authentication System](#5-authentication-system)
6. [Route Migration Reference](#6-route-migration-reference)
7. [Component Migration Guide](#7-component-migration-guide)
8. [API Layer Architecture](#8-api-layer-architecture)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Security Hardening](#10-security-hardening)
11. [AI Features & Server Actions](#11-ai-features--server-actions)
12. [Testing & Validation Checklist](#12-testing--validation-checklist)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Troubleshooting Guide](#14-troubleshooting-guide)

---

## 1. Architecture Overview

### 1.1 Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 15 FRONTEND                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   RSC       │  │   Client    │  │  Middleware │  │   Server    │        │
│  │   Pages     │  │ Components  │  │   (Auth)    │  │   Actions   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                    │                                        │
│                        ┌───────────┴───────────┐                            │
│                        │   API Client Layer    │                            │
│                        │   (server + client)   │                            │
│                        └───────────┬───────────┘                            │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  /api/user/*     │  /api/engine/*  │  /api/ai/*    │  /api/payments/*      │
│  /api/dashboard/*│  /api/benchmarks│  /api/waitlist│  /api/admin/*         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
    ┌───────────┐            ┌───────────┐              ┌───────────┐
    │  Supabase │            │ Anthropic │              │  Razorpay │
    │PostgreSQL │            │  Claude   │              │  Payments │
    │  + Auth   │            │   AI      │              │           │
    └───────────┘            └───────────┘              └───────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| App Router (not Pages) | Better RSC support, layouts, loading states |
| Keep FastAPI backend | No backend migration — maintain separation of concerns |
| Supabase SSR package | Cookie-based auth for middleware |
| Server Actions for AI | Streaming responses, better UX for AI features |
| Parallel Migration | Zero-downtime migration, rollback capability |

### 1.3 Technology Stack Comparison

| Layer | Current (CRA) | Target (Next.js 15) |
|-------|---------------|---------------------|
| Framework | React 18 + CRA + CRACO | Next.js 15.1.x |
| Router | react-router-dom v6 | Next.js App Router |
| Bundler | Webpack (via CRA) | Turbopack (dev) + webpack (prod) |
| Styling | Tailwind CSS 3.x | Tailwind CSS 3.x (same) |
| Auth | Supabase JS Client | Supabase SSR + Middleware |
| State | React Context | React Context + Server State |
| API | Axios + Fetch | Fetch + Server Actions |

---

## 2. Prerequisites & Setup

### 2.1 System Requirements

```bash
# Required versions
Node.js >= 18.17.0 (LTS recommended: 20.x)
npm >= 10.0.0 or pnpm >= 8.0.0
Git >= 2.40.0

# Verify versions
node -v   # Should be v18.17.0 or higher
npm -v    # Should be 10.0.0 or higher
```

### 2.2 Create Next.js 15 App

```powershell
# From repository root
cd "C:\Users\shresth_agarwal\Documents\devforge\New folder\CENTURION"

# Create Next.js 15 app with TypeScript
npx create-next-app@latest frontend-next --typescript --tailwind --eslint --app --src-dir --turbopack

# Answer prompts:
# √ Would you like to use `src/` directory? Yes
# √ Would you like to use App Router? Yes
# √ Would you like to use Turbopack for `next dev`? Yes
# √ Would you like to customize the import alias? Yes → @/*
```

### 2.3 Install Core Dependencies

```powershell
cd frontend-next

# Supabase (SSR-compatible)
npm install @supabase/supabase-js @supabase/ssr

# UI & Animation
npm install framer-motion lucide-react recharts sonner
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-slider
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-tooltip @radix-ui/react-checkbox
npm install @radix-ui/react-label @radix-ui/react-switch
npm install @radix-ui/react-progress @radix-ui/react-separator
npm install @radix-ui/react-popover @radix-ui/react-scroll-area

# State & Forms
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers zustand

# Utilities
npm install date-fns axios

# Dev dependencies
npm install -D @types/node
```

### 2.4 Environment Configuration

Create `frontend-next/.env.local`:

```env
# ═══════════════════════════════════════════════════════════════════════════
# CENTURION 100CR ENGINE — NEXT.JS 15 ENVIRONMENT
# ═══════════════════════════════════════════════════════════════════════════

# ── Supabase (Required) ────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://dryfkpbfuayzwrrkygsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeWZrcGJmdWF5endycmt5Z3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODYxMDUsImV4cCI6MjA4OTI2MjEwNX0.lfR9M5nUdANrBAUXOgeys9sBrYsTjhoyLcBWuRP-sBo

# ── Backend API (Required) ─────────────────────────────────────────────────
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001

# ── Admin (Required for admin routes) ──────────────────────────────────────
NEXT_PUBLIC_ADMIN_EMAILS=admin@100crengine.in

# ── Observability (Optional but recommended) ───────────────────────────────
# NEXT_PUBLIC_SENTRY_DSN=

# ── App Metadata ───────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_VERSION=5.0.0
NEXT_PUBLIC_APP_NAME=Centurion 100Cr Engine
```

### 2.5 Tailwind Configuration

Replace `frontend-next/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Centurion Design System Colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Centurion brand colors
        centurion: {
          gold: '#D4AF37',
          'gold-light': '#F4E4BC',
          navy: '#1E3A5F',
          'navy-dark': '#0F2744',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## 3. Phase-by-Phase Migration Plan

### Phase Overview

| Phase | Duration | Focus | Validation Gate |
|-------|----------|-------|-----------------|
| A | Day 1 | Project setup + global styles | App starts, styles render |
| B | Day 1-2 | Auth foundation + middleware | Login/logout works |
| C | Day 2-3 | API layer + providers | API calls succeed |
| D | Day 3-5 | Public routes migration | All public pages render |
| E | Day 5-7 | Dashboard routes migration | Dashboard loads |
| F | Day 7-8 | Admin + payments | Admin access works |
| G | Day 8-9 | AI features + Server Actions | AI features stream |
| H | Day 9-10 | Testing + hardening | All tests pass |

---

### Phase A: Project Setup & Global Styles

#### A.1 Directory Structure

Create the following structure in `frontend-next/src`:

```
src/
├── app/
│   ├── (public)/              # Public route group
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/
│   │   ├── privacy/
│   │   └── tools/
│   ├── (auth)/                # Auth route group
│   │   ├── auth/
│   │   │   └── callback/
│   │   └── checkout/
│   ├── (protected)/           # Protected route group
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   └── admin/
│   ├── api/                   # API routes (if needed)
│   ├── layout.tsx             # Root layout
│   ├── globals.css
│   ├── providers.tsx
│   └── not-found.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── layout/
│   ├── ui/
│   └── providers/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── supabase/
│   ├── engine/
│   └── utils/
├── context/
├── hooks/
├── types/
└── middleware.ts
```

#### A.2 Global Styles Migration

Create `frontend-next/src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════════════════════════════
   CENTURION DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */

@layer base {
  :root {
    /* Colors - Light Mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;

    /* Motion tokens */
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 400ms;
    --ease-luxury: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

    /* Centurion brand */
    --centurion-gold: #D4AF37;
    --centurion-gold-rgb: 212, 175, 55;
    --centurion-navy: #1E3A5F;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CENTURION CUSTOM COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

@layer components {
  .centurion-card {
    @apply relative overflow-hidden rounded-xl border border-white/10
           bg-gradient-to-br from-white/5 to-white/[0.02]
           backdrop-blur-xl shadow-2xl;
  }

  .centurion-gold-gradient {
    @apply bg-gradient-to-r from-[var(--centurion-gold)] to-amber-400;
  }

  .centurion-button-primary {
    @apply inline-flex items-center justify-center rounded-lg
           bg-gradient-to-r from-[var(--centurion-gold)] to-amber-400
           px-6 py-3 text-sm font-semibold text-slate-900
           transition-all duration-[var(--duration-normal)]
           hover:shadow-lg hover:shadow-[var(--centurion-gold)]/25
           hover:-translate-y-0.5 active:translate-y-0;
  }

  .centurion-glass {
    @apply backdrop-blur-xl bg-white/5 border border-white/10;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

@layer utilities {
  .animate-enter {
    animation: enter var(--duration-normal) var(--ease-luxury);
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .shimmer-loading {
    @apply relative overflow-hidden;
  }

  .shimmer-loading::after {
    content: '';
    @apply absolute inset-0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 2s linear infinite;
    background-size: 200% 100%;
  }
}
```

#### A.3 Root Layout

Create `frontend-next/src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Centurion 100Cr Engine | Revenue Milestone Prediction',
    template: '%s | Centurion 100Cr Engine',
  },
  description:
    'Calculate your path to ₹100 Crore ARR. Revenue milestone prediction platform for Indian SaaS founders.',
  keywords: ['SaaS', 'revenue', 'ARR', 'startup', 'India', 'founder'],
  authors: [{ name: '100Cr Engine Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Centurion 100Cr Engine',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A5F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-950 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### A.4 Providers Component

Create `frontend-next/src/app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: 'centurion-toast',
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

#### A.5 Validation Gate

```powershell
cd frontend-next
npm run dev
```

✅ **Pass criteria:**
- App starts at http://localhost:3000
- No console errors
- Global styles apply

---

### Phase B: Authentication Foundation

#### B.1 Supabase Client Setup

Create `frontend-next/src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient can only be used in browser');
  }

  if (!browserClient) {
    browserClient = createClient();
  }

  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url'
  );
}
```

Create `frontend-next/src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handle cookies in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handle cookies in Server Components
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Session error:', error.message);
    return null;
  }

  return session;
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
```

Create `frontend-next/src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
```

#### B.2 Middleware for Auth Protection

Create `frontend-next/src/middleware.ts`:

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/checkout', '/admin'];

// Routes that require admin access
const ADMIN_ROUTES = ['/admin'];

// Public routes that should redirect to dashboard if authenticated
const AUTH_REDIRECT_ROUTES = ['/'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Check if accessing protected route without auth
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    // Redirect to home with login intent
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('login', 'true');
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin route protection
  if (isAdminRoute && user) {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = user.email?.toLowerCase();

    if (!userEmail || !adminEmails.includes(userEmail)) {
      // Silently redirect non-admins to home (security through obscurity)
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

#### B.3 Auth Context Migration

Create `frontend-next/src/context/AuthContext.tsx`:

```typescript
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface Profile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  company_name?: string;
  stage?: string;
  sector?: string;
  current_mrr?: number;
  growth_rate?: number;
  business_model?: 'saas' | 'agency' | null;
  onboarding_completed?: boolean;
  beta_status?: 'active' | 'expired' | null;
  beta_expires_at?: string;
  streak_count?: number;
  dpdp_consent_given?: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: 'founder' | 'studio' | 'vc_portfolio' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  expires_at?: string;
}

interface AuthContextValue {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;

  // Methods
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  refreshProfile: () => Promise<void>;

  // Computed - Access Control
  isAuthenticated: boolean;
  isBetaUser: boolean;
  hasPaidSubscription: boolean;
  canAccessDashboard: boolean;

  // Computed - Persona
  businessModel: 'saas' | 'agency' | null;
  isSaaS: boolean;
  isAgency: boolean;
  hasPersona: boolean;
  hasCompletedOnboarding: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextValue | null>(null);

// ════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ════════════════════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch user data from backend ─────────────────────────────────────────
  const fetchUserData = useCallback(async (accessToken: string) => {
    if (!accessToken) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setSubscription(data.subscription);
      } else if (response.status === 401) {
        // Token invalid - sign out
        console.warn('Profile fetch returned 401 - signing out');
        await handleSignOut();
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  }, []);

  // ── Initialize auth ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserData(session.access_token);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        await fetchUserData(session.access_token);
      } else {
        setProfile(null);
        setSubscription(null);
      }

      setLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchUserData]);

  // ── Auth methods ─────────────────────────────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    }

    // Clear all state
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('centurion_gate_dismissed');
    }

    router.push('/');
  }, [router]);

  const getAccessToken = useCallback(() => {
    return session?.access_token ?? null;
  }, [session]);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (token) {
      await fetchUserData(token);
    }
  }, [getAccessToken, fetchUserData]);

  // ── Computed values ──────────────────────────────────────────────────────
  const computedValues = useMemo(() => {
    // Persona
    const businessModel = profile?.business_model ?? null;
    const isSaaS = businessModel === 'saas';
    const isAgency = businessModel === 'agency';
    const hasPersona = businessModel !== null;
    const hasCompletedOnboarding = profile?.onboarding_completed ?? false;

    // Beta check
    const isBetaUser = Boolean(
      profile?.beta_status === 'active' &&
        profile?.beta_expires_at &&
        new Date(profile.beta_expires_at) > new Date()
    );

    // Subscription check
    const hasPaidSubscription = Boolean(
      ['founder', 'studio', 'vc_portfolio'].includes(subscription?.plan ?? '') &&
        subscription?.status === 'active' &&
        subscription?.expires_at &&
        new Date(subscription.expires_at) > new Date()
    );

    // Dashboard access
    const canAccessDashboard = isBetaUser || hasPaidSubscription;

    return {
      businessModel,
      isSaaS,
      isAgency,
      hasPersona,
      hasCompletedOnboarding,
      isBetaUser,
      hasPaidSubscription,
      canAccessDashboard,
    };
  }, [profile, subscription]);

  // ── Context value ────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    // State
    user,
    session,
    profile,
    subscription,
    loading,

    // Methods
    signInWithMagicLink,
    signInWithGoogle,
    signOut: handleSignOut,
    getAccessToken,
    refreshProfile,

    // Computed
    isAuthenticated: Boolean(user),
    ...computedValues,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK
// ════════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
```

#### B.4 Auth Callback Page

Create `frontend-next/src/app/auth/callback/page.tsx`:

```typescript
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/?error=auth_failed');
        return;
      }

      // Get redirect from URL or localStorage
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-centurion-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/70">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-16 h-16 border-4 border-centurion-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
```

---

## 4. Frontend ↔ Backend Integration Map

This section provides the complete mapping between frontend features and backend API endpoints.

### 4.1 User Management APIs

| Frontend Feature | Method | Endpoint | Auth | Request Body | Response |
|------------------|--------|----------|------|--------------|----------|
| Profile fetch | GET | `/api/user/profile` | JWT | - | `{ user: Profile, subscription: Subscription }` |
| Profile update | PUT | `/api/user/profile` | JWT | `{ name?, company?, stage?, business_model? }` | `{ success: true, user: Profile }` |
| Onboarding | POST | `/api/user/onboarding` | JWT | `{ company_name, stage, sector, current_mrr, business_model }` | `{ success: true, projection?: {...} }` |
| Account delete | DELETE | `/api/user/delete` | JWT | - | `{ success: true }` |

### 4.2 Dashboard APIs

| Frontend Feature | Method | Endpoint | Auth | Response Shape |
|------------------|--------|----------|------|----------------|
| Command Centre | GET | `/api/dashboard/overview` | Paid | `{ companyName, currentMRR, growthRate, nextMilestone, healthScore, actionQueue, streak }` |
| Revenue Intelligence | GET | `/api/dashboard/revenue` | Paid | `{ revenueHistory[], growth, trends }` |
| Check-in submit | POST | `/api/checkin` | Paid | `{ success, streak_count }` |
| Check-in history | GET | `/api/checkins` | Paid | `{ checkins: CheckIn[] }` |

### 4.3 Engine APIs

| Frontend Feature | Method | Endpoint | Auth | Request Body | Response |
|------------------|--------|----------|------|--------------|----------|
| 100Cr Calculator | POST | `/api/engine/projection` | Optional | `{ current_mrr, growth_rate, months? }` | `{ milestones[], sensitivity, shareUrl }` |
| Share projection | GET | `/api/engine/projection/{slug}` | None | - | `{ inputs, result }` |
| Scenario analysis | POST | `/api/engine/scenario` | JWT | `{ scenarios: ScenarioInput[] }` | `{ scenarios: ScenarioResult[] }` |

### 4.4 Benchmark APIs

| Frontend Feature | Method | Endpoint | Auth | Response |
|------------------|--------|----------|------|----------|
| Stage list | GET | `/api/benchmarks/stages` | None | `{ stages: Stage[] }` |
| Stage benchmarks | GET | `/api/benchmarks/{stage}` | None | `{ medianGrowth, p25, p75, sampleSize }` |
| Compare to peers | POST | `/api/benchmarks/compare` | None | `{ percentile, comparison }` |

### 4.5 AI APIs

| Frontend Feature | Method | Endpoint | Auth | Rate Limit | Response |
|------------------|--------|----------|------|------------|----------|
| Daily Pulse | GET | `/api/ai/daily-pulse` | Paid | 60/day | `{ question, context }` |
| Weekly Question | GET | `/api/ai/weekly-question` | Paid | 7/day | `{ question }` |
| Board Report | POST | `/api/ai/board-report` | Paid | 2/month | `{ report: string }` |
| Strategy Brief | POST | `/api/ai/strategy-brief` | Paid | 1/month | `{ brief: string }` |
| Deviation Analysis | POST | `/api/ai/deviation` | Paid | - | `{ analysis, recommendations }` |
| AI Usage Stats | GET | `/api/ai/usage` | Paid | - | `{ monthlySpend, limits }` |

### 4.6 Payment APIs

| Frontend Feature | Method | Endpoint | Auth | Request Body | Response |
|------------------|--------|----------|------|--------------|----------|
| Create Order | POST | `/api/payments/razorpay/create-order` | JWT | `{ plan: "founder" }` | `{ orderId, amount, keyId }` |
| Webhook | POST | `/api/payments/razorpay/webhook` | HMAC | Razorpay event | `{ status: "ok" }` |

### 4.7 Connector APIs

| Frontend Feature | Method | Endpoint | Auth | Response |
|------------------|--------|----------|------|----------|
| List providers | GET | `/api/connectors/providers` | None | `{ providers: Provider[] }` |
| User connectors | GET | `/api/connectors` | Paid | `{ connectors: Connector[] }` |
| Connect | POST | `/api/connectors/{provider}/connect` | Paid | `{ success: true }` |
| Disconnect | DELETE | `/api/connectors/{provider}` | Paid | `{ success: true }` |
| Sync (stub) | POST | `/api/connectors/{provider}/sync` | Paid | `{ message: "coming soon" }` |

### 4.8 Waitlist APIs

| Frontend Feature | Method | Endpoint | Auth | Request Body | Response |
|------------------|--------|----------|------|--------------|----------|
| Join Waitlist | POST | `/api/waitlist` | None | `{ email, name, company, stage, dpdp_consent }` | `{ position, referral_url }` |
| Get Count | GET | `/api/waitlist/count` | None | - | `{ count: number }` |

### 4.9 Admin APIs

| Frontend Feature | Method | Endpoint | Auth | Response |
|------------------|--------|----------|------|----------|
| Platform Stats | GET | `/api/admin/stats` | Admin | `{ userCount, mrr, activeUsers }` |
| System Health | GET | `/api/admin/system/health` | Admin | `{ supabase, redis, scheduler }` |
| Scheduler Status | GET | `/api/admin/scheduler/status` | Admin | `{ jobs: Job[] }` |
| Trigger Job | POST | `/api/admin/trigger/{job}` | Admin | `{ triggered: true }` |
| Waitlist List | GET | `/api/admin/waitlist` | Admin | `{ entries: WaitlistEntry[] }` |
| Grant Beta | POST | `/api/admin/beta/{user_id}` | Admin | `{ success: true }` |

---

## 5. Authentication System

### 5.1 Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 15 AUTH FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User Action                Frontend                  Backend               Supabase
    │                         │                         │                     │
    │ Enter email             │                         │                     │
    │─────────────────────────>                         │                     │
    │                         │                         │                     │
    │                         │ supabase.auth.signInWithOtp()                 │
    │                         │─────────────────────────────────────────────> │
    │                         │                         │                     │
    │                         │ <───────── Magic link email sent ───────────  │
    │                         │                         │                     │
    │ Click magic link        │                         │                     │
    │─────────────────────────>                         │                     │
    │                         │                         │                     │
    │                         │ GET /auth/callback      │                     │
    │                         │ (middleware runs)       │                     │
    │                         │                         │                     │
    │                         │ exchangeCodeForSession()                      │
    │                         │─────────────────────────────────────────────> │
    │                         │                         │                     │
    │                         │ <───── session (JWT) ─────────────────────── │
    │                         │                         │                     │
    │                         │ GET /api/user/profile   │                     │
    │                         │ Authorization: Bearer   │                     │
    │                         │────────────────────────>│                     │
    │                         │                         │                     │
    │                         │                         │ verify_jwt_token()  │
    │                         │                         │ (RS256 / HS256)     │
    │                         │                         │                     │
    │                         │ <── profile + subscription                    │
    │                         │                         │                     │
    │                         │ Redirect based on access │                    │
    │                         │ • canAccessDashboard? → /dashboard            │
    │                         │ • else → /pricing       │                     │
```

### 5.2 Access Control Matrix

| Route Pattern | Auth Required | Subscription Required | Admin Required |
|---------------|---------------|----------------------|----------------|
| `/` | No | No | No |
| `/pricing` | No | No | No |
| `/privacy` | No | No | No |
| `/tools/*` | No | No | No |
| `/preview/*` | No | No | No |
| `/auth/callback` | No | No | No |
| `/checkout` | Yes | No | No |
| `/dashboard/*` | Yes | Yes (or Beta) | No |
| `/admin/*` | Yes | No | Yes |

### 5.3 JWT Verification (Backend)

The backend uses dual verification:

```python
# backend/services/auth.py

async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token using RS256 (JWKS) with HS256 fallback.
    """
    header = jwt.get_unverified_header(token)
    algorithm = header.get('alg', 'HS256')

    # 1. Try RS256 via JWKS (Supabase default for new tokens)
    if algorithm == 'RS256':
        jwks_client = get_jwks_client()
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256'],
                audience='authenticated'
            )

    # 2. Fallback to HS256 for legacy/test tokens
    jwt_secret = AuthConfig.get_jwt_secret()
    return jwt.decode(
        token,
        jwt_secret,
        algorithms=['HS256'],
        audience='authenticated'
    )
```

---

## 6. Route Migration Reference

### 6.1 Complete Route Mapping

| CRA Route | Next.js Path | File Location | Component Type |
|-----------|--------------|---------------|----------------|
| `/` | `/` | `app/(public)/page.tsx` | RSC |
| `/pricing` | `/pricing` | `app/(public)/pricing/page.tsx` | RSC |
| `/privacy` | `/privacy` | `app/(public)/privacy/page.tsx` | RSC |
| `/auth/callback` | `/auth/callback` | `app/auth/callback/page.tsx` | Client |
| `/tools/100cr-calculator` | `/tools/100cr-calculator` | `app/(public)/tools/100cr-calculator/page.tsx` | Client |
| `/tools/arr-calculator` | `/tools/arr-calculator` | `app/(public)/tools/arr-calculator/page.tsx` | Client |
| `/tools/runway-calculator` | `/tools/runway-calculator` | `app/(public)/tools/runway-calculator/page.tsx` | Client |
| `/tools/growth-calculator` | `/tools/growth-calculator` | `app/(public)/tools/growth-calculator/page.tsx` | Client |
| `/tools/invoice-health-calculator` | `/tools/invoice-health-calculator` | `app/(public)/tools/invoice-health-calculator/page.tsx` | Client |
| `/preview/*` | `/preview/*` | `app/(public)/preview/*/page.tsx` | RSC |
| `/checkout` | `/checkout` | `app/(auth)/checkout/page.tsx` | Client |
| `/dashboard` | `/dashboard` | `app/(protected)/dashboard/page.tsx` | Hybrid |
| `/dashboard/revenue` | `/dashboard/revenue` | `app/(protected)/dashboard/revenue/page.tsx` | Hybrid |
| `/dashboard/forecasting` | `/dashboard/forecasting` | `app/(protected)/dashboard/forecasting/page.tsx` | Hybrid |
| `/dashboard/benchmarks` | `/dashboard/benchmarks` | `app/(protected)/dashboard/benchmarks/page.tsx` | Hybrid |
| `/dashboard/reports` | `/dashboard/reports` | `app/(protected)/dashboard/reports/page.tsx` | Hybrid |
| `/dashboard/coach` | `/dashboard/coach` | `app/(protected)/dashboard/coach/page.tsx` | Client |
| `/dashboard/goals` | `/dashboard/goals` | `app/(protected)/dashboard/goals/page.tsx` | Client |
| `/dashboard/investors` | `/dashboard/investors` | `app/(protected)/dashboard/investors/page.tsx` | Hybrid |
| `/dashboard/connectors` | `/dashboard/connectors` | `app/(protected)/dashboard/connectors/page.tsx` | Client |
| `/dashboard/settings` | `/dashboard/settings` | `app/(protected)/dashboard/settings/page.tsx` | Client |
| `/dashboard/cashflow` | `/dashboard/cashflow` | `app/(protected)/dashboard/cashflow/page.tsx` | Hybrid |
| `/dashboard/ar-aging` | `/dashboard/ar-aging` | `app/(protected)/dashboard/ar-aging/page.tsx` | Hybrid |
| `/dashboard/collections` | `/dashboard/collections` | `app/(protected)/dashboard/collections/page.tsx` | Client |
| `/admin` | `/admin` | `app/(protected)/admin/page.tsx` | Client |

### 6.2 Layout Structure

```
app/
├── layout.tsx                    # Root layout (fonts, providers)
├── (public)/
│   ├── layout.tsx               # Public layout (Navbar, Footer)
│   ├── page.tsx                 # Landing
│   ├── pricing/page.tsx
│   ├── privacy/page.tsx
│   └── tools/
│       ├── layout.tsx
│       └── [calculator]/page.tsx
├── (auth)/
│   ├── auth/callback/page.tsx
│   └── checkout/page.tsx
└── (protected)/
    ├── layout.tsx               # Dashboard layout (sidebar)
    ├── dashboard/
    │   ├── layout.tsx           # Dashboard sub-layout
    │   ├── page.tsx             # Command Centre
    │   └── [...slug]/page.tsx
    └── admin/page.tsx
```

### 6.3 React Router → Next.js Migration Patterns

| React Router Pattern | Next.js Equivalent |
|---------------------|-------------------|
| `<Link to="/path">` | `<Link href="/path">` |
| `useNavigate()` | `useRouter().push()` |
| `useLocation().pathname` | `usePathname()` |
| `useParams()` | `useParams()` (same) |
| `useSearchParams()` | `useSearchParams()` (same, needs Suspense) |
| `<Navigate to="/path" replace />` | `redirect('/path')` (server) or `router.replace('/path')` (client) |
| `<Outlet />` | `{children}` in layout |
| Route guards | Middleware + layout checks |

---

## 7. Component Migration Guide

### 7.1 Client vs Server Component Decision Tree

```
Component needs...
├── useState, useEffect, useReducer? → 'use client'
├── Event handlers (onClick, onChange)? → 'use client'
├── Browser APIs (localStorage, window)? → 'use client'
├── useRouter, usePathname? → 'use client'
├── Framer Motion animations? → 'use client'
├── Context hooks (useAuth, useQuery)? → 'use client'
└── None of above? → Server Component (default)
```

### 7.2 Component Migration Checklist

For each component from `frontend/src/components/`:

1. **Determine type**: Client or Server (see decision tree)
2. **Add directive**: Add `'use client';` if client component
3. **Update imports**:
   - `react-router-dom` → `next/navigation`
   - `process.env.REACT_APP_*` → `process.env.NEXT_PUBLIC_*`
4. **Update hooks**:
   - `useNavigate()` → `useRouter()`
   - `useLocation()` → `usePathname()`
5. **Update Link components**:
   - `<Link to=...>` → `<Link href=...>`
6. **Test hydration**: Verify no mismatches

### 7.3 Key Component Migrations

#### Navbar Migration

```typescript
// frontend-next/src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Calculator, ChevronDown, 
  LayoutDashboard, LogOut 
} from 'lucide-react';

const FREE_TOOLS = [
  { label: '100Cr Calculator', href: '/tools/100cr-calculator' },
  { label: 'ARR Calculator', href: '/tools/arr-calculator' },
  { label: 'Runway Calculator', href: '/tools/runway-calculator' },
  { label: 'Growth Calculator', href: '/tools/growth-calculator' },
  { label: 'Invoice Health', href: '/tools/invoice-health-calculator' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, canAccessDashboard, signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">
              100<span className="text-centurion-gold">Cr</span> Engine
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Free Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <button className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors">
                <Calculator className="w-4 h-4" />
                <span>Free Tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg bg-slate-900 border border-white/10 shadow-xl overflow-hidden"
                  >
                    {FREE_TOOLS.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {tool.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/pricing"
              className={`text-sm ${
                pathname === '/pricing'
                  ? 'text-centurion-gold'
                  : 'text-white/70 hover:text-white'
              } transition-colors`}
            >
              Pricing
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {canAccessDashboard && (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {/* Open auth modal */}}
                className="centurion-button-primary"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              {FREE_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block text-white/70 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tool.label}
                </Link>
              ))}
              <Link
                href="/pricing"
                className="block text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

#### Dashboard Sidebar Migration

```typescript
// frontend-next/src/components/dashboard/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  BarChart2,
  FileText,
  Sparkles,
  Target,
  Users,
  Plug,
  Settings,
  LogOut,
  Activity,
  Clock,
  MessageSquare,
} from 'lucide-react';

const SAAS_NAV = [
  { label: 'Command Centre', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Revenue Intelligence', path: '/dashboard/revenue', icon: TrendingUp },
  { label: 'Forecasting', path: '/dashboard/forecasting', icon: LineChart },
  { label: 'Benchmarks', path: '/dashboard/benchmarks', icon: BarChart2 },
  { label: 'Reports', path: '/dashboard/reports', icon: FileText },
  { label: 'AI Growth Coach', path: '/dashboard/coach', icon: Sparkles },
  { label: 'Goals', path: '/dashboard/goals', icon: Target },
  { label: 'Investors', path: '/dashboard/investors', icon: Users },
  { label: 'Connectors', path: '/dashboard/connectors', icon: Plug },
];

const AGENCY_NAV = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cash Flow Radar', path: '/dashboard/cashflow', icon: Activity, badge: 'New' },
  { label: 'AR Aging', path: '/dashboard/ar-aging', icon: Clock },
  { label: 'Collections', path: '/dashboard/collections', icon: MessageSquare },
  { label: 'AI Business Coach', path: '/dashboard/coach', icon: Sparkles },
  { label: 'Connectors', path: '/dashboard/connectors', icon: Plug },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSaaS, isAgency, signOut, profile } = useAuth();

  const navItems = isSaaS ? SAAS_NAV : isAgency ? AGENCY_NAV : SAAS_NAV;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          100<span className="text-centurion-gold">Cr</span> Engine
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-centurion-gold/10 text-centurion-gold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {'badge' in item && (
                    <span className="ml-auto text-xs bg-centurion-gold/20 text-centurion-gold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/dashboard/settings"
          className={`
            flex items-center space-x-3 px-4 py-3 rounded-lg
            transition-colors
            ${pathname === '/dashboard/settings'
              ? 'bg-centurion-gold/10 text-centurion-gold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>

        {/* User info */}
        {profile && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-white/5">
            <p className="text-sm text-white font-medium truncate">
              {profile.company_name || profile.name || 'Your Company'}
            </p>
            <p className="text-xs text-white/50 truncate">{profile.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
```

---

## 8. API Layer Architecture

### 8.1 Server-Side API Client

Create `frontend-next/src/lib/api/server.ts`:

```typescript
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Server-side API client for use in Server Components and Server Actions.
 * Automatically includes auth token from Supabase session.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
    // Next.js 15 caching options
    next: {
      revalidate: options.cache === 'no-store' ? 0 : 60,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPED API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function getDashboardOverview() {
  return serverFetch<{
    companyName: string;
    currentMRR: number;
    growthRate: number;
    nextMilestone: {
      label: string;
      value: number;
      date: string;
      monthsAway: number;
    };
    healthScore: number;
    healthSignals: {
      growth: number;
      retention: number;
      runway: number;
      engagement: number;
    };
    actionQueue: Array<{
      id: string;
      type: string;
      title: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    streak: number;
  }>('/api/dashboard/overview', { cache: 'no-store' });
}

export async function getUserProfile() {
  return serverFetch<{
    user: Profile;
    subscription: Subscription;
  }>('/api/user/profile', { cache: 'no-store' });
}

export async function getBenchmarkStages() {
  return serverFetch<{
    stages: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>('/api/benchmarks/stages');
}

export async function getWaitlistCount() {
  return serverFetch<{ count: number }>('/api/waitlist/count');
}
```

### 8.2 Client-Side API Client

Create `frontend-next/src/lib/api/client.ts`:

```typescript
'use client';

import { getSupabaseClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Client-side API client for use in Client Components.
 * Handles auth token injection and error normalization.
 */
export async function clientFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const data = await response.json();
    throw {
      type: 'rate_limited',
      message: data.detail || 'Rate limit exceeded',
      resetAt: data.reset_at,
    };
  }

  // Handle auth errors
  if (response.status === 401) {
    throw {
      type: 'unauthorized',
      message: 'Please sign in again',
    };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// User APIs
export async function updateProfile(data: Partial<Profile>) {
  return clientFetch('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function completeOnboarding(data: OnboardingData) {
  return clientFetch('/api/user/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Check-in APIs
export async function submitCheckIn(data: { month: string; actual_revenue: number }) {
  return clientFetch('/api/checkin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCheckIns() {
  return clientFetch<{ checkins: CheckIn[] }>('/api/checkins');
}

// Engine APIs
export async function runProjection(data: {
  current_mrr: number;
  growth_rate: number;
  months?: number;
}) {
  return clientFetch('/api/engine/projection', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// AI APIs
export async function getDailyPulse() {
  return clientFetch<{ question: string; context?: string }>('/api/ai/daily-pulse');
}

export async function getWeeklyQuestion() {
  return clientFetch<{ question: string }>('/api/ai/weekly-question');
}

export async function generateBoardReport(data: { month: string }) {
  return clientFetch<{ report: string }>('/api/ai/board-report', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Connector APIs
export async function getConnectors() {
  return clientFetch<{ connectors: Connector[] }>('/api/connectors');
}

export async function connectProvider(provider: string, apiKey: string) {
  return clientFetch(`/api/connectors/${provider}/connect`, {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export async function disconnectProvider(provider: string) {
  return clientFetch(`/api/connectors/${provider}`, {
    method: 'DELETE',
  });
}

// Waitlist APIs
export async function joinWaitlist(data: WaitlistEntry) {
  return clientFetch<{ position: number; referral_url: string }>('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Payment APIs
export async function createRazorpayOrder(plan: 'founder') {
  return clientFetch<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>('/api/payments/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}
```

### 8.3 React Query Hooks

Create `frontend-next/src/hooks/useApi.ts`:

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/client';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.clientFetch('/api/dashboard/overview'),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useRevenueIntelligence() {
  return useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: () => api.clientFetch('/api/dashboard/revenue'),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK-IN HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useCheckIns() {
  return useQuery({
    queryKey: ['checkins'],
    queryFn: api.getCheckIns,
  });
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.submitCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AI HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDailyPulse() {
  return useQuery({
    queryKey: ['ai', 'daily-pulse'],
    queryFn: api.getDailyPulse,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  });
}

export function useWeeklyQuestion() {
  return useQuery({
    queryKey: ['ai', 'weekly-question'],
    queryFn: api.getWeeklyQuestion,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false,
  });
}

export function useGenerateBoardReport() {
  return useMutation({
    mutationFn: api.generateBoardReport,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTOR HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useConnectors() {
  return useQuery({
    queryKey: ['connectors'],
    queryFn: api.getConnectors,
  });
}

export function useConnectProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: string; apiKey: string }) =>
      api.connectProvider(provider, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}

export function useDisconnectProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.disconnectProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

---

## 9. Performance Optimizations

### 9.1 React Server Components Strategy

Use RSC for:
- Landing page (static content)
- Pricing page (mostly static)
- Privacy page (static)
- Dashboard layouts (fetch user data server-side)

```typescript
// app/(protected)/dashboard/page.tsx
import { getDashboardOverview } from '@/lib/api/server';
import { CommandCentreClient } from './CommandCentreClient';

export default async function DashboardPage() {
  // Fetch on server - no loading state needed
  const data = await getDashboardOverview();

  return <CommandCentreClient initialData={data} />;
}
```

### 9.2 Streaming with Suspense

```typescript
// app/(protected)/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';
import { DashboardContent } from './DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

### 9.3 Image Optimization

```typescript
import Image from 'next/image';

// Replace all img tags with Next Image
<Image
  src="/hero-dashboard.png"
  alt="Dashboard preview"
  width={1200}
  height={800}
  priority // for above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
/>
```

### 9.4 Font Optimization

Already configured in root layout with `next/font/google`:

```typescript
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevent FOUT
});
```

### 9.5 Bundle Analysis

Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

Install analyzer:

```bash
npm install -D @next/bundle-analyzer
```

Add to `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const config: NextConfig = {
  // ...
};

export default withBundleAnalyzer(config);
```

---

## 10. Security Hardening

### 10.1 Environment Variables

```typescript
// next.config.ts
const config: NextConfig = {
  env: {
    // Only expose public vars
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  },
};
```

### 10.2 Security Headers

```typescript
// next.config.ts
const config: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
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
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
};
```

### 10.3 Content Security Policy

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co ${process.env.NEXT_PUBLIC_BACKEND_URL};
  frame-src https://checkout.razorpay.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const config: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: cspHeader.replace(/\n/g, ' ').trim(),
        },
        // ... other headers
      ],
    },
  ],
};
```

### 10.4 Rate Limiting (Edge)

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only if using Upstash Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // Continue with auth middleware
  return updateSession(request);
}
```

---

## 11. AI Features & Server Actions

### 11.1 Server Actions for AI Streaming

Create `frontend-next/src/app/actions/ai.ts`:

```typescript
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getAuthHeaders() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function generateBoardReport(month: string) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BACKEND_URL}/api/ai/board-report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ month }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate report');
  }

  const data = await response.json();
  revalidatePath('/dashboard/reports');

  return data;
}

export async function generateStrategyBrief() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BACKEND_URL}/api/ai/strategy-brief`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate brief');
  }

  return response.json();
}

export async function analyzeDeviation(data: {
  planned_revenue: number;
  actual_revenue: number;
  period: string;
}) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BACKEND_URL}/api/ai/deviation`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze deviation');
  }

  return response.json();
}
```

### 11.2 AI Coach Page with Streaming

```typescript
// app/(protected)/dashboard/coach/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useDailyPulse, useWeeklyQuestion } from '@/hooks/useApi';
import { generateBoardReport } from '@/app/actions/ai';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Sparkles, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoachPage() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);

  const { data: dailyPulse, isLoading: pulseLoading } = useDailyPulse();
  const { data: weeklyQuestion, isLoading: questionLoading } = useWeeklyQuestion();

  const handleGenerateReport = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    startTransition(async () => {
      try {
        const result = await generateBoardReport(currentMonth);
        setReport(result.report);
        toast.success('Board report generated!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to generate report');
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-centurion-gold" />
          AI Growth Coach
        </h1>
        <p className="text-white/60 mt-1">
          Your personal AI-powered growth advisor
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Pulse */}
        <CenturionCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-centurion-gold" />
              Daily Pulse
            </h2>

            {pulseLoading ? (
              <div className="animate-pulse h-20 bg-white/5 rounded" />
            ) : (
              <p className="text-white/80">{dailyPulse?.question}</p>
            )}
          </div>
        </CenturionCard>

        {/* Weekly Question */}
        <CenturionCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-centurion-gold" />
              Strategic Question
            </h2>

            {questionLoading ? (
              <div className="animate-pulse h-20 bg-white/5 rounded" />
            ) : (
              <p className="text-white/80">{weeklyQuestion?.question}</p>
            )}
          </div>
        </CenturionCard>
      </div>

      {/* Board Report Generator */}
      <CenturionCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-centurion-gold" />
              Board Report Generator
            </h2>

            <button
              onClick={handleGenerateReport}
              disabled={isPending}
              className="centurion-button-primary flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>

          {report && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <pre className="text-white/80 whitespace-pre-wrap text-sm">
                {report}
              </pre>
            </div>
          )}
        </div>
      </CenturionCard>
    </div>
  );
}
```

---

## 12. Testing & Validation Checklist

### 12.1 Unit Testing Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 12.2 Playwright E2E Setup

```bash
npm install -D @playwright/test
npx playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 12.3 Migration Validation Checklist

Run through this checklist before cutover:

#### Functional Routes
- [ ] Landing page renders with all sections
- [ ] Pricing page shows correct plans
- [ ] Privacy page renders
- [ ] All 5 calculator tools work
- [ ] Preview pages render without auth
- [ ] Auth callback handles magic link
- [ ] Auth callback handles Google OAuth
- [ ] Checkout page loads for authenticated users
- [ ] Dashboard Command Centre loads with data
- [ ] All 9 SaaS dashboard routes work
- [ ] All 6 Agency dashboard routes work
- [ ] Admin dashboard loads for admin users
- [ ] 404 page renders for unknown routes

#### Authentication
- [ ] Magic link email sends
- [ ] Magic link completes sign-in
- [ ] Google OAuth completes sign-in
- [ ] Sign-out clears all state
- [ ] Protected routes redirect unauthenticated users
- [ ] Dashboard redirects non-subscribers to pricing
- [ ] Admin routes redirect non-admins silently

#### API Integration
- [ ] Profile fetch works
- [ ] Profile update saves
- [ ] Onboarding completes successfully
- [ ] Check-in submits and updates streak
- [ ] Dashboard overview loads
- [ ] Revenue intelligence loads
- [ ] AI daily pulse returns question
- [ ] AI weekly question returns question
- [ ] Board report generates
- [ ] Connectors list loads
- [ ] Connector connect works
- [ ] Razorpay order creates
- [ ] Waitlist join works

#### Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 300KB (first load)

#### Security
- [ ] All env vars are NEXT_PUBLIC_ prefixed
- [ ] No credentials in client bundle
- [ ] CSP headers present
- [ ] HTTPS enforced
- [ ] Rate limiting works

---

## 13. Deployment Strategy

### 13.1 Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### 13.2 Environment Variables (Vercel)

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview |
| `NEXT_PUBLIC_BACKEND_URL` | Production, Preview |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Production |

### 13.3 Vercel Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 13.4 Cutover Plan

1. **Pre-cutover (T-24h)**
   - Run full test suite on staging
   - Verify all API integrations
   - Check Sentry integration
   - Backup CRA build

2. **Cutover (T-0)**
   - Deploy Next.js to production
   - Verify critical paths
   - Monitor error rates

3. **Post-cutover (T+24h)**
   - Monitor Sentry for new errors
   - Check Core Web Vitals
   - Verify analytics tracking

4. **Rollback procedure**
   - Revert DNS to CRA deployment
   - Or: Vercel instant rollback

---

## 14. Troubleshooting Guide

### 14.1 Common Issues

#### Hydration Mismatch

**Symptom:** Console error about hydration mismatch

**Fix:**
```typescript
// Add suppressHydrationWarning to dynamic content
<span suppressHydrationWarning>{new Date().toLocaleString()}</span>

// Or use useEffect for client-only rendering
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

#### Missing `'use client'`

**Symptom:** Error about using hooks in Server Component

**Fix:**
```typescript
// Add at top of file
'use client';

import { useState } from 'react';
```

#### Cookie/Session Issues

**Symptom:** Auth state lost on navigation

**Fix:**
```typescript
// Ensure middleware is updating session
// Check middleware.ts matcher config
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### API Route 500 Errors

**Symptom:** Server Actions failing

**Fix:**
```typescript
// Check error handling in server action
export async function myAction() {
  try {
    // ... action code
  } catch (error) {
    console.error('Action error:', error);
    throw error; // Re-throw for client handling
  }
}
```

### 14.2 Performance Issues

#### Slow Initial Load

**Check:**
1. Bundle analyzer output
2. Large dependencies
3. Missing dynamic imports

**Fix:**
```typescript
// Dynamic import for heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

#### API Calls Slow

**Check:**
1. Server component vs client fetch
2. Caching configuration
3. Backend response times

**Fix:**
```typescript
// Use server-side fetch with caching
const data = await fetch(url, {
  next: { revalidate: 60 }, // Cache for 60s
});
```

### 14.3 Build Errors

#### TypeScript Errors

```bash
# Strict type checking
npm run build

# Check specific file
npx tsc --noEmit src/path/to/file.tsx
```

#### Missing Modules

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## Appendix A: File Migration Checklist

Use this checklist when migrating each file:

```
□ Determine component type (Server/Client)
□ Add 'use client' if needed
□ Update imports:
  □ react-router-dom → next/navigation
  □ REACT_APP_* → NEXT_PUBLIC_*
  □ Relative → @/ alias
□ Update hooks:
  □ useNavigate → useRouter
  □ useLocation → usePathname
  □ useHistory → useRouter
□ Update Link components:
  □ to → href
  □ Remove component prop
□ Update Image components:
  □ img → next/image
  □ Add width/height
□ Test in isolation
□ Test with full app
□ Check hydration
□ Check console errors
```

---

## Appendix B: Quick Commands

```powershell
# Development
cd frontend-next
npm run dev                    # Start dev server (Turbopack)

# Build & Test
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # ESLint
npm run test                   # Vitest unit tests
npx playwright test            # E2E tests

# Analysis
npm run analyze                # Bundle analysis

# Deployment
vercel                         # Preview deployment
vercel --prod                  # Production deployment
```

---

**End of Migration Guide**

*Last Updated: March 24, 2026*
*Version: 1.0.0*
*Target: Next.js 15.1.x*

