export default function SummaryCard({ summary }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">System Summary</h2>

      <p>Score: {summary.score}</p>
      <p>Status: {summary.status}</p>
      <p>Risk: {summary.risk}</p>
    </div>
  );
}