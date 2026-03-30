import { readFileSync } from "fs";

export default (app) => {

  app.on("workflow_run.completed", async (context) => {

    const { workflow_run } = context.payload;

    // 🛑 Only act on success
    if (workflow_run.conclusion !== "success") return;

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.owner.login;

    console.log("🔥 Workflow completed, processing PR...");

    // 🔍 Get PR linked to this workflow
    const prs = await context.octokit.rest.actions.listWorkflowRunPullRequests({
      owner,
      repo,
      run_id: workflow_run.id
    });

    if (prs.data.length === 0) {
      console.log("❌ No PR found");
      return;
    }

    const pr = prs.data[0];

    console.log(`🔎 Found PR: #${pr.number}`);

    // 📄 Read FaultPulse report
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

    // 🧠 Build PR comment
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

---
`;

    // 💬 Post comment
    await context.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr.number,
      body: comment
    });

    console.log("💬 Comment added");

    // 🚀 AUTO MERGE LOGIC
    if (decision.status !== "CRITICAL") {

      console.log("🚀 Attempting auto-merge...");

      try {
        await context.octokit.rest.pulls.merge({
          owner,
          repo,
          pull_number: pr.number
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