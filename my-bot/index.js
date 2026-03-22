/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {

  // When PR is opened
  app.on("pull_request.opened", async (context) => {
    await context.octokit.issues.createComment(
      context.issue({
        body: "👀 Hey! Make sure your code passes CI before merging."
      })
    );
  });

};
