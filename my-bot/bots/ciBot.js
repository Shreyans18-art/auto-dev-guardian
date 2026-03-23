export default (app) => {

  // 🔥 Trigger when CI (GitHub Actions) completes
  app.on("check_suite.completed", async (context) => {

    const suite = context.payload.check_suite;

    // Only continue if CI passed
    if (suite.conclusion !== "success") {
      console.log("CI not successful");
      return;
    }

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {

      // 🔥 Get PR linked to this check
      const prs = suite.pull_requests;

      if (!prs || prs.length === 0) {
        console.log("No PR linked");
        return;
      }

      const pr = prs[0];
      const pull_number = pr.number;

      console.log("✅ CI passed — merging PR");

      // 💬 Comment
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: "✅ CI Passed! Auto-merging PR 🚀",
      });

      // 🔥 Merge
      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number,
      });

    } catch (err) {
      console.log("Merge failed:", err.message);
    }

  });

};