import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function resourceBot(url, baseline) {
  const issues = [];
  const html = await (await fetch(url)).text();

  const scripts = (html.match(/<script/g) || []).length;

  const limit = baseline.thresholds.scriptLimit;

  if (scripts > limit) {
    issues.push(createIssue({
      bot: "resource",
      type: "TOO_MANY_SCRIPTS",
      severity: "LOW",
      message: `${scripts} scripts`,
      fix: "Reduce JS usage"
    }));
  }

  return createResult({ bot: "resource", metrics: { scripts }, issues });
}