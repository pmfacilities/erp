import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from './ui/Toaster'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
