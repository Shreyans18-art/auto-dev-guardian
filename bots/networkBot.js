import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function networkBot(url, baseline) {

  const issues = [];
  let responseTime = 0;

  try {
    const start = Date.now();
    const res = await fetch(url);
    responseTime = Date.now() - start;

    // 🔥 dynamic threshold
    const threshold = baseline.thresholds.responseTime;

    if (responseTime > threshold) {
      issues.push(createIssue({
        bot: "network",
        type: "SLOW_RESPONSE",
        severity: "MEDIUM",
        message: `${responseTime}ms > ${threshold}`,
        fix: "Optimize backend/CDN"
      }));
    }

    if (!res.ok) {
      issues.push(createIssue({
        bot: "network",
        type: "HTTP_ERROR",
        severity: "HIGH",
        message: `Status ${res.status}`,
        fix: "Fix backend"
      }));
    }

  } catch (err) {
    issues.push(createIssue({
      bot: "network",
      type: "FAIL",
      severity: "CRITICAL",
      message: err.message,
      fix: "Check server"
    }));
  }

  return createResult({
    bot: "network",
    metrics: { responseTime },
    issues
  });
}