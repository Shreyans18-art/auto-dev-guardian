export default (app) => {

  app.on("workflow_run.completed", async (context) => {

    const workflow = context.payload.workflow_run;

    if (workflow.conclusion !== "success") {
      console.log("Workflow not successful");
      return;
    }

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    try {

      // Get PR linked to commit
      const prs = await context.octokit.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: workflow.head_sha,
      });

      if (!prs.data.length) {
        console.log("No PR found");
        return;
      }

      const pr = prs.data[0];
      const pull_number = pr.number;

      console.log("🚀 Workflow complete — merging PR");

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