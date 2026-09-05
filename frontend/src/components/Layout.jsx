import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Box, BookOpen, FileText } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Urban Furniture</h1>
          <p className="text-sm text-gray-500">Accounting System</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/contacts" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <Users size={20} /> Contacts
          </Link>
          <Link to="/products" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <Box size={20} /> Products
          </Link>
          <Link to="/accounting" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <BookOpen size={20} /> Accounting
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
            <FileText size={20} /> Reports
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
