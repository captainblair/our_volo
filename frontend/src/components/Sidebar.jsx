import { Link, useLocation } from 'react-router-dom'
export default function Sidebar(){
  const { pathname } = useLocation()
  const link = (to, label) => (
    <Link className={`block px-4 py-2 rounded hover:bg-gray-100 ${pathname===to?'bg-gray-200':''}`} to={to}>{label}</Link>
  )
  return (
    <aside className="w-64 p-4 border-r bg-white h-screen hidden md:block">
      <h2 className="text-xl font-semibold mb-4">Volo Africa</h2>
      <nav className="space-y-2">
        {link('/','Dashboard')}
        {link('/tasks','Tasks')}
        {link('/messaging','Messaging')}
        {link('/admin','Admin')}
      </nav>
    </aside>
  )
}
