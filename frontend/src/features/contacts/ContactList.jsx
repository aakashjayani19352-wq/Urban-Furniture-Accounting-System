import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    apiClient.get('/api/contacts').then(res => setContacts(res.data));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="page-heading">Contacts</h1><p className="page-subtitle">Manage your customers and vendors.</p></div>
        <Link to="/contacts/new" className="primary-button">Add contact</Link>
      </div>
      <div className="surface"><div className="overflow-x-auto"><table className="data-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}><td className="font-medium text-slate-900">{contact.name}</td><td className="text-slate-500">{contact.email}</td><td>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.type === 'Vendor' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {contact.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
    </div>
  );
}
