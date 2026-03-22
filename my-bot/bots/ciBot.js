export default (app) => {

  app.on("check_suite.completed", async (context) => {

    const conclusion = context.payload.check_suite.conclusion;

    if (conclusion !== "success") return;

    const prs = context.payload.check_suite.pull_requests;

    if (!prs || prs.length === 0) return;

    const pr = prs[0];

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: "✅ CI Passed! Auto-merging PR 🚀",
      });

      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number: pr.number,
      });

    } catch (err) {
      console.log("Auto merge failed:", err.message);
    }

  });

};