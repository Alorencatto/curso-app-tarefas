import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "App de Tarefas",
  description: "App mínimo para demonstrar a entrega de software da issue à produção.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
