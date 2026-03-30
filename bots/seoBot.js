import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function seoBot(url) {
  const issues = [];
  const html = await (await fetch(url)).text();

  if (!html.includes("<title>")) {
    issues.push(createIssue({
      bot: "seo",
      type: "NO_TITLE",
      severity: "LOW",
      message: "Missing title tag",
      fix: "Add <title>"
    }));
  }

  return createResult({ bot: "seo", issues });
}