import { createIssue, createResult } from "../utils/schema.js";

export default async function sslBot(url) {
  const issues = [];

  if (!url.startsWith("https")) {
    issues.push(createIssue({
      bot: "ssl",
      type: "NO_SSL",
      severity: "HIGH",
      message: "HTTPS not used",
      fix: "Enable SSL"
    }));
  }

  return createResult({ bot: "ssl", issues });
}