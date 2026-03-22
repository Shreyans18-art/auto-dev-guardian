export default (app) => {

  app.on("pull_request.synchronize", async (context) => {

    const pr = context.payload.pull_request;

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const prNumber = pr.number;

    try {
      // 🔍 Get status checks
      const checks = await context.octokit.checks.listForRef({
        owner,
        repo,
        ref: pr.head.sha,
      });

      const allPassed = checks.data.check_runs.every(
        (check) => check.conclusion === "success"
      );

      if (!allPassed) {
        console.log("CI not passed yet");
        return;
      }

      // 💬 Comment
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: "✅ All checks passed! Auto-merging PR 🚀",
      });

      // 🔥 Merge PR
      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number: prNumber,
      });

    } catch (err) {
      console.log("Error:", err.message);
    }

  });

};