import { createResult } from "../utils/schema.js";

export default async function consoleBot() {
  return createResult({
    bot: "console",
    metrics: {},
    issues: []
  });
}