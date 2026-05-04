# GreenCrop — Greenhouse Management System

A full-stack greenhouse management system built with React, Tailwind CSS, and Supabase.

## Quick Start (Demo Mode)

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app runs immediately with demo data (no auth, no Supabase needed).

---

## Project Structure

```
src/
├── components/
│   ├── common/          # Modal, StatusMessage, ConfirmDialog
│   ├── dashboard/       # GreenhouseMap, GreenhouseBlock, ActionModal
│   ├── forms/           # IrrigationForm, SprayingForm, FertilizationForm, YieldForm
│   └── layout/          # Layout, Header, Sidebar
├── context/             # AuthContext (Supabase auth + demo mode)
├── data/                # demoData.js (static dummy data)
├── lib/                 # supabase.js client
├── pages/
│   ├── admin/           # EmployeesPage, SprayTypesPage, SeasonSetupPage
│   ├── Dashboard.jsx
│   └── LoginPage.jsx
└── utils/               # cropColors.js (deterministic crop color palette)
supabase/
├── schema.sql           # Full database schema + RLS policies
└── seed.sql             # Initial data (3 greenhouses, demo crops)
```

---

## Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate initial data
4. Go to **Project Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`

### Restrict Access (Authorized Emails Only)
In Supabase → **Authentication → Email Templates**, invite specific users.  
Or add a custom check in the RLS policies:
```sql
-- Example: restrict to specific email domain
CREATE POLICY "email_domain_check" ON employees
  FOR ALL TO authenticated
  USING (auth.jwt()->>'email' LIKE '%@yourdomain.com');
```

---

## Railway Deployment

### 1. Create a GitHub Repository

```bash
git init
git add -A
git commit -m "Initial commit: GreenCrop"
git remote add origin https://github.com/YOUR_USERNAME/greencrop.git
git push -u origin main
```

Create a `dev` branch for your staging environment:
```bash
git checkout -b dev
git push -u origin dev
```

### 2. Link to Railway

1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Select your `greencrop` repository

### 3. Configure Two Environments

**Production (main branch):**
- Railway dashboard → Environments → Add Environment → name it `production`
- Settings → Source → Branch: `main`

**Development (dev branch):**
- Railway dashboard → Environments → Add Environment → name it `development`
- Settings → Source → Branch: `dev`

### 4. Set Environment Variables

For EACH environment in Railway → Variables, add:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

> **Important:** These are build-time variables for Vite. They must be set before the build runs.

### 5. Verify Build & Start Commands

Railway should auto-detect from `railway.toml`:
- Build: `npm ci && npm run build`
- Start: `npm start` (runs `serve -s dist`)

---

## Features

| Feature | Description |
|---|---|
| **Greenhouse Map** | Visual grid of all 3 greenhouses with color-coded crop sections |
| **Activity Logging** | Click any crop section → log Irrigation, Spraying, Fertilization, or Yield |
| **Last Value Display** | Every form shows the last recorded entry for quick reference |
| **Fertilization Validation** | Opening # input validated against the crop's assigned range |
| **Admin CRUD** | Manage Employees, Spray Types, and Season Setup assignments |
| **Auth** | Supabase email/password auth (bypassed in demo mode) |
| **Demo Mode** | Runs with dummy data when Supabase is not configured |

## Opening Dimensions

Each greenhouse opening = **8m × 48m = 384 m² = 0.384 dunam**

| Greenhouse | Openings | Total Area |
|---|---|---|
| Greenhouse 1 | 7 | 2,688 m² (2.7 dunam) |
| Greenhouse 2 | 11 | 4,224 m² (4.2 dunam) |
| Greenhouse 3 | 18 | 6,912 m² (6.9 dunam) |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (demo mode — no .env needed)
npm run dev

# Create .env.local with Supabase credentials for full mode
cp .env.example .env.local
# Edit .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Build for production
npm run build

# Preview production build locally
npm run preview
```
