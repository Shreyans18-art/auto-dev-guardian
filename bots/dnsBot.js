import dns from "dns/promises";
import { createIssue } from "../utils/schema.js";

export default async function dnsBot(url) {
  const issues = [];

  try {
    const hostname = new URL(url).hostname;

    const res = await dns.lookup(hostname);

    if (!res.address) {
      issues.push(createIssue({
        bot: "dns",
        type: "DNS_FAILURE",
        severity: "CRITICAL",
        message: `DNS resolution failed for ${hostname}`,
        fix: "Check domain DNS settings"
      }));
    }

  } catch (err) {
    issues.push(createIssue({
      bot: "dns",
      type: "DNS_ERROR",
      severity: "CRITICAL",
      message: err.message,
      fix: "Verify domain and DNS provider"
    }));
  }

  return issues;
}