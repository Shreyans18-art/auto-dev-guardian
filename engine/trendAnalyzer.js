import fs from "fs";
import path from "path";

const HISTORY_PATH = path.resolve("./reports/history.json");

function ensureHistory() {
  if (!fs.existsSync("./reports")) {
    fs.mkdirSync("./reports", { recursive: true });
  }

  if (!fs.existsSync(HISTORY_PATH)) {
    fs.writeFileSync(HISTORY_PATH, JSON.stringify([]));
  }
}

export default function trendAnalyzer(currentReport) {

  ensureHistory();

  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));

  // store current run
  history.push({
    timestamp: currentReport.timestamp,
    score: currentReport.decision.score
  });

  // keep last 10 runs only
  if (history.length > 10) {
    history.shift();
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

  // 📈 ANALYSIS
  let trend = "STABLE";
  let prediction = "No immediate risk";

  if (history.length >= 3) {
    const last = history.slice(-3);

    if (
      last[0].score > last[1].score &&
      last[1].score > last[2].score
    ) {
      trend = "DECLINING";
      prediction = "System health decreasing, possible degradation soon";
    }

    if (
      last[0].score < last[1].score &&
      last[1].score < last[2].score
    ) {
      trend = "IMPROVING";
      prediction = "System performance improving";
    }
  }

  return {
    history,
    trend,
    prediction
  };
}