import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RUM_PATH = path.resolve("./reports/rum.json");

// 🧠 CACHE (VERY IMPORTANT)
const aiCache = {};

// ensure folder
if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

// 📡 SAVE RUM DATA
app.post("/api/rum", (req, res) => {
  const data = req.body;

  let existing = [];

  try {
    existing = JSON.parse(fs.readFileSync(RUM_PATH, "utf-8"));
  } catch {}

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

// 🧠 LOCAL FALLBACK (ALWAYS WORKS)
function localExplain(message) {
  if (!message) return "Unknown error";

  if (message.includes("ReferenceError")) {
    return `
Issue: A function or variable is not defined.

Why:
JavaScript cannot find the function you are trying to call.

Fix:
Define the function before using it.

Example:
function undefinedFunction() {
  console.log("Now defined");
}
`;
  }

  if (message.includes("TypeError")) {
    return `
Issue: Invalid operation on undefined or null.

Fix:
Check variable before using it.

Example:
if (obj) obj.method();
`;
  }

  return "General JavaScript error. Check code structure.";
}

// 🔁 AI CALL WITH RETRY
async function callAI(message, retries = 2) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: `
Error: ${message}

Explain:
1. What it means
2. Why it happens
3. How to fix
4. Example fix code
`
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data?.choices) throw new Error("Invalid AI response");

    return data.choices[0].message.content;

  } catch (err) {
    if (retries > 0) {
      return callAI(message, retries - 1);
    }
    return null;
  }
}

// 🧠 FINAL AI ROUTE
app.post("/api/ai-explain", async (req, res) => {
  const { message } = req.body;

  // 🔥 CACHE HIT
  if (aiCache[message]) {
    return res.json({
      explanation: aiCache[message],
      fix: aiCache[message]
    });
  }

  // 🔥 TRY AI
  let explanation = await callAI(message);

  // 🔥 FALLBACK
  if (!explanation) {
    explanation = localExplain(message);
  }

  // 🔥 SAVE TO CACHE
  aiCache[message] = explanation;

  res.json({
    explanation,
    fix: explanation
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});