export type TaskStatus = "active" | "archived";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  // Metadados do arquivamento. Tarefas arquivadas não os preenchem.
  archive?: { archivedAt: string; reason: string };
};

export const STORAGE_KEY = "curso-tarefas:v1";

export const initialTasks: Task[] = [
  { id: "seed-1", title: "Revisar a issue #1 no GitHub", description: "Conferir os critérios de aceite, identificar a causa do problema e registrar os próximos passos.", status: "active", createdAt: "2026-11-20T10:00:00.000Z" },
  { id: "seed-2", title: "Abrir PR com a correção", description: "Enviar a mudança em uma branch própria, explicar como validar e vincular o pull request à issue.", status: "active", createdAt: "2026-11-21T10:00:00.000Z" },
  { id: "seed-3", title: "Aprovar o preview na Vercel", status: "active", createdAt: "2026-11-22T10:00:00.000Z" },
  { id: "seed-4", title: "Tarefa antiga já arquivada", description: "Esta tarefa foi concluída e arquivada como exemplo.", status: "archived", createdAt: "2026-11-01T10:00:00.000Z" },
];
