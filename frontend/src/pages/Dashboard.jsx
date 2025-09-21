import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard(){
  const [stats, setStats] = useState({tasks:0, pending:0, messages:0})
  useEffect(()=>{
    Promise.all([
      api.get('/tasks/'),
      api.get('/messaging/department/')
    ]).then(([t, m])=>{
      const tasks = t.data
      setStats({
        tasks: tasks.length,
        pending: tasks.filter(x=>x.status==='pending').length,
        messages: m.data.length
      })
    })
  },[])

  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <Sidebar/>
      <div className="flex flex-col">
        <Topbar/>
        <main className="p-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard title="My Dept Tasks" value={stats.tasks}/>
            <StatCard title="Pending Tasks" value={stats.pending}/>
            <StatCard title="Dept Messages" value={stats.messages}/>
          </div>
        </main>
      </div>
    </div>
  )
}
