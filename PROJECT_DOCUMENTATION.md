# Bitcoin Savings Tracker - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Feature Documentation](#feature-documentation)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [API Endpoints](#api-endpoints)
8. [Data Synchronization](#data-synchronization)
9. [User Interface Design](#user-interface-design)
10. [Setup & Deployment](#setup--deployment)
11. [Key Calculations & Formulas](#key-calculations--formulas)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Bitcoin Savings Tracker** is a modern, full-stack web application designed to help users track, manage, and analyze their Bitcoin investments and savings over time. The app provides portfolio management, DCA simulation, investment goal tracking, and comprehensive market analysis with Persian (Farsi) language support.

### Key Features
- 📊 **Portfolio Dashboard** - Real-time BTC holdings and metrics
- 💰 **Purchase Management** - Add, edit, delete purchase records
- 📈 **DCA Simulator** - Dollar-cost averaging strategy modeling
- 🎯 **Goal Tracking** - Create and track financial investment goals
- 📉 **Statistics & Analytics** - Advanced market analysis and charts
- 🔄 **Cloud Sync** - Automatic data synchronization with Supabase
- 👤 **User Accounts** - Secure authentication and session management
- 🌓 **Dark/Light Theme** - Full theme support
- 📱 **Responsive Design** - Mobile-first, desktop-enhanced UI
- 🌐 **PWA Support** - Installable as native app

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Hooks + SWR
- **Date Handling**: date-fns, Jalali date utilities (Persian calendar)

### Backend
- **Runtime**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email/Password)
- **Data Sync**: Real-time with Supabase Client SDK

### External APIs
- **Bitcoin Price Data**:
  - CoinGecko API (primary)
  - Binance API (fallback)
  - CoinCap API (secondary fallback)
- **Iranian Exchange Rate**: Nobitex API

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Environment**: Next.js 16 with Turbopack (stable)

---

## Project Structure

```
bitcoin-savings-tracker/
├── app/
│   ├── layout.tsx                 # Root layout with theme setup
│   ├── page.tsx                   # Main dashboard page with tab routing
│   ├── globals.css                # Tailwind CSS configuration
│   ├── account/
│   │   ├── page.tsx               # User account & session management
│   │   └── actions.ts             # Server actions for account operations
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── callback/route.ts      # OAuth callback handler
│   └── api/
│       ├── bitcoin-data/route.ts  # Bitcoin price caching API
│       └── nobitex/route.ts       # Iranian exchange rate API
├── components/
│   ├── pages/
│   │   ├── dca-page.tsx           # DCA simulator page
│   │   ├── goals-page.tsx         # Goal tracking page
│   │   └── statistics-page.tsx    # Analytics & statistics page
│   ├── ui/                         # shadcn/ui components
│   ├── sidebar.tsx                # Navigation sidebar
│   ├── bottom-nav.tsx             # Mobile bottom navigation
│   ├── price-ticker.tsx           # Real-time BTC price display
│   ├── portfolio-chart.tsx        # Portfolio visualization
│   ├── purchase-history.tsx       # Transaction list
│   ├── metrics-cards.tsx          # Key metrics display
│   └── [other components]
├── lib/
│   ├── supabase/
│   │   ├── client.tsx             # Client-side Supabase instance
│   │   ├── server.ts              # Server-side Supabase instance
│   │   ├── middleware.ts          # Auth middleware for API routes
│   │   └── admin.ts               # Admin Supabase client (service role)
│   ├── hooks.ts                   # Custom React hooks (useAuth, useChartColors)
│   ├── types.ts                   # TypeScript type definitions
│   ├── utils.ts                   # Utility functions
│   ├── storage.ts                 # Local storage & cloud sync logic
│   ├── jalali-utils.ts            # Persian date utilities
│   └── api-cache.ts               # API response caching
├── scripts/
│   ├── 001_create_users_table.sql           # Initial schema
│   ├── 002_add_rls_policies.sql             # Row-level security
│   ├── 003_auto_create_user_trigger.sql    # Auto-create user profiles
│   ├── 004_enforce_strict_rls.sql           # Strict RLS enforcement
│   ├── 005_count_user_sessions.sql          # Session counting
│   ├── 006_create_bitcoin_prices_table.sql # Price caching table
│   ├── 007_bitcoin_prices_rls.sql           # Price table RLS
│   └── 008_add_irt_price_column.sql        # IRT price column
├── public/                        # Static assets
├── styles/                        # Global styles
├── middleware.ts                  # Next.js middleware for auth
├── PROJECT_DOCUMENTATION.md       # This file
└── [config files]

```

---

## Feature Documentation

### 1. Dashboard (Home Page)
**Location**: `app/page.tsx` (activePage === "home")

**Components**:
- QuoteCard - Daily inspirational quote
- PriceTicker - Real-time BTC/USD/IRT prices
- MetricsCards - Portfolio metrics (total BTC, portfolio value, etc.)
- PortfolioChart - Interactive portfolio visualization
- PurchaseHistory - Transaction list with edit/delete
- AddPurchaseDialog - Add new purchase

**Features**:
- Empty state with import/export options
- Real-time price updates every 5 seconds
- Manual refresh capability
- Cloud sync status indicator
- Add/Edit/Delete purchases
- Bulk delete multiple purchases
- Import/Export functionality (CSV, JSON)

### 2. DCA Simulator
**Location**: `components/pages/dca-page.tsx`

**Purpose**: Simulate dollar-cost averaging strategy returns and help users understand the impact of regular investments.

**Inputs**:
- Investment Amount: $10 - $1,000 (slider)
- Frequency: Daily, Weekly, Biweekly, Monthly (buttons)
- Duration: 6 - 60 months (slider)
- Current BTC Price: Auto-filled from market data

**Calculations**:
- Simulates price appreciation (~0.8% per purchase)
- Tracks total invested capital
- Calculates accumulated BTC
- Computes portfolio value
- Calculates ROI% = ((Final Value - Invested) / Invested) × 100

**Output**:
- Interactive line chart showing invested vs actual value
- Summary card with final metrics
- BTC accumulated
- Return percentage
- DCA benefits explanation

**Modern UI Elements**:
- Responsive grid layout (1 col mobile, 3 col desktop)
- Icon badges for metric categories
- Interactive sliders with real-time updates
- Visual chart with Recharts library
- Gradient-styled result cards

### 3. Goals & Research
**Location**: `components/pages/goals-page.tsx`

**Purpose**: Allow users to define and track specific financial goals with automatic progress calculation.

**Features**:
- **Goal Types**:
  - BTC Amount Goal (e.g., "Own 1 BTC")
  - USD Value Goal (e.g., "Invest $50,000")
  - Purchase Count Goal (e.g., "Make 100 purchases")
  - Streak Days Goal (e.g., "Invest for 30 consecutive days")

**Goal Management**:
- Create new goals with title and target
- Edit goal details
- Delete goals
- Mark goals as complete
- Pause/Resume goals
- View progress percentage

**Progress Tracking**:
- Automatic calculation based on actual purchases
- Visual progress bar (0-100%)
- Current vs target display
- Status indicators (active, paused, completed)
- Completion celebration message

**Authentication**:
- Goals only accessible to authenticated users
- Redirect to login for non-authenticated users
- Persistent storage in Supabase

**UI Design**:
- Card-based layout
- Color-coded status (green for completed)
- Responsive grid (1 col mobile, adapts to desktop)
- Progress bars for visual clarity
- Action buttons for management

### 4. Statistics & Analytics
**Location**: `components/pages/statistics-page.tsx`

**Features**:
- **Price Chart**: Historical BTC price with user purchase markers
- **Portfolio VS BTC Comparison**: Your portfolio value vs BTC performance
- **Market Heatmap**: Color-coded market data (price changes)
- **Metrics Summary**:
  - ATH (All-Time High) & ATL (All-Time Low)
  - Current price vs ATH difference
  - Investment metrics (total cost, profit/loss)
- **DCA Performance Analysis**: Comparison with buy-and-hold strategy
- **Advanced Calculations**:
  - Weighted average purchase price
  - Current portfolio allocation
  - ROI metrics
  - Sharpe ratio calculations

**Charts**:
- Interactive Recharts with tooltips
- Real-time updates
- Theme-aware colors (light/dark)
- Responsive sizing
- Legend with toggle

### 5. User Account Management
**Location**: `app/account/page.tsx`

**Features**:
- View logged-in user email
- Session management
- View all active sessions
- Terminate individual sessions
- Terminate all sessions
- Data backup & download
- Delete account (with confirmation)
- Logout

**Security**:
- Only accessible to authenticated users
- Server-side session validation
- Admin client operations for data deletion
- Confirmation dialogs for destructive actions

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

### Purchases Table
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  amount_btc DECIMAL(18, 8) NOT NULL,
  price_usd DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)

-- Indexes
CREATE INDEX purchases_user_id_idx ON purchases(user_id);
CREATE INDEX purchases_date_idx ON purchases(date);
```

### Bitcoin Prices Table
```sql
CREATE TABLE bitcoin_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  btc_usd DECIMAL(12, 2) NOT NULL,
  irt_usd DECIMAL(15, 2),
  irt_price DECIMAL(15, 2),
  fetched_at TIMESTAMP DEFAULT now(),
  source TEXT
)

-- Index for fast queries
CREATE INDEX idx_bitcoin_prices_fetched_at ON bitcoin_prices(fetched_at DESC);
```

### Goals Table (Future Implementation)
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('btc', 'usd', 'purchases', 'streak')),
  target DECIMAL(18, 8) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

### Row-Level Security (RLS) Policies
- Users can only see their own purchases
- Public read-only access to bitcoin_prices table
- Authenticated users can manage their own goals
- Service role can insert/update prices

---

## Authentication & Security

### Authentication Flow
1. User enters email/password on login page
2. Supabase handles password hashing & validation
3. JWT token issued on successful auth
4. Middleware refreshes token on each request
5. Session cookie stored (HTTP-only, secure)
6. User profile auto-created via Postgres trigger

### Security Features
- **Password Security**: Bcrypt hashing (Supabase)
- **Session Management**: HTTP-only cookies, 1-hour expiration
- **CSRF Protection**: SameSite cookies
- **Row-Level Security**: Users isolated at database level
- **API Protection**: Middleware validates auth tokens
- **Rate Limiting**: Vercel built-in rate limiting

### Protected Routes
- `/account` - User account management
- `/api/purchases` - User purchase data (if implemented)
- Goals endpoints - Authenticated users only

---

## API Endpoints

### Bitcoin Price Data
**Route**: `GET/POST /api/bitcoin-data`

**Purpose**: Cache and serve Bitcoin price data (updates hourly)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "btc_usd": 67000,
    "irt_price": 2.82e12,
    "fetched_at": "2025-12-25T14:00:00Z",
    "source": "coingecko"
  }
}
```

**Sources**: CoinGecko → Binance → CoinCap

### Iranian Exchange Rate
**Route**: `POST /api/nobitex`

**Purpose**: Fetch current BTC/IRT exchange rate

**Response**:
```json
{
  "stats": {
    "btc-rls": {
      "latest": "28200000000"
    }
  },
  "fallbackRate": 590000
}
```

---

## Data Synchronization

### Sync Strategy
1. **Local First**: Data stored in browser localStorage
2. **Cloud Backup**: Automatic sync to Supabase when logged in
3. **Conflict Resolution**: Cloud data overwrites local on login
4. **Offline Support**: Full offline functionality with local data

### Sync Triggers
- Purchase added/edited/deleted
- User logs in
- Cloud sync button clicked
- Auto-sync every transaction (if enabled)

### Storage Implementation
**File**: `lib/storage.ts`

**Features**:
- `loadPurchases()` - Retrieve from localStorage
- `savePurchases()` - Save to localStorage
- `syncPurchasesToSupabase()` - Upload to cloud
- `enableCloudSync()` - Enable sync flag
- `isCloudSyncEnabled()` - Check sync status

---

## User Interface Design

### Design System
- **Primary Color**: Orange (#f79a1a) for Bitcoin theme
- **Neutrals**: Gray scale for backgrounds & text
- **Accent**: Primary for CTAs and highlights

### Responsive Breakpoints
- **Mobile**: 0-640px (single column, bottom nav)
- **Tablet**: 641-1024px (2-3 columns, flexbox)
- **Desktop**: 1024px+ (full 3-4 column grids, sidebar nav)

### Component Library
- **Cards**: For content sections
- **Sliders**: For numeric input
- **Progress Bars**: For goal tracking
- **Charts**: Recharts for visualization
- **Dialogs**: For forms and confirmations
- **Tabs**: For multi-section navigation
- **Buttons**: shadcn/ui with variants

### Accessibility
- Semantic HTML (main, header, nav)
- ARIA roles and labels
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliant

### Light/Dark Theme
- System theme detection via next-themes
- Tailwind dark mode support
- CSS variables for colors
- Context-based theme switching
- Persistent theme selection

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ and pnpm
- Supabase project (free tier)
- Git for version control

### Local Development
See `SETUP_GUIDE.md` for detailed instructions:
1. Clone repository
2. Install dependencies: `pnpm install`
3. Set up `.env.local` with Supabase credentials
4. Run migrations: `pnpm run migrate`
5. Start dev server: `pnpm dev`
6. Open http://localhost:3000

### Environment Variables
Required `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
POSTGRES_URL=
SUPABASE_JWT_SECRET=
```

### Database Migrations
Run SQL scripts in order (1-8):
```bash
psql -d $DATABASE_URL < scripts/001_create_users_table.sql
psql -d $DATABASE_URL < scripts/002_add_rls_policies.sql
# ... etc
```

### Deployment to Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy: Vercel auto-deploys on push

---

## Key Calculations & Formulas

### Portfolio Metrics
```
Total BTC = Sum of all purchase btc_amounts
Portfolio Value = Total BTC × Current BTC Price
Total Invested = Sum of all purchase total_usd_spent
Profit/Loss = Portfolio Value - Total Invested
ROI% = (Profit/Loss / Total Invested) × 100
```

### DCA Simulation
```
For each purchase:
  BTC Bought = Investment Amount / Current Price
  Total Accumulated BTC += BTC Bought
  Total Invested += Investment Amount

After all purchases:
  Portfolio Value = Total BTC × Current Price
  ROI% = ((Portfolio Value - Total Invested) / Total Invested) × 100
```

### Average Purchase Price
```
Weighted Average Price = Total Invested / Total BTC
```

### Goal Progress
```
Progress% = (Current Achievement / Target) × 100
For BTC Goal: Current = Total BTC accumulated
For USD Goal: Current = Total USD invested
For Purchases: Current = Number of transactions
```

---

## Future Enhancements

### Short-term (Next 3 months)
- [ ] Goals Supabase integration (save to database)
- [ ] Goal notifications & reminders
- [ ] DCA strategy templates (beginner, advanced)
- [ ] Purchase notes & transaction categories
- [ ] Portfolio breakdown by year

### Medium-term (3-6 months)
- [ ] Mobile app (React Native)
- [ ] Transaction scheduling
- [ ] Tax reporting tools
- [ ] Portfolio comparison with others (anonymized)
- [ ] Email notifications for goals
- [ ] Advanced DCA strategies with technical indicators

### Long-term (6+ months)
- [ ] Multi-asset support (ETH, Altcoins)
- [ ] Integration with exchanges (API trading)
- [ ] AI-powered investment suggestions
- [ ] Community features (forums, tips)
- [ ] Advanced analytics (NUPL, funding rates)
- [ ] Institutional features (team collaboration)

### Research Areas
- Technical analysis integration
- On-chain metrics (whale watching)
- Macro economic indicators
- AI sentiment analysis
- Portfolio optimization algorithms

---

## Development Notes

### Key Challenges Solved
1. **Authentication State**: Used singleton pattern for Supabase client
2. **Real-time Prices**: Implemented hourly cache with fallback APIs
3. **Persian Calendar**: Created utility functions for Jalali dates
4. **Offline Sync**: Implemented localStorage + cloud conflict resolution
5. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
6. **Dark Theme**: Used next-themes with CSS custom properties

### Performance Optimizations
- Bitcoin prices cached hourly (reduces API calls)
- Component code-splitting via dynamic imports
- Image optimization with Next.js Image component
- Tailwind CSS purging for smaller bundle
- SWR for client-side caching and revalidation

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Recharts Documentation](https://recharts.org)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Active Development
