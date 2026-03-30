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

const SEVERITY_SCORE = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 5
};

export default function decisionEngine(results, baseline) {

  let score = 100;
  let reasons = [];

  for (const result of results) {

    const weight = BOT_WEIGHTS[result.bot] || 5;

    for (const issue of result.issues) {

      let penalty = SEVERITY_SCORE[issue.severity] || 5;

      // normalize weight
      penalty = (penalty * weight) / 100;

      // 🔥 baseline adjustment
      if (baseline.type === "HEAVY_APP") {
        penalty *= 0.7;
      }

      score -= penalty;

      reasons.push(`${result.bot}: ${issue.type}`);
    }
  }

  if (score < 0) score = 0;

  let status = "HEALTHY";

  if (score < 60) status = "CRITICAL";
  else if (score < 85) status = "DEGRADED";

  return {
    score: Math.round(score),
    status,
    reasons
  };
}