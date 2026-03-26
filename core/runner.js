import networkBot from "../bots/networkBot.js";
import dnsBot from "../bots/dnsBot.js";
import headersBot from "../bots/headersBot.js";

import { saveReport } from "../engine/reportManager.js";
import { evaluate } from "../engine/decisionEngine.js";

const url = process.argv[2] || "https://example.com";

async function runBotSafe(name, botFn) {
  try {
    console.log(`🚀 Running ${name}...`);
    const result = await botFn(url);

    if (!Array.isArray(result)) {
      console.log(`⚠️ ${name} did not return array`);
      return [];
    }

    console.log(`✅ ${name} completed with ${result.length} issues`);
    return result;

  } catch (err) {
    console.log(`❌ ${name} failed:`, err.message);
    return [
      {
        bot: name,
        type: "BOT_FAILURE",
        severity: "HIGH",
        message: err.message,
        fix: "Check bot implementation",
        timestamp: new Date().toISOString()
      }
    ];
  }
}

async function run() {
  console.log("🔥 Starting FaultPulse Runner...\n");

  const results = await Promise.all([
    runBotSafe("networkBot", networkBot),
    runBotSafe("dnsBot", dnsBot),
    runBotSafe("headersBot", headersBot)
  ]);

  console.log("\n📦 Raw bot results:", JSON.stringify(results, null, 2));

  const issues = results.flat();

  console.log(`\n📊 Total Issues Found: ${issues.length}`);

  const decision = evaluate(issues);

  const report = {
    url,
    timestamp: new Date().toISOString(),
    issues,
    decision
  };

  saveReport(report);

  console.log("\n🧠 Final Decision:", decision);

  // 🔥 Fail CI if needed
  if (decision.status === "BLOCK") {
    console.log("❌ Blocking CI due to critical issues");
    process.exit(1);
  } else {
    console.log("✅ CI Passed");
  }
}

run();