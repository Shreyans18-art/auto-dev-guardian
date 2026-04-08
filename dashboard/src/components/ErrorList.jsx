import { useEffect, useState } from "react";
import axios from "axios";

export default function ErrorList() {
  const [errors, setErrors] = useState([]);
  const [aiMap, setAiMap] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:5000/api/rum");

        const errData = res.data.filter(d => d.type === "error");

        // 🔥 GROUP ERRORS
        const grouped = {};

        errData.forEach(err => {
          if (!grouped[err.message]) {
            grouped[err.message] = {
              count: 0,
              data: err
            };
          }
          grouped[err.message].count++;
        });

        const uniqueErrors = Object.values(grouped);

        // ✅ SET ERRORS IMMEDIATELY (no blocking)
        setErrors(uniqueErrors);

        // 🔥 FETCH AI IN BACKGROUND (non-blocking)
        uniqueErrors.forEach(async (item) => {
          try {
            const resAI = await axios.post(
              "http://localhost:5000/api/ai-explain",
              { message: item.data.message }
            );

            setAiMap(prev => ({
              ...prev,
              [item.data.message]: resAI.data
            }));

          } catch {
            setAiMap(prev => ({
              ...prev,
              [item.data.message]: {
                explanation: "AI failed",
                fix: ""
              }
            }));
          }
        });

      } catch (err) {
        console.error("Error fetching RUM data:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="card">
      <h2 className="title">🧠 AI Error Insights</h2>

      {errors.length === 0 && <p>No errors 🎉</p>}

      {errors.map((item, i) => {
        const ai = aiMap[item.data.message];

        return (
          <div key={i} style={{ marginBottom: "25px" }}>
            <p><strong>Error:</strong> {item.data.message}</p>
            <p><strong>Occurrences:</strong> {item.count}</p>

            {/* 🔥 TRACE INFO */}
            <p><strong>File:</strong> {item.data.source || "N/A"}</p>
            <p><strong>Line:</strong> {item.data.line || "N/A"}</p>
            <p><strong>Column:</strong> {item.data.col || "N/A"}</p>

            {/* 🧠 AI EXPLANATION */}
            <p>
              <strong>Explanation:</strong>{" "}
              {ai?.explanation || "Thinking... 🤔"}
            </p>

            {/* 🔧 FIX CODE */}
            <pre
              style={{
                background: "#020617",
                padding: "12px",
                borderRadius: "10px",
                overflowX: "auto",
                fontSize: "13px"
              }}
            >
              {ai?.fix || ""}
            </pre>

            {/* 🔍 STACK TRACE */}
            <details style={{ marginTop: "10px" }}>
              <summary style={{ cursor: "pointer" }}>
                View Stack Trace
              </summary>

              <pre
                style={{
                  background: "#020617",
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  marginTop: "5px"
                }}
              >
                {item.data.stack || "No stack available"}
              </pre>
            </details>

            <hr style={{ marginTop: "20px", opacity: 0.3 }} />
          </div>
        );
      })}
    </div>
  );
}