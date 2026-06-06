"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, getAllDediche, updateDedica, deleteDedica } from "@/lib/supabase";
import { EVENT_CONFIG } from "@/config/event";
import type { Dedica } from "@/lib/types";

const AUTH_KEY = "sw_admin_authed";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
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
            <p style={{ fontSize: 13, color: "var(--color-primary)", margin: "0 0 12px" }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full">
            Accedi
          </button>
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
  dedica,
  onDelete,
  onUpdate,
}: {
  dedica: Dedica;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, testo: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [editText, setEditText] = useState(dedica.testo);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try { await onUpdate(dedica.id, editText.trim()); setMode("view"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    await onDelete(dedica.id);
  };

  const time = new Date(dedica.created_at).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mode === "edit") {
    return (
      <div className="padlet-card card-amber p-4">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f5a623", marginBottom: 8 }}>
          ✏️ Modifica · {dedica.nome_firma}
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
          <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 18px" }} onClick={() => { setEditText(dedica.testo); setMode("view"); }}>
            Annulla
          </button>
        </div>
      </div>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <div className="padlet-card card-pink p-4">
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", margin: "0 0 6px" }}>
          Eliminare il messaggio di <strong>{dedica.nome_firma}</strong>?
        </p>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic", margin: "0 0 14px" }}>
          &ldquo;{dedica.testo.slice(0, 100)}{dedica.testo.length > 100 ? "…" : ""}&rdquo;
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={saving}
            style={{ background: "#e53e3e", color: "#fff", border: "none", borderRadius: 100, padding: "6px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            {saving ? "Eliminando…" : "Sì, elimina"}
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
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--color-text)" }}>
            {dedica.nome_firma}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{time}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text)", margin: 0, lineHeight: 1.55, wordBreak: "break-word" }}>
          {dedica.testo}
        </p>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setMode("edit")}
          title="Modifica"
          style={{ background: "rgba(79,142,247,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 15 }}
        >
          ✏️
        </button>
        <button
          onClick={() => setMode("confirm-delete")}
          title="Elimina"
          style={{ background: "rgba(240,98,146,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 15 }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [dediche, setDediche] = useState<Dedica[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getAllDediche();
      setDediche(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const ch = supabase
      .channel("admin-dediche")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dediche" }, (payload) => {
        setDediche((prev) => [payload.new as Dedica, ...prev]);
      })
      .subscribe();

    const poll = setInterval(load, 10_000);

    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteDedica(id);
    setDediche((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleUpdate = useCallback(async (id: string, testo: string) => {
    await updateDedica(id, testo);
    setDediche((prev) => prev.map((d) => (d.id === id ? { ...d, testo } : d)));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      {/* Sticky header */}
      <div style={{
        background: "var(--color-surface)",
        borderBottom: "1.5px solid rgba(0,0,0,0.07)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--color-text)" }}>
            🛡️ Admin — {EVENT_CONFIG.eventName}
          </span>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {loading ? "Caricamento…" : `${dediche.length} messaggi`}
          </span>
        </div>
        <button className="btn-secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={onLogout}>
          Esci
        </button>
      </div>

      {/* Message list */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {loading && (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: 14 }}>
            Caricamento messaggi…
          </p>
        )}
        {!loading && dediche.length === 0 && (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: 14 }}>
            Nessun messaggio ancora.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dediche.map((d) => (
            <DedicaRow
              key={d.id}
              dedica={d}
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
