/**
 * Compute a 0–100 critical score from bot results.
 * PASS = full weight, WARN = half weight, FAIL = 0
 */
export function computeScore(botResults) {
  if (!botResults || botResults.length === 0) return 0;

  const weights = {
    networkBot:      10,
    headersBot:      10,
    sslBot:          10,
    dnsBot:           8,
    performanceBot:   8,
    latencyBot:       8,
    uptimeBot:        9,
    apiBot:           7,
    seoBot:           5,
    cachingBot:       5,
    accessibilityBot: 5,
    resourceBot:      5,
    authBot:          5,
    consoleBot:       3,
    geoBot:           3,
  };

  let earned = 0;
  let total  = 0;

  botResults.forEach(bot => {
    const w = weights[bot.id] || 5;
    total += w;
    if (bot.status === 'pass')    earned += w;
    else if (bot.status === 'warn') earned += w * 0.5;
    // fail → 0
  });

  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

export function scoreLabel(score) {
  if (score >= 80) return { label: 'Safe to Deploy', color: 'var(--success)', emoji: '✅' };
  if (score >= 50) return { label: 'Deploy with Caution', color: 'var(--warning)', emoji: '⚠️' };
  return { label: 'Critical Issues — Block', color: 'var(--danger)', emoji: '❌' };
}
