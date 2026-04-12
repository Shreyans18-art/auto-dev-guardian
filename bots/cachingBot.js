import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function cachingBot(url) {
  const issues = [];

  try {
    const res = await fetch(url, { timeout: 10000 });
    const cacheControl = res.headers.get("cache-control");
    const etag = res.headers.get("etag");
    const lastModified = res.headers.get("last-modified");

    if (!cacheControl) {
      issues.push(createIssue({
        bot: "cache",
        type: "NO_CACHE",
        severity: "LOW",
        message: "Cache-Control header is missing",
        fix: "Add Cache-Control headers: `public, max-age=31536000, immutable` for static assets"
      }));
    } else if (cacheControl.includes("no-store") || cacheControl.includes("no-cache")) {
      // no-cache on HTML is fine, note it as informational pass
    }

    if (!etag && !lastModified && cacheControl) {
      issues.push(createIssue({
        bot: "cache",
        type: "NO_ETAG",
        severity: "LOW",
        message: "ETag and Last-Modified headers missing — conditional requests not supported",
        fix: "Enable ETags in your web server config (Nginx: `etag on;`)"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "cache",
      type: "FETCH_ERROR",
      severity: "LOW",
      message: `Could not check caching: ${err.message}`,
      fix: "Ensure the URL is publicly accessible"
    }));
  }

  return createResult({ bot: "cache", issues });
}