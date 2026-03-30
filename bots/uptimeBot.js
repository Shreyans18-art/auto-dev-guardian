import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function uptimeBot(url) {
  const issues = [];
  let status = "UP";

  try {
    const res = await fetch(url);
    if (!res.ok) status = "DOWN";
  } catch {
    status = "DOWN";
  }

  if (status === "DOWN") {
    issues.push(createIssue({
      bot: "uptime",
      type: "DOWN",
      severity: "CRITICAL",
      message: "Website not reachable",
      fix: "Check server uptime"
    }));
  }

  return createResult({ bot: "uptime", metrics: { status }, issues });
}