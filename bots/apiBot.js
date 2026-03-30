import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function apiBot(url) {
  const issues = [];

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API failure");
  } catch (err) {
    issues.push(createIssue({
      bot: "api",
      type: "API_FAIL",
      severity: "HIGH",
      message: err.message,
      fix: "Check API endpoint"
    }));
  }

  return createResult({ bot: "api", issues });
}