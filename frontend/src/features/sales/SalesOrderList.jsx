import { Link } from 'react-router-dom';

export default function SalesOrderList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <Link to="/sales/new" className="bg-blue-600 text-white px-4 py-2 rounded">New SO</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of SOs will appear here. (TODO: GET /api/sales)</p>
      </div>
    </div>
  );
}\n