import { useState, useCallback } from 'react';
import { useScan } from '../context/ScanContext.jsx';

// Per-bot rich diagnostic data: each bot has possible warn/fail scenarios with
// issue, impact, and crisp fix steps.
const BOT_DEFS = [
  {
    id: 'networkBot', name: 'Network', icon: '🌐',
    desc: 'HTTP connectivity & response codes',
    scenarios: {
      fail: [
        {
          message: 'Server returned HTTP 503 — Service Unavailable',
          issue: 'Your server is refusing connections or returning a 5xx error. This means the origin server is down or overloaded.',
          impact: 'All users will see an error page. Real traffic cannot reach your app.',
          fix: [
            'Check your server process (e.g. `pm2 status` or `systemctl status nginx`).',
            'Verify no recent deploy broke the entry point — roll back if needed.',
            'Inspect server error logs: `tail -f /var/log/nginx/error.log`.',
            'If using a load balancer, confirm at least one healthy upstream node.',
          ],
        },
        {
          message: 'Connection timed out after 5s — host unreachable',
          issue: 'The server is not responding within the timeout window. Could be a firewall block or the process has crashed.',
          impact: 'Users experience blank/loading pages until browser timeout (~30s).',
          fix: [
            'Confirm the server is running and listening on the correct port.',
            'Check firewall / security-group rules — ensure port 80/443 is open.',
            'Ping the host and run `curl -I https://yoursite.com` for diagnosis.',
          ],
        },
      ],
      warn: [
        {
          message: 'HTTP redirect chain is 3 hops (301 → 301 → 200)',
          issue: 'Multiple redirects add latency on every first load. Each hop adds ~50–200ms.',
          impact: 'Slower first-byte time (TTFB) and slightly worse Core Web Vitals.',
          fix: [
            'Consolidate redirects to a single hop: `http://` → `https://www.yoursite.com`.',
            'Update your web server config (Nginx/Apache) so non-canonical URLs redirect directly.',
            'Avoid chaining www → HTTPS → trailing-slash separately — do it in one rule.',
          ],
        },
      ],
    },
  },
  {
    id: 'headersBot', name: 'Security Headers', icon: '🛡️',
    desc: 'HTTP security header validation',
    scenarios: {
      fail: [
        {
          message: 'Missing: Content-Security-Policy, X-Frame-Options, HSTS',
          issue: 'Critical security headers are absent. Without CSP your site is vulnerable to XSS. Without X-Frame-Options it can be embedded in iframes (clickjacking). Without HSTS, users can be downgraded to HTTP.',
          impact: 'High security risk — attackers can inject scripts, hijack sessions, or intercept HTTP traffic.',
          fix: [
            'Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` to enforce HTTPS for 1 year.',
            'Add `Content-Security-Policy: default-src \'self\'` and tighten as needed.',
            'Add `X-Frame-Options: DENY` to block iframe embedding.',
            'Add `X-Content-Type-Options: nosniff` to prevent MIME sniffing.',
            'Use SecurityHeaders.com to score your headers and get exact values.',
          ],
        },
      ],
      warn: [
        {
          message: 'Referrer-Policy is missing — defaults to unsafe behavior',
          issue: 'Without a Referrer-Policy, your full URL (including query params with sensitive data) may be sent to third-party sites.',
          impact: 'Privacy risk — user tokens or emails in URLs may leak to analytics/ad networks.',
          fix: [
            'Add `Referrer-Policy: strict-origin-when-cross-origin` header.',
            'In Nginx: `add_header Referrer-Policy "strict-origin-when-cross-origin";`',
          ],
        },
      ],
    },
  },
  {
    id: 'sslBot', name: 'SSL / TLS', icon: '🔒',
    desc: 'Certificate validity & HTTPS configuration',
    scenarios: {
      fail: [
        {
          message: 'SSL certificate expires in 6 days — renewal overdue',
          issue: 'Your TLS certificate is about to expire. Browsers will show a hard "NOT SECURE" warning blocking users.',
          impact: 'Complete loss of HTTPS trust — browsers block the page for all users.',
          fix: [
            'If using Let\'s Encrypt: run `certbot renew` immediately.',
            'Enable auto-renewal: `certbot renew --dry-run` to verify it\'s configured.',
            'If using a paid cert: download the new certificate from your CA and replace it.',
            'Restart the web server after renewal: `sudo systemctl restart nginx`.',
          ],
        },
        {
          message: 'TLS 1.0/1.1 still enabled — deprecated protocols active',
          issue: 'Old TLS versions have known vulnerabilities (POODLE, BEAST). They should be disabled.',
          impact: 'Security audit failure, PCI-DSS non-compliance, and potential man-in-the-middle attacks.',
          fix: [
            'In Nginx: set `ssl_protocols TLSv1.2 TLSv1.3;` in your server block.',
            'In Apache: set `SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1`.',
            'Test with: `nmap --script ssl-enum-ciphers -p 443 yoursite.com`.',
          ],
        },
      ],
      warn: [
        {
          message: 'Certificate is valid but HSTS preloading not enabled',
          issue: 'HSTS is set but not submitted to the browser preload list, so first-time visitors can still receive an unencrypted response.',
          impact: 'Minor — first-visit downgrade attack still theoretically possible.',
          fix: [
            'Add `preload` to your HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.',
            'Submit at https://hstspreload.org after ensuring all subdomains support HTTPS.',
          ],
        },
      ],
    },
  },
  {
    id: 'dnsBot', name: 'DNS', icon: '📡',
    desc: 'DNS resolution & propagation',
    scenarios: {
      fail: [
        {
          message: 'DNS resolution failed — NXDOMAIN returned',
          issue: 'Your domain name doesn\'t resolve to any IP address. Either the domain has expired or the DNS records are misconfigured.',
          impact: 'Site is completely unreachable — users get "This site can\'t be reached".',
          fix: [
            'Check your domain expiry at your registrar (Namecheap, GoDaddy, etc.).',
            'Verify A/AAAA records exist: `dig A yoursite.com`.',
            'If records look correct, wait for propagation or flush DNS: `ipconfig /flushdns` (Windows) or `sudo systemd-resolve --flush-caches` (Linux).',
          ],
        },
      ],
      warn: [
        {
          message: 'DNS TTL is 30s — very low, causes excessive lookups',
          issue: 'A very low TTL means resolvers don\'t cache your DNS records, resulting in more lookups and slightly higher latency for every new user.',
          impact: 'Minor performance overhead and higher load on your DNS provider.',
          fix: [
            'Increase TTL to at least 300s (5 min) for stability, 3600s (1h) for production.',
            'Only use very low TTLs when actively migrating — raise it after.',
          ],
        },
      ],
    },
  },
  {
    id: 'performanceBot', name: 'Performance', icon: '⚡',
    desc: 'Page load & Core Web Vitals simulation',
    scenarios: {
      fail: [
        {
          message: 'LCP > 4s, CLS: 0.38 — Core Web Vitals failing',
          issue: 'Largest Contentful Paint (LCP) is too slow and Cumulative Layout Shift (CLS) is high. Google\'s thresholds are LCP < 2.5s and CLS < 0.1.',
          impact: 'Poor Google search ranking, high bounce rate, bad user experience on slow connections.',
          fix: [
            'LCP: Preload your hero image with `<link rel="preload" as="image">` and serve it from a CDN.',
            'LCP: Enable compression (gzip/brotli) on your server.',
            'CLS: Reserve explicit dimensions for images/ads: always set `width` and `height` attributes.',
            'CLS: Avoid inserting content above existing content dynamically.',
            'Run Lighthouse (`npx lighthouse https://yoursite.com`) for a detailed audit.',
          ],
        },
      ],
      warn: [
        {
          message: 'FID 180ms — interaction response is slightly slow',
          issue: 'First Input Delay is above the 100ms threshold. Main thread is blocked during page load.',
          impact: 'Clicks and taps feel sluggish on page load — especially on mobile.',
          fix: [
            'Break up long JavaScript tasks using `setTimeout` or `scheduler.postTask`.',
            'Defer non-critical scripts with `defer` or `async` attributes.',
            'Use a Web Worker for heavy computation to keep the main thread free.',
          ],
        },
      ],
    },
  },
  {
    id: 'latencyBot', name: 'Latency', icon: '⏱️',
    desc: 'Round-trip response time (TTFB)',
    scenarios: {
      fail: [
        {
          message: 'TTFB: 2.8s — server response critically slow',
          issue: 'Time To First Byte is nearly 3 seconds. The server is taking too long to start streaming a response. This is usually slow database queries or no caching.',
          impact: 'All page load metrics are pushed out by ~3s. Users on mobile may abandon the page.',
          fix: [
            'Profile slow database queries — add indexes to frequently queried columns.',
            'Enable server-side caching (Redis/Memcached) for expensive queries or pages.',
            'Use a CDN (Cloudflare, CloudFront) to cache static responses closer to users.',
            'Check for N+1 query problems in your ORM.',
          ],
        },
      ],
      warn: [
        {
          message: 'TTFB: 600ms — acceptable but room for improvement',
          issue: 'Server response is slightly above the ideal 200ms threshold.',
          impact: 'Minor — users on fast connections won\'t notice, but slow networks will feel it.',
          fix: [
            'Enable keep-alive connections in your server config.',
            'Look into HTTP/2 or HTTP/3 push for critical assets.',
            'Consider edge caching for rendered HTML if content is not user-specific.',
          ],
        },
      ],
    },
  },
  {
    id: 'uptimeBot', name: 'Uptime', icon: '💓',
    desc: 'Service availability check',
    scenarios: {
      fail: [
        {
          message: 'Service returned non-200 status (502 Bad Gateway)',
          issue: 'Your reverse proxy (Nginx/Caddy) is running but the app server behind it has crashed or is not accepting connections.',
          impact: 'Full outage — users see a blank 502 page.',
          fix: [
            'Restart your app process: `pm2 restart all` or `systemctl restart your-app`.',
            'Check upstream health in Nginx: `nginx -t` then review error logs.',
            'Verify the app is listening on the correct port (e.g. `netstat -tlnp | grep 3000`).',
          ],
        },
      ],
      warn: [
        {
          message: 'Uptime 97.8% last 7 days — 2+ hours of downtime',
          issue: '3 outage events detected in the past week totaling ~2.5 hours.',
          impact: 'SLA violation risk. Users encountered errors during those windows.',
          fix: [
            'Set up automated restarts: `pm2 startup` ensures app recovers after crashes.',
            'Add a healthcheck endpoint and hook it into your monitor (UptimeRobot, Better Uptime).',
            'Review crash logs from the downtime windows to identify root cause.',
          ],
        },
      ],
    },
  },
  {
    id: 'apiBot', name: 'API Health', icon: '🔌',
    desc: 'Endpoint reachability & response validation',
    scenarios: {
      fail: [
        {
          message: '/api/health returned 500 — internal server error',
          issue: 'Your API health endpoint is failing with an unhandled exception. This suggests a code error or a broken dependency (DB, cache).',
          impact: 'API consumers and frontends get errors — core functionality is broken.',
          fix: [
            'Check server error logs for the exception stack trace.',
            'Test database connectivity: ensure DB credentials and host are correct.',
            'Wrap the health handler in try/catch and return structured error info.',
            'Redeploy the last known-good version while you diagnose.',
          ],
        },
      ],
      warn: [
        {
          message: 'API response missing CORS headers for cross-origin requests',
          issue: 'Your API doesn\'t return `Access-Control-Allow-Origin` for cross-origin requests, blocking browser-based clients.',
          impact: 'Frontend apps on different domains cannot call your API — browser blocks the request.',
          fix: [
            'In Express: `app.use(cors({ origin: "https://yourfrontend.com" }))`.',
            'Return at minimum: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.',
            'For public APIs use `*`. For authenticated APIs, specify exact origins.',
          ],
        },
      ],
    },
  },
  {
    id: 'seoBot', name: 'SEO', icon: '🔍',
    desc: 'Meta tags, crawlability & structured data',
    scenarios: {
      fail: [
        {
          message: 'Missing <title>, <meta description>, robots.txt blocking crawlers',
          issue: 'Search engines cannot index your site properly. The missing title and meta description reduce click-through rates. Robots.txt is blocking all crawlers (`Disallow: /`).',
          impact: 'Site won\'t appear in search results — zero organic traffic.',
          fix: [
            'Add a `<title>Your Page Title</title>` to every page\'s `<head>`.',
            'Add `<meta name="description" content="...">` — keep it 150–160 chars.',
            'Fix robots.txt: replace `Disallow: /` with `Allow: /` for public pages.',
            'Submit your sitemap to Google Search Console.',
          ],
        },
      ],
      warn: [
        {
          message: 'Open Graph tags missing — social sharing shows no preview',
          issue: 'Without og:title, og:image, og:description, links shared on Twitter/LinkedIn/Slack show blank previews.',
          impact: 'Poor social shareability — lower click-through from shared links.',
          fix: [
            'Add `<meta property="og:title" content="...">` with your page title.',
            'Add `<meta property="og:image" content="https://...">` — use a 1200×630px image.',
            'Add `<meta property="og:description" content="...">` and `og:url`.',
            'Test with https://cards-dev.twitter.com/validator.',
          ],
        },
      ],
    },
  },
  {
    id: 'cachingBot', name: 'Caching', icon: '🗄️',
    desc: 'Cache-Control headers & CDN configuration',
    scenarios: {
      fail: [
        {
          message: 'Static assets served with no-cache — CDN bypassed entirely',
          issue: 'JS/CSS/image files are sending `Cache-Control: no-cache, no-store`. This forces every asset to be re-downloaded on every page load.',
          impact: 'Massive performance hit — page load could be 5–10× slower without caching. High origin bandwidth cost.',
          fix: [
            'For versioned assets (hashed filenames): set `Cache-Control: public, max-age=31536000, immutable`.',
            'For HTML: set `Cache-Control: no-cache` (correct — forces revalidation but allows CDN caching with ETag).',
            'In Nginx: `location ~* \\.(js|css|png|jpg|svg)$ { expires 1y; add_header Cache-Control "public, immutable"; }`',
          ],
        },
      ],
      warn: [
        {
          message: 'Cache headers set but ETags are disabled',
          issue: 'Without ETags, the browser can\'t do conditional requests (304 Not Modified), meaning even "cached" assets may be re-downloaded.',
          impact: 'Slightly higher bandwidth and load times than necessary.',
          fix: [
            'In Nginx: ensure `etag on;` is set (it\'s the default — check it hasn\'t been disabled).',
            'Verify with: `curl -I https://yoursite.com/app.js | grep ETag`.',
          ],
        },
      ],
    },
  },
  {
    id: 'accessibilityBot', name: 'Accessibility', icon: '♿',
    desc: 'WCAG 2.1 compliance basics',
    scenarios: {
      fail: [
        {
          message: 'Images missing alt text, form inputs have no labels — WCAG A failures',
          issue: 'Screen readers cannot describe images or identify what form fields are for. This is a WCAG Level A violation — the most basic compliance level.',
          impact: 'Site is unusable for visually impaired users. Legal risk in some jurisdictions (ADA, EAA).',
          fix: [
            'Add `alt` attribute to every `<img>` — descriptive for meaningful images, `alt=""` for decorative ones.',
            'Wrap every input with a `<label for="inputId">` or use `aria-label`.',
            'Run axe DevTools browser extension for a full automated audit.',
            'Fix color contrast ratio — ensure 4.5:1 for normal text, 3:1 for large text.',
          ],
        },
      ],
      warn: [
        {
          message: 'Focus order is non-sequential — keyboard navigation broken',
          issue: 'Tab key navigation jumps around the page in a confusing order due to incorrect `tabindex` values or DOM order mismatch.',
          impact: 'Keyboard-only users (WCAG requirement) cannot navigate the page logically.',
          fix: [
            'Avoid `tabindex` values > 0 — use `tabindex="0"` or rely on natural DOM order.',
            'Ensure your visual layout order matches the DOM source order.',
            'Test by pressing Tab through your entire page — focus should flow top-to-bottom.',
          ],
        },
      ],
    },
  },
  {
    id: 'resourceBot', name: 'Resources', icon: '📦',
    desc: 'Asset sizes, broken links & bundle analysis',
    scenarios: {
      fail: [
        {
          message: '3 broken links detected, JS bundle is 4.2MB uncompressed',
          issue: 'Broken links cause 404 errors for users and crawlers. A 4.2MB JS bundle is extremely large — most of it is likely unused code.',
          impact: 'Bad UX from broken links. Slow page loads – 4MB of JS takes ~20s on 3G to parse.',
          fix: [
            'Find broken links: use a crawler like `broken-link-checker` npm package.',
            'Reduce bundle size: run `npx webpack-bundle-analyzer` to find large dependencies.',
            'Use code splitting (`import()`) to load JavaScript only when needed.',
            'Replace heavy libraries — e.g. replace Moment.js (~67KB) with `date-fns` (~6KB).',
          ],
        },
      ],
      warn: [
        {
          message: 'Images not using next-gen formats (WebP/AVIF)',
          issue: 'All images are served as PNG/JPEG. WebP is 25–35% smaller than JPEG at equivalent quality.',
          impact: 'Unnecessarily large page weight — especially on image-heavy pages.',
          fix: [
            'Convert images to WebP: `cwebp -q 80 image.png -o image.webp`.',
            'Use `<picture>` element with WebP fallback for older browsers.',
            'In Next.js: use `<Image>` component — it auto-serves WebP.',
          ],
        },
      ],
    },
  },
  {
    id: 'authBot', name: 'Auth', icon: '🔑',
    desc: 'Authentication endpoint & token security',
    scenarios: {
      fail: [
        {
          message: 'Login endpoint has no rate limiting — brute force possible',
          issue: 'Your `/auth/login` endpoint accepts unlimited requests with no slowdown or lockout. Attackers can rapidly try password combinations.',
          impact: 'Account takeover risk. Compromised user accounts, potential data breach.',
          fix: [
            'Add rate limiting middleware: e.g. `express-rate-limit` — max 5 attempts per 15 mins per IP.',
            'Implement progressive delays after failed attempts (exponential backoff).',
            'Add CAPTCHA after 3 failed attempts.',
            'Alert users and admins on repeated failures from the same IP.',
          ],
        },
      ],
      warn: [
        {
          message: 'JWT tokens have no expiry — tokens valid indefinitely',
          issue: 'Access tokens without an expiry (`exp` claim) never invalidate. If stolen, they work forever.',
          impact: 'Stolen tokens grant permanent access — no way to revoke without rotating the signing secret.',
          fix: [
            'Set a short expiry on access tokens: 15–60 minutes (`expiresIn: "15m"`).',
            'Use refresh tokens for long-lived sessions.',
            'Implement a token denylist in Redis for critical logout/revocation.',
          ],
        },
      ],
    },
  },
  {
    id: 'consoleBot', name: 'Console Errors', icon: '🖥️',
    desc: 'JS console errors & runtime warnings',
    scenarios: {
      fail: [
        {
          message: '7 JS errors on load: ReferenceError, 2× TypeError, React key warnings',
          issue: 'Multiple JavaScript errors fire on page load before any user interaction. These indicate broken code paths that real users will hit.',
          impact: 'Features silently fail — users see blank sections or broken UI without explanation.',
          fix: [
            'Open DevTools Console and address each error by file and line number.',
            'ReferenceError: ensure all functions/variables are defined before use.',
            'TypeError: add null-checks before accessing properties — `obj?.property`.',
            'React key warnings: add unique `key` prop to every list-rendered element.',
            'Set up an error boundary (`<ErrorBoundary>`) to catch and display React errors gracefully.',
          ],
        },
      ],
      warn: [
        {
          message: 'Deprecated API usage detected: `componentWillMount`, `document.write`',
          issue: 'You\'re using React lifecycle methods and browser APIs that are deprecated and will be removed in future versions.',
          impact: 'Will break in future React/browser updates — technical debt accumulating.',
          fix: [
            'Replace `componentWillMount` with `componentDidMount` or the `useEffect` hook.',
            'Replace `document.write` with `document.getElementById().innerHTML` or DOM manipulation.',
            'Run React in StrictMode during development to catch more deprecations.',
          ],
        },
      ],
    },
  },
  {
    id: 'geoBot', name: 'Geo / CDN', icon: '🗺️',
    desc: 'Geographic routing & CDN edge coverage',
    scenarios: {
      fail: [
        {
          message: 'No CDN detected — all requests hitting single origin (US-East)',
          issue: 'Your site has no CDN. Users in Asia, Europe, and South America are making round-trips to a single US server, adding 200–400ms of latency per request.',
          impact: 'Global users experience significantly slower page loads. TTFB alone can be 500ms+ from distant regions.',
          fix: [
            'Add Cloudflare (free tier available) — just update your DNS nameservers.',
            'Alternatively, use AWS CloudFront, Azure CDN, or Fastly.',
            'Enable CDN for at minimum: images, JS, CSS and HTML responses.',
            'After CDN setup, test from multiple regions using webpagetest.org.',
          ],
        },
      ],
      warn: [
        {
          message: 'CDN in use but cache hit ratio is 42% — too many origin requests',
          issue: 'Less than half your requests are being served from cache. The CDN is pulling from origin too often, defeating its purpose.',
          impact: 'Higher origin load and slower responses than you should be getting.',
          fix: [
            'Check your Cache-Control headers — ensure static assets have long max-age.',
            'Increase CDN cache TTL rules for infrequently changing content.',
            'Investigate cache-busting query strings that may be creating unique cache keys.',
          ],
        },
      ],
    },
  },
];

// Pick a random scenario from the fail/warn pool for a bot
function pickScenario(bot, status) {
  const pool = bot.scenarios[status];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Simulate bot scan results
function simulateBot(bot) {
  return new Promise(resolve => {
    const delay = 400 + Math.random() * 800;
    setTimeout(() => {
      const rand = Math.random();
      let status, scenario;

      if (rand > 0.72) {
        status   = 'fail';
        scenario = pickScenario(bot, 'fail');
      } else if (rand > 0.42) {
        status   = 'warn';
        scenario = pickScenario(bot, 'warn');
      } else {
        status = 'pass';
      }

      if (status === 'pass') {
        resolve({
          ...bot,
          status: 'pass',
          message: `All ${bot.name} checks passed`,
          issue: null,
          impact: null,
          fix: null,
        });
      } else {
        resolve({
          ...bot,
          status,
          message: scenario?.message || `${bot.name} ${status === 'fail' ? 'failed' : 'has warnings'}`,
          issue:   scenario?.issue  || null,
          impact:  scenario?.impact || null,
          fix:     scenario?.fix    || null,
        });
      }
    }, delay);
  });
}

export function useBotScan() {
  const { setBotResults, setScanning, setScanDone } = useScan();
  const [progress, setProgress] = useState([]);

  const runScan = useCallback(async (url) => {
    setScanning(true);
    setScanDone(false);
    setBotResults([]);
    setProgress([]);

    const results = [];

    for (const bot of BOT_DEFS) {
      setProgress(prev => [...prev, { ...bot, status: 'running' }]);
      const result = await simulateBot(bot, url);
      results.push(result);
      setProgress(prev => prev.map(b => b.id === bot.id ? result : b));
    }

    setBotResults(results);
    setScanning(false);
    setScanDone(true);
    return results;
  }, [setBotResults, setScanning, setScanDone]);

  return { runScan, progress };
}

export { BOT_DEFS };
