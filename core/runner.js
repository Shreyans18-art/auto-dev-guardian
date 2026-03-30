import baselineAnalyzer from "../engine/baselineAnalyzer.js";
import decisionEngine from "../engine/decisionEngine.js";
import trendAnalyzer from "../engine/trendAnalyzer.js";
import aiAnalyzer from "../engine/aiAnalyzer.js";
import { saveReport } from "../engine/reportManager.js";

// Bots
import networkBot from "../bots/networkBot.js";
import dnsBot from "../bots/dnsBot.js";
import headersBot from "../bots/headersBot.js";
import performanceBot from "../bots/performanceBot.js";
import uptimeBot from "../bots/uptimeBot.js";
import seoBot from "../bots/seoBot.js";
import latencyBot from "../bots/latencyBot.js";
import resourceBot from "../bots/resourceBot.js";
import accessibilityBot from "../bots/accessibilityBot.js";
import cachingBot from "../bots/cachingBot.js";
import apiBot from "../bots/apiBot.js";
import sslBot from "../bots/sslBot.js";
import consoleBot from "../bots/consoleBot.js";
import geoBot from "../bots/geoBot.js";
import authBot from "../bots/authBot.js";

const url = process.argv[2];

async function run() {

  console.log("🔥 Starting FaultPulse Runner...\n");

  // 🧠 BASELINE
  const baseline = await baselineAnalyzer(url);

  // 🚀 BOTS
  const bots = [
    networkBot,
    dnsBot,
    headersBot,
    performanceBot,
    uptimeBot,
    seoBot,
    latencyBot,
    resourceBot,
    accessibilityBot,
    cachingBot,
    apiBot,
    sslBot,
    consoleBot,
    geoBot,
    authBot
  ];

  const results = await Promise.all(
    bots.map(bot => bot(url, baseline))
  );

  // 📊 DECISION
  const decision = decisionEngine(results, baseline);

  // 📈 TREND
  const trend = trendAnalyzer({
    timestamp: new Date().toISOString(),
    decision
  });

  // 🤖 AI ANALYSIS
  const ai = aiAnalyzer({
    baseline,
    results,
    decision,
    trend
  });

  // 📦 FINAL REPORT
  const report = {
    url,
    timestamp: new Date().toISOString(),
    baseline,
    results,
    decision,
    trend,
    ai
  };

  saveReport(report);

  console.log("\n📊 FINAL REPORT:");
  console.log(JSON.stringify(report, null, 2));

  // CI EXIT
  if (decision.status === "CRITICAL") {
    process.exit(1);
  }
}

run();