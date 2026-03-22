export default (app) => {

  app.on("check_run.completed", async (context) => {

    const conclusion = context.payload.check_run.conclusion;

    const pr = context.payload.check_run.pull_requests[0];
    if (!pr) return;

    const issue_number = pr.number;

    let message =
      conclusion === "success"
        ? "✅ CI Passed! Ready to merge 🚀"
        : "❌ CI Failed! Fix your code before merging 😤";

    await context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number,
      body: message,
    });

  });

};