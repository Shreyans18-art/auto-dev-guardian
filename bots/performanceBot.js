import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function performanceBot(url, baseline) {
  const issues = [];
  let size = 0;

  try {
    const res = await fetch(url, { timeout: 12000 });
    const text = await res.text();
    size = text.length;

    // Dynamic size limit based on site type
    let limit = 300000;
    if (baseline?.type === "HEAVY_APP") limit = 800000;
    else if (baseline?.type === "LIGHT_SITE") limit = 100000;

    if (size > limit) {
      issues.push(createIssue({
        bot: "performance",
        type: "LARGE_PAGE",
        severity: "MEDIUM",
        message: `Page size ${Math.round(size / 1024)}KB exceeds ${Math.round(limit / 1024)}KB limit`,
        fix: "Enable gzip/brotli compression, minimize HTML, remove unused CSS/JS"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "performance",
      type: "FETCH_ERROR",
      severity: "HIGH",
      message: `Could not load page: ${err.message}`,
      fix: "Check server availability and response"
    }));
  }

  return createResult({ bot: "performance", metrics: { size }, issues });
}