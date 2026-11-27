import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import { withSentryConfig } from "@sentry/nextjs/config";

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
const commitDate = commitSha && /^[a-f0-9]{40}$/i.test(commitSha)
  ? execFileSync("git", ["show", "-s", "--format=%cI", commitSha], { encoding: "utf8" }).trim()
  : undefined;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: commitSha,
    NEXT_PUBLIC_GIT_COMMIT_DATE: commitDate,
  },
};

// O upload de source maps só acontece se SENTRY_AUTH_TOKEN existir no build.
// Sem ele (ou sem DSN), o build e o app funcionam normalmente.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  widenClientFileUpload: true,
});
