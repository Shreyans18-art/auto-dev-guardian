import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function performanceBot(url, baseline) {
  const issues = [];
  let size = 0;

  const res = await fetch(url);
  const text = await res.text();
  size = text.length;

  let limit = 300000;
  if (baseline.type === "HEAVY_APP") limit = 800000;

  if (size > limit) {
    issues.push(createIssue({
      bot: "performance",
      type: "LARGE_PAGE",
      severity: "MEDIUM",
      message: `${size} bytes`,
      fix: "Optimize bundle size"
    }));
  }

  return createResult({ bot: "performance", metrics: { size }, issues });
}