export default (app) => {

  // 🔥 DEBUG: log ALL incoming events
  app.onAny((context) => {
    console.log("📩 Event received:", context.name);
  });

  // 🔥 MAIN: listen for CI completion
  app.on("workflow_run.completed", async (context) => {

    console.log("🔥 workflow_run.completed triggered");

    const workflow = context.payload.workflow_run;

    console.log("Workflow conclusion:", workflow.conclusion);

    // ❌ If CI failed → do nothing
    if (workflow.conclusion !== "success") {
      console.log("❌ CI not successful, skipping merge");
      return;
    }

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {

      // 🔍 Find PR linked to this commit
      const prs = await context.octokit.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: workflow.head_sha,
      });

      console.log("🔎 PRs found:", prs.data.length);

      if (!prs.data.length) {
        console.log("❌ No PR found for this commit");
        return;
      }

      const pr = prs.data[0];

      console.log("🚀 Attempting to merge PR:", pr.number);

      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number: pr.number,
      });

      console.log("✅ PR merged successfully");

    } catch (err) {
      console.log("❌ Merge failed:", err.message);
    }

  });

};