export function createIssue({
  bot,
  type,
  severity,
  message,
  fix
}) {
  return {
    bot,
    type,
    severity,
    message,
    fix,
    timestamp: new Date().toISOString()
  };
}

export function createResult({ bot, metrics = {}, issues = [] }) {
  return {
    bot,
    status: issues.length === 0 ? "OK" : "FAIL",
    metrics,
    issues
  };
}