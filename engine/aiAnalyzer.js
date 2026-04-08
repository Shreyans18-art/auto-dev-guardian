import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function aiAnalyzer({ baseline, results, decision, trend }) {

  const issues = results.flatMap(r => r.issues);

  const input = {
    systemType: baseline.type,
    complexity: baseline.complexity,
    score: decision.score,
    status: decision.status,
    trend: trend.direction,
    prediction: trend.prediction,
    issues: issues.map(i => ({
      type: i.type,
      severity: i.severity,
      message: i.message
    }))
  };

  try {

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are an advanced DevOps AI system.

Think like:
- Site Reliability Engineer
- Backend Performance Expert
- Security Analyst

Your job:
1. Identify root cause (not symptoms)
2. Detect failure chain (how issues connect)
3. Predict future failure
4. Suggest ONE priority fix
5. Give preventive actions

Be sharp, concise, and technical.
Return ONLY JSON.
`
          },
          {
            role: "user",
            content: `
Analyze this system:

${JSON.stringify(input, null, 2)}

Return JSON:

{
  "summary": "",
  "rootCause": "",
  "failureChain": [],
  "riskLevel": "",
  "prediction": "",
  "confidence": "",
  "priorityFix": "",
  "preventiveActions": []
}
`
          }
        ]
      })
    });

    const data = await response.json();

    let text = data.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        summary: text,
        rootCause: "Parsing failed",
        failureChain: [],
        riskLevel: "UNKNOWN",
        prediction: "Unavailable",
        confidence: "LOW",
        priorityFix: "Check logs manually",
        preventiveActions: []
      };
    }

    return parsed;

  } catch (err) {
    return {
      summary: "AI unavailable",
      rootCause: err.message,
      failureChain: [],
      riskLevel: "UNKNOWN",
      prediction: "Unavailable",
      confidence: "LOW",
      priorityFix: "Retry later",
      preventiveActions: []
    };
  }
}