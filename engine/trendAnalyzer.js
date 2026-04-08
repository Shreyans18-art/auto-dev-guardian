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

// 📈 Calculate slope
function calculateSlope(history) {
  if (history.length < 2) return 0;

  let totalChange = 0;

  for (let i = 1; i < history.length; i++) {
    totalChange += history[i].score - history[i - 1].score;
  }

  return totalChange / (history.length - 1);
}

export default function trendAnalyzer(currentReport) {

  ensureHistory();

  const history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));

  const currentScore = currentReport.decision.score;

  // add current
  history.push({
    timestamp: currentReport.timestamp,
    score: currentScore
  });

  // keep last 10
  if (history.length > 10) {
    history.shift();
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

  // 📈 TREND
  let direction = "STABLE";
  let message = "System stable";

  if (history.length >= 3) {
    const slope = calculateSlope(history);

    if (slope < -5) {
      direction = "DECLINING";
      message = "Performance degrading over time";
    } else if (slope > 5) {
      direction = "IMPROVING";
      message = "Performance improving";
    }
  }

  // 🔮 PREDICTION
  let prediction = "No risk detected";

  if (history.length >= 3) {
    const slope = calculateSlope(history);

    const futureScore = currentScore + slope * 2;

    if (futureScore < 60) {
      prediction = "⚠️ High risk: system may become CRITICAL soon";
    } else if (futureScore < 75) {
      prediction = "⚠️ Moderate risk: degradation likely to continue";
    }
  }

  return {
    direction,
    message,
    prediction,
    history
  };
}