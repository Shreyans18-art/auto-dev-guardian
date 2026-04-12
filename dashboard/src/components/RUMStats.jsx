import { useEffect, useState } from "react";
import axios from "axios";

export default function RUMStats() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/rum`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const errors = data.filter(d => d.type === "error");
  const perf = data.filter(d => d.type === "performance");

  const avgLoad =
    perf.length > 0
      ? Math.round(
          perf.reduce((sum, d) => sum + (d.loadTime || 0), 0) /
            perf.length
        )
      : 0;

  const anomalies = perf.filter(d => d.anomaly).length;

  return (
    <div className="card">
      <h2 className="title">🌍 RUM Insights</h2>

      <p>Total Events: {data.length}</p>
      <p>Errors: {errors.length}</p>
      <p>Avg Load Time: {avgLoad} ms</p>
      <p>Anomalies: {anomalies}</p>
    </div>
  );
}