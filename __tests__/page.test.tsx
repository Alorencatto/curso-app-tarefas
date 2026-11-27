import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import Page from "../app/page";
import { STORAGE_KEY, initialTasks, type Task } from "../app/tasks";

// Obs.: os dois bugs do app (duplicação ao salvar e exceção em "Detalhes")
// são intencionais para o curso e, por isso, não são cobertos aqui.

function items() {
  return screen.getAllByRole("listitem");
}

describe("Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza o título e os dados de exemplo", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: "Tarefas" })).toBeDefined();
    expect(items()).toHaveLength(initialTasks.length);
    expect(screen.getByText("Revisar a issue #1 no GitHub")).toBeDefined();
  });

  it("marca tarefas arquivadas com o selo correto", () => {
    render(<Page />);
    const archived = items().find((li) => within(li).queryByText("Tarefa antiga já arquivada"));
    expect(archived).toBeDefined();
    expect(within(archived!).getByText("arquivada")).toBeDefined();
    // Tarefas arquivadas não oferecem o botão "Arquivar".
    expect(within(archived!).queryByRole("button", { name: "Arquivar" })).toBeNull();
  });

  it("não cria tarefa quando o título está vazio", () => {
    render(<Page />);
    fireEvent.change(screen.getByLabelText("Título da tarefa"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(items()).toHaveLength(initialTasks.length);
  });

  it("cria uma tarefa ativa no topo da lista após o atraso de salvamento", () => {
    render(<Page />);
    const input = screen.getByLabelText("Título da tarefa") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  Escrever testes  " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    // Durante o salvamento o botão indica progresso e a tarefa ainda não existe.
    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDefined();
    expect(items()).toHaveLength(initialTasks.length);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(items()).toHaveLength(initialTasks.length + 1);
    const first = items()[0];
    expect(within(first).getByText("Escrever testes")).toBeDefined();
    expect(within(first).getByText("ativa")).toBeDefined();
    expect(input.value).toBe("");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDefined();
  });

  it("arquiva uma tarefa ativa", () => {
    render(<Page />);
    const target = items().find((li) => within(li).queryByText("Abrir PR com a correção"))!;
    fireEvent.click(within(target).getByRole("button", { name: "Arquivar" }));

    const updated = items().find((li) => within(li).queryByText("Abrir PR com a correção"))!;
    expect(within(updated).getByText("arquivada")).toBeDefined();
    expect(within(updated).queryByRole("button", { name: "Arquivar" })).toBeNull();
  });

  it("persiste as tarefas no localStorage", () => {
    render(<Page />);
    const target = items().find((li) => within(li).queryByText("Aprovar o preview na Vercel"))!;
    fireEvent.click(within(target).getByRole("button", { name: "Arquivar" }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Task[];
    expect(stored.find((t) => t.id === "seed-3")?.status).toBe("archived");
  });

  it("carrega as tarefas salvas no localStorage", () => {
    const saved: Task[] = [
      { id: "x1", title: "Tarefa salva", status: "active", createdAt: "2026-11-25T10:00:00.000Z" },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    render(<Page />);
    expect(items()).toHaveLength(1);
    expect(screen.getByText("Tarefa salva")).toBeDefined();
  });

  it("ignora dados inválidos no localStorage e mantém os de exemplo", () => {
    localStorage.setItem(STORAGE_KEY, "{isso não é json");
    render(<Page />);
    expect(items()).toHaveLength(initialTasks.length);
  });

  it("restaura os dados de exemplo", () => {
    render(<Page />);
    const target = items().find((li) => within(li).queryByText("Revisar a issue #1 no GitHub"))!;
    fireEvent.click(within(target).getByRole("button", { name: "Arquivar" }));

    fireEvent.click(screen.getByRole("button", { name: "Restaurar dados de exemplo" }));

    const restored = items().find((li) => within(li).queryByText("Revisar a issue #1 no GitHub"))!;
    expect(within(restored).getByText("ativa")).toBeDefined();
    expect(items()).toHaveLength(initialTasks.length);
  });
});
