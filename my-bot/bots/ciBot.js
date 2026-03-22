export default (app) => {

  app.on("check_suite.completed", async (context) => {

    const conclusion = context.payload.check_suite.conclusion;

    const pr = context.payload.check_suite.pull_requests[0];
    if (!pr) return;

    const issue_number = pr.number;

    let message = "";

    if (conclusion === "success") {
      message = "✅ CI Passed! Auto-merging PR 🚀";

      try {
        await context.octokit.pulls.merge({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          pull_number: issue_number,
        });
      } catch (err) {
        console.log("Auto merge failed:", err.message);
      }

    } else {
      message = "❌ CI Failed! Fix your code 😤";
    }

    await context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number,
      body: message,
    });

  });

};