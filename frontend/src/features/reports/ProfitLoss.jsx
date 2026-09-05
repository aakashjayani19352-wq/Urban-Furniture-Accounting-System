import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const incomeData = [
  { name: 'Sales Revenue', value: 15000 },
  { name: 'Service Revenue', value: 3000 },
];

const expenseData = [
  { name: 'Cost of Goods Sold', value: 6000 },
  { name: 'Rent', value: 2000 },
  { name: 'Salaries', value: 4500 },
  { name: 'Utilities', value: 500 },
];

const monthlyData = [
  { month: 'Jan', Income: 4000, Expenses: 2400 },
  { month: 'Feb', Income: 3000, Expenses: 1398 },
  { month: 'Mar', Income: 11000, Expenses: 9200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ProfitLoss() {
  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpenses = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Statement</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Income</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Net Profit</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">${netProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="bg-white p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4 w-full text-left">Expenses Breakdown</h2>
          <PieChart width={400} height={300}>
            <Pie data={expenseData} cx={200} cy={150} innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
          </PieChart>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4 w-full text-left">Income vs Expenses (Q1)</h2>
          <BarChart width={400} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar dataKey="Income" fill="#00C49F" />
            <Bar dataKey="Expenses" fill="#FF8042" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
