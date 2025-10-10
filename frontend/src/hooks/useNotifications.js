import React from 'react'; 
import { useEffect } from 'react'

export default function useNotifications(onMessage){
  useEffect(()=>{
    // WebSocket disabled for now - backend not configured
    // TODO: Implement WebSocket server for real-time notifications
    console.log('WebSocket notifications disabled');
    
    // Use polling instead (every 30 seconds)
    const interval = setInterval(() => {
      if (onMessage) {
        onMessage({ type: 'poll' });
      }
    }, 30000);
    
    return () => clearInterval(interval);
  },[onMessage])
}
