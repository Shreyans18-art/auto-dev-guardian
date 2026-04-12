import { useState, useCallback } from 'react';
import { useScan } from '../context/ScanContext.jsx';

// Bot metadata — used during the animated loading phase
// (must match order in server.js mapBotResult calls)
export const BOT_DEFS = [
  { id: 'networkBot',       name: 'Network',          icon: '🌐', desc: 'HTTP connectivity & response codes' },
  { id: 'headersBot',       name: 'Security Headers', icon: '🛡️', desc: 'HTTP security header validation' },
  { id: 'sslBot',           name: 'SSL / TLS',        icon: '🔒', desc: 'Certificate validity & HTTPS configuration' },
  { id: 'dnsBot',           name: 'DNS',              icon: '📡', desc: 'DNS resolution & propagation' },
  { id: 'performanceBot',   name: 'Performance',      icon: '⚡', desc: 'Page load & response size analysis' },
  { id: 'latencyBot',       name: 'Latency',          icon: '⏱️', desc: 'Round-trip response time (TTFB)' },
  { id: 'uptimeBot',        name: 'Uptime',           icon: '💓', desc: 'Service availability check' },
  { id: 'apiBot',           name: 'API Health',       icon: '🔌', desc: 'Endpoint reachability & response validation' },
  { id: 'seoBot',           name: 'SEO',              icon: '🔍', desc: 'Meta tags, crawlability & structured data' },
  { id: 'cachingBot',       name: 'Caching',          icon: '🗄️', desc: 'Cache-Control headers & CDN configuration' },
  { id: 'accessibilityBot', name: 'Accessibility',    icon: '♿', desc: 'WCAG 2.1 compliance basics' },
  { id: 'resourceBot',      name: 'Resources',        icon: '📦', desc: 'Asset sizes & bundle analysis' },
  { id: 'authBot',          name: 'Auth',             icon: '🔑', desc: 'Authentication endpoint & token security' },
  { id: 'consoleBot',       name: 'Console Errors',   icon: '🖥️', desc: 'JS console errors & runtime warnings' },
  { id: 'geoBot',           name: 'Geo / CDN',        icon: '🗺️', desc: 'Geographic routing & CDN edge coverage' },
];

// Staggered delay helper for animated progress loader
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useBotScan() {
  const { setBotResults, setScanning, setScanDone } = useScan();
  const [progress, setProgress] = useState([]);

  const runScan = useCallback(async (url) => {
    setScanning(true);
    setScanDone(false);
    setBotResults([]);
    setProgress([]);

    // Show all bots as "running" sequentially with staggered animation
    // We start the real scan in parallel while showing loader
    const startProgress = async () => {
      for (const bot of BOT_DEFS) {
        setProgress(prev => [...prev, { ...bot, status: 'running' }]);
        await sleep(250 + Math.random() * 200); // staggered reveal
      }
    };

    // Run real scan against backend
    const runRealScan = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      return response.json();
    };

    try {
      // Run both in parallel — progress animation + real scan
      const [, scanData] = await Promise.all([
        startProgress(),
        runRealScan(),
      ]);

      // Map backend bot results to frontend format
      // Backend returns bots array in same order as BOT_DEFS
      const mappedResults = (scanData.bots || []).map((bot, idx) => {
        const def = BOT_DEFS[idx] || {};
        return {
          id:      bot.id      || def.id,
          name:    bot.name    || def.name,
          icon:    bot.icon    || def.icon,
          desc:    bot.desc    || def.desc,
          status:  bot.status  || 'pass',
          message: bot.message || `All ${bot.name || def.name} checks passed`,
          issue:   bot.issue   || null,
          impact:  bot.impact  || null,
          fix:     bot.fix     || null,
          score:   bot.score   ?? 100,
        };
      });

      // Update progress to show final statuses
      setProgress(mappedResults);
      setBotResults(mappedResults);

    } catch (err) {
      console.error('Scan failed:', err);

      // On error — mark all running bots as a special error state
      // and fabricate a minimal error result set so the report still renders
      const errorResults = BOT_DEFS.map(bot => ({
        ...bot,
        status: 'warn',
        message: 'Scan backend unreachable — check server is running on port 5000',
        issue: `Could not connect to scan server: ${err.message}`,
        impact: 'Real scan results unavailable. Start the backend server with: node server.js',
        fix: [
          'Open a terminal in the project root.',
          'Run: node server.js',
          'Then re-run the scan.',
        ],
        score: 50,
      }));

      setProgress(errorResults);
      setBotResults(errorResults);
    }

    setScanning(false);
    setScanDone(true);
    return [];
  }, [setBotResults, setScanning, setScanDone]);

  return { runScan, progress };
}
