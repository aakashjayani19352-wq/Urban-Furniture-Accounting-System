import { Link } from 'react-router-dom';

export default function JournalList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Journals</h1>
        <Link to="/journals/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">New Journal</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 text-gray-500">
        <p>List of journals (Sales, Purchase, Bank, Cash) will appear here. (TODO: GET /api/journals)</p>
      </div>
    </div>
  );
}