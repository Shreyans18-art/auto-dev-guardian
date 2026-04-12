import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function latencyBot(url, baseline) {
  const issues = [];
  let latency = 0;

  try {
    const start = Date.now();
    await fetch(url, { timeout: 10000 });
    latency = Date.now() - start;

    const limit = baseline?.thresholds?.responseTime ?? 3000;

    if (latency > limit) {
      issues.push(createIssue({
        bot: "latency",
        type: "HIGH_LATENCY",
        severity: latency > limit * 2 ? "HIGH" : "MEDIUM",
        message: `Response time ${latency}ms exceeds ${limit}ms threshold`,
        fix: "Enable CDN, optimize server-side rendering, add response caching"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "latency",
      type: "TIMEOUT",
      severity: "HIGH",
      message: `Request timed out: ${err.message}`,
      fix: "Check server performance and network configuration"
    }));
  }

  return createResult({ bot: "latency", metrics: { latency }, issues });
}