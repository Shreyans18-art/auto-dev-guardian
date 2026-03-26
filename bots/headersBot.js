import { createIssue } from "../utils/schema.js";
import fetch from "node-fetch"

export default async function headersBot(url) {
  const issues = [];

  try {
    const res = await fetch(url);

    const headers = res.headers;

    if (!headers.get("content-security-policy")) {
      issues.push(createIssue({
        bot: "security",
        type: "MISSING_CSP",
        severity: "MEDIUM",
        message: "Missing Content Security Policy header",
        fix: "Add CSP header for security"
      }));
    }

    if (!headers.get("x-frame-options")) {
      issues.push(createIssue({
        bot: "security",
        type: "MISSING_X_FRAME",
        severity: "LOW",
        message: "Missing X-Frame-Options header",
        fix: "Prevent clickjacking attacks"
      }));
    }

  } catch (err) {
    issues.push(createIssue({
      bot: "security",
      type: "HEADER_FETCH_FAIL",
      severity: "HIGH",
      message: err.message,
      fix: "Check server accessibility"
    }));
  }

  return issues;
}