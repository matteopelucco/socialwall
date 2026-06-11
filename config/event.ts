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
  curiosita?: string;
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
  "--color-board-bg": string;
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
  dedicaMinChars: number;
  scoreMessages: ScoreMessages;
  wallTitle: string;
  wallSubtitle: string;
  dedicaPlaceholder: string;
  scoreNudgeText: string;
  dedicaHeaderText: string;
  qrInviteText: string;
  timeMessages: Record<number, string>;
  theme: EventTheme;
  questions: Question[];
};

// ============================================================
// PADLET THEME
// Warm beige board, white cards, colorful top-strips.
// Light, clean, festive — inspired by Padlet.
// ============================================================

export const PADLET_THEME: EventTheme = {
  "--color-primary":    "#f06292",   // pink — CTA buttons, highlights
  "--color-secondary":  "#4f8ef7",   // blue — accents, links
  "--color-accent":     "#34c072",   // green
  "--color-accent2":    "#7c5de8",   // violet
  "--color-bg":         "#f0ebe3",   // warm beige board
  "--color-surface":    "#ffffff",   // white cards / sidebar
  "--color-surface2":   "#f7f4ef",   // slightly off-white inputs
  "--color-board-bg":   "#f0ebe3",   // board background alias
  "--color-text":       "#1a1a2e",   // near-black
  "--color-text-muted": "#9a96a8",   // muted gray
  "--font-display":     "'Nunito', sans-serif",
  "--font-body":        "'Nunito Sans', sans-serif",
};

// Card accent colors — cycled by index on the wall
export const CARD_ACCENT_COLORS = [
  { bg: "#fffbf0", strip: "#f5a623" }, // amber
  { bg: "#f0f7ff", strip: "#4f8ef7" }, // blue
  { bg: "#f0fff4", strip: "#34c072" }, // green
  { bg: "#fff0f6", strip: "#f06292" }, // pink
  { bg: "#f3f0ff", strip: "#7c5de8" }, // violet
  { bg: "#f0fbff", strip: "#00bcd4" }, // cyan
];

export const AVATAR_COLORS = [
  "#f06292", "#4f8ef7", "#34c072",
  "#7c5de8", "#f5a623", "#00bcd4",
];

// ============================================================
// EVENT CONFIGURATION
// ============================================================

export const EVENT_CONFIG: EventConfig = {
  // ── Identity ───────────────────────────────────────────────
  eventName:     "Tu sei DONo per Tutti",
  eventDate:     "14 Giugno 2026",
  eventSubtitle: "Prima Santa Messa · Mesenzana",
  honoree:       "Don Samuele",

  // ── Quiz ───────────────────────────────────────────────────
  quizTitle:    "Quanto conosci Don Samuele?",
  quizSubtitle: "10 domande per scoprirlo (o riscoprirlo) 😄",
  questionsPerSession: 10,
  dedicaMinChars: 10,

  scoreMessages: {
    10: "Sei il suo fan numero 1! 🏆",
    8:  "Lo conosci benissimo! 🌟",
    6:  "Non male, c'è del potenziale! 😄",
    4:  "Qualcosa sai, qualcosa no... 🤔",
    0:  "Ora lo conosci un po' di più! 😊",
  },

  // ── Wall ───────────────────────────────────────────────────
  wallTitle:         "Muro dei Messaggi 💌",
  wallSubtitle:      "I tuoi auguri a Don Samuele",
  dedicaPlaceholder: "Scrivi il tuo messaggio a Don Samuele...",
  scoreNudgeText:    "I messaggi di oggi verranno raccolti e consegnati a Don Samuele come ricordo della sua Prima Messa. Basta una riga ✍️",
  dedicaHeaderText:  "Don Samuele leggerà ogni messaggio. Sarà il suo ricordo di questo giorno.",
  qrInviteText:      "Scansiona e partecipa al quiz!",

  // ── Time feedback (keyed by max seconds, ascending) ────────
  timeMessages: {
    45:   "Fulmineo! ⚡ Meno di un minuto!",
    90:   "Velocissimo! 🚀",
    150:  "Ottimo ritmo! 🎯",
    240:  "Con calma, con stile 😎",
    9999: "La riflessione è una virtù! 🙏",
  },

  // ── Theme ─────────────────────────────────────────────────
  theme: PADLET_THEME,

  // ── Questions ─────────────────────────────────────────────
  questions: [
    {
      id: 1,
      testo: "In quale città è cresciuto Don Samuele?",
      opzioni: ["Milano", "Varese", "Mesenzana", "Venegono Inferiore"],
      corretta: 2,
      curiosita: "Mesenzana è sempre stata la sua casa ❤️",
    },
    {
      id: 2,
      testo: "Qual è il cognome di Don Samuele?",
      opzioni: ["Branche", "Brancè", "Branciè", "Giuliani"],
      corretta: 1,
      curiosita: "Brancè — un cognome unico come lui! 😄",
    },
    {
      id: 3,
      testo: "Quando è stata la sua Prima Messa?",
      opzioni: ["1 Gennaio 2026", "25 Aprile 2026", "8 Dicembre 2025", "14 Giugno 2026"],
      corretta: 3,
      curiosita: "Oggi stesso — un giorno da ricordare! 🎉",
    },
    {
      id: 4,
      testo: "Quando è nato Don Samuele?",
      opzioni: ["6 aprile 1999", "6 aprile 2001", "15 agosto 1998", "1 gennaio 2000"],
      corretta: 0,
      curiosita: "Un bambino di primavera! Forse è per questo che porta sempre un po' di sole con sé ☀️",
    },
    {
      id: 5,
      testo: "Come chiamava l'acqua da piccolo?",
      opzioni: ["Acaa", "Glù Glù", "Dlà Dlà", "Scià Scià"],
      corretta: 2,
      curiosita: "\"Dlà Dlà\" — una parola talmente bella che quasi dispiace non averla adottata tutti 💧",
    },
    {
      id: 6,
      testo: "Per quale squadra tifa Don Samuele?",
      opzioni: ["Milan", "Inter", "Juventus", "Atalanta"],
      corretta: 1,
      curiosita: "Interista convinto! La fede calcistica è dura a morire... anche in seminario ⚫🔵",
    },
    {
      id: 7,
      testo: "Come si chiama la mamma di Don Samuele?",
      opzioni: ["Sara", "Maria", "Anna", "Elena"],
      corretta: 0,
      curiosita: "Sara — un nome bellissimo, con una storia antica. E non è finita qui.. 😂",
    },
    {
      id: 8,
      testo: "Come si chiama la nipote di Don Samuele?",
      opzioni: ["Sofia", "Giulia", "Sara", "Emma"],
      corretta: 2,
      curiosita: "Sara! In casa Brancè il nome porta bene... e fa confusione a tavola 😂",
    },
    {
      id: 9,
      testo: "In quali parrocchie è stato Don Samuele durante il Seminario (conta l'ordine!)",
      opzioni: ["Somma Lombardo -> Villasanta -> Policlinico -> Cesano Maderno", "Villasanta -> Somma Lombardo -> Policlinico -> Cesano Maderno", "Venegono -> Villasanta -> Cesano Maderno", "Somma Lombardo -> Cesano Maderno -> Villasanta -> Venegono"],
      corretta: 0,
      curiosita: "Ma prima di tutto.. anni e anni come chierichietto a Mesenzana! ⛪",
    },
    {
      id: 10,
      testo: "Di dove è originario Don Samuele?",
      opzioni: ["Sicilia", "Lodi", "Cesenatico", "Castendallo"],
      corretta: 3,
      curiosita: "Nato a Mesenzana, ma le origini non si dimenticano! 🏠",
    }
  ],
};
