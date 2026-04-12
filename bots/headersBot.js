import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function headersBot(url) {
  const issues = [];

  try {
    const res = await fetch(url, { timeout: 10000 });
    const h = res.headers;

    // CSP check — HIGH severity
    if (!h.get("content-security-policy")) {
      issues.push(createIssue({
        bot: "security",
        type: "CSP_MISSING",
        severity: "MEDIUM",
        message: "Content-Security-Policy header is missing",
        fix: "Add `Content-Security-Policy: default-src 'self'` to HTTP response headers"
      }));
    }

    // X-Frame-Options check
    const frameOptions = h.get("x-frame-options");
    const csp = h.get("content-security-policy") || "";
    // CSP frame-ancestors overrides X-Frame-Options — if CSP has frame-ancestors, XFO is optional
    if (!frameOptions && !csp.includes("frame-ancestors")) {
      issues.push(createIssue({
        bot: "security",
        type: "XFRAME_MISSING",
        severity: "LOW",
        message: "X-Frame-Options header is missing (clickjacking risk)",
        fix: "Add `X-Frame-Options: DENY` or use CSP `frame-ancestors 'none'`"
      }));
    }

    // HSTS check (only for HTTPS)
    if (url.startsWith("https") && !h.get("strict-transport-security")) {
      issues.push(createIssue({
        bot: "security",
        type: "HSTS_MISSING",
        severity: "LOW",
        message: "Strict-Transport-Security (HSTS) header is missing",
        fix: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`"
      }));
    }

    // X-Content-Type-Options check
    if (!h.get("x-content-type-options")) {
      issues.push(createIssue({
        bot: "security",
        type: "XCTO_MISSING",
        severity: "LOW",
        message: "X-Content-Type-Options header is missing (MIME sniffing risk)",
        fix: "Add `X-Content-Type-Options: nosniff` to your response headers"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "security",
      type: "FETCH_ERROR",
      severity: "MEDIUM",
      message: `Could not check headers: ${err.message}`,
      fix: "Ensure the URL is publicly accessible"
    }));
  }

  return createResult({ bot: "security", issues });
}