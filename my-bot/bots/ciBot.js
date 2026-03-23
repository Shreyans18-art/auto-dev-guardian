export default (app) => {

  app.on("pull_request.synchronize", async (context) => {

    const pr = context.payload.pull_request;

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pull_number = pr.number;

    try {

      // 🔥 Get CI status
      const { data } = await context.octokit.repos.getCombinedStatusForRef({
        owner,
        repo,
        ref: pr.head.sha,
      });

      // Check if ALL checks passed
      const allPassed = data.statuses.length > 0 &&
        data.statuses.every((status) => status.state === "success");

      if (!allPassed) {
        console.log("CI not passed yet");
        return;
      }

      console.log("✅ CI passed — merging PR...");

      // 💬 Comment on PR
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: "✅ CI Passed! Auto-merging PR 🚀",
      });

      // 🔥 Merge PR
      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number,
      });

    } catch (err) {
      console.log("Auto merge failed:", err.message);
    }

  });

};