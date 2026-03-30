import fetch from "node-fetch";

export default async function baselineAnalyzer(url) {

  let html = "";
  let pageSize = 0;
  let scriptCount = 0;
  let imageCount = 0;

  try {
    const res = await fetch(url);
    html = await res.text();
    pageSize = html.length;

    // count scripts
    scriptCount = (html.match(/<script/gi) || []).length;

    // count images
    imageCount = (html.match(/<img/gi) || []).length;

  } catch (err) {
    return {
      type: "UNKNOWN",
      complexity: "UNKNOWN",
      flags: ["FETCH_FAILED"],
      metrics: {},
      thresholds: {}
    };
  }

  // 🧠 TYPE CLASSIFICATION
  let type = "MEDIUM_SITE";

  if (scriptCount < 5 && pageSize < 100000) {
    type = "LIGHT_SITE";
  } else if (scriptCount > 20 || pageSize > 500000) {
    type = "HEAVY_APP";
  }

  // 🧠 COMPLEXITY
  let complexity = "MEDIUM";

  if (scriptCount < 5) complexity = "LOW";
  else if (scriptCount > 20) complexity = "HIGH";

  // 🧠 FLAGS (HYBRID POWER)
  const flags = [];

  if (scriptCount > 15) flags.push("SCRIPT_HEAVY");
  if (imageCount > 20) flags.push("MEDIA_HEAVY");
  if (pageSize > 500000) flags.push("LARGE_PAGE");

  // detect possible SPA
  if (html.includes("id=\"root\"") || html.includes("id=\"app\"")) {
    flags.push("SPA_DETECTED");
  }

  // 🧠 DYNAMIC THRESHOLDS
  let responseTime = 2000;

  if (type === "LIGHT_SITE") responseTime = 1500;
  if (type === "MEDIUM_SITE") responseTime = 3000;
  if (type === "HEAVY_APP") responseTime = 5000;

  return {
    type,
    complexity,
    flags,
    metrics: {
      pageSize,
      scriptCount,
      imageCount
    },
    thresholds: {
      responseTime,
      scriptLimit: type === "HEAVY_APP" ? 40 : 20
    }
  };
}