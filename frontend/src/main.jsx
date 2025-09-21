import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TasksPage from './pages/TasksPage'
import MessagingPage from './pages/MessagingPage'
import AdminPage from './pages/AdminPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TasksPage/></PrivateRoute>} />
        <Route path="/messaging" element={<PrivateRoute><MessagingPage/></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage/></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

createRoot(document.getElementById('root')).render(<App/>)
