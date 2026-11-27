import packageJson from "../package.json";

export default function VersionLabel() {
  const commitSha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
  const commitDate = process.env.NEXT_PUBLIC_GIT_COMMIT_DATE;
  const validCommitSha = commitSha && /^[a-f0-9]{40}$/i.test(commitSha)
    ? commitSha
    : undefined;

  return (
    <footer className="app-version" aria-label="Versão da aplicação">
      Versão {packageJson.version} · {validCommitSha ? (
        <a
          href={`https://github.com/Alorencatto/curso-app-tarefas/commit/${validCommitSha}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Commit ${validCommitSha}`}
        >
          {validCommitSha.slice(0, 7)}
        </a>
      ) : (
        "desenvolvimento local"
      )}
      {validCommitSha && commitDate ? ` · ${new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(commitDate))}` : null}
    </footer>
  );
}
