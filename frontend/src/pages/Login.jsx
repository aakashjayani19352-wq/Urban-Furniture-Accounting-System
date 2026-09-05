import React from 'react'

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Urban Furniture</h2>
        <p className="text-gray-500 text-center mb-8">Sign in to your account</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" placeholder="Enter your username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition-shadow" placeholder="Enter your password" />
          </div>
          <button className="w-full bg-orange-500 text-white font-medium py-2 rounded-md hover:bg-orange-600 transition-colors shadow-sm">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
