import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Wrench, CalendarDays, UserCog,
  DollarSign, Package, AlertTriangle, BarChart3, Settings, Building2,
  Receipt, Zap, Briefcase, FileUser, Trophy, Lock, Shield, PiggyBank, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, PerfilSessao } from '@/store/useStore'

interface Item {
  to: string
  label: string
  icon: any
  permite: PerfilSessao[]
  destaque?: 'privado'
}

interface Section { titulo: string; itens: Item[]; soPara?: PerfilSessao[] }

const TODOS: PerfilSessao[] = ['socio_gestor', 'socio', 'gerente']
const SO_SOCIOS: PerfilSessao[] = ['socio_gestor', 'socio']
const SO_GESTOR: PerfilSessao[] = ['socio_gestor']

const sections: Section[] = [
  {
    titulo: 'Visão geral',
    itens: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, permite: TODOS }],
  },
  {
    titulo: '🔒 Sala dos Sócios',
    soPara: SO_SOCIOS,
    itens: [
      { to: '/socios', label: 'Sala dos Sócios', icon: Shield, permite: SO_GESTOR, destaque: 'privado' },
      { to: '/socios/painel', label: 'Painel do Sócio', icon: PiggyBank, permite: SO_SOCIOS, destaque: 'privado' },
      { to: '/socios/despesas', label: 'Despesas dos sócios', icon: Receipt, permite: SO_SOCIOS, destaque: 'privado' },
      { to: '/socios/pagamentos', label: 'Pagamentos avulsos', icon: DollarSign, permite: SO_SOCIOS, destaque: 'privado' },
    ],
  },
  {
    titulo: 'Comercial',
    itens: [
      { to: '/contratos', label: 'Contratos', icon: FileText, permite: TODOS },
      { to: '/clientes', label: 'Clientes', icon: Users, permite: TODOS },
      { to: '/servicos-avulsos', label: 'Serviços Avulsos', icon: Zap, permite: TODOS },
      { to: '/prestadores', label: 'Prestadores', icon: Briefcase, permite: TODOS },
      { to: '/concorrentes', label: 'Propostas Concorrentes', icon: Trophy, permite: TODOS },
    ],
  },
  {
    titulo: 'Operação',
    itens: [
      { to: '/operacional', label: 'Operacional', icon: Wrench, permite: TODOS },
      { to: '/escalas', label: 'Escalas', icon: CalendarDays, permite: TODOS },
      { to: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle, permite: TODOS },
      { to: '/estoque', label: 'Estoque', icon: Package, permite: TODOS },
    ],
  },
  {
    titulo: 'Pessoas',
    itens: [
      { to: '/funcionarios', label: 'Funcionários', icon: UserCog, permite: TODOS },
      { to: '/curriculos', label: 'Currículos', icon: FileUser, permite: TODOS },
    ],
  },
  {
    titulo: 'Financeiro',
    itens: [
      { to: '/financeiro', label: 'Contas a pagar/receber', icon: DollarSign, permite: TODOS },
    ],
  },
  {
    titulo: 'Gestão',
    itens: [
      { to: '/relatorios', label: 'Relatórios (BI)', icon: BarChart3, permite: TODOS },
      { to: '/configuracoes', label: 'Configurações', icon: Settings, permite: TODOS },
    ],
  },
]

const perfilLabelCurto: Record<PerfilSessao, string> = {
  socio_gestor: 'Sócio Admin',
  socio: 'Sócio',
  gerente: 'Admin',
}

export function Sidebar() {
  const sessao = useStore((s) => s.sessao)
  const logout = useStore((s) => s.logout)
  const perfil = sessao?.perfil || 'gerente'

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-semibold">PSFM</div>
          <div className="text-xs text-slate-400">PS Facilities Manager</div>
        </div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        {sections
          .filter((sec) => !sec.soPara || sec.soPara.includes(perfil))
          .map((sec) => {
            const itensVisiveis = sec.itens.filter((it) => it.permite.includes(perfil))
            if (itensVisiveis.length === 0) return null
            const isPrivado = sec.titulo.includes('Sócios')
            return (
              <div key={sec.titulo} className="mb-4">
                <div className={`px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1 ${isPrivado ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isPrivado && <Lock className="h-3 w-3" />}
                  {sec.titulo}
                </div>
                <div className="space-y-0.5">
                  {itensVisiveis.map(({ to, label, icon: Icon, destaque }) => (
                    <NavLink
                      key={to} to={to} end={to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                          isActive
                            ? destaque === 'privado'
                              ? 'bg-emerald-600 text-white font-medium'
                              : 'bg-brand-600 text-white font-medium'
                            : destaque === 'privado'
                              ? 'text-emerald-200 hover:bg-emerald-900/40'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
      </nav>
      {/* Rodapé: usuário logado + logout sempre acessível */}
      {sessao && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5 p-2 rounded-lg">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 bg-gradient-to-br ${
              sessao.perfil === 'socio_gestor' ? 'from-emerald-500 to-emerald-700'
              : sessao.perfil === 'socio' ? 'from-brand-500 to-brand-700'
              : 'from-slate-500 to-slate-700'
            }`}>
              {sessao.avatarIniciais}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{sessao.nome}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{perfilLabelCurto[sessao.perfil]} · @{sessao.login}</div>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="h-8 w-8 rounded-lg hover:bg-red-600 flex items-center justify-center text-slate-400 hover:text-white flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 text-center">
            Versão 1.3.0 · MVP · © PS Facilities
          </div>
        </div>
      )}
    </aside>
  )
}
