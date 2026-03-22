export default (app) => {

  app.on("check_run.completed", async (context) => {

    const conclusion = context.payload.check_run.conclusion;

    const pr = context.payload.check_run.pull_requests[0];
    if (!pr) return;

    const issue_number = pr.number;

   if (conclusion === "success") {
  message = "✅ CI Passed! Ready to merge 🚀";

  try {
    await context.octokit.pulls.merge({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      pull_number: issue_number,
    });
  } catch (err) {
    console.log("Auto merge failed:", err.message);
  }
}
    await context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number,
      body: message,
    });

  });

};