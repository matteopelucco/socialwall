# SocialWall – Claude Code Context

## What is this?

A **generic, reusable event webapp** with two surfaces:
1. `/quiz` — A mobile quiz (QR code → smartphone) with score + dedication form
2. `/wall` — A live wall for a TV/screen showing dedications, leaderboard, and live typing

Designed to be **event-agnostic**: all event-specific content lives in `config/event.ts`.
The codebase stays clean and reusable across future events.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Realtime DB | Supabase (PostgreSQL + Realtime WebSocket) |
| Hosting | Vercel |
| Repo | GitHub (matteopelucco/socialwall) |

---

## Project structure

```
socialwall/
├── config/
│   ├── event.ts            ← ALL event-specific config lives here
│   └── qr.png              ← QR image to display on wall
├── app/
│   ├── page.tsx            ← redirects to /quiz
│   ├── layout.tsx          ← global fonts, metadata, theme CSS vars
│   ├── globals.css         ← design system: CSS vars, base styles
│   ├── quiz/
│   │   └── page.tsx        ← quiz flow (client component)
│   └── wall/
│       └── page.tsx        ← live wall (client component, TV-optimized)
├── components/
│   ├── quiz/
│   │   ├── WelcomeScreen.tsx     ← name input + start
│   │   ├── QuestionCard.tsx      ← single question + 4 options
│   │   ├── AnswerFeedback.tsx    ← correct/wrong animation overlay
│   │   ├── ScoreScreen.tsx       ← final score + answers recap
│   │   └── DedicaForm.tsx        ← message + signature + submit
│   │   └── ThankYouScreen.tsx    ← post-submit confirmation
│   └── wall/
│       ├── WallHeader.tsx        ← event title + live counter
│       ├── LiveTypingBanner.tsx  ← "X sta scrivendo..." ticker
│       ├── DedicaCard.tsx        ← animated card for a single dedication
│       ├── DedicaFeed.tsx        ← auto-scrolling feed of cards
│       └── Leaderboard.tsx       ← top scores sidebar
├── lib/
│   ├── supabase.ts         ← Supabase client (singleton)
│   ├── types.ts            ← TypeScript interfaces
│   └── utils.ts            ← helpers (shuffle, format, etc.)
├── supabase/
│   └── schema.sql          ← run this in Supabase SQL Editor
└── .env.local.example
```

---

## The config file (config/event.ts)

This is the ONLY file that changes between events. It exports an `EVENT_CONFIG` object:

```typescript
export const EVENT_CONFIG = {
  // Metadata
  eventName: "Festa di Don Samuele",
  eventDate: "14 Giugno 2026",
  eventSubtitle: "Prima Santa Messa",
  honoree: "Don Samuele",

  // Quiz settings
  quizTitle: "Quanto conosci Don Samuele?",
  questionsPerSession: 10,          // show all 10

  // Score messages (keyed by min score)
  scoreMessages: {
    10: "Sei il suo fan numero 1! 🏆",
    8:  "Lo conosci benissimo! 🌟",
    5:  "Non male, ma c'è margine! 😄",
    0:  "Ora lo conosci un po' di più! 😊",
  },

  // Wall settings
  wallTitle: "Muro dei Messaggi",
  wallSubtitle: "Scrivi a Don Samuele",

  // Theme: color palette CSS var overrides (applied to :root)
  // Default theme: Neo-Memphis (colorful, bold, modern)
  // Override here for event-specific branding
  theme: {
    "--color-primary":    "#FF3D5A",   // hot coral-red
    "--color-secondary":  "#FFD600",   // electric yellow
    "--color-accent":     "#00E5FF",   // cyan
    "--color-accent2":    "#7C3AED",   // violet
    "--color-bg":         "#0A0A0F",   // near-black
    "--color-surface":    "#16161F",   // dark card bg
    "--color-text":       "#F5F5F5",
    "--color-text-muted": "#888899",
    "--font-display":     "'Bebas Neue', sans-serif",
    "--font-body":        "'Plus Jakarta Sans', sans-serif",
  },

  // Questions pool — FILL IN before deploy
  questions: [
    // {
    //   id: 1,
    //   testo: "...",
    //   opzioni: ["A", "B", "C", "D"],
    //   corretta: 0,           // index of correct option
    //   curiosita: "Fun fact shown after answer"
    // },
  ],
};
```

---

## Database schema (Supabase)

Three tables. All public RLS (no auth — local event).

### `sessions`
```
id uuid PK | nome text | punteggio int | totale_domande int | created_at timestamptz
```

### `dediche`
```
id uuid PK | session_id uuid FK | nome_firma text | testo text | created_at timestamptz
```

### `typing_status`
```
id uuid PK | session_id uuid | nome text | last_seen timestamptz
```

Realtime enabled on: `dediche`, `typing_status`, `sessions`

---

## Key behaviors

### Quiz flow
1. WelcomeScreen → user enters name
2. Questions one at a time, full screen, tap to answer
3. Instant feedback animation (green ✓ / red ✗) → auto-advance after 1.2s
4. ScoreScreen: X/10, personalized message, collapsed answer recap
5. DedicaForm: textarea (max 300 chars) + pre-filled signature
6. On submit: save `session` + `dedica` to Supabase → ThankYouScreen
7. Typing status: upsert to `typing_status` while user types dedica, delete on submit

### Wall (TV, landscape, no interaction needed)
- Layout: left sidebar (leaderboard) | center+right (dedica feed)
- Supabase Realtime subscription on `dediche` INSERT → new card flies in
- Supabase Realtime on `typing_status` → update live typing banner
- Auto-scroll feed every 3s if content overflows
- Typing status entries older than 45s are filtered out client-side
- Polling fallback every 15s for missed realtime events

---

## Admin panel (/admin)

Password-protected moderation page for live event management.

**Route**: `/admin`  
**Auth**: client-side password check against `NEXT_PUBLIC_ADMIN_PASSWORD`, stored in `sessionStorage` (cleared on tab close).

**Features**:
- Lists all dediche (most recent first), updates in realtime via Supabase
- **Edit**: inline textarea to fix/clean a message, saves to Supabase
- **Delete**: two-step confirmation (no accidental deletes), removes from DB and wall instantly
- Polling fallback every 10s for missed events

**Implementation notes**:
- Single file: `app/admin/page.tsx` (client component)
- Supabase helpers: `getAllDediche()`, `updateDedica(id, testo)`, `deleteDedica(id)` in `lib/supabase.ts`
- No server-side auth — suitable for local event (anon key is already public)
- Desktop-optimized but works on mobile

---

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DEDICA_ENABLED=true        # set "false" to disable dedica form
NEXT_PUBLIC_ADMIN_PASSWORD=            # password for /admin panel
```

---

## Design system: Neo-Memphis

**Concept**: Bold geometry, saturated color blocks, kinetic energy. Modern festive.
**NOT**: corporate, pastel, gradient-purple, "AI default".

Key CSS conventions:
- Heavy borders: `border: 3px solid var(--color-primary)`
- Offset shadows: `box-shadow: 4px 4px 0 var(--color-secondary)` (no blur)
- Rotated accents: decorative elements at ±2°–5°
- Uppercase display type with tight tracking
- Background: geometric SVG pattern (dots or grid) at low opacity
- Cards: dark bg + colored border-left accent strip
- Buttons: solid fill, no border-radius or very small (4px), bold text, hover = translate(-2px, -2px) + shadow grows

Fonts (load via next/font or Google Fonts):
- Display: **Bebas Neue** (headings, scores, big numbers)
- Body: **Plus Jakarta Sans** (readable, modern, slightly quirky)

---

## Coding conventions

- All Supabase calls in `lib/supabase.ts` — no inline client creation
- All `useEffect` Realtime subscriptions: cleanup on unmount
- No `any` types — use interfaces from `lib/types.ts`
- Mobile-first CSS for `/quiz` (max-width: 480px centered)
- Wall page: fixed viewport, overflow hidden, no scrollbar
- API routes only if needed for server-side operations; prefer direct Supabase client calls from components
- Error states: always show a friendly message, never blank screen
- Loading states: skeleton or pulse animation, never blank

---

## First prompt for Claude Code

After cloning and running `npm install`, use this prompt:

> "Read CLAUDE.md carefully. Build the complete SocialWall webapp:
> 1. Initialize Next.js 14 with TypeScript and Tailwind
> 2. Create the Supabase client in lib/supabase.ts
> 3. Build all components for /quiz and /wall as specified
> 4. Apply the Neo-Memphis design system throughout
> 5. Make sure config/event.ts drives all event-specific content
> 6. The questions array in config/event.ts is empty — add 3 placeholder questions so the quiz is testable"

---

## Checklist

- [ ] Create repo `socialwall` on GitHub (matteopelucco)
- [ ] Create Supabase account at supabase.com
- [ ] New Supabase project, region: EU West (Frankfurt)
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Enable Realtime on `dediche`, `typing_status`, `sessions`
- [ ] Copy Supabase URL + anon key → `.env.local`
- [ ] Connect repo to Vercel, add env vars
- [ ] Generate QR code → `https://[your-domain].vercel.app/quiz`
- [ ] Open `/wall` on TV, press F11 fullscreen
