import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import Page from "../app/page";
import VersionLabel from "../app/version";
import { STORAGE_KEY, initialTasks, type Task } from "../app/tasks";
import packageJson from "../package.json";

const captureException = vi.hoisted(() =>
  vi.fn<(error: unknown, context?: unknown) => string | undefined>(() => "evento-teste-123"),
);

vi.mock("@sentry/nextjs", () => ({ captureException }));

// Obs.: a duplicação ao salvar (clique duplo) tem teste de regressão abaixo.

function items() {
  return screen.getAllByRole("listitem");
}

describe("Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    captureException.mockClear();
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

  it("mostra a descrição completa da tarefa selecionada e atualiza ao selecionar outra", () => {
    render(<Page />);

    const first = items().find((li) => within(li).queryByText("Revisar a issue #1 no GitHub"))!;
    fireEvent.click(within(first).getByRole("button", { name: "Detalhes" }));
    expect(screen.getByRole("region", { name: "Revisar a issue #1 no GitHub" }).textContent)
      .toContain("Conferir os critérios de aceite, identificar a causa do problema e registrar os próximos passos.");

    const second = items().find((li) => within(li).queryByText("Abrir PR com a correção"))!;
    fireEvent.click(within(second).getByRole("button", { name: "Detalhes" }));
    const details = screen.getByRole("region", { name: "Abrir PR com a correção" });
    expect(details.textContent).toContain("Enviar a mudança em uma branch própria");
    expect(screen.queryByRole("region", { name: "Revisar a issue #1 no GitHub" })).toBeNull();
  });

  it("informa quando a tarefa não tem descrição e permite fechar os detalhes", () => {
    render(<Page />);

    const task = items().find((li) => within(li).queryByText("Aprovar o preview na Vercel"))!;
    fireEvent.click(within(task).getByRole("button", { name: "Detalhes" }));

    expect(screen.getByText("Esta tarefa não tem descrição.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Fechar detalhes" }));
    expect(screen.queryByText("Esta tarefa não tem descrição.")).toBeNull();
    expect(items()).toHaveLength(initialTasks.length);
  });

  it("abre os detalhes de tarefas arquivadas sem falhar", () => {
    render(<Page />);

    const archived = items().find((li) => within(li).queryByText("Tarefa antiga já arquivada"))!;
    fireEvent.click(within(archived).getByRole("button", { name: "Detalhes" }));

    expect(screen.getByText("Esta tarefa foi concluída e arquivada como exemplo.")).toBeDefined();
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
    const description = screen.getByLabelText("Descrição da tarefa (opcional)") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "  Escrever testes  " } });
    fireEvent.change(description, { target: { value: "  Cobrir a abertura dos detalhes.  " } });
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
    expect(description.value).toBe("");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDefined();

    fireEvent.click(within(items()[0]).getByRole("button", { name: "Detalhes" }));
    expect(screen.getByText("Cobrir a abertura dos detalhes.")).toBeDefined();
  });

  it("cria uma única tarefa com dois cliques rápidos em Salvar", () => {
    render(<Page />);
    const input = screen.getByLabelText("Título da tarefa") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Tarefa única" } });

    const button = screen.getByRole("button", { name: "Salvar" }) as HTMLButtonElement;
    fireEvent.click(button);
    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getAllByText("Tarefa única")).toHaveLength(1);
    expect(items()).toHaveLength(initialTasks.length + 1);
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

  it("explica o erro proposital e cancela sem enviar evento ao Sentry", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: "Gerar erro de teste" }));

    expect(screen.getByText(/erro proposital para o Sentry/i)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(captureException).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("envia um único erro de teste ao Sentry e preserva as tarefas", () => {
    render(<Page />);
    const before = items().length;

    fireEvent.click(screen.getByRole("button", { name: "Gerar erro de teste" }));
    fireEvent.click(screen.getByRole("button", { name: "Gerar erro" }));

    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0];
    expect((error as Error).message).toMatch(/erro de teste/i);
    expect(context).toMatchObject({
      tags: { origem: "botao-erro-teste" },
      fingerprint: ["erro-de-teste-app-tarefas"],
    });

    // A confirmação fecha e o usuário vê o ID do evento para rastrear a issue.
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("evento-teste-123");

    // Nenhuma tarefa é criada, removida ou alterada.
    expect(items()).toHaveLength(before);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Task[];
    expect(stored).toEqual(initialTasks);
  });
});

describe("VersionLabel", () => {
  it("exibe a versão definida no package.json", () => {
    render(<VersionLabel />);

    expect(screen.getByRole("contentinfo", { name: "Versão da aplicação" }).textContent)
      .toBe(`Versão ${packageJson.version}`);
  });
});
