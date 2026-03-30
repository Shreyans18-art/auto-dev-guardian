import { readFileSync } from "fs";

export default (app) => {

  app.on("workflow_run.completed", async (context) => {

    const { workflow_run } = context.payload;

    // 🛑 Only act on successful CI
    if (workflow_run.conclusion !== "success") return;

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.owner.login;

    console.log("🔥 Workflow completed, processing PR...");

    // ✅ DIRECTLY GET PR FROM PAYLOAD
    const prs = workflow_run.pull_requests;

    if (!prs || prs.length === 0) {
      console.log("❌ No PR found in payload");
      return;
    }

    const prNumber = prs[0].number;

    console.log(`🔎 Found PR: #${prNumber}`);

    // 📄 Read report
    let report;

    try {
      report = JSON.parse(
        readFileSync("./reports/latest.json", "utf-8")
      );
    } catch (err) {
      console.log("❌ Report not found");
      return;
    }

    const { decision, ai, trend } = report;

    // 💬 COMMENT
    const comment = `
## 🤖 FaultPulse AI Report

### 📊 Score: ${decision.score}
### 🚦 Status: ${decision.status}

---

### 🧠 AI Summary
${ai.summary}

---

### 🔍 Issues
${ai.rootCauses.map(i => `- ${i}`).join("\n")}

---

### 🛠 Recommendations
${ai.recommendations.map(r => `- ${r}`).join("\n")}

---

### 📈 Trend
${trend.trend} — ${trend.prediction}
`;

    await context.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: comment
    });

    console.log("💬 Comment added");

    // 🚀 AUTO MERGE
    if (decision.status !== "CRITICAL") {

      console.log("🚀 Attempting auto-merge...");

      try {
        await context.octokit.rest.pulls.merge({
          owner,
          repo,
          pull_number: prNumber
        });

        console.log("✅ PR merged successfully");

      } catch (err) {
        console.log("❌ Merge failed:", err.message);
      }

    } else {
      console.log("⛔ Merge blocked due to CRITICAL issues");
    }

  });

};