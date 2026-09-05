import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const assetData = [
  { name: 'Cash', value: 25000 },
  { name: 'Bank', value: 45000 },
  { name: 'Accounts Receivable', value: 12000 },
  { name: 'Inventory', value: 8000 },
];

const liabilityData = [
  { name: 'Accounts Payable', value: 15000 },
  { name: 'Short-term Loans', value: 5000 },
];

const equityData = [
  { name: 'Owner Capital', value: 60000 },
  { name: 'Retained Earnings', value: 10000 },
];

const COLORS_ASSETS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const COLORS_LIAB = ['#d84c4c', '#e67373'];

export default function BalanceSheet() {
  const totalAssets = assetData.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = liabilityData.reduce((acc, curr) => acc + curr.value, 0);
  const totalEquity = equityData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Balance Sheet</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Assets</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">${totalAssets.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Liabilities</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">${totalLiabilities.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Equity</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">${totalEquity.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Breakdown */}
        <div className="bg-white p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4 w-full text-left">Assets Breakdown</h2>
          <PieChart width={400} height={300}>
            <Pie data={assetData} cx={200} cy={150} outerRadius={100} fill="#8884d8" dataKey="value" label>
              {assetData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_ASSETS[index % COLORS_ASSETS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
          </PieChart>
        </div>

        {/* Liabilities Breakdown */}
        <div className="bg-white p-6 rounded shadow flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4 w-full text-left">Liabilities Breakdown</h2>
          <PieChart width={400} height={300}>
            <Pie data={liabilityData} cx={200} cy={150} innerRadius={50} outerRadius={100} fill="#82ca9d" dataKey="value">
              {liabilityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_LIAB[index % COLORS_LIAB.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
