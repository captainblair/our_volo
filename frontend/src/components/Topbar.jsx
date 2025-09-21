import React from 'react'; 
import { useAuth } from '../context/AuthContext'
export default function Topbar(){
  const { user, logout } = useAuth()
  return (
    <header className="flex items-center justify-between p-3 border-b bg-white">
      <div className="md:hidden font-semibold">Volo Africa</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button onClick={logout} className="px-3 py-1 rounded border">Logout</button>
      </div>
    </header>
  )
}
