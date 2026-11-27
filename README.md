# App de Tarefas — curso de entrega de software

App mínimo (Next.js App Router + TypeScript) para demonstrar o caminho da issue até a correção em produção com Cursor, OpenBot, GitHub Issues, Vercel e Sentry. Lista, cria e arquiva tarefas em uma única página, com dados de exemplo e `localStorage` (sem login nem banco).

> **Os dois bugs são intencionais.** Não os corrija fora das aulas.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm start        # serve o build
```

## Configurar o Sentry (opcional)

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SENTRY_DSN` com a DSN do projeto. Sem DSN, o SDK fica desativado e o app roda normalmente. Reinicie o `npm run dev` após alterar.

Na Vercel, defina as mesmas variáveis em *Project Settings → Environment Variables*. `SENTRY_ORG`, `SENTRY_PROJECT` e `SENTRY_AUTH_TOKEN` são opcionais e servem para enviar source maps no build (stack traces legíveis).

## Reproduzir os bugs

**Bug 1 — duplicação ao salvar**
1. Digite um título no campo "Nova tarefa".
2. Clique duas vezes rapidamente em **Salvar** (o salvamento leva 600 ms).
3. Resultado: duas tarefas com o mesmo título. Esperado: uma.

**Bug 2 — exceção nos detalhes de tarefa arquivada**
1. Abra a página (já existe a tarefa "Tarefa antiga já arquivada").
2. Clique em **Detalhes** nela (ou arquive qualquer tarefa e abra os detalhes).
3. Resultado: `TypeError` não tratado no console e nenhum detalhe exibido. Com DSN configurada, o erro aparece como nova issue no Sentry. Em `npm run dev`, o overlay de erros do Next também aparece.

Para voltar ao estado inicial, use **Restaurar dados de exemplo** na página.

## Simular erro de teste (Sentry)

A tela principal tem o botão **Gerar erro de teste**. Ele pede confirmação, explica que o erro é proposital e só envia algo ao Sentry depois de **Gerar erro**; **Cancelar** fecha a confirmação sem capturar nada. As tarefas existentes não são alteradas.

O evento chega ao projeto `alorencatto/app-de-tarefas-curso` com o ambiente, a versão do deploy (quando disponível) e um fingerprint fixo (`erro-de-teste-app-tarefas`), que agrupa os erros de teste em uma única issue do Sentry. O ID do evento aparece na tela para rastrear a issue criada na triagem.

## Demonstrações do curso

### 1. Relato humano → produção

1. Uma pessoa relata o problema (ex.: "salvar duas vezes cria duplicata").
2. O **OpenBot** transforma o relato em uma **GitHub Issue**.
3. O **Cursor** lê a issue, implementa a correção e abre um **PR**.
4. A **Vercel** gera o **preview** do PR.
5. Revisão e **aprovação** do PR.
6. Merge na `main` → deploy em **produção**.

### 2. Exceção no app → produção

1. O erro do Bug 2 ocorre no app e é capturado pelo Sentry.
2. O Sentry cria uma **nova issue** (alerta).
3. O **OpenBot** recebe o alerta e abre a GitHub Issue.
4. Segue a mesma esteira: Cursor → PR → preview na Vercel → aprovação → produção.

## Fora do escopo desta etapa

Webhook do Sentry, rotinas do OpenBot e a publicação na Vercel ficam para os exercícios.
