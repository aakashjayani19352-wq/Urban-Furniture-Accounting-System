import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Marketing', Planned: 4000, Actual: 2400 },
  { name: 'Operations', Planned: 3000, Actual: 1398 },
  { name: 'IT', Planned: 2000, Actual: 9800 },
];

export default function BudgetReport() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Budget Report</h2>
      {/* TODO: Fetch real data from GET /api/reports/budget */}
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Planned" fill="#8884d8" />
        <Bar dataKey="Actual" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}\n