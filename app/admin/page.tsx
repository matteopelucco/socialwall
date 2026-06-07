"use client";

import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  getAllDedicheWithSessions,
  updateDedica,
  deleteSession,
  deleteDedica,
  deleteAllSessions,
} from "@/lib/supabase";
import { EVENT_CONFIG } from "@/config/event";
import { formatTime } from "@/lib/utils";
import type { DedicaWithSession } from "@/lib/types";

const AUTH_KEY = "sw_admin_authed";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

// ── PDF export ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

function openPrintWindow(items: DedicaWithSession[]) {
  const ordered = [...items].reverse(); // oldest first
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Messaggi per ${escapeHtml(EVENT_CONFIG.honoree)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&family=Nunito+Sans:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Nunito Sans',Georgia,serif;color:#1a1a2e;background:#fff;padding:48px 56px;max-width:760px;margin:0 auto}
    .cover{text-align:center;padding-bottom:36px;margin-bottom:40px;border-bottom:3px solid #f06292}
    .cover-emoji{font-size:48px;margin-bottom:16px}
    .cover h1{font-family:'Nunito',sans-serif;font-size:30px;font-weight:900;color:#1a1a2e;margin-bottom:8px}
    .cover .sub{font-size:15px;color:#9a96a8;margin-bottom:4px}
    .cover .count{margin-top:16px;display:inline-block;background:#fff0f6;color:#f06292;font-size:13px;font-weight:700;padding:4px 16px;border-radius:100px}
    .msg{margin-bottom:32px;padding:20px 24px 16px;border-left:4px solid #f06292;background:#fff8fb;page-break-inside:avoid;break-inside:avoid}
    .msg-text{font-size:15px;line-height:1.75;color:#1a1a2e;margin-bottom:12px}
    .msg-author{font-family:'Nunito',sans-serif;font-size:12px;font-weight:900;color:#f06292;text-transform:uppercase;letter-spacing:0.1em}
    .footer{margin-top:48px;text-align:center;font-size:12px;color:#c0bcc8;border-top:1px solid #f0ebe3;padding-top:20px}
    @media print{body{padding:24px 32px}@page{margin:20mm}}
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-emoji">💌</div>
    <h1>Messaggi per ${escapeHtml(EVENT_CONFIG.honoree)}</h1>
    <p class="sub">${escapeHtml(EVENT_CONFIG.eventName)}</p>
    <p class="sub">${escapeHtml(EVENT_CONFIG.eventSubtitle)}</p>
    <span class="count">${ordered.length} messaggi ricevuti</span>
  </div>
  ${ordered.map((item) => `
  <div class="msg">
    <p class="msg-text">${escapeHtml(item.testo)}</p>
    <p class="msg-author">— ${escapeHtml(item.nome_firma)}</p>
  </div>`).join("")}
  <div class="footer">${escapeHtml(EVENT_CONFIG.eventDate)}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Abilita i popup per questo sito per scaricare il PDF."); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

// ── Login ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(pw)) {
      setError("Password errata.");
      setPw("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="padlet-card card-violet p-8" style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "var(--color-text)", margin: "0 0 4px" }}>
          🛡️ Admin
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 24px" }}>
          {EVENT_CONFIG.eventName}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            placeholder="Password"
            className="input-padlet"
            style={{ marginBottom: error ? 8 : 12 }}
            autoFocus
          />
          {error && (
            <p style={{ fontSize: 13, color: "var(--color-primary)", margin: "0 0 12px" }}>{error}</p>
          )}
          <button type="submit" className="btn-primary w-full">Accedi</button>
        </form>
        {!ADMIN_PASSWORD && (
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 16, textAlign: "center" }}>
            ⚠️ NEXT_PUBLIC_ADMIN_PASSWORD non configurata
          </p>
        )}
      </div>
    </div>
  );
}

// ── Dedica Row ─────────────────────────────────────────────────────────

function DedicaRow({
  item,
  onDelete,
  onUpdate,
}: {
  item: DedicaWithSession;
  onDelete: (item: DedicaWithSession) => Promise<void>;
  onUpdate: (id: string, testo: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [editText, setEditText] = useState(item.testo);
  const [saving, setSaving] = useState(false);

  const session = item.sessions;
  const time = new Date(item.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try { await onUpdate(item.id, editText.trim()); setMode("view"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    await onDelete(item);
  };

  if (mode === "edit") {
    return (
      <div className="padlet-card card-amber p-4">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f5a623", marginBottom: 8 }}>
          ✏️ Modifica messaggio · {item.nome_firma}
        </div>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value.slice(0, 300))}
          rows={4}
          className="input-padlet"
          style={{ resize: "none", marginBottom: 10, fontSize: 14 }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" style={{ fontSize: 13, padding: "6px 18px" }} onClick={handleSave} disabled={saving || !editText.trim()}>
            {saving ? "Salvo…" : "Salva"}
          </button>
          <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 18px" }} onClick={() => { setEditText(item.testo); setMode("view"); }}>
            Annulla
          </button>
        </div>
      </div>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <div className="padlet-card card-pink p-4">
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px" }}>
          Eliminare il messaggio di <strong>{item.nome_firma}</strong>?
        </p>
        {session && (
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 6px" }}>
            Verrà eliminata anche la sessione di <strong>{session.nome}</strong> ({session.punteggio}/{session.totale_domande} · {formatTime(session.tempo_secondi)}) — sparirà dalla classifica.
          </p>
        )}
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic", margin: "0 0 14px" }}>
          &ldquo;{item.testo.slice(0, 100)}{item.testo.length > 100 ? "…" : ""}&rdquo;
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={saving}
            style={{ background: "#e53e3e", color: "#fff", border: "none", borderRadius: 100, padding: "6px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            {saving ? "Eliminando…" : "Sì, elimina tutto"}
          </button>
          <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 18px" }} onClick={() => setMode("view")}>
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="padlet-card card-blue p-4" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row: name + score badge + time */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--color-text)" }}>
            {item.nome_firma}
          </span>
          {session && (
            <span style={{ fontSize: 11, background: "rgba(79,142,247,0.12)", color: "#4f8ef7", borderRadius: 100, padding: "1px 8px", fontWeight: 700 }}>
              {session.punteggio}/{session.totale_domande} · ⏱ {formatTime(session.tempo_secondi)}
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{time}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text)", margin: 0, lineHeight: 1.55, wordBreak: "break-word" }}>
          {item.testo}
        </p>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setMode("edit")}
          title="Modifica testo"
          style={{ background: "rgba(79,142,247,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 15 }}
        >
          ✏️
        </button>
        <button
          onClick={() => setMode("confirm-delete")}
          title="Elimina messaggio e sessione"
          style={{ background: "rgba(240,98,146,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 15 }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── Delete-all confirmation banner ─────────────────────────────────────

function DeleteAllBanner({ onConfirm, onCancel, deleting }: { onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <div style={{ background: "#fff5f5", border: "1.5px solid #feb2b2", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#c53030" }}>
        ⚠️ Tutti i messaggi e tutti i partecipanti verranno eliminati. Non è reversibile.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onConfirm}
          disabled={deleting}
          style={{ background: "#e53e3e", color: "#fff", border: "none", borderRadius: 100, padding: "6px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          {deleting ? "Eliminando…" : "Conferma: elimina tutto"}
        </button>
        <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={onCancel}>
          Annulla
        </button>
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<DedicaWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAllDedicheWithSessions();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const ch = supabase
      .channel("admin-dediche")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dediche" }, () => {
        load();
      })
      .subscribe();

    const poll = setInterval(load, 10_000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, [load]);

  const handleDelete = useCallback(async (item: DedicaWithSession) => {
    if (item.sessions?.id) {
      await deleteSession(item.sessions.id); // cascades to dedica
    } else {
      await deleteDedica(item.id); // orphan dedica, no session
    }
    setItems((prev) => prev.filter((d) => d.id !== item.id));
  }, []);

  const handleUpdate = useCallback(async (id: string, testo: string) => {
    await updateDedica(id, testo);
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, testo } : d)));
  }, []);

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await deleteAllSessions(); // cascades to all dediche
      setItems([]);
      setShowDeleteAll(false);
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      {/* Sticky header */}
      <div style={{
        background: "var(--color-surface)",
        borderBottom: "1.5px solid rgba(0,0,0,0.07)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--color-text)" }}>
            🛡️ Admin — {EVENT_CONFIG.eventName}
          </span>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {loading ? "Caricamento…" : `${items.length} messaggi`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => openPrintWindow(items)}
            disabled={items.length === 0}
            style={{ background: "rgba(52,192,114,0.1)", color: "#22a06b", border: "1.5px solid #86efac", borderRadius: 100, padding: "6px 16px", fontWeight: 700, fontSize: 13, cursor: items.length === 0 ? "not-allowed" : "pointer", opacity: items.length === 0 ? 0.5 : 1 }}
          >
            📄 Scarica PDF
          </button>
          <button
            onClick={() => setShowDeleteAll((v) => !v)}
            style={{ background: showDeleteAll ? "#fed7d7" : "rgba(229,62,62,0.08)", color: "#c53030", border: "1.5px solid #feb2b2", borderRadius: 100, padding: "6px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            🗑️ Cancella tutto
          </button>
          <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={onLogout}>
            Esci
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {showDeleteAll && (
          <DeleteAllBanner
            onConfirm={handleDeleteAll}
            onCancel={() => setShowDeleteAll(false)}
            deleting={deletingAll}
          />
        )}

        {loading && (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: 14 }}>Caricamento messaggi…</p>
        )}
        {!loading && items.length === 0 && (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: 14 }}>Nessun messaggio ancora.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <DedicaRow
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
  }, []);

  const handleLogin = useCallback((pw: string): boolean => {
    if (!ADMIN_PASSWORD || pw !== ADMIN_PASSWORD) return false;
    sessionStorage.setItem(AUTH_KEY, "1");
    setAuthed(true);
    return true;
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }, []);

  if (!authed) return <LoginScreen onLogin={handleLogin} />;
  return <AdminPanel onLogout={handleLogout} />;
}
