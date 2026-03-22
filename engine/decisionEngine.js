export function evaluate(issues) {
  const critical = issues.filter(i => i.severity === "CRITICAL");

  if (critical.length > 0) {
    return { status: "BLOCK", reason: "Critical issues found" };
  }

  return { status: "PASS" };
}