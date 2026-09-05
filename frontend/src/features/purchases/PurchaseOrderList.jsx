import { Link } from 'react-router-dom';

export default function PurchaseOrderList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Link to="/purchases/new" className="bg-blue-600 text-white px-4 py-2 rounded">New PO</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of POs will appear here. (TODO: GET /api/purchases)</p>
      </div>
    </div>
  );
}\n