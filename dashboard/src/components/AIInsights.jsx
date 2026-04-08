export default function AIInsights({ ai }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl space-y-2">
      <h2 className="text-xl">AI Insights</h2>

      <p><strong>Summary:</strong> {ai.summary}</p>
      <p><strong>Root Cause:</strong> {ai.rootCause}</p>
      <p><strong>Prediction:</strong> {ai.prediction}</p>
      <p><strong>Priority Fix:</strong> {ai.priorityFix}</p>

      <p><strong>Failure Chain:</strong> {ai.failureChain?.join(" → ")}</p>
      <p><strong>Confidence:</strong> {ai.confidence}</p>
    </div>
  );
}