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