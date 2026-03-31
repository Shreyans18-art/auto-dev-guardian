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

// 📈 Calculate % change
function calculateChange(prev, current) {
  if (!prev) return 0;
  return ((current - prev) / prev) * 100;
}

export default function trendAnalyzer(currentReport) {

  ensureHistory();

  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));

  const currentScore = currentReport.decision.score;

  const last = history.length > 0 ? history[history.length - 1] : null;

  const change = last
    ? calculateChange(last.score, currentScore)
    : 0;

  // 📈 Determine direction
  let direction = "STABLE";
  let message = "System stable";

  if (change < -5) {
    direction = "DECLINING";
    message = "System performance degrading over time";
  } else if (change > 5) {
    direction = "IMPROVING";
    message = "System performance improving";
  }

  // 🧠 store current
  history.push({
    timestamp: currentReport.timestamp,
    score: currentScore
  });

  // keep last 10 runs
  if (history.length > 10) {
    history.shift();
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

  return {
    direction,
    change: `${change.toFixed(2)}%`,
    message,
    history
  };
}