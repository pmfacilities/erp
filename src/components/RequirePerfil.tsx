import { ReactNode } from 'react'
import { useStore, PerfilSessao } from '@/store/useStore'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  perfisPermitidos: PerfilSessao[]
  children: ReactNode
}

export function RequirePerfil({ perfisPermitidos, children }: Props) {
  const sessao = useStore((s) => s.sessao)
  const navigate = useNavigate()

  if (sessao && perfisPermitidos.includes(sessao.perfil)) return <>{children}</>

  return (
    <div className="p-6">
      <Card>
        <CardContent className="py-16 text-center max-w-lg mx-auto">
          <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <div className="text-xl font-semibold text-slate-900 mb-1">Acesso restrito</div>
          <div className="text-sm text-slate-600 mb-4">
            Esta área contém informações confidenciais reservadas aos <strong>sócios da PS Facilities</strong>. Seu perfil
            atual{sessao && <> (<Badge>{sessao.perfil.replace('_', ' ')}</Badge>)</>} não possui permissão para acessá-la.
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono">{children}</span>
}
