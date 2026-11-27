"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEY, initialTasks, type Task } from "./tasks";

const SAVE_DELAY_MS = 600; // atraso fixo para a demonstração ser previsível

function describeTask(task: Task): string {
  // BUG 2 (intencional): tarefas arquivadas não têm `archive`, então
  // `task.archive!.archivedAt` lança TypeError ao abrir os detalhes.
  const when = new Date(task.archive!.archivedAt).toLocaleDateString("pt-BR");
  const status = task.status === "archived" ? `Arquivada em ${when}: ${task.archive!.reason}` : "Ativa";
  return `${task.title} — ${status}`;
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch {
      // dados inválidos: mantém os dados de exemplo
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const text = title.trim();
    if (!text) return;

    // BUG 1 (intencional): não há proteção contra cliques repetidos.
    // O botão não é desativado e o campo só é limpo depois do atraso,
    // então dois cliques rápidos criam duas tarefas.
    setSaving(true);
    setTimeout(() => {
      setTasks((current) => [
        { id: crypto.randomUUID(), title: text, status: "active", createdAt: new Date().toISOString() },
        ...current,
      ]);
      setTitle("");
      setSaving(false);
    }, SAVE_DELAY_MS);
  }

  function archive(id: string) {
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, status: "archived" } : t)));
    setDetails(null);
  }

  function openDetails(task: Task) {
    setDetails(describeTask(task));
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    setTasks(initialTasks);
    setDetails(null);
  }

  return (
    <main className="container">
      <h1>Tarefas</h1>

      <form className="form" onSubmit={handleSave}>
        <input
          aria-label="Título da tarefa"
          placeholder="Nova tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">{saving ? "Salvando…" : "Salvar"}</button>
      </form>

      <ul className="list">
        {tasks.map((task) => (
          <li key={task.id} className={task.status === "archived" ? "item archived" : "item"}>
            <span className="title">{task.title}</span>
            <span className="badge">{task.status === "archived" ? "arquivada" : "ativa"}</span>
            <button type="button" onClick={() => openDetails(task)}>Detalhes</button>
            {task.status === "active" && (
              <button type="button" onClick={() => archive(task.id)}>Arquivar</button>
            )}
          </li>
        ))}
      </ul>

      {details && <p className="details" role="status">{details}</p>}

      <button type="button" className="link" onClick={resetData}>
        Restaurar dados de exemplo
      </button>
    </main>
  );
}
