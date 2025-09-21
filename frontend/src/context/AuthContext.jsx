import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const Ctx = createContext(null)

export function AuthProvider({children}){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(()=>{
    if(token){
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/users/me/').then(res=>setUser(res.data)).catch(()=>logout())
    }
  },[token])

  const login = async (email, password) => {
    const res = await api.post('/auth/token/', {username: email, password})
    const tk = res.data.access
    setToken(tk)
    localStorage.setItem('token', tk)
  }
  const logout = ()=>{
    setToken(null); setUser(null); localStorage.removeItem('token')
  }
  return <Ctx.Provider value={{token,user,login,logout}}>{children}</Ctx.Provider>
}
export const useAuth = ()=> useContext(Ctx)
