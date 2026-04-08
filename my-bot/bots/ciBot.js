import { readFileSync } from "fs";

export default (app) => {

  app.on("workflow_run.completed", async (context) => {

    const { workflow_run } = context.payload;

    if (workflow_run.conclusion !== "success") return;

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    console.log("🔥 Workflow completed");

    const prs = workflow_run.pull_requests;

    if (!prs || prs.length === 0) {
      console.log("❌ No PR found");
      return;
    }

    const prNumber = prs[0].number;

    console.log(`🔎 PR FOUND: #${prNumber}`);

    // 📄 READ REPORT
    let report;

    try {
      report = JSON.parse(
        readFileSync("./reports/latest.json", "utf-8")
      );
    } catch {
      console.log("❌ Report not found");
      return;
    }

    const { summary, trend, ai } = report;

    const status = summary.status;
    const risk = ai?.riskLevel || "LOW";

    // 💬 COMMENT TEMPLATE
    const comment = `
## 🤖 FaultPulse Report

### 📊 Score: ${summary.score}
### 🚦 Status: ${status}
### ⚠️ Risk: ${risk}

---

### 🧠 AI Summary
${ai.summary}

---

### 🔮 Prediction
${ai.prediction}

---

### 🛠 Recommended Actions
${(ai.actions || []).map(a => `- ${a}`).join("\n")}

---
`;

    await context.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: comment
    });

    console.log("💬 Comment added");

    // 🚫 BLOCK CRITICAL
    if (status === "CRITICAL") {
      console.log("⛔ Blocking merge (CRITICAL)");
      return;
    }

    // ⚠️ DEGRADED → warn only
    if (status === "DEGRADED") {
      console.log("⚠️ Degraded system → no auto merge");

      // add label
      await context.octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: ["⚠️ degraded"]
      });

      return;
    }

    // 🔥 HIGH RISK → label + warning
    if (risk === "HIGH") {

      console.log("🚨 High risk detected");

      await context.octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: ["🚨 high-risk"]
      });

      return;
    }

    // 🐞 REPEATED FAILURE → create issue
    if (trend?.direction === "DECLINING" && trend?.history?.length >= 3) {

      console.log("🐞 Repeated degradation → creating issue");

      await context.octokit.rest.issues.create({
        owner,
        repo,
        title: "⚠️ FaultPulse: System degradation detected",
        body: `
System performance is declining over multiple runs.

Prediction:
${trend.prediction}

Action required immediately.
`
      });
    }

    // ✅ HEALTHY → AUTO MERGE
    if (status === "HEALTHY") {

      console.log("🚀 Auto-merging PR...");

      try {
        await context.octokit.rest.pulls.merge({
          owner,
          repo,
          pull_number: prNumber
        });

        console.log("✅ PR MERGED");

      } catch (err) {
        console.log("❌ Merge failed:", err.message);
      }
    }

  });

};