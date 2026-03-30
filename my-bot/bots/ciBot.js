export default (app) => {

  app.on("workflow_run.completed", async (context) => {

    const { workflow_run } = context.payload;

    if (workflow_run.conclusion !== "success") return;

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    console.log("🔥 Workflow completed, processing PR...");

    const prs = workflow_run.pull_requests;

    if (!prs || prs.length === 0) {
      console.log("❌ No PR found");
      return;
    }

    const prNumber = prs[0].number;

    console.log(`✅ PR FOUND: ${prNumber}`);

    await context.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: "🚀 Auto-tested & ready to merge by FaultPulse"
    });

    console.log("💬 Comment added");

    try {
      await context.octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: prNumber
      });

      console.log("🚀 MERGED SUCCESSFULLY");

    } catch (err) {
      console.log("❌ Merge failed:", err.message);
    }

  });

};