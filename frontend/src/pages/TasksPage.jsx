import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../services/api'


export default function TasksPage(){
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignee, setAssignee] = useState('')
  const [users, setUsers] = useState([])

  const load = ()=> api.get('/tasks/').then(r=>setTasks(r.data))
  useEffect(()=>{
    load()
    api.get('/users/manage/').then(r=>setUsers(r.data)).catch(()=>{})
  },[])

  const createTask = async (e)=>{
    e.preventDefault()
    await api.post('/tasks/', {task_title:title, task_desc:desc, assigned_to: assignee})
    setTitle(''); setDesc(''); setAssignee(''); load()
  }
  const updateStatus = async (id, status)=>{
    const t = tasks.find(x=>x.id===id)
    await api.put(`/tasks/${id}/`, {...t, status})
    load()
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <Sidebar/>
      <div className="flex flex-col">
        <Topbar/>
        <main className="p-4">
          <form onSubmit={createTask} className="bg-white p-4 rounded-2xl border shadow-sm mb-4 grid md:grid-cols-4 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
            <input className="border rounded px-2 py-1" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)}/>
            <select className="border rounded px-2 py-1" value={assignee} onChange={e=>setAssignee(e.target.value)}>
              <option value="">Assign to</option>
              {users.map(u=> <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <button className="bg-black text-white rounded px-3">Create</button>
          </form>

          <div className="grid md:grid-cols-3 gap-3">
            {tasks.map(t=> (
              <div key={t.id} className="bg-white border rounded-2xl p-3">
                <div className="font-semibold">{t.task_title}</div>
                <div className="text-sm text-gray-500">{t.task_desc}</div>
                <div className="text-xs mt-2">Status: <span className="px-2 py-0.5 rounded border">{t.status}</span></div>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>updateStatus(t.id,'pending')} className="px-2 py-1 border rounded">Pending</button>
                  <button onClick={()=>updateStatus(t.id,'in_progress')} className="px-2 py-1 border rounded">In Progress</button>
                  <button onClick={()=>updateStatus(t.id,'completed')} className="px-2 py-1 border rounded">Completed</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
