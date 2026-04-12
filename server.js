import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const RUM_PATH = path.resolve("./reports/rum.json");


//api test route
app.get("/api/test",(req,res)=>{
  res.status(200).json({"message":"success"})
})
// 🧠 CACHE
const aiCache = {};

// ensure folder
if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

// ─────────────────────────────────────────────
// 🔬 BOT DEFINITIONS (metadata for frontend display)
// ─────────────────────────────────────────────
const BOT_META = {
  network:      { id: "networkBot",      name: "Network",          icon: "🌐", desc: "HTTP connectivity & response codes" },
  security:     { id: "headersBot",      name: "Security Headers", icon: "🛡️", desc: "HTTP security header validation" },
  ssl:          { id: "sslBot",          name: "SSL / TLS",        icon: "🔒", desc: "Certificate validity & HTTPS" },
  dns:          { id: "dnsBot",          name: "DNS",              icon: "📡", desc: "DNS resolution & propagation" },
  performance:  { id: "performanceBot",  name: "Performance",      icon: "⚡", desc: "Page load & response size" },
  latency:      { id: "latencyBot",      name: "Latency",          icon: "⏱️", desc: "Round-trip response time (TTFB)" },
  uptime:       { id: "uptimeBot",       name: "Uptime",           icon: "💓", desc: "Service availability check" },
  api:          { id: "apiBot",          name: "API Health",       icon: "🔌", desc: "Endpoint reachability & response" },
  seo:          { id: "seoBot",          name: "SEO",              icon: "🔍", desc: "Meta tags & crawlability" },
  cache:        { id: "cachingBot",      name: "Caching",          icon: "🗄️", desc: "Cache-Control headers & CDN" },
  accessibility:{ id: "accessibilityBot",name: "Accessibility",    icon: "♿", desc: "WCAG 2.1 compliance basics" },
  resource:     { id: "resourceBot",     name: "Resources",        icon: "📦", desc: "Asset sizes & bundle analysis" },
  auth:         { id: "authBot",         name: "Auth",             icon: "🔑", desc: "Authentication endpoint security" },
  console:      { id: "consoleBot",      name: "Console Errors",   icon: "🖥️", desc: "JS console errors & warnings" },
  geo:          { id: "geoBot",          name: "Geo / CDN",        icon: "🗺️", desc: "Geographic routing & CDN edge" },
};

// Map severity to status
function severityToStatus(issues) {
  if (!issues || issues.length === 0) return "pass";
  const hasCriticalOrHigh = issues.some(i => i.severity === "CRITICAL" || i.severity === "HIGH");
  return hasCriticalOrHigh ? "fail" : "warn";
}

// Map real bot report to frontend format
function mapBotResult(botKey, botStat, issues) {
  const meta = BOT_META[botKey] || { id: botKey + "Bot", name: botKey, icon: "🤖", desc: "" };
  const myIssues = (issues || []).filter(i => i.bot === botKey);
  const status = botStat?.status === "OK" ? "pass" : severityToStatus(myIssues);

  // Build user-friendly messages
  let message = `All ${meta.name} checks passed`;
  let issueText = null;
  let impactText = null;
  let fixSteps = null;

  if (myIssues.length > 0) {
    const top = myIssues[0];
    message = top.message;
    issueText = `Issue type: ${top.type}. ${top.message}`;
    impactText = `Severity: ${top.severity}. This may impact your site's performance or security.`;
    fixSteps = [top.fix || "Review and address this issue"];

    // Extra context per issue type
    if (top.type === "CSP_MISSING") {
      issueText = "Content-Security-Policy header is missing. Your site is vulnerable to XSS attacks.";
      impactText = "High security risk — attackers can inject malicious scripts into your pages.";
      fixSteps = [
        "Add `Content-Security-Policy: default-src 'self'` to your HTTP response headers.",
        "In Nginx: `add_header Content-Security-Policy \"default-src 'self'\";`",
        "In Express: use the `helmet` package — `app.use(helmet())`.",
        "Test your CSP at https://csp-evaluator.withgoogle.com/",
      ];
    } else if (top.type === "XFRAME_MISSING") {
      issueText = "X-Frame-Options header is missing. Site can be embedded in iframes (clickjacking risk).";
      impactText = "Medium risk — attackers could trick users into clicking hidden elements.";
      fixSteps = [
        "Add `X-Frame-Options: DENY` or `SAMEORIGIN` to your response headers.",
        "In Nginx: `add_header X-Frame-Options DENY;`",
        "In Express: use `helmet.frameguard({ action: 'deny' })`.",
      ];
    } else if (top.type === "NO_CACHE") {
      issueText = "Cache-Control header is missing. Assets are not being cached by browsers or CDNs.";
      impactText = "Performance impact — every visit re-downloads all assets, increasing load time.";
      fixSteps = [
        "Add `Cache-Control: public, max-age=31536000, immutable` for versioned static assets.",
        "For HTML: `Cache-Control: no-cache` is correct — allows CDN revalidation.",
        "In Nginx: `expires 1y; add_header Cache-Control \"public, immutable\";`",
      ];
    } else if (top.type === "SLOW_RESPONSE" || top.type === "HIGH_LATENCY") {
      issueText = `Response time is ${top.message}. This is above the recommended threshold.`;
      impactText = "Users experience slow page loads. This can increase bounce rates significantly.";
      fixSteps = [
        "Enable a CDN (Cloudflare, CloudFront) to serve content closer to users.",
        "Enable compression (gzip/brotli) on your server.",
        "Profile slow database queries and add caching using Redis/Memcached.",
        "Check for N+1 query problems in your backend ORM.",
      ];
    } else if (top.type === "TOO_MANY_SCRIPTS") {
      issueText = `Too many scripts detected: ${top.message}. This increases parse time.`;
      impactText = "JavaScript parse time slows initial page load — especially on mobile devices.";
      fixSteps = [
        "Use code splitting to load JavaScript only when needed: `import()`.",
        "Bundle and minify scripts — use Webpack, Vite, or esbuild.",
        "Defer non-critical scripts with the `defer` or `async` attribute.",
      ];
    } else if (top.type === "LARGE_PAGE") {
      issueText = `Page size is ${top.message}. This is larger than recommended.`;
      impactText = "Large page size slows download times, especially on mobile and slow connections.";
      fixSteps = [
        "Enable gzip/brotli compression on your web server.",
        "Minify HTML, CSS, and JavaScript files.",
        "Remove unused code with tree-shaking in your bundler.",
      ];
    } else if (top.type === "NO_TITLE") {
      issueText = "Missing <title> tag. Search engines cannot properly index your page.";
      impactText = "Poor SEO — site won't appear in search results without a title tag.";
      fixSteps = [
        "Add `<title>Your Page Title</title>` inside the <head> of every page.",
        "Add `<meta name=\"description\" content=\"...\">` — keep it 150–160 chars.",
        "Submit your sitemap to Google Search Console.",
      ];
    } else if (top.type === "NO_ALT") {
      issueText = "Images are missing alt text attributes. Screen readers cannot describe them.";
      impactText = "WCAG Level A violation — site may be unusable for visually impaired users.";
      fixSteps = [
        "Add `alt` attribute to every `<img>` — descriptive for meaningful images, `alt=\"\"` for decorative.",
        "Run axe DevTools browser extension for a full accessibility audit.",
        "Fix color contrast ratio — ensure 4.5:1 for normal text.",
      ];
    } else if (top.type === "NO_SSL") {
      issueText = "HTTPS is not being used. Connection is unencrypted.";
      impactText = "Critical — data transmitted is vulnerable to interception. Browsers show warnings.";
      fixSteps = [
        "Enable SSL using Let's Encrypt: run `certbot --nginx -d yourdomain.com`.",
        "Redirect all HTTP traffic to HTTPS in your server config.",
        "Add HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.",
      ];
    }
  }

  return {
    ...meta,
    status,
    message,
    issue: issueText,
    impact: impactText,
    fix: fixSteps,
    score: botStat?.score ?? (status === "pass" ? 100 : status === "warn" ? 70 : 40),
    issueCount: myIssues.length,
  };
}

// ─────────────────────────────────────────────
// 🚀 REAL SCAN ENDPOINT
// ─────────────────────────────────────────────
app.post("/api/scan", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // Dynamically import runner modules (ESM)
    const [
      { default: baselineAnalyzer },
      { default: decisionEngine },
      { default: trendAnalyzer },
      { saveReport },
      { default: networkBot },
      { default: dnsBot },
      { default: headersBot },
      { default: performanceBot },
      { default: uptimeBot },
      { default: seoBot },
      { default: latencyBot },
      { default: resourceBot },
      { default: accessibilityBot },
      { default: cachingBot },
      { default: apiBot },
      { default: sslBot },
      { default: consoleBot },
      { default: geoBot },
      { default: authBot },
    ] = await Promise.all([
      import("./engine/baselineAnalyzer.js"),
      import("./engine/decisionEngine.js"),
      import("./engine/trendAnalyzer.js"),
      import("./engine/reportManager.js"),
      import("./bots/networkBot.js"),
      import("./bots/dnsBot.js"),
      import("./bots/headersBot.js"),
      import("./bots/performanceBot.js"),
      import("./bots/uptimeBot.js"),
      import("./bots/seoBot.js"),
      import("./bots/latencyBot.js"),
      import("./bots/resourceBot.js"),
      import("./bots/accessibilityBot.js"),
      import("./bots/cachingBot.js"),
      import("./bots/apiBot.js"),
      import("./bots/sslBot.js"),
      import("./bots/consoleBot.js"),
      import("./bots/geoBot.js"),
      import("./bots/authBot.js"),
    ]);

    // 1. Baseline analysis
    const baseline = await baselineAnalyzer(url);

    // 2. Run all bots (with timeout protection)
    const withTimeout = (promise, ms = 10000, fallback) =>
      Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
      ]);

    const [
      netResult, dnsResult, headResult, perfResult, uptResult,
      seoResult, latResult, resResult, accResult, cacheResult,
      apiResult, sslResult, conResult, geoResult, authResult,
    ] = await Promise.all([
      withTimeout(networkBot(url, baseline),      10000, { bot: "network",       status: "OK", metrics: {}, issues: [] }),
      withTimeout(dnsBot(url, baseline),          8000,  { bot: "dns",           status: "OK", metrics: {}, issues: [] }),
      withTimeout(headersBot(url, baseline),      10000, { bot: "security",      status: "OK", metrics: {}, issues: [] }),
      withTimeout(performanceBot(url, baseline),  15000, { bot: "performance",   status: "OK", metrics: {}, issues: [] }),
      withTimeout(uptimeBot(url, baseline),       10000, { bot: "uptime",        status: "OK", metrics: {}, issues: [] }),
      withTimeout(seoBot(url, baseline),          10000, { bot: "seo",           status: "OK", metrics: {}, issues: [] }),
      withTimeout(latencyBot(url, baseline),      10000, { bot: "latency",       status: "OK", metrics: {}, issues: [] }),
      withTimeout(resourceBot(url, baseline),     15000, { bot: "resource",      status: "OK", metrics: {}, issues: [] }),
      withTimeout(accessibilityBot(url, baseline),10000, { bot: "accessibility", status: "OK", metrics: {}, issues: [] }),
      withTimeout(cachingBot(url, baseline),      10000, { bot: "cache",         status: "OK", metrics: {}, issues: [] }),
      withTimeout(apiBot(url, baseline),          10000, { bot: "api",           status: "OK", metrics: {}, issues: [] }),
      withTimeout(sslBot(url, baseline),          5000,  { bot: "ssl",           status: "OK", metrics: {}, issues: [] }),
      withTimeout(consoleBot(url, baseline),      5000,  { bot: "console",       status: "OK", metrics: {}, issues: [] }),
      withTimeout(geoBot(url, baseline),          5000,  { bot: "geo",           status: "OK", metrics: {}, issues: [] }),
      withTimeout(authBot(url, baseline),         5000,  { bot: "auth",          status: "OK", metrics: {}, issues: [] }),
    ]);

    const rawResults = [
      netResult, dnsResult, headResult, perfResult, uptResult,
      seoResult, latResult, resResult, accResult, cacheResult,
      apiResult, sslResult, conResult, geoResult, authResult,
    ];

    // 3. Decision engine
    const decision = decisionEngine(rawResults, baseline);

    // 4. Trend analysis
    const trend = trendAnalyzer({ timestamp: new Date().toISOString(), decision });

    // 5. Save report
    saveReport({ url, baseline, results: rawResults, decision, trend, ai: {} });

    // 6. Build per-bot stats (like old JSON format)
    const botStats = {};
    for (const r of rawResults) {
      const botScore = r.issues.length === 0 ? 100 : Math.max(0, 100 - r.issues.reduce((acc, i) => {
        const penalties = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 };
        return acc + (penalties[i.severity] || 5);
      }, 0));
      botStats[r.bot] = {
        status: r.status,
        score: Math.round(botScore),
        issues: r.issues.length,
      };
    }

    // Collect all issues
    const allIssues = rawResults.flatMap(r => r.issues);

    // 7. Map to frontend format
    const frontendBots = [
      mapBotResult("network",      botStats.network,       allIssues),
      mapBotResult("security",     botStats.security,      allIssues),
      mapBotResult("ssl",          botStats.ssl,           allIssues),
      mapBotResult("dns",          botStats.dns,           allIssues),
      mapBotResult("performance",  botStats.performance,   allIssues),
      mapBotResult("latency",      botStats.latency,       allIssues),
      mapBotResult("uptime",       botStats.uptime,        allIssues),
      mapBotResult("api",          botStats.api,           allIssues),
      mapBotResult("seo",          botStats.seo,           allIssues),
      mapBotResult("cache",        botStats.cache,         allIssues),
      mapBotResult("accessibility",botStats.accessibility, allIssues),
      mapBotResult("resource",     botStats.resource,      allIssues),
      mapBotResult("auth",         botStats.auth,          allIssues),
      mapBotResult("console",      botStats.console,       allIssues),
      mapBotResult("geo",          botStats.geo,           allIssues),
    ];

    res.json({
      success: true,
      url,
      baseline,
      decision,
      trend,
      bots: frontendBots,
      allIssues,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: err.message || "Scan failed" });
  }
});

// 📡 SAVE RUM DATA
app.post("/api/rum", (req, res) => {
  const data = req.body;
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(RUM_PATH, "utf-8")); } catch {}
  existing.push(data);
  fs.writeFileSync(RUM_PATH, JSON.stringify(existing, null, 2));
  res.json({ status: "saved" });
});

// 📊 GET RUM DATA
app.get("/api/rum", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(RUM_PATH, "utf-8"));
    res.json(data);
  } catch {
    res.json([]);
  }
});

// 🧠 LOCAL FALLBACK
function localExplain(message) {
  if (!message) return "Unknown error";
  if (message.includes("ReferenceError")) {
    return `Issue: A function or variable is not defined.\n\nFix: Define the function before using it.\n\nExample:\nfunction undefinedFunction() {\n  console.log("Now defined");\n}`;
  }
  if (message.includes("TypeError")) {
    return `Issue: Invalid operation on undefined or null.\n\nFix: Check variable before using it.\n\nExample:\nif (obj) obj.method();`;
  }
  return "General JavaScript error. Check code structure.";
}

// 🔁 AI CALL WITH RETRY
async function callAI(message, retries = 2) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: `Error: ${message}\n\nExplain:\n1. What it means\n2. Why it happens\n3. How to fix\n4. Example fix code` }],
      }),
    });
    const data = await response.json();
    if (!data?.choices) throw new Error("Invalid AI response");
    return data.choices[0].message.content;
  } catch (err) {
    if (retries > 0) return callAI(message, retries - 1);
    return null;
  }
}

// 🧠 FINAL AI ROUTE
app.post("/api/ai-explain", async (req, res) => {
  const { message } = req.body;
  if (aiCache[message]) return res.json({ explanation: aiCache[message], fix: aiCache[message] });
  let explanation = await callAI(message);
  if (!explanation) explanation = localExplain(message);
  aiCache[message] = explanation;
  res.json({ explanation, fix: explanation });
});

app.listen(5000, () => {
  console.log("🚀 FaultPulse server running on http://localhost:5000");
});