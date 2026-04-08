export default function BotTable({ bots }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h2 className="text-xl mb-3">Bot Analysis</h2>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Bot</th>
            <th>Status</th>
            <th>Score</th>
            <th>Issues</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(bots).map(([name, bot]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{bot.status}</td>
              <td>{bot.score}</td>
              <td>{bot.issues}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}