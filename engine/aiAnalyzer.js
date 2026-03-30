export default function aiAnalyzer({ baseline, results, decision, trend }) {

  let summary = "";
  let fixes = [];

  // 🧠 SUMMARY
  if (decision.status === "HEALTHY") {
    summary = "System is healthy with no major issues.";
  }

  if (decision.status === "DEGRADED") {
    summary = "System performance is degraded. Some issues detected affecting stability.";
  }

  if (decision.status === "CRITICAL") {
    summary = "Critical issues detected. Immediate action required.";
  }

  // 🔍 ROOT CAUSE ANALYSIS
  const issues = results.flatMap(r => r.issues);

  for (const issue of issues) {
    fixes.push(`Fix ${issue.type}: ${issue.fix}`);
  }

  // 📈 TREND INSIGHT
  let trendInsight = "";

  if (trend.trend === "DECLINING") {
    trendInsight = "Performance is decreasing over time. System may fail soon.";
  } else if (trend.trend === "IMPROVING") {
    trendInsight = "System stability is improving.";
  } else {
    trendInsight = "System is stable.";
  }

  return {
    summary,
    rootCauses: issues.map(i => i.type),
    recommendations: fixes.slice(0, 5),
    trendInsight
  };
}