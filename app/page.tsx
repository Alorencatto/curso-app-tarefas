"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
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
  const [confirmingTestError, setConfirmingTestError] = useState(false);
  const [testErrorStatus, setTestErrorStatus] = useState<string | null>(null);

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

    // Ignora cliques repetidos enquanto um salvamento está em andamento.
    if (saving) return;

    setSaving(true);
    setTimeout(() => {
      try {
        setTasks((current) => [
          { id: crypto.randomUUID(), title: text, status: "active", createdAt: new Date().toISOString() },
          ...current,
        ]);
        setTitle("");
      } finally {
        // Libera o botão mesmo se o salvamento falhar, permitindo nova tentativa.
        setSaving(false);
      }
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

  function generateTestError() {
    setConfirmingTestError(false);

    // O fingerprint fixo agrupa todos os erros de teste na mesma issue do Sentry,
    // evitando uma issue nova a cada clique.
    const eventId = Sentry.captureException(
      new Error("Erro de teste proposital para validar a captura no Sentry"),
      {
        tags: { origem: "botao-erro-teste", ambiente: "curso-app-tarefas" },
        fingerprint: ["erro-de-teste-app-tarefas"],
      },
    );

    setTestErrorStatus(
      eventId
        ? `Erro de teste enviado ao Sentry. ID do evento: ${eventId}`
        : "Erro de teste gerado, mas o Sentry está desativado (configure NEXT_PUBLIC_SENTRY_DSN).",
    );
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
        <button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
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

      <section className="test-error">
        <button
          type="button"
          onClick={() => {
            setTestErrorStatus(null);
            setConfirmingTestError(true);
          }}
        >
          Gerar erro de teste
        </button>

        {confirmingTestError && (
          <div role="alertdialog" aria-labelledby="test-error-titulo" aria-describedby="test-error-descricao">
            <p id="test-error-titulo"><strong>Gerar um erro proposital?</strong></p>
            <p id="test-error-descricao">
              Isso envia um erro proposital para o Sentry, para testar a captura e a triagem. Suas tarefas não são alteradas.
            </p>
            <button type="button" onClick={generateTestError}>Gerar erro</button>
            <button type="button" onClick={() => setConfirmingTestError(false)}>Cancelar</button>
          </div>
        )}

        {testErrorStatus && <p role="status">{testErrorStatus}</p>}
      </section>

      <button type="button" className="link" onClick={resetData}>
        Restaurar dados de exemplo
      </button>
    </main>
  );
}
