import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from './ui/Toaster'
import { useStore } from '@/store/useStore'

export function Layout() {
  const sidebarAberta = useStore((s) => s.sidebarAberta)
  const toggleSidebar = useStore((s) => s.toggleSidebar)

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Backdrop para mobile */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => toggleSidebar(false)}
        />
      )}
      
      <Sidebar />
      
      <main className="flex-1 min-w-0 flex flex-col relative">
        <Outlet />
      </main>
      
      <Toaster />
    </div>
  )
}
