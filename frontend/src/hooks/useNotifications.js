import React from 'react'; 
import { useEffect } from 'react'

export default function useNotifications(onMessage){
  useEffect(()=>{
    const ws = new WebSocket('ws://localhost:8000/ws/notifications/')
    ws.onmessage = (e)=>{
      try{ onMessage(JSON.parse(e.data)) }catch{}
    }
    return ()=> ws.close()
  },[onMessage])
}
