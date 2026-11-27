import { describe, expect, it, vi } from "vitest";
import { getCommitMetadata } from "../lib/commit-metadata";

const headSha = "0123456789abcdef0123456789abcdef01234567";
const vercelSha = "abcdef0123456789abcdef0123456789abcdef01";
const commitDate = "2026-11-27T20:10:27+00:00";

describe("getCommitMetadata", () => {
  it("uses HEAD and its committer date when no Vercel SHA is provided", () => {
    const showCommit = vi.fn(() => `${headSha}\n${commitDate}\n`);

    expect(getCommitMetadata(undefined, showCommit)).toEqual({ sha: headSha, date: commitDate });
    expect(showCommit).toHaveBeenCalledWith("HEAD");
  });

  it("uses the Vercel SHA and resolves the date from that exact commit", () => {
    const showCommit = vi.fn(() => `${vercelSha}\n${commitDate}\n`);

    expect(getCommitMetadata(vercelSha, showCommit)).toEqual({ sha: vercelSha, date: commitDate });
    expect(showCommit).toHaveBeenCalledWith(vercelSha);
  });

  it("keeps a valid Vercel SHA if its commit is unavailable in the checkout", () => {
    const showCommit = vi.fn(() => {
      throw new Error("commit not present");
    });

    expect(getCommitMetadata(vercelSha, showCommit)).toEqual({ sha: vercelSha });
  });

  it("returns no metadata when the source has no Git or Vercel metadata", () => {
    const showCommit = vi.fn(() => {
      throw new Error("not a git repository");
    });

    expect(getCommitMetadata(undefined, showCommit)).toEqual({});
    expect(showCommit).toHaveBeenCalledWith("HEAD");
  });

  it("ignores an invalid Vercel SHA and falls back to HEAD", () => {
    const showCommit = vi.fn(() => `${headSha}\n${commitDate}\n`);

    expect(getCommitMetadata("invalid", showCommit)).toEqual({ sha: headSha, date: commitDate });
    expect(showCommit).toHaveBeenCalledWith("HEAD");
  });
});
