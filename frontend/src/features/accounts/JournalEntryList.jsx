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

  // P5: O(1) account lookup map instead of O(n) .find() per line
  const accountMap = {};
  accounts.forEach(a => { accountMap[a.id] = a; });

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
              <div key={entry.id} className="surface overflow-hidden border border-slate-200/80 dark:border-amber-500/15">
                <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-3.5 flex justify-between items-center dark:border-amber-500/15 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-400 text-sm tracking-wide">{entry.entry_number}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-200 font-medium">{entry.reference || 'General Transaction'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border dark:border-emerald-500/30">
                      ✓ Balanced & Posted
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800/60">
                    <thead className="bg-slate-100/75 dark:bg-slate-900/90">
                      <tr>
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-amber-400/80">Account</th>
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-amber-400/80">Description</th>
                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-amber-400/80">Debit (₹)</th>
                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-amber-400/80">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900/40">
                      {entry.lines?.map((line, idx) => {
                        const acc = accountMap[line.account_id];
                        const accLabel = acc ? `${acc.code} - ${acc.name}` : `Account #${line.account_id}`;

                        return (
                          <tr key={idx} className="transition-colors hover:bg-amber-50/40 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{accLabel}</td>
                            <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">{line.description || '-'}</td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-bold text-slate-900 dark:text-emerald-400">
                              {line.debit > 0 ? `₹${Number(line.debit).toFixed(2)}` : <span className="text-slate-300 dark:text-slate-600 font-normal">-</span>}
                            </td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-bold text-slate-900 dark:text-amber-400">
                              {line.credit > 0 ? `₹${Number(line.credit).toFixed(2)}` : <span className="text-slate-300 dark:text-slate-600 font-normal">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-slate-200/80 bg-slate-50/90 font-bold text-sm dark:border-slate-700/80 dark:bg-slate-800/70">
                        <td colSpan="2" className="px-6 py-3 text-right text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Total:</td>
                        <td className="px-6 py-3 text-right font-mono text-blue-600 dark:text-blue-400">₹{entryDebit.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-mono text-blue-600 dark:text-blue-400">₹{entryCredit.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Journal Entry Modal with Live Balance Validation */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="surface max-w-2xl w-full p-6 shadow-2xl my-8 dark:bg-slate-900 dark:border dark:border-amber-500/20">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Create Balanced Journal Entry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Every entry must satisfy the fundamental double-entry rule: <strong>Total Debits = Total Credits</strong>.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">Journal</label>
                  <select
                    value={selectedJournal}
                    onChange={(e) => setSelectedJournal(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.name} ({j.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">Reference / Memo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-end Depreciation"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-2">Entry Lines</label>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="col-span-5">
                        <select
                          value={line.account_id}
                          onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                          className="w-full text-xs p-1.5 border rounded dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                          className="w-full text-xs p-1.5 border rounded text-right dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Credit"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          className="w-full text-xs p-1.5 border rounded text-right dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-red-500 hover:text-red-400 font-bold"
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
                  className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  + Add Line
                </button>
              </div>

              {/* Balance Indicator Bar */}
              <div className={`p-3 rounded-lg border flex justify-between items-center ${
                isBalanced 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-500/40 dark:text-emerald-300' 
                  : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-300'
              }`}>
                <div className="text-xs font-semibold">
                  {isBalanced ? '✓ Balanced: Ready to Post' : '⚠️ Unbalanced: Debits must equal Credits'}
                </div>
                <div className="text-sm font-bold flex gap-4">
                  <span>Debits: ₹{totalDebit.toFixed(2)}</span>
                  <span>Credits: ₹{totalCredit.toFixed(2)}</span>
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