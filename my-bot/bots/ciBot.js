export default (app) => {

  app.on("pull_request.opened", async (context) => {

    const pr = context.payload.pull_request;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const prNumber = pr.number;

    // ⏳ Wait for CI to finish
    setTimeout(async () => {

      try {
        const checks = await context.octokit.checks.listForRef({
          owner,
          repo,
          ref: pr.head.sha,
        });

        const allPassed = checks.data.check_runs.length > 0 &&
          checks.data.check_runs.every(
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
          body: "✅ CI Passed! Auto-merging PR 🚀",
        });

        // 🔥 Merge
        await context.octokit.pulls.merge({
          owner,
          repo,
          pull_number: prNumber,
        });

      } catch (err) {
        console.log("Error:", err.message);
      }

    }, 15000); // wait 15 sec

  });

};