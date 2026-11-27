import { describe, expect, it } from "vitest";
import { STORAGE_KEY, initialTasks } from "../app/tasks";

describe("initialTasks", () => {
  it("contém dados de exemplo", () => {
    expect(initialTasks.length).toBeGreaterThan(0);
  });

  it("usa ids únicos", () => {
    const ids = initialTasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tem título não vazio e status válido em todas as tarefas", () => {
    for (const task of initialTasks) {
      expect(task.title.trim()).not.toBe("");
      expect(["active", "archived"]).toContain(task.status);
    }
  });

  it("usa datas de criação em formato ISO válido", () => {
    for (const task of initialTasks) {
      const date = new Date(task.createdAt);
      expect(Number.isNaN(date.getTime())).toBe(false);
      expect(date.toISOString()).toBe(task.createdAt);
    }
  });

  it("inclui tarefas ativas e ao menos uma arquivada", () => {
    expect(initialTasks.some((t) => t.status === "active")).toBe(true);
    expect(initialTasks.some((t) => t.status === "archived")).toBe(true);
  });
});

describe("STORAGE_KEY", () => {
  it("é uma chave estável e versionada", () => {
    expect(STORAGE_KEY).toBe("curso-tarefas:v1");
  });
});
