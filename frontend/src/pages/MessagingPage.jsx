import React, { useState, useEffect, useCallback } from "react";
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
    if (!text.trim()) return;
    await api.post('/messaging/department/', {message_body: text})
    setText(''); 
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Department Messages</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 h-[calc(100vh-200px)] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map(m=>(
              <div key={m.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-medium text-gray-900">{m.sender}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(m.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{m.message_body}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={send} className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={text} 
              onChange={e=>setText(e.target.value)} 
              placeholder="Type a message to your department..." 
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={!text.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
