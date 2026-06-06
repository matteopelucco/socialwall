"use client";

// app/quiz/page.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { EVENT_CONFIG, type Question } from "@/config/event";
import { pickQuestions, getScoreMessage, generateTempId } from "@/lib/utils";
import {
  createSession,
  createDedica,
  upsertTypingStatus,
  deleteTypingStatus,
} from "@/lib/supabase";
import type { QuizPhase } from "@/lib/types";

// ── Sub-components ────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen memphis-bg p-6 text-center">
      <div className="w-full max-w-sm animate-slide-up">
        <div
          className="font-display text-secondary text-lg mb-2 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {EVENT_CONFIG.eventDate}
        </div>
        <h1
          className="font-display text-5xl text-text-main mb-2 leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {EVENT_CONFIG.quizTitle}
        </h1>
        <p className="text-text-muted text-sm mb-8">{EVENT_CONFIG.quizSubtitle}</p>

        <div className="card-memphis p-6 mb-6">
          <label className="block text-left text-xs uppercase tracking-widest text-text-muted mb-2">
            Il tuo nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && onStart(name.trim())}
            placeholder="Come ti chiami?"
            className="w-full bg-surface2 text-text-main border-2 border-surface2 focus:border-primary rounded px-4 py-3 text-base outline-none transition-colors"
            autoFocus
          />
        </div>

        <button
          className="btn-memphis w-full text-xl py-4"
          onClick={() => name.trim() && onStart(name.trim())}
          disabled={!name.trim()}
        >
          Inizia il Quiz →
        </button>

        <p className="text-text-muted text-xs mt-4">
          {EVENT_CONFIG.questionsPerSession} domande · ~2 minuti
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

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
  const optionLabels = ["A", "B", "C", "D"];

  const getOptionClass = (idx: number) => {
    if (!answered) return "";
    if (idx === question.corretta) return "option-correct";
    if (idx === selectedIndex && idx !== question.corretta) return "option-wrong";
    return "option-neutral";
  };

  return (
    <div className="flex flex-col min-h-screen memphis-bg p-4">
      {/* Progress */}
      <div className="w-full max-w-sm mx-auto pt-4 pb-2">
        <div className="flex justify-between items-center mb-2">
          <span
            className="font-display text-primary text-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {index + 1}/{total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < index
                    ? "bg-primary w-4"
                    : i === index
                    ? "bg-secondary w-4"
                    : "bg-surface2 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto gap-4 animate-slide-up">
        <div className="card-memphis p-5">
          <p className="text-text-main text-lg font-semibold leading-snug">
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
              className={`card-memphis p-4 text-left flex items-center gap-3 cursor-pointer transition-all duration-200 ${getOptionClass(idx)}`}
            >
              <span
                className="font-display text-primary text-xl w-7 shrink-0"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {optionLabels[idx]}
              </span>
              <span className="text-text-main text-sm font-medium">{opt}</span>
            </button>
          ))}
        </div>

        {/* Curiosità */}
        {answered && question.curiosita && (
          <div
            className="card-memphis p-4 animate-fade-in"
            style={{ borderColor: "var(--color-accent)", boxShadow: "4px 4px 0 var(--color-accent)" }}
          >
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Lo sapevi?</p>
            <p className="text-sm text-text-main">{question.curiosita}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

function ScoreScreen({
  score,
  total,
  questions,
  answers,
  onContinue,
}: {
  score: number;
  total: number;
  questions: Question[];
  answers: (number | null)[];
  onContinue: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const message = getScoreMessage(score, EVENT_CONFIG.scoreMessages);
  const pct = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center min-h-screen memphis-bg p-6">
      <div className="w-full max-w-sm mt-8 animate-pop">
        {/* Big score */}
        <div className="card-memphis p-8 text-center mb-4">
          <div
            className="font-display text-8xl text-secondary leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {score}/{total}
          </div>
          <div
            className="font-display text-2xl text-primary mt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {pct}%
          </div>
          <p className="text-text-main mt-3 font-semibold">{message}</p>
        </div>

        {/* Details toggle */}
        <button
          className="btn-memphis-secondary btn-memphis w-full mb-4 text-base"
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
                  className={`card-memphis p-3 ${correct ? "option-correct" : "option-wrong"}`}
                >
                  <p className="text-xs text-text-muted mb-1">{i + 1}. {q.testo}</p>
                  <p className="text-sm font-semibold text-text-main">
                    {correct ? "✓" : "✗"} {q.opzioni[q.corretta]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button className="btn-memphis w-full text-xl py-4" onClick={onContinue}>
          Lascia un messaggio 💌
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

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

  // Typing status updates
  useEffect(() => {
    if (testo.length > 0) {
      upsertTypingStatus(sessionId, defaultName);
      if (typingTimer.current) clearInterval(typingTimer.current);
      typingTimer.current = setInterval(() => {
        upsertTypingStatus(sessionId, defaultName);
      }, 5000);
    }
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
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
    <div className="flex flex-col items-center justify-center min-h-screen memphis-bg p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <h2
          className="font-display text-4xl text-text-main mb-1 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {EVENT_CONFIG.wallTitle}
        </h2>
        <p className="text-text-muted text-sm text-center mb-6">
          Il tuo messaggio apparirà sul muro in tempo reale ✨
        </p>

        <div className="card-memphis p-5 mb-4">
          <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
            Il tuo messaggio
          </label>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value.slice(0, 300))}
            placeholder={EVENT_CONFIG.dedicaPlaceholder}
            rows={5}
            className="w-full bg-surface2 text-text-main border-2 border-surface2 focus:border-primary rounded px-3 py-2 text-sm outline-none resize-none transition-colors"
          />
          <div className={`text-right text-xs mt-1 ${remaining < 30 ? "text-primary" : "text-text-muted"}`}>
            {remaining} caratteri rimanenti
          </div>
        </div>

        <div className="card-memphis p-5 mb-6">
          <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
            Firma
          </label>
          <input
            type="text"
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
            className="w-full bg-surface2 text-text-main border-2 border-surface2 focus:border-primary rounded px-3 py-2 text-sm outline-none transition-colors"
          />
        </div>

        <button
          className="btn-memphis w-full text-xl py-4"
          onClick={handleSubmit}
          disabled={!testo.trim() || loading}
        >
          {loading ? "Invio in corso..." : "Invia Messaggio 💌"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

function ThankYouScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen memphis-bg p-6 text-center">
      <div className="w-full max-w-sm animate-pop">
        <div
          className="font-display text-9xl text-secondary mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          🎉
        </div>
        <h2
          className="font-display text-5xl text-text-main mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Grazie!
        </h2>
        <p className="text-text-muted mb-6">
          Il tuo messaggio è sul muro per {EVENT_CONFIG.honoree}.
        </p>
        <div className="card-memphis p-4">
          <p className="text-sm text-text-main">
            Cerca il tuo nome sul grande schermo! 📺
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Quiz Page ────────────────────────────────────────────────

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

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);
    setAnswered(true);

    const isCorrect = idx === questions[currentQ].corretta;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    if (isCorrect) setScore((s) => s + 1);

    // Auto-advance
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((q) => q + 1);
        setAnswered(false);
        setSelectedIndex(null);
      } else {
        // Quiz complete — save session
        const finalScore = isCorrect ? score + 1 : score;
        createSession(userName, finalScore, questions.length).then((session) => {
          setSessionId(session.id);
        });
        setPhase("score");
      }
    }, 1800);
  }, [answered, currentQ, questions, answers, score, userName]);

  if (phase === "welcome") return <WelcomeScreen onStart={handleStart} />;

  if (phase === "question" && questions.length > 0) {
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
  }

  if (phase === "score") {
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        questions={questions}
        answers={answers}
        onContinue={() => setPhase("dedica")}
      />
    );
  }

  if (phase === "dedica") {
    return (
      <DedicaForm
        defaultName={userName}
        sessionId={sessionId}
        onSubmit={() => setPhase("thankyou")}
      />
    );
  }

  return <ThankYouScreen />;
}
