import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Garante DOM limpo e localStorage zerado entre os testes.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
