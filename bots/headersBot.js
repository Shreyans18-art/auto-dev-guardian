import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function headersBot(url) {
  const issues = [];

  const res = await fetch(url);
  const h = res.headers;

  if (!h.get("content-security-policy")) {
    issues.push(createIssue({
      bot: "security",
      type: "CSP_MISSING",
      severity: "MEDIUM",
      message: "Missing CSP",
      fix: "Add CSP header"
    }));
  }

  if (!h.get("x-frame-options")) {
    issues.push(createIssue({
      bot: "security",
      type: "XFRAME_MISSING",
      severity: "LOW",
      message: "Missing X-Frame",
      fix: "Prevent clickjacking"
    }));
  }

  return createResult({ bot: "security", issues });
}