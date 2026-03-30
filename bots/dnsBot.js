import dns from "dns/promises";
import { createIssue, createResult } from "../utils/schema.js";

export default async function dnsBot(url, baseline) {
  const issues = [];
  let ip = null;

  try {
    const host = new URL(url).hostname;
    const res = await dns.lookup(host);
    ip = res.address;
  } catch (err) {
    issues.push(createIssue({
      bot: "dns",
      type: "DNS_FAIL",
      severity: "CRITICAL",
      message: err.message,
      fix: "Check DNS configuration"
    }));
  }

  return createResult({ bot: "dns", metrics: { ip }, issues });
}