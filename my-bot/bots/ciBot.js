export default (app) => {

  app.on("check_run.completed", async (context) => {

    const check = context.payload.check_run;

    // ✅ Only act when CI completes successfully
    if (check.conclusion !== "success") return;

    const prs = check.pull_requests;
    if (!prs || prs.length === 0) return;

    const pr = prs[0];

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {
      // 💬 Comment
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: "✅ CI Passed! Auto-merging PR 🚀",
      });

      // 🔥 Merge
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