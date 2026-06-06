// lib/utils.ts

import type { Question } from "@/config/event";

/** Fisher-Yates shuffle — returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random questions from pool */
export function pickQuestions(pool: Question[], n: number): Question[] {
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

/** Format a date string to Italian locale */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Get score message from config based on score */
export function getScoreMessage(
  score: number,
  messages: Record<number, string>
): string {
  const thresholds = Object.keys(messages)
    .map(Number)
    .sort((a, b) => b - a);
  for (const t of thresholds) {
    if (score >= t) return messages[t];
  }
  return messages[0] ?? "Grazie per aver partecipato!";
}

/** Generate a random session ID for typing status (no DB session yet) */
export function generateTempId(): string {
  return crypto.randomUUID();
}

/** Truncate text with ellipsis */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

/** Format elapsed seconds as M:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Get time feedback message (keyed by max seconds, ascending) */
export function getTimeMessage(
  seconds: number,
  messages: Record<number, string>
): string {
  const thresholds = Object.keys(messages).map(Number).sort((a, b) => a - b);
  for (const t of thresholds) {
    if (seconds <= t) return messages[t];
  }
  return messages[thresholds[thresholds.length - 1]] ?? "";
}

/** Time ago in Italian */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "adesso";
  if (mins === 1) return "1 min fa";
  if (mins < 60) return `${mins} min fa`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 ora fa";
  return `${hours} ore fa`;
}
