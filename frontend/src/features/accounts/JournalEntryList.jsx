export default function JournalEntryList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Journal Entries</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6 text-gray-500">
        <p>Accounting records (Debits & Credits) linked to transactions will appear here. (TODO: GET /api/journal-entries)</p>
      </div>
    </div>
  );
}