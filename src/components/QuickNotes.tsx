"use client";

import { useState, useEffect } from "react";

interface Note {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const STORAGE_KEY = "daily-app-notes";
const COLORS = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#f3e8ff"];
const DARK_COLORS = ["#78350f", "#1e3a5f", "#14532d", "#831843", "#581c87"];

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNotes(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, mounted]);

  const addNote = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const colorIdx = notes.length % COLORS.length;
    setNotes([
      {
        id: crypto.randomUUID(),
        text: trimmed,
        color: COLORS[colorIdx],
        createdAt: Date.now(),
      },
      ...notes,
    ]);
    setInput("");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  if (!mounted) return <NotesSkeleton />;

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">&#128221;</span>
        <h2 className="text-lg font-semibold">Notes rapides</h2>
        <span className="ml-auto text-sm text-[var(--muted)]">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addNote();
        }}
        className="flex gap-2 mb-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrire une note..."
          rows={2}
          className="flex-1 rounded-lg border border-[var(--card-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addNote();
            }
          }}
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity self-end"
        >
          +
        </button>
      </form>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-lg p-3 group relative"
            style={{ backgroundColor: note.color + "30" }}
          >
            <p className="text-sm whitespace-pre-wrap pr-6">{note.text}</p>
            <span className="text-xs text-[var(--muted)] mt-1 block">
              {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[var(--danger)] text-sm hover:bg-red-50 dark:hover:bg-red-950 rounded px-1.5 py-0.5 transition-all"
            >
              &#10005;
            </button>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)] py-4">
          Aucune note pour le moment
        </p>
      )}
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm animate-pulse">
      <div className="h-6 bg-[var(--card-border)] rounded w-36 mb-4" />
      <div className="h-16 bg-[var(--card-border)] rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 bg-[var(--card-border)] rounded" />
        <div className="h-12 bg-[var(--card-border)] rounded" />
      </div>
    </div>
  );
}
