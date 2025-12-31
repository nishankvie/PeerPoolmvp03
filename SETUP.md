# Peerpool MVP - Setup Guide

## 🎉 Your MVP is Ready!

The development server is running at **http://localhost:3000**

## ⚠️ Important: Supabase Configuration Required

Before you can use the authentication and database features, you need to set up Supabase:

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: Peerpool (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is perfect for MVP

### Step 2: Get Your API Keys

1. Once your project is created, go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### Step 3: Create Environment File

Create a file named `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials.

### Step 4: Set Up Database Schema

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **"New query"**
4. Copy the entire contents of `supabase/schema.sql` from this project
5. Paste it into the SQL editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see a success message. This creates all the necessary tables, security policies, and triggers.

### Step 5: Configure Authentication Providers

#### Magic Link (Email) - Already Enabled ✅
Email magic links work out of the box!

#### Google OAuth (Optional)

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable the provider
4. Follow the instructions to:
   - Create a Google Cloud project
   - Set up OAuth consent screen
   - Create OAuth credentials
   - Add authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

### Step 6: Restart Development Server

After adding `.env.local`:

1. Stop the current server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Open http://localhost:3000

## 🚀 Features Implemented

### ✅ Complete
- **Authentication**: Magic link (email) + Google OAuth
- **Bottom Navigation**: 5-item nav with floating create button
- **Home Page**: Dashboard with upcoming hangouts and available friends
- **My Time**: Interactive availability grid (tap blocks to set availability)
- **Create Hangout**: Form to create hangouts with time, visibility options
- **Hangouts List**: View all hangouts with filters (upcoming/all/past)
- **Chat**: Placeholder for future messaging
- **PWA Ready**: Installable as mobile app, works offline

### 🎨 Design System
- Premium, minimal aesthetic
- Calm color palette (grays + soft blue accent)
- Consistent spacing and typography
- Mobile-first responsive
- Inter font family

## 📱 Testing on Mobile

### iOS (Safari)
1. Open http://localhost:3000 on your iPhone (must be on same WiFi)
2. Or use your computer's IP: http://YOUR_IP:3000
3. Tap Share → Add to Home Screen

### Android (Chrome)
1. Open the app in Chrome
2. Tap the three dots → "Install app" or "Add to Home Screen"

## 🗄️ Database Schema

### Tables Created
- **profiles**: User accounts (auto-created on signup)
- **availability_blocks**: Time slots when users are free
- **hangouts**: Planned activities
- **hangout_participants**: Who's joining each hangout
- **friendships**: Friend connections (for future friend features)

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only see their own data and public/friend data
- Secure policies for all CRUD operations

## 🎯 Next Steps (Post-MVP)

To expand the app, consider:

1. **Friend System**: Send/accept friend requests
2. **Real-time Chat**: Add messaging using Supabase Realtime
3. **Notifications**: Push notifications for hangout invites
4. **Hangout Details Page**: Individual page per hangout with RSVP
5. **Calendar Integration**: Import from Google Calendar, iCal
6. **Location Support**: Add venue/location to hangouts
7. **Smart Suggestions**: Recommend hangout times based on mutual availability

## 🐛 Troubleshooting

### "Failed to load" or authentication errors
- Make sure `.env.local` exists with correct Supabase credentials
- Restart the dev server after adding environment variables

### Database errors
- Verify the schema was run successfully in Supabase SQL Editor
- Check Supabase logs: Dashboard → Logs → Database

### PWA not installing
- PWA requires HTTPS in production (localhost is exempt)
- Check browser console for service worker errors

## 📦 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Update Supabase Redirect URLs

After deployment, add your production URL to Supabase:
1. Dashboard → Authentication → URL Configuration
2. Add: `https://your-app.vercel.app/auth/callback`

## 📄 Files Overview

```
├── app/                      # Next.js App Router pages
│   ├── (auth)/login/        # Login page (magic link + Google)
│   ├── auth/callback/       # OAuth callback handler
│   ├── page.tsx             # Home dashboard
│   ├── time/                # Availability grid
│   ├── create/              # Create hangout form
│   ├── hangouts/            # Hangouts list
│   └── chat/                # Chat (placeholder)
├── components/
│   ├── AuthProvider.tsx     # Auth context provider
│   └── BottomNav.tsx        # Bottom navigation
├── lib/supabase/
│   ├── client.ts            # Client-side Supabase
│   ├── server.ts            # Server-side Supabase
│   └── database.types.ts    # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
└── middleware.ts            # Auth middleware (route protection)
```

## 🎨 Design Tokens (Tailwind)

All design system values are in `tailwind.config.ts`:

- Colors: `bg-primary`, `bg-card`, `text-primary`, `accent`, etc.
- Border radius: `sm` (8px), `md` (12px), `lg` (16px)
- Shadows: `subtle`

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase dashboard logs
3. Verify environment variables are set correctly
4. Ensure the database schema was run successfully

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS


