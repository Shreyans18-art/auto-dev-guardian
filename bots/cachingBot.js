import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function cachingBot(url) {
  const issues = [];
  const res = await fetch(url);

  if (!res.headers.get("cache-control")) {
    issues.push(createIssue({
      bot: "cache",
      type: "NO_CACHE",
      severity: "LOW",
      message: "Caching not enabled",
      fix: "Add cache headers"
    }));
  }

  return createResult({ bot: "cache", issues });
}