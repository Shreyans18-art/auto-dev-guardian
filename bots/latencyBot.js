import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function latencyBot(url, baseline) {
  const issues = [];
  const start = Date.now();

  await fetch(url);
  const latency = Date.now() - start;

  const limit = baseline.thresholds.responseTime;

  if (latency > limit) {
    issues.push(createIssue({
      bot: "latency",
      type: "HIGH_LATENCY",
      severity: "MEDIUM",
      message: `${latency}ms`,
      fix: "Improve backend speed"
    }));
  }

  return createResult({ bot: "latency", metrics: { latency }, issues });
}