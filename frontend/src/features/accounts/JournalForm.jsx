import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JournalForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => navigate('/journals'), 1500);
  };

  return (
    <div className="bg-white p-6 rounded shadow relative">
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-t mb-4">
          ✅ Journal saved successfully! Redirecting...
        </div>
      )}
      <h2 className="text-xl font-bold mb-4 mt-2">Add Journal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Journal Name *</label>
          <input required className="border p-2 w-full" placeholder="e.g., Bank Journal" />
        </div>
        <div>
          <label className="block">Type</label>
          <select className="border p-2 w-full">
            <option>Sale</option>
            <option>Purchase</option>
            <option>Cash</option>
            <option>Bank</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}