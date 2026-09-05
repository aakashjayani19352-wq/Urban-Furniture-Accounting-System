import { Link } from 'react-router-dom';

export default function ContactList() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link to="/contacts/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Contact</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>List of contacts will appear here. (TODO: GET /api/contacts)</p>
      </div>
    </div>
  );
}