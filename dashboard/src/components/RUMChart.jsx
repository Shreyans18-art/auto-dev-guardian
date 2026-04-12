import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

export default function RUMChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/rum`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const perf = data.filter(d => d.type === "performance");

  const chartData = {
    labels: perf.map((_, i) => i + 1),
    datasets: [
      {
        label: "Load Time",
        data: perf.map(d => d.loadTime || 0)
      }
    ]
  };

  return (
    <div className="card">
      <h2 className="title">📊 Performance</h2>

      {perf.length === 0 ? (
        <p>No data yet</p>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}