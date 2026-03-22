import networkBot from "../bots/networkBot.js";
import dnsBot from "../bots/dnsBot.js";

export async function runAllBots(url) {
  const results = await Promise.all([
    networkBot(url),
    dnsBot(url)
  ]);

  return results.flat();
}

import { evaluate } from "../engine/decisionEngine.js";

const decision = evaluate(results);

if (decision.status === "BLOCK") {
  console.log("❌ Blocking CI due to critical issues");
  process.exit(1); // 🔥 THIS FAILS CI
}