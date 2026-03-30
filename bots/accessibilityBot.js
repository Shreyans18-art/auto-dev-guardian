import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function accessibilityBot(url) {
  const issues = [];
  const html = await (await fetch(url)).text();

  if (!html.includes("alt=")) {
    issues.push(createIssue({
      bot: "accessibility",
      type: "NO_ALT",
      severity: "LOW",
      message: "Missing alt attributes",
      fix: "Add alt to images"
    }));
  }

  return createResult({ bot: "accessibility", issues });
}