import { execFileSync } from "node:child_process";

const fullShaPattern = /^[a-f0-9]{40}$/i;

export type CommitMetadata = {
  sha?: string;
  date?: string;
};

export function getCommitMetadata(
  vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA,
  showCommit = (ref: string) => execFileSync(
    "git",
    ["show", "-s", "--format=%H%n%cI", ref],
    { encoding: "utf8" },
  ),
): CommitMetadata {
  const requestedSha = vercelCommitSha && fullShaPattern.test(vercelCommitSha)
    ? vercelCommitSha
    : undefined;

  try {
    const [sha, date] = showCommit(requestedSha ?? "HEAD").trim().split("\n");
    if (sha && fullShaPattern.test(sha)) {
      return { sha, ...(date ? { date } : {}) };
    }
  } catch {
    // A source archive may have neither Git metadata nor a Vercel commit SHA.
  }

  return requestedSha ? { sha: requestedSha } : {};
}
