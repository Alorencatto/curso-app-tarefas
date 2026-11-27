export type TaskStatus = "active" | "archived";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  // Metadados do arquivamento. Tarefas arquivadas não os preenchem.
  archive?: { archivedAt: string; reason: string };
};

export const STORAGE_KEY = "curso-tarefas:v1";

export const initialTasks: Task[] = [
  { id: "seed-1", title: "Revisar a issue #1 no GitHub", status: "active", createdAt: "2026-11-20T10:00:00.000Z" },
  { id: "seed-2", title: "Abrir PR com a correção", status: "active", createdAt: "2026-11-21T10:00:00.000Z" },
  { id: "seed-3", title: "Aprovar o preview na Vercel", status: "active", createdAt: "2026-11-22T10:00:00.000Z" },
  { id: "seed-4", title: "Tarefa antiga já arquivada", status: "archived", createdAt: "2026-11-01T10:00:00.000Z" },
];
