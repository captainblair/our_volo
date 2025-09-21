import React from 'react'; 
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../services/api'
import { useEffect, useState } from 'react'

export default function AdminPage(){
  const [logs, setLogs] = useState([])
  useEffect(()=>{ api.get('/adminpanel/logs/').then(r=>setLogs(r.data)).catch(()=>{}) },[])
  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <Sidebar/>
      <div className="flex flex-col">
        <Topbar/>
        <main className="p-4">
          <div className="bg-white border rounded-2xl p-3">
            <h2 className="font-semibold mb-2">Audit Logs</h2>
            <div className="divide-y">
              {logs.map(l=>(
                <div key={l.id} className="py-2 text-sm"><span className="text-gray-500">{new Date(l.timestamp).toLocaleString()}</span> — {l.action} — {l.user_email}</div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
