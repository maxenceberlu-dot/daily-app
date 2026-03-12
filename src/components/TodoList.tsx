"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = "daily-app-todos";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTodos(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos([
      ...todos,
      { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const pending = todos.filter((t) => !t.done);
  const completed = todos.filter((t) => t.done);

  if (!mounted) return <TodoSkeleton />;

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">&#10003;</span>
        <h2 className="text-lg font-semibold">Mes tâches</h2>
        <span className="ml-auto text-sm text-[var(--muted)]">
          {pending.length} restante{pending.length !== 1 ? "s" : ""}
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ajouter une tâche..."
          className="flex-1 rounded-lg border border-[var(--card-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          +
        </button>
      </form>

      <ul className="space-y-2">
        {pending.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
        ))}
      </ul>

      {completed.length > 0 && (
        <>
          <div className="my-3 border-t border-[var(--card-border)]" />
          <p className="text-xs text-[var(--muted)] mb-2">
            Terminées ({completed.length})
          </p>
          <ul className="space-y-2">
            {completed.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
          </ul>
        </>
      )}

      {todos.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)] py-4">
          Aucune tâche pour le moment
        </p>
      )}
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 group">
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          todo.done
            ? "bg-[var(--success)] border-[var(--success)] text-white"
            : "border-[var(--muted)] hover:border-[var(--accent)]"
        }`}
      >
        {todo.done && <span className="text-xs">&#10003;</span>}
      </button>
      <span
        className={`flex-1 text-sm ${
          todo.done ? "line-through text-[var(--muted)]" : ""
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-[var(--danger)] text-sm hover:bg-red-50 dark:hover:bg-red-950 rounded px-1.5 py-0.5 transition-all"
      >
        &#10005;
      </button>
    </li>
  );
}

function TodoSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm animate-pulse">
      <div className="h-6 bg-[var(--card-border)] rounded w-32 mb-4" />
      <div className="h-10 bg-[var(--card-border)] rounded mb-4" />
      <div className="space-y-3">
        <div className="h-5 bg-[var(--card-border)] rounded w-3/4" />
        <div className="h-5 bg-[var(--card-border)] rounded w-1/2" />
      </div>
    </div>
  );
}
