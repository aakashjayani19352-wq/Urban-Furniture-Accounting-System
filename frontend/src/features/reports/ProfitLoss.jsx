export default function ProfitLoss() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Profit & Loss (P&L)</h2>
      <div className="p-4 border rounded bg-gray-50 text-gray-600">
        <p>Income minus purchases/expenses to show net profit. (TODO: GET /api/reports/profit-loss)</p>
      </div>
    </div>
  );
}