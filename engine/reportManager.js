import fs from "fs";
import path from "path";

const REPORT_PATH = path.resolve("./reports/latest.json");

// 🧠 BOT WEIGHTS
const BOT_WEIGHTS = {
  network: 25,
  latency: 15,
  performance: 15,
  security: 20,
  dns: 10,
  uptime: 30,
  seo: 5,
  accessibility: 5,
  resource: 5,
  cache: 5,
  api: 15,
  ssl: 20,
  console: 2,
  geo: 2,
  auth: 10
};

// 🧠 SEVERITY SCORES
const SEVERITY_SCORE = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5
};

// 📁 Ensure folder exists
function ensureDir() {
  if (!fs.existsSync("./reports")) {
    fs.mkdirSync("./reports", { recursive: true });
  }
}

// 🧠 CALCULATE BOT SCORE
function calculateBotScore(botResult, baseline) {
  let score = 100;

  for (const issue of botResult.issues) {
    let penalty = SEVERITY_SCORE[issue.severity] || 5;

    if (baseline.type === "HEAVY_APP") {
      penalty *= 0.7;
    }

    score -= penalty;
  }

  if (score < 0) score = 0;

  return Math.round(score);
}

// 🧠 BUILD SUMMARY
function buildSummary(totalScore) {
  let status = "HEALTHY";
  let risk = "LOW";

  if (totalScore < 60) {
    status = "CRITICAL";
    risk = "HIGH";
  } else if (totalScore < 85) {
    status = "DEGRADED";
    risk = "MEDIUM";
  }

  return {
    score: totalScore,
    status,
    risk
  };
}

// 🧠 GENERATE INSIGHTS
function generateInsights(results) {
  const issues = results.flatMap(r => r.issues);

  if (issues.length === 0) {
    return "System is performing optimally with no major issues.";
  }

  const top = issues[0];

  return `Primary issue detected: ${top.type}. ${top.message}`;
}

// 💾 SAVE REPORT (FINAL FORMAT)
export function saveReport({ url, baseline, results, decision, trend, ai }) {
  ensureDir();

  let totalScore = decision.score;

  // 🧠 BOT BREAKDOWN
  const botStats = {};

  for (const result of results) {
    const botScore = calculateBotScore(result, baseline);

    botStats[result.bot] = {
      status: result.status,
      score: botScore,
      issues: result.issues.length
    };
  }

  const summary = buildSummary(totalScore);

  const report = {
    url,
    timestamp: new Date().toISOString(),

    summary,

    baseline,

    bots: botStats,

    issues: results.flatMap(r => r.issues),

    insights: generateInsights(results),

    trend,

    ai:{
      ...ai,
      generatedAt: new Date().toISOString()
    }
  };

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(report, null, 2)
  );
}