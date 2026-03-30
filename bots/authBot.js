import { createResult } from "../utils/schema.js";

export default async function authBot() {
  return createResult({
    bot: "auth",
    metrics: {},
    issues: []
  });
}