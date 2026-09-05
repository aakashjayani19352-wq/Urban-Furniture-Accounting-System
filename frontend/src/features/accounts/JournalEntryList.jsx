import { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

export default function JournalEntryList() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reference, setReference] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('');
  const [lines, setLines] = useState([
    { account_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', debit: 0, credit: 0, description: '' }
  ]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    const res = await apiClient.get('/transactions/journal-entries');
    setEntries(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
    apiClient.get('/accounts').then(res => {
      setAccounts(res.data || []);
      if (res.data?.length > 0) {
        setLines([
          { account_id: res.data[0].id, debit: 100, credit: 0, description: 'Debit leg' },
          { account_id: res.data[1]?.id || res.data[0].id, debit: 0, credit: 100, description: 'Credit leg' }
        ]);
      }
    });
    apiClient.get('/journals').then(res => {
      setJournals(res.data || []);
      if (res.data?.length > 0) setSelectedJournal(res.data[0].id);
    });
  }, []);

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) <= 0.01 && totalDebit > 0;

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { account_id: accounts[0]?.id || '', debit: 0, credit: 0, description: '' }]);
  };

  const removeLine = (idx) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      setErrorMsg('Double-entry violation: Total Debit must exactly equal Total Credit!');
      return;
    }
    setErrorMsg(null);
    try {
      await apiClient.post('/transactions/journal-entries', {
        journal_id: parseInt(selectedJournal) || 1,
        reference: reference || 'Manual General Journal Entry',
        lines: lines.map(l => ({
          account_id: parseInt(l.account_id),
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          description: l.description || reference
        }))
      });
      setSuccessMsg('Journal entry successfully posted and balanced!');
      setShowModal(false);
      fetchEntries();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post entry');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Double-Entry Journal Entries</h1>
          <p className="page-subtitle">Inspect the core general ledger with strict Debit = Credit audit trails.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="primary-button">
          + New Journal Entry
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          ✅ {successMsg}
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="surface p-8 text-center text-slate-400">
            {loading ? 'Loading journal entries...' : 'No journal entries found.'}
          </div>
        ) : (
          entries.map((entry) => {
            const entryDebit = entry.lines?.reduce((sum, l) => sum + (l.debit || 0), 0) || 0;
            const entryCredit = entry.lines?.reduce((sum, l) => sum + (l.credit || 0), 0) || 0;

            return (
              <div key={entry.id} className="surface overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 mr-3">{entry.entry_number}</span>
                    <span className="text-sm text-slate-600 font-medium">{entry.reference || 'General Transaction'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      ✓ Balanced & Posted
                    </span>
                  </div>
                </div>

                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Account</th>
                      <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                      <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Debit ($)</th>
                      <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entry.lines?.map((line, idx) => {
                      const acc = accounts.find(a => a.id === line.account_id);
                      const accLabel = acc ? `${acc.code} - ${acc.name}` : `Account #${line.account_id}`;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-2.5 text-sm font-medium text-slate-900">{accLabel}</td>
                          <td className="px-6 py-2.5 text-sm text-slate-500">{line.description || '-'}</td>
                          <td className="px-6 py-2.5 text-sm text-right font-semibold text-slate-800">
                            {line.debit > 0 ? `$${Number(line.debit).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-2.5 text-sm text-right font-semibold text-slate-800">
                            {line.credit > 0 ? `$${Number(line.credit).toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold text-sm">
                      <td colSpan="2" className="px-6 py-2.5 text-right text-slate-700">Total:</td>
                      <td className="px-6 py-2.5 text-right text-blue-600">${entryDebit.toFixed(2)}</td>
                      <td className="px-6 py-2.5 text-right text-blue-600">${entryCredit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      {/* New Journal Entry Modal with Live Balance Validation */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Balanced Journal Entry</h3>
            <p className="text-xs text-slate-500 mb-4">
              Every entry must satisfy the fundamental double-entry rule: <strong>Total Debits = Total Credits</strong>.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600">Journal</label>
                  <select
                    value={selectedJournal}
                    onChange={(e) => setSelectedJournal(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  >
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.name} ({j.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600">Reference / Memo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-end Depreciation"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Entry Lines</label>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border">
                      <div className="col-span-5">
                        <select
                          value={line.account_id}
                          onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                          className="w-full text-xs p-1.5 border rounded"
                        >
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Debit"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                          className="w-full text-xs p-1.5 border rounded text-right"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Credit"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          className="w-full text-xs p-1.5 border rounded text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLine}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  + Add Line
                </button>
              </div>

              {/* Balance Indicator Bar */}
              <div className={`p-3 rounded-lg border flex justify-between items-center ${
                isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}>
                <div className="text-xs font-semibold">
                  {isBalanced ? '✓ Balanced: Ready to Post' : '⚠️ Unbalanced: Debits must equal Credits'}
                </div>
                <div className="text-sm font-bold flex gap-4">
                  <span>Debits: ${totalDebit.toFixed(2)}</span>
                  <span>Credits: ${totalCredit.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`primary-button ${!isBalanced ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Post Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}