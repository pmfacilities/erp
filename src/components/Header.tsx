import { useState, useRef, useEffect } from 'react'
import { Bell, Search, HelpCircle, ChevronDown, LogOut, Lock, Shield, UserCog, Settings, Menu } from 'lucide-react'
import { useStore, PerfilSessao } from '@/store/useStore'
import { Link } from 'react-router-dom'

const perfilLabel: Record<PerfilSessao, string> = {
  socio_gestor: 'Sócio Administrador',
  socio: 'Sócio',
  gerente: 'Usuário administrativo',
}

const perfilIcon: Record<PerfilSessao, any> = {
  socio_gestor: Shield,
  socio: Lock,
  gerente: UserCog,
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const sessao = useStore((s) => s.sessao)
  const logout = useStore((s) => s.logout)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const alertas = useStore((s) => {
    const ocoAbertas = s.ocorrencias.filter((o) => o.status !== 'resolvida').length
    const finAtrasado = s.financeiro.filter((f) => f.status === 'atrasado').length
    const estoqueBaixo = s.estoque.filter((e) => e.quantidade < e.estoqueMinimo).length
    return ocoAbertas + finAtrasado + estoqueBaixo
  })
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Sem sessão → não renderiza header (auth gate vai redirecionar para login)
  if (!sessao) return null
  const Icon = perfilIcon[sessao.perfil]
  const nomeExibicao = sessao.nome
  const loginExibicao = sessao.login
  const perfilAtual = sessao.perfil
  const iniciais = sessao.avatarIniciais

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => toggleSidebar()}
          className="lg:hidden h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-semibold text-slate-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{title}</h1>
          {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden xs:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Buscar..."
            className="h-9 w-48 2xl:w-64 rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button className="relative h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Bell className="h-4 w-4" />
          {alertas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-semibold flex items-center justify-center">
              {alertas}
            </span>
          )}
        </button>
        <button className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 hidden sm:flex">
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1 pr-1 sm:pr-2 py-1 rounded-lg hover:bg-slate-50"
          >
            <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm bg-gradient-to-br ${
              perfilAtual === 'socio_gestor' ? 'from-emerald-500 to-emerald-700'
              : perfilAtual === 'socio' ? 'from-brand-500 to-brand-700'
              : 'from-slate-500 to-slate-700'
            }`}>
              {iniciais}
            </div>
            <div className="text-right hidden lg:block">
              <div className="text-sm font-medium text-slate-900 leading-tight">{nomeExibicao}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                <Icon className="h-3 w-3" /> {perfilLabel[perfilAtual]}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-64 sm:w-72 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="font-semibold text-sm text-slate-900">{nomeExibicao}</div>
                <div className="text-xs text-slate-500 mt-0.5">@{loginExibicao}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Icon className="h-3 w-3" /> {perfilLabel[perfilAtual]}
                </div>
              </div>
              <div className="py-1">
                <Link to="/configuracoes" onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Settings className="h-4 w-4" /> Configurações
                </Link>
                <button
                  onClick={() => { setOpen(false); logout() }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
