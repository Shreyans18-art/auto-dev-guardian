export default (app) => {

  app.on("pull_request.opened", async (context) => {

    // PR comment
    await context.octokit.issues.createComment(
      context.issue({
        body: "👀 PR opened! Waiting for CI results..."
      })
    );

    // 🔥 Extra features (label + assign)
    await context.octokit.issues.addLabels(
      context.issue({
        labels: ["auto-reviewed"]
      })
    );

    await context.octokit.issues.addAssignees(
      context.issue({
        assignees: ["Shreyans18-art"]
      })
    );

  });

};