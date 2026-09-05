import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { useAuth } from '../auth/AuthContext';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    setLoading(true);
    const res = await apiClient.get('/contacts');
    setContacts(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete contact "${name}"?`)) {
      try {
        await apiClient.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) {
        alert(err.message || 'Failed to delete contact');
      }
    }
  };

  const filtered = contacts.filter(c => {
    if (filterType === 'all') return true;
    return c.type?.toLowerCase() === filterType.toLowerCase() || c.type?.toLowerCase() === 'both';
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Contact Master Data</h1>
          <p className="page-subtitle">Directory of customers, suppliers/vendors, and business partners.</p>
        </div>
        <Link to="/contacts/new" className="primary-button">+ Add Contact</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'customer', 'vendor'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
              filterType === type ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Contacts' : `${type}s`}
          </button>
        ))}
      </div>

      <div className="surface">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Location</th>
                {user?.role === 'admin' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    {loading ? 'Loading contacts...' : 'No contacts found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr key={contact.id}>
                    <td className="font-semibold text-slate-900">{contact.name}</td>
                    <td>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        contact.type?.toLowerCase() === 'vendor' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="text-slate-600">{contact.email || '-'}</td>
                    <td className="text-slate-600">{contact.mobile || '-'}</td>
                    <td className="text-slate-500 text-xs">
                      {contact.city ? `${contact.city}, ${contact.state || ''}` : '-'}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(contact.id, contact.name)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
