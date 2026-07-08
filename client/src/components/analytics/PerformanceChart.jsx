import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function PerformanceChart({ data = [], mode = 'category' }) {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No performance records available yet.</p>;
  }

  const chartData = data.map((item) => ({
    label: mode === 'category' ? item.categoryName : item.difficulty,
    accuracy: item.averageAccuracy,
    points: item.averagePoints,
    attempts: item.attempts,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="accuracy" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="points" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
