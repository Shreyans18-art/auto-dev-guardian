import { createIssue } from "../utils/schema.js";

export default async function networkBot(url) {
  const issues = [];

  try {
    const start = Date.now();

    const res = await fetch(url);
    const time = Date.now() - start;

    // ❌ HTTP errors
    if (!res.ok) {
      issues.push(createIssue({
        bot: "network",
        type: "HTTP_ERROR",
        severity: "HIGH",
        message: `Status ${res.status} on ${url}`,
        fix: "Check server routes or backend API"
      }));
    }

    // ⚠️ Slow response
    if (time > 3000) {
      issues.push(createIssue({
        bot: "network",
        type: "SLOW_RESPONSE",
        severity: "MEDIUM",
        message: `Response time ${time}ms`,
        fix: "Optimize backend or use caching/CDN"
      }));
    }

  } catch (err) {
    issues.push(createIssue({
      bot: "network",
      type: "REQUEST_FAILED",
      severity: "CRITICAL",
      message: err.message,
      fix: "Check server availability or DNS"
    }));
  }

  return issues;
}