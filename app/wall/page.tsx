"use client";

// app/wall/page.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { EVENT_CONFIG, CARD_ACCENT_COLORS, AVATAR_COLORS } from "@/config/event";
import {
  supabase,
  getRecentDediche,
  getLeaderboard,
  getTotalParticipants,
  getActiveTyping,
} from "@/lib/supabase";
import { timeAgo, formatTime } from "@/lib/utils";
import type { Dedica, LeaderboardEntry, TypingStatus } from "@/lib/types";

// ── Helpers ────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % AVATAR_COLORS.length;
}

const CARD_CLASSES = [
  "card-amber",
  "card-blue",
  "card-green",
  "card-pink",
  "card-violet",
  "card-cyan",
];

// ── DedicaCard ─────────────────────────────────────────────────────

function DedicaCard({ dedica, index }: { dedica: Dedica; index: number }) {
  const cardClass = CARD_CLASSES[index % CARD_CLASSES.length];
  const avatarColor = AVATAR_COLORS[getColorIndex(dedica.nome_firma)];
  const initials = getInitials(dedica.nome_firma);

  return (
    <div
      className={`padlet-card ${cardClass} animate-card-in mb-3`}
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      <div className="p-4">
        <p
          className="text-sm leading-relaxed mb-3"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.65,
          }}
        >
          "{dedica.testo}"
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="avatar" style={{ background: avatarColor, width: 28, height: 28, fontSize: 11 }}>
              {initials}
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--color-text)",
              }}
            >
              {dedica.nome_firma}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            {timeAgo(dedica.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────

function Sidebar({
  entries,
  total,
}: {
  entries: LeaderboardEntry[];
  total: number;
}) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className="flex flex-col h-full p-4 no-scrollbar overflow-y-auto"
      style={{
        background: "var(--color-surface)",
        borderRight: "1.5px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* Counter */}
      <div
        className="rounded-2xl p-4 mb-4 text-center"
        style={{ background: "var(--color-surface2)" }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1,
            color: "var(--color-secondary)",
          }}
        >
          {total}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginTop: 4,
          }}
        >
          partecipanti
        </div>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 12,
          fontFamily: "var(--font-display)",
        }}
      >
        🏆 Classifica
      </div>

      <div className="flex flex-col gap-2">
        {entries.slice(0, 8).map((e, i) => {
          const avatarColor = AVATAR_COLORS[getColorIndex(e.nome)];
          return (
            <div
              key={`${e.nome}-${i}`}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: i === 0 ? "rgba(79,142,247,0.08)" : "transparent",
              }}
            >
              <span style={{ fontSize: i < 3 ? 16 : 12, width: 24, textAlign: "center", color: "var(--color-text-muted)" }}>
                {medals[i] ?? `${i + 1}.`}
              </span>
              <div className="avatar" style={{ background: avatarColor, width: 26, height: 26, fontSize: 10 }}>
                {getInitials(e.nome)}
              </div>
              <span
                className="flex-1 truncate"
                style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}
              >
                {e.nome}
              </span>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    fontWeight: 800,
                    color: i === 0 ? "var(--color-secondary)" : "var(--color-text-muted)",
                    lineHeight: 1.2,
                  }}
                >
                  {e.punteggio}/{e.totale_domande}
                </div>
                {e.tempo_secondi > 0 && (
                  <div style={{ fontSize: 10, color: "var(--color-text-muted)", lineHeight: 1.2 }}>
                    {formatTime(e.tempo_secondi)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic" }}>
            Ancora nessuno... sii il primo! 🎯
          </p>
        )}
      </div>

      {/* QR panel */}
      <div
        className="rounded-2xl p-4 mt-auto"
        style={{ background: "var(--color-surface2)", textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-text-muted)",
            marginBottom: 10,
            fontFamily: "var(--font-display)",
          }}
        >
          {EVENT_CONFIG.qrInviteText}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/qr.png"
          alt="QR code"
          style={{ width: "100%", maxWidth: 160, height: "auto", borderRadius: 8, margin: "0 auto", display: "block" }}
        />
      </div>
    </div>
  );
}

// ── Typing Banner ──────────────────────────────────────────────────

function TypingBanner({ typers }: { typers: TypingStatus[] }) {
  if (typers.length === 0) return null;
  const names = typers.map((t) => t.nome).join(", ");
  const verb = typers.length === 1 ? "sta scrivendo" : "stanno scrivendo";

  return (
    <div
      className="flex items-center gap-3 px-5 py-2"
      style={{
        background: "rgba(124,93,232,0.07)",
        borderBottom: "1px solid rgba(124,93,232,0.15)",
        fontSize: 13,
        color: "var(--color-text-muted)",
      }}
    >
      <div className="flex gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span>
        <strong style={{ color: "var(--color-text)", fontWeight: 700 }}>{names}</strong>{" "}
        {verb}...
      </span>
    </div>
  );
}

// ── Wall Header ────────────────────────────────────────────────────

function WallHeader({ total }: { total: number }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1.5px solid rgba(0,0,0,0.07)",
        gridColumn: "1 / -1",
      }}
    >
      <div className="flex items-center gap-3">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 900,
            color: "var(--color-text)",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {EVENT_CONFIG.wallTitle}
        </h1>
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            fontWeight: 500,
          }}
        >
          {EVENT_CONFIG.eventSubtitle}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#d63650",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Live
          </span>
        </div>
        <div
          className="rounded-full px-4 py-1 flex items-center gap-2"
          style={{ background: "#eef2ff" }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
            👥 {total} partecipanti
          </span>
        </div>
        <div
          className="rounded-full px-4 py-1"
          style={{ background: "var(--color-surface2)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--color-text)",
            }}
          >
            {EVENT_CONFIG.eventName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center p-8"
      style={{ color: "var(--color-text-muted)" }}
    >
      <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.3 }}>💌</div>
      <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--color-text)" }}>
        I messaggi appariranno qui in tempo reale
      </p>
      <p style={{ fontSize: 14 }}>
        Scansiona il QR code per essere il primo!
      </p>
    </div>
  );
}

// ── Main Wall Page ─────────────────────────────────────────────────

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

    const dedicaChannel = supabase
      .channel("wall-dediche")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dediche" }, (payload) => {
        setDediche((prev) => [payload.new as Dedica, ...prev]);
      })
      .subscribe();

    const typingChannel = supabase
      .channel("wall-typing")
      .on("postgres_changes", { event: "*", schema: "public", table: "typing_status" }, () => {
        getActiveTyping().then(setTypers);
      })
      .subscribe();

    const sessionChannel = supabase
      .channel("wall-sessions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sessions" }, () => {
        getLeaderboard().then(setLeaderboard);
        getTotalParticipants().then(setTotal);
      })
      .subscribe();

    const poll = setInterval(load, 15_000);

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
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ top: 300, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(scroll);
  }, [dediche]);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ fontFamily: "var(--font-body)", background: "var(--color-surface)" }}
    >
      {/* Header — full width */}
      <WallHeader total={total} />

      {/* Typing banner — full width */}
      <TypingBanner typers={typers} />

      {/* Body: sidebar + feed */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="shrink-0 overflow-hidden" style={{ width: 220 }}>
          <Sidebar entries={leaderboard} total={total} />
        </div>

        {/* Dedica feed — masonry columns */}
        <div
          ref={feedRef}
          className="flex-1 no-scrollbar overflow-y-auto board-bg p-4"
          style={{ columnCount: 3, columnGap: "12px" }}
        >
          {dediche.length === 0 ? (
            <div style={{ columnSpan: "all" }}>
              <EmptyState />
            </div>
          ) : (
            dediche.map((d, i) => (
              <DedicaCard key={d.id} dedica={d} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
