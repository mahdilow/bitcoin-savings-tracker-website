# Local Development Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- A Supabase project

## Environment Configuration

1. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials**:
   - Go to your Supabase project dashboard
   - Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
   ```

## Running the Project

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Troubleshooting

### "fetch failed" errors
- **Cause**: Supabase URL/keys are incorrect or network is unreachable
- **Solution**: 
  1. Verify Supabase project is active
  2. Check environment variables are correct
  3. Ensure you have internet connection
  4. Try restarting dev server: `pnpm dev`

### "Missing environment variables" warning
- **Cause**: `.env.local` file not found or variables not set
- **Solution**: 
  1. Copy `.env.example` to `.env.local`
  2. Fill in all required Supabase credentials

### Authentication redirects to login
- **Cause**: Auth token expired or invalid
- **Solution**: 
  1. Clear browser cookies for localhost
  2. Log out and log back in
  3. Check that `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set to `http://localhost:3000/auth/callback`

## Database Migrations

After setup, run any pending SQL migrations:

```bash
# Run scripts in order
pnpm supabase db execute --file scripts/001_initial_setup.sql
```

Or execute them manually in the Supabase SQL editor.
