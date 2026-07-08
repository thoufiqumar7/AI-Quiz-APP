import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AccuracyChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No recent performance data available yet.</p>;
  }

  const chartData = data.map((item, index) => ({
    attempt: `Q${index + 1}`,
    accuracy: item.accuracy,
    points: item.totalPoints,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
          <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="points" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
