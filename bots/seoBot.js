import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function seoBot(url) {
  const issues = [];

  try {
    const res = await fetch(url, { timeout: 10000 });
    const html = await res.text();

    if (!html.toLowerCase().includes("<title")) {
      issues.push(createIssue({
        bot: "seo",
        type: "NO_TITLE",
        severity: "MEDIUM",
        message: "Missing <title> tag",
        fix: "Add a <title>Page Name</title> tag inside the <head>"
      }));
    }

    if (!html.toLowerCase().includes('meta name="description"') &&
        !html.toLowerCase().includes("meta name='description'")) {
      issues.push(createIssue({
        bot: "seo",
        type: "NO_META_DESC",
        severity: "LOW",
        message: "Missing meta description",
        fix: "Add <meta name=\"description\" content=\"...\"> to your <head>"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "seo",
      type: "FETCH_ERROR",
      severity: "MEDIUM",
      message: `Could not fetch page: ${err.message}`,
      fix: "Ensure the URL is publicly accessible"
    }));
  }

  return createResult({ bot: "seo", issues });
}