// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Check .env.local:\n" +
      "NEXT_PUBLIC_SUPABASE_URL\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

let _supabase: ReturnType<typeof getSupabaseClient> | null = null;

export function getClient() {
  if (!_supabase) _supabase = getSupabaseClient();
  return _supabase;
}

// Backward-compat export used by the helper functions below
export const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ── Typed helpers ─────────────────────────────────────────────

import type { Session, Dedica, DedicaWithSession, TypingStatus, LeaderboardEntry } from "./types";

export async function createSession(
  nome: string,
  punteggio: number,
  totale_domande: number,
  tempo_secondi: number
): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ nome, punteggio, totale_domande, tempo_secondi })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createDedica(
  session_id: string,
  nome_firma: string,
  testo: string
): Promise<Dedica> {
  const { data, error } = await supabase
    .from("dediche")
    .insert({ session_id, nome_firma, testo })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertTypingStatus(
  session_id: string,
  nome: string
): Promise<void> {
  await supabase
    .from("typing_status")
    .upsert({ session_id, nome, last_seen: new Date().toISOString() }, {
      onConflict: "session_id",
    });
}

export async function deleteTypingStatus(session_id: string): Promise<void> {
  await supabase
    .from("typing_status")
    .delete()
    .eq("session_id", session_id);
}

export async function getRecentDediche(limit = 50): Promise<Dedica[]> {
  const { data, error } = await supabase
    .from("dediche")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getTotalParticipants(): Promise<number> {
  const { count, error } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getActiveTyping(): Promise<TypingStatus[]> {
  const cutoff = new Date(Date.now() - 45_000).toISOString();
  const { data, error } = await supabase
    .from("typing_status")
    .select("*")
    .gt("last_seen", cutoff);
  if (error) throw error;
  return data ?? [];
}

// ── Admin helpers ──────────────────────────────────────────────

export async function getAllDediche(): Promise<Dedica[]> {
  const { data, error } = await supabase
    .from("dediche")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllDedicheWithSessions(): Promise<DedicaWithSession[]> {
  const { data, error } = await supabase
    .from("dediche")
    .select("*, sessions(id, nome, punteggio, totale_domande, tempo_secondi)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DedicaWithSession[];
}

export async function updateDedica(id: string, testo: string): Promise<void> {
  const { error } = await supabase
    .from("dediche")
    .update({ testo })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDedica(id: string): Promise<void> {
  const { error } = await supabase
    .from("dediche")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAllSessions(): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .not("id", "is", null);
  if (error) throw error;
}
