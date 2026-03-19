# Centurion — 100Cr Engine: Complete UI/UX Inventory

> **Audit Date**: March 18, 2026  
> **Framework**: React 19 + React Router 7 + CRA (Craco)  
> **Purpose**: Reference document for Next.js migration and Figma enhancement

---

## 1. Design System Audit

### 1.1 Font Families

| Font | Weight | Usage |
|------|--------|-------|
| **Manrope** | 400, 500, 600, 700, 800 | Headings, brand text (`.font-heading`, `.type-display`, `.type-hero`, `.type-title`, `.type-heading`) |
| **Inter** | 400, 500, 600 | Body text, UI labels, form inputs (default `body` font-family) |
| **JetBrains Mono** | 400, 500, 600 | Financial numbers, code, metrics (`.font-mono`, `.tabular-nums`) |

**Import**: Google Fonts via `@import url()` in `index.css`

**Typography Scale (CSS Variables)**:
```css
--type-display: clamp(52px, 8vw, 88px)    /* Hero headlines */
--type-hero: clamp(36px, 5vw, 60px)       /* Section headlines */
--type-title: clamp(24px, 3vw, 36px)      /* Page titles */
--type-heading: 20px                       /* Card headings */
--type-body: 16px                          /* Body text */
--type-small: 14px                         /* Small text */
--type-label: 12px                         /* Labels, uppercase */
```

**Letter Spacing**:
- Display: `-0.04em`
- Hero: `-0.03em`
- Title: `-0.02em`
- Heading: `-0.01em`
- Label: `0.06em` (uppercase)

**Line Heights**:
- Display/Hero: `1.04–1.08`
- Title/Heading: `1.15–1.3`
- Body: `1.7`
- Small: `1.65`

---

### 1.2 Color Palette

**Surfaces (CSS Variables in tokens.css)**:
| Variable | Hex | Usage |
|----------|-----|-------|
| `--surface-0` | `#FFFFFF` | Main background |
| `--surface-1` | `#FAFAFA` | Secondary background, footer |
| `--surface-2` | `#F4F4F5` | Card backgrounds, sections |
| `--surface-3` | `#EEEEEF` | Hover states |
| `--surface-4` | `#E8E8E9` | Borders |
| `--surface-5` | `#E2E2E3` | Dividers |

**Text Colors**:
| Variable | Hex | Usage |
|----------|-----|-------|
| `--text-primary` | `#09090B` | Headlines, primary text |
| `--text-secondary` | `#52525B` | Body text, descriptions |
| `--text-tertiary` | `#A1A1AA` | Helper text, labels |
| `--text-disabled` | `rgba(0,0,0,0.2)` | Disabled states |

**Additional Hardcoded Colors (used directly)**:
| Hex | Usage |
|-----|-------|
| `#71717A` | Muted text (Zinc 500) |
| `#18181B` | Dark hover state |
| `#27272A` | Dark gradient end |
| `#F9FAFB` | Window chrome bg |

**Semantic/Functional Colors**:
| Color | Hex | Usage |
|-------|-----|-------|
| Emerald 500 | `#10B981` | Positive indicators, growth |
| Emerald 600 | `#059669` | Positive text |
| Emerald 100 | `#D1FAE5` | Positive backgrounds |
| Amber 400 | `#FBBF24` | Warning indicators |
| Amber 500 | `#F59E0B` | Warning state |
| Amber 600 | `#D97706` | Warning text |
| Red 500 | `#EF4444` | Critical/destructive |
| Red 600 | `#DC2626` | Error text |
| Violet 600 | `#7C3AED` | Accent (announcement bar) |
| Purple 600 | `#9333EA` | Accent gradient |
| Blue 500 | `#3B82F6` | Links, info |

**Premium Gradients (CSS Variables)**:
```css
--gradient-gold: linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 50%, #D4B896 100%)
--gradient-obsidian: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)
--gradient-onyx: linear-gradient(135deg, #09090B 0%, #18181B 50%, #27272A 100%)
--gradient-emerald: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)
--gradient-glass-light: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)
```

**Shadcn HSL Variables (index.css @layer base)**:
```css
--background: 0 0% 100%
--foreground: 0 0% 3.9%
--primary: 0 0% 3.5%
--primary-foreground: 0 0% 98%
--secondary: 0 0% 96.1%
--muted: 0 0% 96.1%
--muted-foreground: 0 0% 45.1%
--destructive: 0 84.2% 60.2%
--border: 0 0% 89.8%
--ring: 0 0% 3.9%
--radius: 0.5rem
```

---

### 1.3 Spacing Scale

**System**: Tailwind default scale (rem-based, 4px base)

**Commonly Used**:
| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Icon spacing |
| `gap-2` | 8px | Tight element spacing |
| `gap-3` | 12px | Component internal spacing |
| `gap-4` | 16px | Card content spacing |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Major section gaps |
| `gap-12` | 48px | Hero/section spacing |
| `p-4` | 16px | Card padding |
| `p-6` | 24px | Large card padding |
| `p-8` | 32px | Hero content padding |
| `px-4` | 16px | Container horizontal padding |
| `md:px-8` | 32px | Desktop container padding |
| `py-20` | 80px | Section vertical padding |
| `md:py-32` | 128px | Large section padding |

**Custom Spacing**:
- Max width container: `max-w-6xl` (72rem / 1152px)
- Max width narrow: `max-w-4xl` (56rem / 896px)
- Max width text: `max-w-2xl` (42rem / 672px)

---

### 1.4 Border Radius Pattern

**Tailwind Config Extensions**:
```javascript
lg: 'var(--radius)'          // 0.5rem = 8px
md: 'calc(var(--radius) - 2px)'  // 6px
sm: 'calc(var(--radius) - 4px)'  // 4px
```

**Commonly Used**:
| Class | Value | Usage |
|-------|-------|-------|
| `rounded-full` | 9999px | Pills, avatar, buttons |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-xl` | 12px | Inner cards, icons |
| `rounded-lg` | 8px | Inputs, small cards |
| `rounded-md` | 6px | Buttons |

**Inconsistency Noted**: Mix of `rounded-2xl` (cards) and `rounded-lg` (inputs) creates slight visual disconnect.

---

### 1.5 Shadow Usage

**CSS Variables (tokens.css)**:
```css
--shadow-card: 0 1px 2px rgba(0,0,0,0.04), 
               0 4px 8px rgba(0,0,0,0.04), 
               0 12px 24px rgba(0,0,0,0.04)

--shadow-card-hover: 0 2px 4px rgba(0,0,0,0.06), 
                     0 8px 16px rgba(0,0,0,0.06), 
                     0 20px 40px rgba(0,0,0,0.06)

--shadow-nav: 0 1px 0 rgba(0,0,0,0.05), 
              0 8px 32px rgba(0,0,0,0.08)

--shadow-premium: 0 4px 6px rgba(0,0,0,0.05), 
                  0 10px 20px rgba(0,0,0,0.08), 
                  0 20px 40px rgba(0,0,0,0.1)

--shadow-glow-gold: 0 0 40px rgba(212,184,150,0.3)
--shadow-glow-emerald: 0 0 40px rgba(110,231,183,0.3)
```

**Inline Shadows (hardcoded)**:
- Navbar: `shadow-[0_8px_32px_rgba(0,0,0,0.12)]`
- Hero button: `shadow-[0_4px_24px_rgba(0,0,0,0.2)]`
- Dropdown: `shadow-[0_16px_48px_rgba(0,0,0,0.12)]`
- Hero chart card: `shadow-[0_24px_80px_rgba(0,0,0,0.12)]`

---

### 1.6 CSS Variables / Tailwind Config Customizations

**Custom Animations (tailwind.config.js)**:
```javascript
keyframes: {
  'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  'marquee': { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-33.333%)' } },
  'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
},
animation: {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'marquee': 'marquee 25s linear infinite',
  'float': 'float 3s ease-in-out infinite'
}
```

**Motion Tokens (tokens.css)**:
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-luxury: cubic-bezier(0.22, 1, 0.36, 1)
--duration-fast: 150ms
--duration-base: 200ms
--duration-enter: 500ms
--duration-slow: 800ms
```

**Background Patterns (index.css)**:
```css
.bg-dot-grid {
  background-image: radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

**Plugin**: `tailwindcss-animate`

---

## 2. Page-by-Page Inventory

---

### 2.1 Landing Page (/)

**Route**: `/`  
**File**: `src/pages/LandingPage.jsx`  
**Layout**: Single-page scroll, vertical sections

**Structure**:
1. `<Navbar />` — Fixed floating pill
2. `<AnnouncementBar />` — Fixed below navbar
3. `<HeroSection />` (HeroSectionNew) — Full viewport
4. `<LogoCarousel />` — Horizontal marquee
5. `<ScrollStorySection />` — 5 feature sections
6. `<InlineCTA variant="dark" />` — Dark band CTA
7. `<FounderDNAQuiz />` — Lead gen quiz
8. `<SocialProofSection />` — Metrics + testimonials
9. `<TeaserLockedSection />` — Blurred premium features
10. `<InlineCTA />` — Light CTA
11. `<PricingSection />` — 2-column cards
12. `<CTASection />` — Final CTA
13. `<Footer />`

**Components Present**:
- `Navbar` (from layout/)
- `AnnouncementBar` (from layout/)
- `HeroSection` (HeroSectionNew.jsx)
- `LogoCarousel`
- `ScrollStorySection`
- `FounderDNAQuiz`
- `SocialProofSection`
- `TeaserLockedSection`
- `PricingSection`
- `CTASection`, `InlineCTA` (CTASectionNew.jsx)
- `Footer`

**Interactive Elements**:
- Navbar: Tools dropdown, user menu dropdown, mobile menu toggle
- Hero: 2 CTA buttons ("Start Free Projection", "See how it works")
- Logo carousel: Auto-scrolling marquee
- Scroll story: "Try it free" buttons per section
- Quiz: Multi-step form with radio options, email input
- Pricing: 2 CTA buttons per plan
- CTA Section: Large CTA button

**Animation/Motion**:
- Hero text: Framer `initial={{ opacity: 0, y: 30 }}` → `animate={{ opacity: 1, y: 0 }}`, staggered delays (0.1–0.5s), duration 0.5–0.7s
- Hero chart: `initial={{ opacity: 0, x: 40, scale: 0.95 }}` → `animate` on view, duration 0.8s, delay 0.3s
- Chart line: Recharts `animationDuration={1500}`, `animationEasing="ease-out"`
- Animated counter: Custom hook using `requestAnimationFrame`, 2s duration
- Scroll indicator: Infinite `y: [0, 8, 0]`, duration 2s
- Logo carousel: CSS `animate-marquee` 30s linear infinite
- ScrollStorySection: `useInView` trigger, `initial={{ opacity: 0, x: -40 }}` / `x: 40`, duration 0.6–0.7s
- SocialProofSection metrics: Staggered fade-in with scale spring
- Testimonials: `initial={{ opacity: 0, y: 40 }}`, delay per index * 0.15
- TeaserLockedSection: Blur overlay, lock icon scale animation
- ScrollReveal wrapper: `initial={{ opacity: 0, y: 24 }}` → `whileInView`, duration 0.5s, ease-out-expo

**Data Visualization**:
- Hero: `AreaChart` (Recharts) with gradient fill, 7 data points (hardcoded mock)
- ScrollStorySection: `AreaChart` preview (hardcoded data)

**Responsive Behavior**:
- Navbar: Hidden on mobile (`hidden md:flex`), shows mobile menu toggle
- Hero: Grid `lg:grid-cols-2`, stacks on mobile
- Metrics row: `grid-cols-2 md:grid-cols-4`
- Pricing: `grid md:grid-cols-2`
- Mobile bottom padding: `pb-20` on main

**Loading/Error States**:
- Quiz: Loading spinner during API call, fallback mock result on error
- No skeleton loaders on landing

**Mock vs Live Data**:
- ALL data is hardcoded/mock (chart data, testimonials, metrics values like "10,000+" projections)
- Quiz submits to `/api/quiz/submit` but falls back to mock result on error

---

### 2.2 Auth Callback (/auth/callback)

**Route**: `/auth/callback`  
**File**: `src/pages/AuthCallback.jsx`

**Layout**: Centered content, full viewport height

**Structure**:
- Single centered container `max-w-md`
- Status-based rendering (processing / success / error)

**Components Present**:
- No reusable components, inline JSX only
- Icons: `Loader2`, `CheckCircle`, `AlertCircle` (Lucide)

**Interactive Elements**:
- Error state: "Try again" button → navigates to `/`

**Animation/Motion**:
- All states: Framer `initial={{ opacity: 0, scale: 0.9 }}` → `animate={{ opacity: 1, scale: 1 }}`

**Responsive Behavior**:
- Fully responsive (centered design)

**Loading/Error States**:
- **Processing**: Spinning `Loader2`, text "Signing you in..."
- **Success**: Green circle with `CheckCircle`, "Welcome back!", redirects in 1.5s
- **Error**: Red circle with `AlertCircle`, error message displayed, retry button

**Mock vs Live Data**:
- Uses Supabase `getSession()`; if `isSupabaseConfigured()` returns false, shows mock success state

---

### 2.3 Pricing Page (/pricing)

**Route**: `/pricing`  
**File**: `src/pages/PricingPage.jsx`

**Layout**: Simple page wrapper

**Structure**:
1. `<Navbar />`
2. `<PricingSection />` (reused from landing)
3. `<Footer />`

**Components Present**:
- `Navbar`, `Footer`, `PricingSection`

**Interactive Elements**:
- Same as landing pricing section (2 CTA buttons)

**Animation/Motion**:
- `ScrollReveal` wrapper on each card (delay 0.06 / 0.12)

**Responsive Behavior**:
- `pt-24` top padding for fixed navbar
- Grid `md:grid-cols-2`

**Loading/Error States**:
- None (static content)

**Mock vs Live Data**:
- All copy from `copy.js` (static)

---

### 2.4 100Cr Calculator (/tools/100cr-calculator)

**Route**: `/tools/100cr-calculator`  
**File**: `src/pages/tools/HundredCrCalculator.jsx`

**Layout**: 3-column grid (1 input + 2 results on desktop)

**Structure**:
1. `<Navbar />`
2. Header (centered)
3. Main content grid:
   - Left column: Input card (MRR slider, Growth slider, Stage buttons) + Sensitivity card
   - Right column (2-span): Result card (target date, chart, legend) + Milestone cards (4x) + Benchmark card + Action buttons
4. `<Footer />`

**Components Present**:
- `Navbar`, `Footer`
- `CenturionCard`, `CenturionCardContent`
- `SliderInput` (x2)
- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent`
- `ScrollReveal`

**Interactive Elements**:
- MRR Slider: min 10,000 / max 50,000,000 / step 10,000
- Growth Slider: min 0.01 / max 0.30 / step 0.01
- Stage buttons: 3 options (Pre-Seed, Seed, Series A)
- Share projection button (non-functional stub)
- Download PDF button (non-functional stub)

**Animation/Motion**:
- Result target date: Framer `initial={{ opacity: 0, y: 10 }}` → `animate`, keyed by `targetDate`
- SliderInput thumb: CSS `hover:scale-110`, `transition-transform duration-150`

**Data Visualization**:
- `LineChart` (Recharts): 2 lines (Your projection black, Median gray dashed)
- ReferenceLine at 100Cr (dashed)
- Custom Tooltip (dark background)
- Benchmark progress bars (3x) with CSS width transitions

**Responsive Behavior**:
- Grid: `lg:grid-cols-3`, stacks on mobile
- Milestone cards: `grid-cols-2 md:grid-cols-4`
- Chart height: `h-[300px]`

**Loading/Error States**:
- None (all calculations are frontend, instant)

**Mock vs Live Data**:
- All calculations are **frontend-only** via `lib/engine/projection.js`
- No API calls on main calculation path

---

### 2.5 ARR Calculator (/tools/arr-calculator)

**Route**: `/tools/arr-calculator`  
**File**: `src/pages/tools/ARRCalculator.jsx`

**Layout**: 2-column grid

**Structure**:
1. `<Navbar />`
2. Header (centered)
3. Grid: Left (inputs) / Right (results)
4. `<Footer />`

**Components Present**:
- `Navbar`, `Footer`, `CenturionCard`, `SliderInput`, `Tooltip`

**Interactive Elements**:
- MRR Slider, Customers Slider, ARPU Slider

**Animation/Motion**:
- None (static UI)

**Data Visualization**:
- None (numeric displays only)

**Responsive Behavior**:
- Grid `md:grid-cols-2`

**Loading/Error States**:
- None

**Mock vs Live Data**:
- Frontend calculations only

---

### 2.6 Runway Calculator (/tools/runway-calculator)

**Route**: `/tools/runway-calculator`  
**File**: `src/pages/tools/RunwayCalculator.jsx`

**Layout**: 2-column grid

**Components Present**:
- `Navbar`, `Footer`, `CenturionCard`, `SliderInput`

**Interactive Elements**:
- 4 sliders: Cash in Bank, Monthly Burn, Monthly Revenue, Growth Rate

**Data Visualization**:
- None (numeric result with conditional coloring)

**Responsive Behavior**:
- Grid `md:grid-cols-2`

**Conditional Styling**:
- Result card changes bg color based on status:
  - Critical: `bg-red-50 border-red-200`
  - Warning: `bg-amber-50 border-amber-200`
  - Healthy: `bg-[#09090B]` (dark)

---

### 2.7 Growth Calculator (/tools/growth-calculator)

**Route**: `/tools/growth-calculator`  
**File**: `src/pages/tools/GrowthCalculator.jsx`

**Layout**: 2-column grid

**Components Present**:
- `Navbar`, `Footer`, `CenturionCard`, `SliderInput`

**Interactive Elements**:
- 3 sliders: Previous Revenue, Current Revenue, Number of Months

**Data Visualization**:
- None (numeric displays)

**Conditional Styling**:
- T2D3 Status badge color based on performance

---

### 2.8 Dashboard - Command Centre (/dashboard)

**Route**: `/dashboard` (index route)  
**File**: `src/pages/dashboard/CommandCentre.jsx`  
**Layout**: Wrapped in `DashboardLayout`

**Structure**:
1. Header with title + sync status + refresh button + check-in button
2. Top row: Milestone countdown (dark, 2-span) + Health score card
3. Action queue card
4. AI priority card (gradient bg)
5. Streak indicator

**Components Present**:
- `CenturionCard`, `CenturionCardContent`
- `CheckInModal` (modal)
- `SyncStatus`, `RefreshButton`
- `UpgradeModal` (triggered on rate limit)
- `OnboardingTour`
- Icons from Lucide

**Interactive Elements**:
- "Monthly Check-in" button → opens `CheckInModal`
- Refresh button
- Tour restart button
- Action queue items (clickable)

**Animation/Motion**:
- Health score ring: Animated circular progress (likely inline SVG or CSS)
- Cards: Hover lift via `CenturionCard hover` prop

**Data Visualization**:
- Health score circular progress
- Streak counter

**Responsive Behavior**:
- Grid `md:grid-cols-3`
- Mobile: Stacked layout

**Loading/Error States**:
- **Loading**: Centered `Loader2` spinner
- **Error**: Falls back to `fallbackData` (mock), shows error silently
- Rate limit 429 → shows `UpgradeModal`

**Mock vs Live Data**:
- Calls `fetchDashboardOverview(token)`
- Uses `fallbackData` object on error (hardcoded company "Your Startup", MRR 420000, etc.)

---

### 2.9 Dashboard - Revenue Intelligence (/dashboard/revenue)

**Route**: `/dashboard/revenue`  
**File**: `src/pages/dashboard/RevenueIntelligence.jsx`

**Structure**:
1. Header with sync status
2. 4-metric row (MRR, MoM Growth, vs Baseline, vs Benchmark)
3. Revenue chart (Actual vs Baseline vs Benchmark)
4. Cohort retention table

**Components Present**:
- `CenturionCard`, `SyncStatus`, `RefreshButton`

**Data Visualization**:
- `AreaChart` (Recharts): 3 areas (actual, baseline, benchmark)
- Cohort table: Color-coded cells by retention %

**Loading/Error States**:
- `Loader2` spinner
- Fallback to `fallbackRevenueData` array

**Mock vs Live Data**:
- Calls `fetchRevenueIntelligence(token)`
- Falls back to 7-month hardcoded mock data

---

### 2.10 Dashboard - Forecasting Engine (/dashboard/forecasting)

**Route**: `/dashboard/forecasting`  
**File**: `src/pages/dashboard/ForecastingEngine.jsx`

**Structure**:
1. Header
2. Scenario controls card (3 sliders)
3. 24-month scenario chart
4. Sensitivity matrix table
5. What-if narrator card

**Interactive Elements**:
- Base Growth slider, Churn slider, Expansion slider

**Data Visualization**:
- `LineChart`: 3 lines (Optimistic, Base, Pessimistic)
- Sensitivity table: Color-coded cells

**Loading/Error States**:
- None (all frontend calculations)

---

### 2.11 Dashboard - Benchmark Intelligence (/dashboard/benchmarks)

**Route**: `/dashboard/benchmarks`  
**File**: `src/pages/dashboard/BenchmarkIntelligence.jsx`

**Structure**:
1. Header
2. Stage comparison cards
3. Peer distribution chart
4. Transition readiness score

**Data Visualization**:
- Bar charts for peer comparison
- Percentile gauge

---

### 2.12 Dashboard - Reporting Engine (/dashboard/reports)

**Route**: `/dashboard/reports`  
**File**: `src/pages/dashboard/ReportingEngine.jsx`

**Structure**:
1. Header
2. Report type cards (Board Report, Investor Update, Strategy Brief, Data Room)
3. Generated report preview area

**Interactive Elements**:
- Generate report buttons
- Download/share buttons

---

### 2.13 Dashboard - AI Growth Coach (/dashboard/coach)

**Route**: `/dashboard/coach`  
**File**: `src/pages/dashboard/AIGrowthCoach.jsx`

**Structure**:
1. Header
2. Daily Pulse card (left border accent)
3. Weekly Question card (dark background)
4. Deviation Alerts accordion
5. Coaching History list

**Components Present**:
- `CenturionCard` with custom border styling

**Interactive Elements**:
- Refresh buttons on pulse/question
- Textarea for reflection input
- Expandable deviation alerts

**Animation/Motion**:
- Refresh icon: `animate-spin` when loading

**Loading/Error States**:
- Per-section `Loader2` spinners
- Falls back to mock data

**Mock vs Live Data**:
- Calls `getDailyPulse(token)`, `getWeeklyQuestion(token)`
- Fallback objects hardcoded

---

### 2.14 Dashboard - Goal Architecture (/dashboard/goals)

**Route**: `/dashboard/goals`  
**File**: `src/pages/dashboard/GoalArchitecture.jsx`

**Structure**:
1. Header
2. Milestone ladder visualization
3. Quarterly goals cards
4. Weekly commitment tracker

---

### 2.15 Dashboard - Investor Relations (/dashboard/investors)

**Route**: `/dashboard/investors`  
**File**: `src/pages/dashboard/InvestorRelations.jsx`

**Structure**:
1. Header
2. Projection pack generator
3. Funding timeline
4. Dilution modeller

---

### 2.16 Dashboard - Connectors (/dashboard/connectors)

**Route**: `/dashboard/connectors`  
**File**: `src/pages/dashboard/Connectors.jsx`

**Structure**:
1. Header with trust notice
2. Tier 1 providers (API Key): Razorpay, Stripe, Cashfree, Chargebee
3. Tier 2 providers (OAuth): Coming soon indicators
4. Tier 3 providers (CSV): Tally, Amazon, Flipkart

**Interactive Elements**:
- Connect buttons (open modal with API key input)
- Disconnect buttons (confirmation)
- Sync buttons (stub — "coming soon")

**Loading/Error States**:
- Connection status indicators
- Sync status with last_synced_at timestamp

---

### 2.17 Dashboard - Settings (/dashboard/settings)

**Route**: `/dashboard/settings`  
**File**: `src/pages/dashboard/Settings.jsx` (761 lines)

**Structure**:
1. Tabs: Profile | Billing | Support
2. Profile tab: Personal info form, Company info form, Notifications toggles, Delete account section
3. Billing tab: Current plan card, Payment history, Upgrade CTA
4. Support tab: Help center links, Contact form

**Components Present**:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Radix)
- `Switch` (Radix)
- `Badge`, `Button`, `Label`
- `Tooltip`
- `BackgroundPaths`, `GlassAccountSettingsCard`

**Interactive Elements**:
- Profile form inputs (text, select, toggle switches)
- Save profile button (**NOTE: Not wired to API — only console.log**)
- Delete account button (confirmation modal)
- Invoice download buttons

**Animation/Motion**:
- Tab content: Framer `initial={{ opacity: 0, y: 10 }}` → `animate`

**Loading/Error States**:
- Save button: Shows loading spinner, success checkmark

**Mock vs Live Data**:
- Profile form pre-filled from `useAuth()` context
- **Profile save is NOT persisted** — handleSaveProfile only logs to console

---

## 3. Component Library Audit

### Layout Components (`components/layout/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `Navbar` | none | Floating pill, centered, glassmorphism (`bg-white/70 backdrop-blur-xl`), 56px height, `rounded-full`, contains logo + tools dropdown + links + auth | All pages except dashboard |
| `AnnouncementBar` | none | Fixed below navbar, violet gradient bar, 40px height, dismiss button | Landing |
| `Footer` | none | Light gray bg (`#FAFAFA`), 4-column grid on desktop, logo + links + copyright | All public pages |
| `DashboardSidebar` | none | Fixed left, 256px wide, white bg, vertical nav links with icons, bottom section with plan badge + settings + logout | Dashboard pages (desktop only) |

### UI Primitives (`components/ui/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `Button` | variant, size, asChild | shadcn button with variants (default, destructive, outline, secondary, ghost, link), sizes (default, sm, lg, icon) | Throughout |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | className | Standard shadcn card, `rounded-xl border shadow` | Settings |
| `CenturionCard`, `CenturionCardContent` | hover, variant (default/premium/glass/dark) | Custom card with gradient overlays, `rounded-2xl`, premium shadows, hover lift effect | Calculator, Dashboard |
| `SliderInput` | label, value, onChange, min, max, step, formatValue, helperText | Radix slider with label + value display, black thumb, gray track | Calculators, Forecasting |
| `ScrollReveal` | delay, once | Framer Motion wrapper for scroll-triggered fade-in | Landing sections |
| `AnimatedNumber` | value, prefix, suffix, duration | Counter animation using requestAnimationFrame | Hero section |
| `SyncIndicator` (SyncStatus, RefreshButton) | lastSynced, isLoading, isError | Small status dot + timestamp, refresh icon button | Dashboard pages |
| `BackgroundPaths` | className | Decorative SVG paths/blobs | Settings |
| `GlassAccountSettingsCard` | children | Glassmorphism wrapper for settings cards | Settings |
| `UpgradeTeaserModal` | onClose, reason, featureName | Modal showing upgrade prompt when rate limited | Command Centre |
| `input` | type, value, onChange, placeholder, className | Standard input, `rounded-xl` styling inline | Settings forms |
| `select` | value, onChange, className | Standard select, `rounded-xl` styling inline | Settings forms |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | standard Radix props | Radix tabs with custom styling | Settings |
| `Switch` | checked, onCheckedChange | Radix toggle switch | Settings notifications |
| `Badge` | variant | Small label pill | Settings, Dashboard |
| `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` | standard Radix props | Info hover tooltips | Calculator, Settings |
| `Dialog` | open, onOpenChange | Radix modal wrapper | Various modals |
| `Accordion` | type, collapsible | Radix accordion | AI Coach alerts |
| `Skeleton` | className | Loading placeholder | Not observed in use |
| `Progress` | value | Progress bar | Not observed in use |
| `Avatar` | src, fallback | User avatar | Not observed in use |

### Dashboard Components (`components/dashboard/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `DashboardSidebar` | none | 256px fixed sidebar with nav links | DashboardLayout |
| `CheckInModal` | isOpen, onClose, onSuccess | Modal with month selector, revenue input, notes textarea | Command Centre |

### Landing Components (`components/landing/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `HeroSectionNew` | none | Full-height hero with left text + right chart, gradient backgrounds | Landing |
| `HeroSection` (legacy) | none | Not used | — |
| `LogoCarousel` | none | Edge-faded marquee of infrastructure logos | Landing |
| `ScrollStorySection` | none | 5 feature sections with left/right layout | Landing |
| `FounderDNAQuiz` | none | Multi-step quiz form with progress bar | Landing |
| `SocialProofSection` | none | Metrics grid + testimonial cards | Landing |
| `TeaserLockedSection` | none | 3 blurred premium feature cards with lock overlay | Landing |
| `PricingSection` | none | 2-column pricing cards | Landing, Pricing |
| `CTASectionNew` (CTASection, InlineCTA) | variant | Final CTA block, inline CTA bands | Landing |
| `CTASection` (legacy) | none | Not used | — |
| `FeatureStorySection` (legacy) | none | Not used | — |
| `MetricsSection` (legacy) | none | Not used | — |

### Auth Components (`components/auth/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `AuthModal` | isOpen, onClose | Email input modal for magic link auth | Navbar |
| `ProtectedRoute` | children, requirePaid | Route wrapper checking auth state | App.js |

### Tour Components (`components/tour/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `OnboardingTour` | none | Step-by-step spotlight tour | Command Centre |

### Upgrade Components (`components/upgrade/`)

| Component | Props | Visual Description | Used In |
|-----------|-------|-------------------|---------|
| `UpgradeModal` | reason, featureName, currentUsage, limit | Modal with usage stats and upgrade CTA | Command Centre |

---

## 4. Navigation & Layout Audit

### Top Navigation (Public Pages)

**Component**: `Navbar` (`components/layout/Navbar.jsx`)

**Structure**:
- Fixed position (`fixed top-4 left-1/2 -translate-x-1/2`)
- Floating pill design (`rounded-full`)
- Glassmorphism (`bg-white/70 backdrop-blur-xl` when scrolled)
- Height: 56px
- Max width: `max-w-[95vw]`

**Items**:
1. Logo ("100Cr Engine")
2. Tools dropdown (4 items: 100Cr, ARR, Runway, Growth)
3. Benchmarks link
4. Pricing link
5. Auth CTA or User menu (when logged in)

**Behavior on Scroll**:
- Adds shadow on scroll (`shadow-[0_8px_32px_rgba(0,0,0,0.12)]`)
- Hides when scrolling down > 100px, shows on scroll up
- Transition: `duration: 0.2s, ease: [0.16, 1, 0.3, 1]`

**Mobile Behavior** (not visible in current implementation):
- Mobile menu trigger exists but menu content not fully implemented
- Links hidden (`hidden md:flex`)

### Dashboard Sidebar

**Component**: `DashboardSidebar` (`components/dashboard/DashboardSidebar.jsx`)

**Structure**:
- Fixed left (`fixed left-0 top-0 bottom-0`)
- Width: 256px (`w-64`)
- White background with right border
- Hidden on mobile (`hidden lg:flex`)

**Items** (9 nav links):
1. Command Centre (`/dashboard`)
2. Revenue Intelligence (`/dashboard/revenue`)
3. Forecasting Engine (`/dashboard/forecasting`)
4. Benchmark Intelligence (`/dashboard/benchmarks`)
5. Reporting Engine (`/dashboard/reports`)
6. AI Growth Coach (`/dashboard/coach`)
7. Goal Architecture (`/dashboard/goals`)
8. Investor Relations (`/dashboard/investors`)
9. API Connectors (`/dashboard/connectors`)

**Bottom Section**:
- Plan badge (Founder Plan, amber gradient)
- Settings link
- Sign out button

**Active State**:
- Black background (`bg-[#09090B]`), white text
- Others: Gray text, hover bg

**Collapse Behavior**:
- Not implemented (no collapse/expand)

### Mobile Navigation

**Component**: Within `DashboardLayout.jsx`

**Structure**:
- Fixed bottom (`fixed bottom-0 left-0 right-0`)
- Height: 64px (`h-16`)
- White background with top border
- Hidden on desktop (`lg:hidden`)

**Items** (5 items):
1. Home → Command Centre
2. Revenue
3. Forecast
4. Coach
5. Connect → Connectors

**Active State**:
- Black text/icon; inactive: gray (`#A1A1AA`)

### Route Transition Behavior

**Not implemented** — No page transition animations. Routes switch instantly.

---

## 5. Animation & Motion Audit

### Framer Motion Usage

| Component | Animation | Duration | Easing | Trigger |
|-----------|-----------|----------|--------|---------|
| **HeroSection** text | `opacity: 0→1, y: 30→0` | 0.5–0.7s | default | Mount |
| **HeroSection** chart container | `opacity: 0→1, x: 40→0, scale: 0.95→1` | 0.8s | default | Mount |
| **HeroSection** milestone badge | `opacity: 0→1, scale: 0.8→1` | spring, delay 0.2s | spring | After chart animation |
| **HeroSection** floating card | `opacity: 0→1, y: 20→0` | 0.5s, delay 1.2s | default | Mount |
| **HeroSection** scroll indicator | `y: [0, 8, 0]` | 2s, infinite | default | Mount |
| **Navbar** | `y: 0→-100` | 0.2s | `[0.16, 1, 0.3, 1]` | Scroll hide/show |
| **Navbar dropdown** | `opacity: 0→1, y: 8→0, scale: 0.96→1` | 0.15s | default | Open/close |
| **AnnouncementBar** | `height: 0→auto, opacity: 0→1` | 0.3s | default | Mount/dismiss |
| **AnnouncementBar** icon | `rotate: [0, 15, -15, 0]` | 2s, infinite | easeInOut | Mount |
| **ScrollReveal** | `opacity: 0→1, y: 24→0` | 0.5s | `[0.16, 1, 0.3, 1]` | `whileInView` |
| **ScrollStorySection** | `opacity: 0→1, x: ±40→0` | 0.6s | default | `whileInView` |
| **FounderDNAQuiz** steps | `AnimatePresence` exit/enter | varies | default | Step change |
| **SocialProofSection** metrics | `opacity: 0→1, y: 30→0, scale: 0→1` | 0.5s | spring | `whileInView` |
| **TeaserLockedSection** pulsing badge | `boxShadow: [0→8px→0]` | 2s, infinite | default | Mount |
| **Calculator** result date | `opacity: 0→1, y: 10→0` | default | default | Value change (keyed) |
| **CenturionCard hover** | `translate-y: -4px` | 0.3s | `var(--ease-luxury)` | Hover |
| **Button hover** | `scale: 1.02` | default | default | Hover |
| **Button tap** | `scale: 0.98` | default | default | Tap |
| **Settings tab content** | `opacity: 0→1, y: 10→0` | default | default | Tab switch |

### CSS Transitions

| Element | Property | Duration | Location |
|---------|----------|----------|----------|
| Navbar background/shadow | `all` | 300ms | `transition-all duration-300` |
| Links color | `colors` | 150ms–200ms | `transition-colors duration-150` |
| Card shadow/border | `all` | 300ms | CenturionCard |
| Slider thumb | `transform` | 150ms | SliderInput |
| Button background | `colors` | 200ms | button.jsx |
| Input focus ring | `all` | default | `transition-all` |

### CSS Keyframe Animations

| Animation | Duration | Usage |
|-----------|----------|-------|
| `marquee` | 25–30s linear infinite | Logo carousel |
| `float` | 3s ease-in-out infinite | Not observed in use |
| `accordion-down/up` | 0.2s ease-out | Radix accordion |
| `shimmer` | 2–3s ease-in-out infinite | Premium buttons (`:hover::before`) |
| `spin` | standard | Loading spinners |
| `pulse` | standard | Status indicators |
| `pulse-gold` | 2s ease-in-out infinite | Tour spotlight |

### Scroll-Triggered Effects

- `ScrollReveal` component: `whileInView` with `margin: '-80px'`
- `useInView` hook: Used in ScrollStorySection, SocialProofSection, TeaserLockedSection
- `useScroll` + `useTransform`: Hero section parallax effect (opacity, y, scale)

### Overall Motion Assessment: **MODERATE-TO-HEAVY**

The application uses significant animation:
- Every landing section has entrance animations
- Multiple infinite animations (marquee, pulsing badges, icon rotations)
- Smooth hover/focus states throughout
- Respects `prefers-reduced-motion` via Framer's `useReducedMotion` and CSS media query

---

## 6. UX Gaps & Inconsistencies

### Components/Pages Visually Disconnected

1. **Settings page** uses significantly more complex patterns (glassmorphism cards, background paths) compared to other dashboard pages which use simple `CenturionCard`
2. **Pricing cards** use `CenturionCard` while Settings billing uses different card patterns
3. **Tool pages** (ARR, Runway, Growth) are visually simpler than 100Cr Calculator — missing benchmark sections, fewer visual flourishes

### Missing States

1. **Landing page**: No skeleton loaders during quiz API call — jumps from loading spinner to result
2. **Dashboard pages**: Fallback to mock data on error without user notification
3. **Connectors page**: "Coming soon" is only text — no visual empty state
4. **Share/Download buttons**: Click handlers are stubs — no feedback to user that feature is unavailable
5. **Settings profile save**: Form appears to save (loading state) but **data is not persisted** — misleading UX

### Inconsistent Patterns

1. **Button shapes**: 
   - Hero CTA: `rounded-full h-14 px-8`
   - Pricing CTA: `rounded-lg h-11`
   - Dashboard buttons: `rounded-xl h-10 px-4`
   - Card action buttons: `rounded-lg h-10 px-5`

2. **Card radius**:
   - `CenturionCard`: `rounded-2xl` (16px)
   - `Card` (shadcn): `rounded-xl` (12px)
   - Some inline cards: `rounded-lg` (8px)

3. **Text color usage**:
   - Primary text alternates between `text-[#09090B]` and `text-foreground`
   - Secondary text alternates between `text-[#52525B]`, `text-[#71717A]`, `text-muted-foreground`

4. **Shadow application**:
   - Some cards use CSS variable `shadow-card`
   - Others use inline `shadow-[...]` with different values

5. **Spacing in cards**:
   - Some cards: `p-6`
   - Others: `p-8`
   - Some with `CenturionCardContent`: `p-5`

### Accessibility Issues

1. **Missing aria-labels**:
   - Slider thumbs have no aria-label (rely on Radix defaults)
   - Icon-only buttons (refresh, dismiss) have no visible labels
   - Mobile nav icons without text labels

2. **Focus states**:
   - Global `:focus-visible` set in CSS (`outline: 2px solid rgba(0,0,0,0.5)`)
   - Some custom buttons may override focus styles inconsistently

3. **Color contrast**:
   - `text-[#A1A1AA]` on white may fail WCAG AA for small text
   - `text-white/50` on dark backgrounds is low contrast

4. **Keyboard navigation**:
   - Dropdown menus use Radix (keyboard accessible)
   - Modal focus trap handled by Radix Dialog
   - Tour spotlight may trap focus unexpectedly

5. **Screen reader**:
   - Chart data not accessible (Recharts provides limited a11y)
   - Animated numbers don't announce updates

### Mobile Experience Gaps

1. **Navbar mobile menu**: Links hidden on mobile, hamburger menu not fully implemented
2. **Dashboard mobile header**: Only shows logo, no access to full navigation
3. **Dashboard content**: Some charts/tables may overflow on small screens
4. **Horizontal scroll**: Sensitivity matrix table needs horizontal scroll on mobile
5. **Touch targets**: Some buttons/links may be smaller than 44x44px minimum

---

## 7. Strengths to Preserve

### Visual Design

1. **Color palette**: Clean, professional grayscale with emerald/amber accents. Premium feel without being gaudy.

2. **Typography system**: Well-defined scale with Manrope for headings (distinctive) and Inter for body (readable). JetBrains Mono for numbers adds clarity.

3. **CenturionCard component**: Sophisticated card with gradient overlays, premium shadows, and smooth hover animations. Creates visual hierarchy.

4. **Dark/light card contrast**: Strategic use of `bg-[#09090B]` cards for key metrics creates visual hierarchy within pages.

5. **Floating navbar**: Modern glassmorphism pill design that hides on scroll-down feels premium and unobtrusive.

6. **Hero section**: Strong visual impact with animated chart, staggered text reveals, and trust metrics. Conversion-focused.

### Motion Design

7. **ScrollReveal pattern**: Consistent, subtle entrance animations that don't feel overwhelming. Respects reduced motion.

8. **Hero animations**: Staggered reveals create a "story" effect. Chart animation draws attention to key value prop.

9. **Navbar scroll behavior**: Smooth hide/show on scroll direction feels polished.

### UX Patterns

10. **Single-page calculator**: Instant calculations without API latency creates responsive feel.

11. **Fallback to mock data**: Dashboard remains usable even when API fails (though notification would improve it).

12. **Copy.js centralization**: All user-facing strings in one file enables easy copy updates and i18n readiness.

13. **Slider + value display pattern**: Real-time value updates with `tabular-nums` font variant prevents layout shifts.

14. **Dashboard sidebar design**: Clear hierarchy with icon + label, active state is obvious, bottom section for settings/logout.

### Technical Implementation

15. **CSS variables for theming**: Design tokens in `tokens.css` enable consistent theming and future dark mode.

16. **Tailwind + shadcn foundation**: Solid component primitives that are accessible by default (Radix).

17. **Component organization**: Clear separation of landing, dashboard, layout, and UI components.

---

## Appendix: File Index

### Pages
- `src/pages/LandingPage.jsx`
- `src/pages/PricingPage.jsx`
- `src/pages/AuthCallback.jsx`
- `src/pages/tools/HundredCrCalculator.jsx`
- `src/pages/tools/ARRCalculator.jsx`
- `src/pages/tools/RunwayCalculator.jsx`
- `src/pages/tools/GrowthCalculator.jsx`
- `src/pages/dashboard/DashboardLayout.jsx`
- `src/pages/dashboard/CommandCentre.jsx`
- `src/pages/dashboard/RevenueIntelligence.jsx`
- `src/pages/dashboard/ForecastingEngine.jsx`
- `src/pages/dashboard/BenchmarkIntelligence.jsx`
- `src/pages/dashboard/ReportingEngine.jsx`
- `src/pages/dashboard/AIGrowthCoach.jsx`
- `src/pages/dashboard/GoalArchitecture.jsx`
- `src/pages/dashboard/InvestorRelations.jsx`
- `src/pages/dashboard/Connectors.jsx`
- `src/pages/dashboard/Settings.jsx`
- `src/pages/preview/PreviewPages.jsx`

### Styles
- `src/index.css` (333 lines)
- `src/styles/tokens.css` (73 lines)
- `tailwind.config.js` (85 lines)

### Core
- `src/App.js` (99 lines)
- `src/lib/copy.js` (359 lines)
- `src/context/AuthContext.jsx`
- `src/lib/engine/projection.js`
- `src/lib/engine/benchmarks.js`
- `src/lib/engine/constants.js`

---

*Document generated for design handoff. All values are exact as found in the codebase.*

