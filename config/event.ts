// ============================================================
// config/event.ts
// THE ONLY FILE YOU NEED TO EDIT between events.
// All event-specific content lives here.
// ============================================================

export type Question = {
  id: number;
  testo: string;
  opzioni: [string, string, string, string];
  corretta: 0 | 1 | 2 | 3;
  curiosita?: string; // fun fact shown after answering
};

export type ScoreMessages = {
  [minScore: number]: string;
};

export type EventTheme = {
  "--color-primary": string;
  "--color-secondary": string;
  "--color-accent": string;
  "--color-accent2": string;
  "--color-bg": string;
  "--color-surface": string;
  "--color-surface2": string;
  "--color-text": string;
  "--color-text-muted": string;
  "--font-display": string;
  "--font-body": string;
};

export type EventConfig = {
  eventName: string;
  eventDate: string;
  eventSubtitle: string;
  honoree: string;
  quizTitle: string;
  quizSubtitle: string;
  questionsPerSession: number;
  scoreMessages: ScoreMessages;
  wallTitle: string;
  wallSubtitle: string;
  dedicaPlaceholder: string;
  theme: EventTheme;
  questions: Question[];
};

// ============================================================
// DEFAULT THEME: Neo-Memphis
// Bold, colorful, modern. Override per event as needed.
// ============================================================

export const NEO_MEMPHIS_THEME: EventTheme = {
  "--color-primary":    "#FF3D5A",   // hot coral-red
  "--color-secondary":  "#FFD600",   // electric yellow
  "--color-accent":     "#00E5FF",   // cyan
  "--color-accent2":    "#7C3AED",   // violet
  "--color-bg":         "#0A0A0F",   // near-black
  "--color-surface":    "#16161F",   // dark card bg
  "--color-surface2":   "#1E1E2A",   // slightly lighter surface
  "--color-text":       "#F5F5F5",
  "--color-text-muted": "#888899",
  "--font-display":     "'Bebas Neue', sans-serif",
  "--font-body":        "'Plus Jakarta Sans', sans-serif",
};

// ============================================================
// EVENT CONFIGURATION
// Edit this for each event
// ============================================================

export const EVENT_CONFIG: EventConfig = {
  // ── Identity ───────────────────────────────────────────────
  eventName:     "Festa di Don Samuele",
  eventDate:     "14 Giugno 2026",
  eventSubtitle: "Prima Santa Messa · Mesenzana",
  honoree:       "Don Samuele",

  // ── Quiz ───────────────────────────────────────────────────
  quizTitle:    "Quanto conosci Don Samuele?",
  quizSubtitle: "10 domande per scoprirlo (o riscoprirlo) 😄",
  questionsPerSession: 10,

  scoreMessages: {
    10: "Sei il suo fan numero 1! 🏆",
    8:  "Lo conosci benissimo! 🌟",
    6:  "Non male, c'è del potenziale! 😄",
    4:  "Qualcosa sai, qualcosa no... 🤔",
    0:  "Ora lo conosci un po' di più! 😊",
  },

  // ── Wall ───────────────────────────────────────────────────
  wallTitle:   "Muro dei Messaggi 💌",
  wallSubtitle: "I tuoi auguri a Don Samuele",
  dedicaPlaceholder: "Scrivi il tuo messaggio a Don Samuele...",

  // ── Theme ─────────────────────────────────────────────────
  // Using default Neo-Memphis. To customize for this event,
  // replace with a custom theme object.
  theme: NEO_MEMPHIS_THEME,

  // ── Questions ─────────────────────────────────────────────
  // Fill in 10 questions. Each has 4 options, one correct (index 0-3).
  // `curiosita` is shown after the user answers — make it warm/funny.
  questions: [
    // PLACEHOLDER — replace with real questions about Don Samuele
    {
      id: 1,
      testo: "In quale città è cresciuto Don Samuele?",
      opzioni: ["Mesenzana", "Varese", "Milano", "Luino"],
      corretta: 0,
      curiosita: "Mesenzana è sempre stata la sua casa ❤️",
    },
    {
      id: 2,
      testo: "Qual è il cognome di Don Samuele?",
      opzioni: ["Rossi", "Brancè", "Ferrari", "Colombo"],
      corretta: 1,
      curiosita: "Brancè — un cognome unico come lui! 😄",
    },
    {
      id: 3,
      testo: "Quando è stata la sua Prima Messa?",
      opzioni: ["14 Giugno 2026", "1 Gennaio 2026", "25 Aprile 2026", "8 Dicembre 2025"],
      corretta: 0,
      curiosita: "Oggi stesso — un giorno da ricordare! 🎉",
    },
    // ── ADD 7 MORE QUESTIONS HERE ──────────────────────────
    // {
    //   id: 4,
    //   testo: "...",
    //   opzioni: ["A", "B", "C", "D"],
    //   corretta: 0,
    //   curiosita: "..."
    // },
  ],
};
