export default (app) => {

  app.on("check_run.completed", async (context) => {

    console.log("🔥 check_run event triggered");

    const check = context.payload.check_run;

    console.log("Conclusion:", check.conclusion);
    console.log("PRs:", check.pull_requests);

    if (check.conclusion !== "success") return;

    const prs = check.pull_requests;
    if (!prs || prs.length === 0) return;

    const pr = prs[0];

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {
      console.log("🚀 Attempting merge...");

      await context.octokit.pulls.merge({
        owner,
        repo,
        pull_number: pr.number,
      });

      console.log("✅ MERGED SUCCESSFULLY");

    } catch (err) {
      console.log("❌ Merge failed:", err.message);
    }

  });

};