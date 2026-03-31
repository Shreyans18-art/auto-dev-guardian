import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function aiAnalyzer({ baseline, results, decision, trend }) {

  const issues = results.flatMap(r => r.issues);

  // 🧠 Prepare compact input for AI
  const input = {
    baseline,
    decision,
    trend,
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
            content: "You are a senior DevOps engineer analyzing website health reports."
          },
          {
            role: "user",
            content: `
Analyze this system report and give:
1. Summary
2. Root cause
3. Recommendations
4. Risk level

Data:
${JSON.stringify(input, null, 2)}
`
          }
        ]
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || "AI analysis failed";

    return {
      explanation: text
    };

  } catch (err) {

    return {
      explanation: "AI service unavailable",
      error: err.message
    };
  }
}