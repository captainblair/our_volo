import React, { useState, useEffect, useCallback } from "react";
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import api from '../services/api'
import useNotifications from '../hooks/useNotifications'

export default function MessagingPage(){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const load = ()=> api.get('/messaging/department/').then(r=>setMessages(r.data))
  useEffect(()=>{ load() },[])

  useNotifications(useCallback(()=>{ load() },[]))

  const send = async (e)=>{
    e.preventDefault()
    await api.post('/messaging/department/', {message_body: text})
    setText(''); load()
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <Sidebar/>
      <div className="flex flex-col">
        <Topbar/>
        <main className="p-4 space-y-3">
          <div className="bg-white border rounded-2xl p-3 h-[70vh] overflow-y-auto">
            {messages.map(m=>(
              <div key={m.id} className="mb-2">
                <div className="text-sm"><span className="font-semibold">{m.sender}</span> <span className="text-gray-500">{new Date(m.timestamp).toLocaleString()}</span></div>
                <div>{m.message_body}</div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2">
            <input className="flex-1 border rounded px-3 py-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message to your department..." />
            <button className="px-4 bg-black text-white rounded">Send</button>
          </form>
        </main>
      </div>
    </div>
  )
}
