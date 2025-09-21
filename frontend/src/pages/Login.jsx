import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@volo.africa')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const submit = async (e)=>{
    e.preventDefault()
    try{ await login(email, password) }catch(err){ setError('Invalid credentials') }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="Email/Username" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-2 rounded">Login</button>
      </form>
    </div>
  )
}
