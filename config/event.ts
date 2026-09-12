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
  eventName:     "Saluto di don Fabio",
  eventDate:     "14 Giugno 2026",
  eventSubtitle: "Grazie, don Fabio!",
  honoree:       "Don Fabio",

  // ── Quiz ───────────────────────────────────────────────────
  quizTitle:    "Quanto conosci Don Fabio?",
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
  wallSubtitle:      "I tuoi auguri a Don Fabio",
  dedicaPlaceholder: "Scrivi il tuo messaggio a Don Fabio...",
  scoreNudgeText:    "I messaggi di oggi verranno raccolti e consegnati a Don Fabio come ricordo di questo giorno. Basta una riga ✍️",
  dedicaHeaderText:  "Don Fabio leggerà ogni messaggio. Sarà il suo ricordo di questo giorno.",
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
      testo: "Quando è nato Don Fabio?",
      opzioni: ["10 gennaio 1988", "22 marzo 1987", "5 luglio 1989", "14 gennaio 1988"],
      corretta: 0,
      curiosita: "Un Capricorno doc, nato proprio all'inizio dell'anno! ♑",
    },
    {
      id: 2,
      testo: "Come si chiama il fratello di Don Fabio?",
      opzioni: ["Marco", "Luca", "Andrea", "Davide"],
      corretta: 0,
      curiosita: "Marco — il fratello che lo conosce meglio di chiunque altro! 👨‍👦",
    },
    {
      id: 3,
      testo: "Come si chiama la mamma di Don Fabio?",
      opzioni: ["Lucia", "Maria", "Carla", "Rosa"],
      corretta: 0,
      curiosita: "Lucia — la mamma che gli ha insegnato tutto, dalla fede alla cucina! ❤️",
    },
    {
      id: 4,
      testo: "Qual è la parrocchia di origine di Don Fabio?",
      opzioni: ["Santa Maria Ausiliatrice, villaggio di Inzago", "San Giuseppe, Gorgonzola", "Sant'Ambrogio, Cassano d'Adda", "San Carlo, Vaprio d'Adda"],
      corretta: 0,
      curiosita: "Il villaggio di Inzago: dove tutto è cominciato per lui 🏡",
    },
    {
      id: 5,
      testo: "Che numero di scarpe porta Don Fabio?",
      opzioni: ["45", "42", "43", "47"],
      corretta: 0,
      curiosita: "45! Piedi grandi per un cammino ancora più grande 👟",
    },
    {
      id: 6,
      testo: "In che anno è entrato in seminario Don Fabio?",
      opzioni: ["2010", "2008", "2012", "2005"],
      corretta: 0,
      curiosita: "2010 — l'anno in cui ha detto sì per la prima volta 📖",
    },
    {
      id: 7,
      testo: "Chi è stato il suo rettore in seminario?",
      opzioni: ["Don Michele Di Tolve", "Don Angelo Brioschi", "Don Giovanni Colombo", "Don Pietro Rota"],
      corretta: 0,
      curiosita: "Don Michele Di Tolve, una guida che non ha mai dimenticato 🙏",
    },
    {
      id: 8,
      testo: "Che mezzo usava preferenzialmente Don Fabio a Cassina?",
      opzioni: ["Bicicletta", "Motorino", "Automobile", "A piedi"],
      corretta: 0,
      curiosita: "Sempre in sella alla sua bici, pioggia o sole! 🚲",
    },
    {
      id: 9,
      testo: "Quanti anni è stato Don Fabio a Cassina?",
      opzioni: ["11 anni", "8 anni", "15 anni", "6 anni"],
      corretta: 0,
      curiosita: "11 anni di cammino insieme alla comunità di Cassina! 🕰️",
    },
    {
      id: 10,
      testo: "Qual è il colore preferito di Don Fabio?",
      opzioni: ["Azzurro", "Verde", "Rosso", "Giallo"],
      corretta: 0,
      curiosita: "Azzurro come il cielo!",
    }
  ],
};
