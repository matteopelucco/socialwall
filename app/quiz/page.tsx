"use client";

// app/quiz/page.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { EVENT_CONFIG, AVATAR_COLORS, type Question } from "@/config/event";
import { pickQuestions, getScoreMessage, generateTempId } from "@/lib/utils";
import {
  createSession,
  createDedica,
  upsertTypingStatus,
  deleteTypingStatus,
} from "@/lib/supabase";
import type { QuizPhase } from "@/lib/types";

// ── Helpers ────────────────────────────────────────────────────────

function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % AVATAR_COLORS.length;
}

// ── WelcomeScreen ──────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="quiz-container">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Header card */}
        <div
          className="padlet-card card-pink mb-6 p-6 text-center"
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 900,
              color: "var(--color-text)",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            {EVENT_CONFIG.quizTitle}
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
            {EVENT_CONFIG.quizSubtitle}
          </p>
        </div>

        {/* Name input */}
        <div className="padlet-card card-blue p-5 mb-4">
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              marginBottom: 8,
            }}
          >
            Il tuo nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onStart(name.trim())}
            placeholder="Come ti chiami?"
            className="input-padlet"
            autoFocus
          />
        </div>

        <button
          className="btn-primary w-full text-lg py-4"
          onClick={() => name.trim() && onStart(name.trim())}
          disabled={!name.trim()}
        >
          Inizia il Quiz →
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginTop: 12,
          }}
        >
          {EVENT_CONFIG.questionsPerSession} domande · circa 2 minuti
        </p>
      </div>
    </div>
  );
}

// ── QuestionCard ───────────────────────────────────────────────────

const OPTION_CARD_CLASSES = ["card-amber", "card-blue", "card-green", "card-violet"];
const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_STRIP_COLORS = ["#f5a623", "#4f8ef7", "#34c072", "#7c5de8"];

function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  answered,
  selectedIndex,
}: {
  question: Question;
  index: number;
  total: number;
  onAnswer: (idx: number) => void;
  answered: boolean;
  selectedIndex: number | null;
}) {
  const getOptionClass = (idx: number) => {
    if (!answered) return OPTION_CARD_CLASSES[idx];
    if (idx === question.corretta) return "option-correct";
    if (idx === selectedIndex) return "option-wrong";
    return "option-neutral";
  };

  return (
    <div className="quiz-container" style={{ justifyContent: "flex-start", paddingTop: "1.5rem" }}>
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 900,
              color: "var(--color-primary)",
            }}
          >
            {index + 1} / {total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 5,
                  width: i < index ? 16 : i === index ? 16 : 8,
                  borderRadius: 10,
                  background:
                    i < index
                      ? "var(--color-primary)"
                      : i === index
                      ? "var(--color-secondary)"
                      : "rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="padlet-card card-pink p-5 mb-4 animate-slide-up">
          <p
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {question.testo}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {question.opzioni.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => !answered && onAnswer(idx)}
              disabled={answered}
              className={`padlet-card ${getOptionClass(idx)} w-full text-left flex items-center gap-3 p-4 transition-all duration-200`}
              style={{ cursor: answered ? "default" : "pointer" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 16,
                  color: answered ? "inherit" : OPTION_STRIP_COLORS[idx],
                  width: 24,
                  flexShrink: 0,
                }}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)" }}>
                {opt}
              </span>
            </button>
          ))}
        </div>

        {/* Fun fact */}
        {answered && question.curiosita && (
          <div className="padlet-card card-cyan p-4 mt-4 animate-fade-in">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#00bcd4",
                marginBottom: 4,
              }}
            >
              Lo sapevi?
            </p>
            <p style={{ fontSize: 13, color: "var(--color-text)", margin: 0 }}>
              {question.curiosita}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ScoreScreen ────────────────────────────────────────────────────

function ScoreScreen({
  score,
  total,
  questions,
  answers,
  onContinue,
  dedicaEnabled,
}: {
  score: number;
  total: number;
  questions: Question[];
  answers: (number | null)[];
  onContinue: () => void;
  dedicaEnabled: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const message = getScoreMessage(score, EVENT_CONFIG.scoreMessages);
  const pct = Math.round((score / total) * 100);
  const cardClass = pct >= 80 ? "card-green" : pct >= 50 ? "card-amber" : "card-pink";

  return (
    <div className="quiz-container">
      <div className="w-full max-w-sm animate-pop">
        <div className={`padlet-card ${cardClass} p-8 text-center mb-4`}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 80,
              fontWeight: 900,
              lineHeight: 1,
              color: "var(--color-text)",
            }}
          >
            {score}/{total}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--color-primary)",
              marginTop: 4,
            }}
          >
            {pct}%
          </div>
          <p style={{ fontWeight: 600, color: "var(--color-text)", marginTop: 12, fontSize: 16 }}>
            {message}
          </p>
        </div>

        <button
          className="btn-secondary w-full mb-3"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Nascondi risposte" : "Vedi risposte corrette"}
        </button>

        {showDetails && (
          <div className="flex flex-col gap-2 mb-4 animate-fade-in">
            {questions.map((q, i) => {
              const correct = answers[i] === q.corretta;
              return (
                <div
                  key={q.id}
                  className={`padlet-card p-3 ${correct ? "card-green" : "card-pink"}`}
                >
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 2 }}>
                    {i + 1}. {q.testo}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                    {correct ? "✓" : "✗"} {q.opzioni[q.corretta]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {dedicaEnabled ? (
          <button className="btn-primary w-full text-lg py-4" onClick={onContinue}>
            Lascia un messaggio 💌
          </button>
        ) : (
          <div className="padlet-card card-amber p-4 text-center">
            <p style={{ fontSize: 14, color: "var(--color-text)", margin: 0 }}>
              📺 Il muro è momentaneamente chiuso.
              Il tuo punteggio è stato registrato in classifica!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DedicaForm ─────────────────────────────────────────────────────

function DedicaForm({
  defaultName,
  sessionId,
  onSubmit,
}: {
  defaultName: string;
  sessionId: string;
  onSubmit: () => void;
}) {
  const [testo, setTesto] = useState("");
  const [firma, setFirma] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (testo.length > 0) {
      upsertTypingStatus(sessionId, defaultName);
      if (typingTimer.current) clearInterval(typingTimer.current);
      typingTimer.current = setInterval(() => {
        upsertTypingStatus(sessionId, defaultName);
      }, 5000);
    }
    return () => { if (typingTimer.current) clearInterval(typingTimer.current); };
  }, [testo, sessionId, defaultName]);

  const handleSubmit = async () => {
    if (!testo.trim()) return;
    setLoading(true);
    try {
      await createDedica(sessionId, firma.trim() || defaultName, testo.trim());
      await deleteTypingStatus(sessionId);
      onSubmit();
    } catch (e) {
      console.error(e);
      alert("Errore nel salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const remaining = 300 - testo.length;

  return (
    <div className="quiz-container">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="padlet-card card-violet p-5 mb-4 text-center">
          <div style={{ fontSize: 36, marginBottom: 6 }}>💌</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 900,
              color: "var(--color-text)",
              margin: "0 0 4px",
            }}
          >
            {EVENT_CONFIG.wallTitle}
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
            Il tuo messaggio apparirà sul muro in tempo reale ✨
          </p>
        </div>

        <div className="padlet-card card-amber p-5 mb-3">
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              marginBottom: 8,
            }}
          >
            Il tuo messaggio
          </label>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value.slice(0, 300))}
            placeholder={EVENT_CONFIG.dedicaPlaceholder}
            rows={5}
            className="input-padlet"
            style={{ resize: "none" }}
          />
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              marginTop: 4,
              color: remaining < 30 ? "var(--color-primary)" : "var(--color-text-muted)",
            }}
          >
            {remaining} caratteri rimanenti
          </div>
        </div>

        <div className="padlet-card card-blue p-5 mb-5">
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              marginBottom: 8,
            }}
          >
            Firma
          </label>
          <input
            type="text"
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
            className="input-padlet"
          />
        </div>

        <button
          className="btn-primary w-full text-lg py-4"
          onClick={handleSubmit}
          disabled={!testo.trim() || loading}
        >
          {loading ? "Invio in corso..." : "Invia Messaggio 💌"}
        </button>
      </div>
    </div>
  );
}

// ── ThankYouScreen ─────────────────────────────────────────────────

function ThankYouScreen() {
  return (
    <div className="quiz-container">
      <div className="w-full max-w-sm text-center animate-pop">
        <div className="padlet-card card-green p-8 mb-4">
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 900,
              color: "var(--color-text)",
              margin: "0 0 8px",
            }}
          >
            Grazie!
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", margin: 0 }}>
            Il tuo messaggio è sul muro per {EVENT_CONFIG.honoree}.
          </p>
        </div>
        <div className="padlet-card card-blue p-4">
          <p style={{ fontSize: 14, color: "var(--color-text)", margin: 0 }}>
            📺 Cerca il tuo nome sul grande schermo!
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Quiz Page ─────────────────────────────────────────────────

const dedicaEnabled = process.env.NEXT_PUBLIC_DEDICA_ENABLED !== "false";

export default function QuizPage() {
  const [phase, setPhase] = useState<QuizPhase>("welcome");
  const [userName, setUserName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const handleStart = useCallback((name: string) => {
    const picked = pickQuestions(EVENT_CONFIG.questions, EVENT_CONFIG.questionsPerSession);
    setUserName(name);
    setQuestions(picked);
    setAnswers(new Array(picked.length).fill(null));
    setSessionId(generateTempId());
    setPhase("question");
  }, []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelectedIndex(idx);
      setAnswered(true);

      const isCorrect = idx === questions[currentQ].corretta;
      const newAnswers = [...answers];
      newAnswers[currentQ] = idx;
      setAnswers(newAnswers);
      const newScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(newScore);

      setTimeout(() => {
        if (currentQ + 1 < questions.length) {
          setCurrentQ((q) => q + 1);
          setAnswered(false);
          setSelectedIndex(null);
        } else {
          createSession(userName, newScore, questions.length).then((session) => {
            setSessionId(session.id);
          });
          setPhase("score");
        }
      }, 1800);
    },
    [answered, currentQ, questions, answers, score, userName]
  );

  if (phase === "welcome") return <WelcomeScreen onStart={handleStart} />;
  if (phase === "question" && questions.length > 0)
    return (
      <QuestionCard
        question={questions[currentQ]}
        index={currentQ}
        total={questions.length}
        onAnswer={handleAnswer}
        answered={answered}
        selectedIndex={selectedIndex}
      />
    );
  if (phase === "score")
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        questions={questions}
        answers={answers}
        onContinue={() => setPhase(dedicaEnabled ? "dedica" : "thankyou")}
        dedicaEnabled={dedicaEnabled}
      />
    );
  if (phase === "dedica")
    return (
      <DedicaForm
        defaultName={userName}
        sessionId={sessionId}
        onSubmit={() => setPhase("thankyou")}
      />
    );
  return <ThankYouScreen />;
}
