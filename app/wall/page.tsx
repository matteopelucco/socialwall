"use client";

// app/wall/page.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { EVENT_CONFIG } from "@/config/event";
import {
  supabase,
  getRecentDediche,
  getLeaderboard,
  getTotalParticipants,
  getActiveTyping,
} from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";
import type { Dedica, LeaderboardEntry, TypingStatus } from "@/lib/types";

// ── DedicaCard ────────────────────────────────────────────────────

const CARD_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-accent2)",
];

function DedicaCard({ dedica, index }: { dedica: Dedica; index: number }) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <div
      className="card-memphis p-5 animate-card-in shrink-0"
      style={{
        borderColor: color,
        boxShadow: `5px 5px 0 ${color}`,
        animationDelay: `${(index % 6) * 0.08}s`,
      }}
    >
      <p className="text-text-main text-base leading-relaxed mb-4 line-clamp-4">
        "{dedica.testo}"
      </p>
      <div className="flex items-center justify-between">
        <span
          className="font-display text-xl"
          style={{ fontFamily: "var(--font-display)", color }}
        >
          — {dedica.nome_firma}
        </span>
        <span className="text-text-muted text-xs">{timeAgo(dedica.created_at)}</span>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────

function LeaderboardPanel({
  entries,
  total,
}: {
  entries: LeaderboardEntry[];
  total: number;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex flex-col h-full p-4 border-r-2 border-surface2">
      {/* Participants counter */}
      <div className="card-memphis p-4 mb-4 text-center" style={{ borderColor: "var(--color-accent)" }}>
        <div
          className="font-display text-6xl text-accent leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {total}
        </div>
        <div className="text-text-muted text-xs uppercase tracking-widest mt-1">
          partecipanti
        </div>
      </div>

      {/* Leaderboard title */}
      <div
        className="font-display text-2xl text-secondary mb-3 uppercase tracking-wide"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Classifica
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-2 overflow-hidden flex-1">
        {entries.slice(0, 8).map((e, i) => (
          <div
            key={`${e.nome}-${i}`}
            className="flex items-center gap-2 p-2 rounded"
            style={{ background: i === 0 ? "rgba(255, 214, 0, 0.08)" : "transparent" }}
          >
            <span className="text-xl w-7 shrink-0">{medals[i] ?? `${i + 1}.`}</span>
            <span className="text-text-main text-sm font-medium flex-1 truncate">
              {e.nome}
            </span>
            <span
              className="font-display text-lg shrink-0"
              style={{
                fontFamily: "var(--font-display)",
                color: i === 0 ? "var(--color-secondary)" : "var(--color-text-muted)",
              }}
            >
              {e.punteggio}/{e.totale_domande}
            </span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-text-muted text-sm italic">
            Ancora nessuno... sii il primo! 🎯
          </p>
        )}
      </div>
    </div>
  );
}

// ── Typing Banner ─────────────────────────────────────────────────

function TypingBanner({ typers }: { typers: TypingStatus[] }) {
  if (typers.length === 0) return null;
  const names = typers.map((t) => t.nome).join(", ");
  const verb = typers.length === 1 ? "sta scrivendo" : "stanno scrivendo";
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 text-sm"
      style={{ background: "rgba(124, 58, 237, 0.15)", borderBottom: "1px solid var(--color-accent2)" }}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="live-dot"
            style={{
              background: "var(--color-accent2)",
              animationDelay: `${i * 0.2}s`,
              width: "6px",
              height: "6px",
            }}
          />
        ))}
      </div>
      <span className="text-text-muted">
        <span className="text-text-main font-semibold">{names}</span> {verb}...
      </span>
    </div>
  );
}

// ── Wall Header ───────────────────────────────────────────────────

function WallHeader() {
  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b-2 border-surface2"
      style={{ background: "var(--color-surface)" }}
    >
      <div>
        <h1
          className="font-display text-4xl text-text-main leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {EVENT_CONFIG.wallTitle}
        </h1>
        <p className="text-text-muted text-sm">{EVENT_CONFIG.eventSubtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-text-muted text-sm uppercase tracking-widest">Live</span>
        <span
          className="font-display text-2xl text-primary ml-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {EVENT_CONFIG.eventName}
        </span>
      </div>
    </div>
  );
}

// ── Main Wall Page ────────────────────────────────────────────────

export default function WallPage() {
  const [dediche, setDediche] = useState<Dedica[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [typers, setTypers] = useState<TypingStatus[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [d, lb, t, ty] = await Promise.all([
      getRecentDediche(100),
      getLeaderboard(),
      getTotalParticipants(),
      getActiveTyping(),
    ]);
    setDediche(d);
    setLeaderboard(lb);
    setTotal(t);
    setTypers(ty);
  }, []);

  useEffect(() => {
    load();

    // Realtime: new dedica
    const dedicaChannel = supabase
      .channel("wall-dediche")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dediche" }, (payload) => {
        setDediche((prev) => [payload.new as Dedica, ...prev]);
        setTotal((t) => t + 1);
      })
      .subscribe();

    // Realtime: typing status
    const typingChannel = supabase
      .channel("wall-typing")
      .on("postgres_changes", { event: "*", schema: "public", table: "typing_status" }, () => {
        getActiveTyping().then(setTypers);
      })
      .subscribe();

    // Realtime: new session (leaderboard update)
    const sessionChannel = supabase
      .channel("wall-sessions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sessions" }, () => {
        getLeaderboard().then(setLeaderboard);
        getTotalParticipants().then(setTotal);
      })
      .subscribe();

    // Polling fallback every 15s
    const poll = setInterval(load, 15_000);

    // Clean stale typers every 10s
    const typerCleanup = setInterval(() => {
      const cutoff = Date.now() - 45_000;
      setTypers((prev) => prev.filter((t) => new Date(t.last_seen).getTime() > cutoff));
    }, 10_000);

    return () => {
      supabase.removeChannel(dedicaChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(sessionChannel);
      clearInterval(poll);
      clearInterval(typerCleanup);
    };
  }, [load]);

  // Auto-scroll feed
  useEffect(() => {
    if (!feedRef.current) return;
    const el = feedRef.current;
    const scroll = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ top: 320, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(scroll);
  }, [dediche]);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col memphis-bg"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <WallHeader />
      <TypingBanner typers={typers} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Leaderboard */}
        <div className="w-72 shrink-0 overflow-hidden">
          <LeaderboardPanel entries={leaderboard} total={total} />
        </div>

        {/* Right: Dedica feed (masonry-style columns) */}
        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto no-scrollbar p-4"
          style={{ columnCount: 2, columnGap: "1rem" }}
        >
          {dediche.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center h-full text-center">
              <div
                className="font-display text-8xl text-surface2 mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                💌
              </div>
              <p className="text-text-muted text-lg">
                I messaggi appariranno qui in tempo reale
              </p>
              <p className="text-text-muted text-sm mt-2">
                Scansiona il QR code per essere il primo!
              </p>
            </div>
          ) : (
            dediche.map((d, i) => (
              <div key={d.id} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
                <DedicaCard dedica={d} index={i} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
