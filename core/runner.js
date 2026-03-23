import networkBot from "../bots/networkBot.js";
import dnsBot from "../bots/dnsBot.js";
import headersBot from "../bots/headersBot.js";

import { saveReport } from "../engine/reportManager.js";
import { evaluate } from "../engine/decisionEngine.js";

const url = process.argv[2] || "https://example.com";

async function run() {
  const results = await Promise.all([
    networkBot(url),
    dnsBot(url),
    headersBot(url)
  ]);

  const issues = results.flat();

  const decision = evaluate(issues);

  const report = {
    url,
    timestamp: new Date().toISOString(),
    issues,
    decision
  };

  saveReport(report);

  console.log("Final Decision:", decision);

  if (decision.status === "BLOCK") {
    process.exit(1);
  }
}

run();