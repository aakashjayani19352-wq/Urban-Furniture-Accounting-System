import { Link } from 'react-router-dom';

export default function ProductList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of products will appear here. (TODO: GET /api/products)</p>
      </div>
    </div>
  );
}