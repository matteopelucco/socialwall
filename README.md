# 🎉 SocialWall

A reusable event webapp with a **mobile quiz** and a **live wall** for events, celebrations, and gatherings.

## Features

- 📱 **Mobile quiz** via QR code — questions, scoring, dedication form
- 📺 **Live wall** for TV — real-time dedications, leaderboard, typing indicators
- ⚙️ **One config file** (`config/event.ts`) to customize for any event
- ⚡ **Supabase Realtime** — WebSocket updates, zero refresh needed
- 🎨 **Neo-Memphis design** — bold, colorful, modern

---

## Quick Setup

### 1. Clone & install
```bash
git clone https://github.com/matteopelucco/socialwall
cd socialwall
npm install
```

### 2. Create Supabase project
1. Go to [supabase.com](https://supabase.com) → create account → new project
2. Region: EU West (Frankfurt)
3. SQL Editor → run `supabase/schema.sql`
4. Copy **Project URL** and **anon public key**

### 3. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Customize the event
Edit `config/event.ts` — change event name, date, questions, theme.

### 5. Run locally
```bash
npm run dev
# Quiz: http://localhost:3000/quiz
# Wall: http://localhost:3000/wall
```

### 6. Deploy to Vercel
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy ✓

---

## URLs

| URL | Description |
|-----|-------------|
| `/quiz` | Mobile quiz for guests (via QR code) |
| `/wall` | Live wall for TV (open in browser, F11 fullscreen) |

---

## Reusing for a new event

1. Edit `config/event.ts` — update `eventName`, `eventDate`, `honoree`, `questions`, optionally `theme`
2. Run `supabase/schema.sql` on a fresh Supabase project (or clear the tables)
3. Deploy

That's it. The entire codebase is event-agnostic.

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Realtime)
- **Vercel**
