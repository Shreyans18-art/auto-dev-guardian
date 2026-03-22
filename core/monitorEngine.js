import { runAllBots } from "./runner.js";
import { saveReport } from "../engine/reportManager.js";
import { evaluate } from "../engine/decisionEngine.js";

const INTERVAL = 60000;

async function cycle() {
  const issues = await runAllBots("https://example.com");

  const decision = evaluate(issues);

  const report = {
    timestamp: new Date(),
    issues,
    decision
  };

  saveReport(report);

  console.log("Cycle complete:", decision.status);
}

setInterval(cycle, INTERVAL);
cycle();