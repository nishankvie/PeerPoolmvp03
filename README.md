# Peerpool MVP

A minimal, premium social app for hanging out more easily.

## Design Philosophy

- Calm, modern, brand-like aesthetic
- Minimal UI, maximum clarity
- Functionality-first without tutorials
- Low cognitive load
- Inspired by Notion, Linear, Apple Calendar, Stripe

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public key
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the entire contents of `supabase/schema.sql`
3. Run the query

### 4. Configure Authentication

#### Magic Link (Email)
Already enabled by default in Supabase.

#### Google OAuth (Optional)
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow the setup instructions to get OAuth credentials
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related pages (login, signup)
│   ├── page.tsx           # Home page
│   ├── time/              # Availability management
│   ├── create/            # Create hangout
│   ├── hangouts/          # View hangouts
│   └── chat/              # Messaging
├── components/            # React components
│   └── BottomNav.tsx      # Bottom navigation bar
├── lib/                   # Utilities and configs
│   └── supabase/          # Supabase client and types
└── supabase/              # Database schema
```

## Features

### MVP (v1)
- ✅ Authentication (Magic Link + Google)
- ✅ User profiles
- 🚧 Availability blocks (set when you're free)
- 🚧 Create micro hangouts
- 🚧 Invite friends / make public
- 🚧 See who's available by time

### Future
- Friend requests
- Chat/messaging
- Notifications
- Calendar integration
- Location suggestions

## Design System

See design tokens in `tailwind.config.ts`

### Colors
- **Background**: `#F9FAFB` (primary), `#FFFFFF` (cards)
- **Text**: `#111827` (primary), `#6B7280` (secondary), `#9CA3AF` (tertiary)
- **Accent**: `#2563EB` (blue)
- **States**: `#16A34A` (success/available), `#F59E0B` (warning/planning)

### Border Radius
- Small: 8px
- Medium (cards): 12px
- Large (modals): 16px

## Database Schema

### Tables
- **profiles**: User accounts
- **availability_blocks**: When users are free
- **hangouts**: Planned activities
- **hangout_participants**: Who's joining
- **friendships**: Friend connections

See `supabase/schema.sql` for full schema with RLS policies.

## License

Private - All rights reserved


