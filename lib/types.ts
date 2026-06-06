// lib/types.ts

export type Session = {
  id: string;
  nome: string;
  punteggio: number;
  totale_domande: number;
  tempo_secondi: number;
  created_at: string;
};

export type Dedica = {
  id: string;
  session_id: string | null;
  nome_firma: string;
  testo: string;
  created_at: string;
};

export type TypingStatus = {
  id: string;
  session_id: string;
  nome: string;
  last_seen: string;
};

export type LeaderboardEntry = {
  nome: string;
  punteggio: number;
  totale_domande: number;
  tempo_secondi: number;
  percentuale: number;
  created_at: string;
};

export type DedicaWithSession = Dedica & {
  sessions: Pick<Session, "id" | "nome" | "punteggio" | "totale_domande" | "tempo_secondi"> | null;
};

// Quiz state machine
export type QuizPhase =
  | "welcome"
  | "question"
  | "feedback"
  | "score"
  | "dedica"
  | "thankyou";
