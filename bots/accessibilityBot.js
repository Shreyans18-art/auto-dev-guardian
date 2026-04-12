import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function accessibilityBot(url) {
  const issues = [];

  try {
    const res = await fetch(url, { timeout: 10000 });
    const html = await res.text();

    // Check for images without alt attribute
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const missingAlt = imgTags.filter(tag => !tag.includes("alt="));

    if (missingAlt.length > 0) {
      issues.push(createIssue({
        bot: "accessibility",
        type: "NO_ALT",
        severity: "LOW",
        message: `${missingAlt.length} image(s) missing alt attributes`,
        fix: "Add descriptive alt text to all <img> elements — use alt=\"\" for decorative ones"
      }));
    }

    // Check for basic lang attribute on <html>
    if (!html.toLowerCase().includes("lang=")) {
      issues.push(createIssue({
        bot: "accessibility",
        type: "NO_LANG",
        severity: "LOW",
        message: "Missing lang attribute on <html> element",
        fix: "Add lang=\"en\" (or appropriate language code) to your <html> tag"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "accessibility",
      type: "FETCH_ERROR",
      severity: "LOW",
      message: `Could not fetch page: ${err.message}`,
      fix: "Ensure the URL is publicly accessible"
    }));
  }

  return createResult({ bot: "accessibility", issues });
}