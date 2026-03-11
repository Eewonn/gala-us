# GalaUs 🎉

**Plan better hangouts with your crew.**

GalaUs is a collaborative event planning platform that helps groups organize outings (called "galas") — vote on ideas, delegate tasks, track expenses, and store memories — all in one beautiful space.

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Framework  | Next.js 16 (App Router)      |
| Styling    | Tailwind CSS v4              |
| Components | shadcn/ui                    |
| Backend    | Supabase (PostgreSQL)        |
| Language   | TypeScript                   |

---

## Features

- **Create Gala** – Name your outing, pick a decision mode, and share an invite code
- **Join Gala** – Enter an invite code to join a friend's gala instantly
- **Overview** – See stage progress, members, stats, and invite code at a glance
- **Voting** – Suggest and upvote locations, food, dates, and activities
- **Tasks** – Kanban-style task board with Todo / In Progress / Done columns
- **Budget** – Log expenses and see the cost per participant automatically
- **Memories** – Store Google Drive links with captions for event photos

---

## Getting Started

### 1. Clone & install

```bash
git clone <repo>
cd gala-us
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Copy your Project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

---

## 🚀 Production Deployment

### Quick Deploy (Tomorrow!)

1. **Run deployment checker:**
   ```bash
   ./deploy-check.sh
   ```

2. **Apply security policies:**
   - Open Supabase SQL Editor
   - Run `supabase/production-rls.sql` (REQUIRED!)

3. **Deploy to Vercel:**
   - Push to GitHub
   - Import in [vercel.com](https://vercel.com)
   - Add environment variables
   - Deploy!

**📖 See [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for complete deployment instructions!**

---

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## App Routes

| Route             | Description                          |
|-------------------|--------------------------------------|
| `/`               | Landing page                         |
| `/create-gala`    | Create a new gala                    |
| `/join`           | Join a gala with an invite code      |
| `/gala/[id]`      | Gala dashboard (Overview / Voting / Tasks / Budget / Memories) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create-gala/page.tsx        # Create gala form
│   ├── join/page.tsx               # Join gala form
│   └── gala/[id]/page.tsx          # Gala dashboard
├── components/
│   ├── GalaLogo.tsx                # Shared logo component
│   └── dashboard/
│       ├── OverviewTab.tsx         # Overview tab
│       ├── VotingTab.tsx           # Voting & suggestions tab
│       ├── TasksTab.tsx            # Kanban tasks tab
│       ├── BudgetTab.tsx           # Expense tracker tab
│       └── MemoriesTab.tsx         # Memories gallery tab
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
└── types/
    └── database.ts                 # TypeScript types for all tables
supabase/
└── schema.sql                      # Full DB schema + RLS policies
```

---

## Design System

The UI follows a **neo-brutalist** style inspired by the Google Stitch designs:

- **Primary color**: `#ff5833` (vibrant orange)
- **Background**: `#f8f6f5` (warm off-white)
- **Font**: Plus Jakarta Sans
- **Borders**: 3–4px solid dark borders
- **Shadows**: 4–8px offset playful drop shadows

---

## Notes

- This MVP uses **name-based identity** stored in `localStorage`. For production, replace with Supabase Auth.
- RLS policies are open for the MVP. Tighten them in production using `auth.uid()`.
