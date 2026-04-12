import fetch from "node-fetch";
import { createIssue, createResult } from "../utils/schema.js";

export default async function resourceBot(url, baseline) {
  const issues = [];
  let scripts = 0;
  let images = 0;

  try {
    const res = await fetch(url, { timeout: 12000 });
    const html = await res.text();

    scripts = (html.match(/<script/gi) || []).length;
    images  = (html.match(/<img/gi) || []).length;

    const limit = baseline?.thresholds?.scriptLimit ?? 20;

    if (scripts > limit) {
      issues.push(createIssue({
        bot: "resource",
        type: "TOO_MANY_SCRIPTS",
        severity: "LOW",
        message: `${scripts} <script> tags detected (limit: ${limit})`,
        fix: "Bundle scripts with Webpack/Vite, use code splitting, defer non-critical JS"
      }));
    }

    // Flag excessive images
    if (images > 50) {
      issues.push(createIssue({
        bot: "resource",
        type: "MANY_IMAGES",
        severity: "LOW",
        message: `${images} images on the page — consider lazy loading`,
        fix: "Add loading=\"lazy\" to below-fold images, use a CDN for image optimization"
      }));
    }
  } catch (err) {
    issues.push(createIssue({
      bot: "resource",
      type: "FETCH_ERROR",
      severity: "LOW",
      message: `Could not analyse resources: ${err.message}`,
      fix: "Ensure the URL is publicly accessible"
    }));
  }

  return createResult({ bot: "resource", metrics: { scripts, images }, issues });
}