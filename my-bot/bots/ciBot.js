export default (app) => {

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {

    const pr = context.payload.pull_request;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pull_number = pr.number;

    // 🔥 Wait for CI to complete
    setTimeout(async () => {

      try {

        const { data } = await context.octokit.repos.getCombinedStatusForRef({
          owner,
          repo,
          ref: pr.head.sha,
        });

        const allPassed = data.statuses.length > 0 &&
          data.statuses.every((s) => s.state === "success");

        if (!allPassed) {
          console.log("CI not passed yet");
          return;
        }

        console.log("✅ CI passed — merging PR");

        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: pull_number,
          body: "✅ CI Passed! Auto-merging PR 🚀",
        });

        await context.octokit.pulls.merge({
          owner,
          repo,
          pull_number,
        });

      } catch (err) {
        console.log("Merge failed:", err.message);
      }

    }, 15000); // wait 15 sec

  });

};