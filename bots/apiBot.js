import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function apiBot(url) {
  const issues = [];

  try {
    const res = await fetch(url, { timeout: 10000 });

    if (!res.ok) {
      issues.push(createIssue({
        bot: "api",
        type: "HTTP_ERROR",
        severity: res.status >= 500 ? "HIGH" : "MEDIUM",
        message: `HTTP ${res.status} ${res.statusText}`,
        fix: "Fix the server-side error returning this status code"
      }));
    }

    // Check for CORS headers (only relevant for non-html content types)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json") && !res.headers.get("access-control-allow-origin")) {
      issues.push(createIssue({
        bot: "api",
        type: "NO_CORS",
        severity: "MEDIUM",
        message: "API endpoint missing CORS headers",
        fix: "Add `Access-Control-Allow-Origin` header to allow cross-origin requests"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "api",
      type: "API_FAIL",
      severity: "HIGH",
      message: err.message,
      fix: "Check server connectivity and that the endpoint is accessible"
    }));
  }

  return createResult({ bot: "api", issues });
}