import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function TrendChart({ trend }) {

  const history = trend.history || [];

  const data = {
    labels: history.map((_, i) => `Run ${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: history.map(h => h.score),
        fill: false
      }
    ]
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h2 className="text-xl mb-2">Trend</h2>
      <Line data={data} />
    </div>
  );
}