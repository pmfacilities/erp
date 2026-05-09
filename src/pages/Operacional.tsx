import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { useStore } from '@/store/useStore'
import { formatDateTime, formatDate } from '@/lib/utils'
import {
  CheckCircle2, Circle, Play, Pause, Clock, MapPin, User, PlayCircle,
  CheckSquare, Plus, Pencil, Trash2, Layers, Users as UsersIcon, Calendar,
} from 'lucide-react'
import type { OrdemServico } from '@/data/mockData'

const statusTone: Record<string, any> = {
  pendente: 'neutral', em_execucao: 'info', concluido: 'success', atrasado: 'danger',
}
const statusLabel: Record<string, string> = {
  pendente: 'Pendente', em_execucao: 'Em execução', concluido: 'Concluído', atrasado: 'Atrasado',
}

type Agrupamento = 'servico' | 'cliente' | 'data'

export function Operacional() {
  const { ordens, contratos, clientes } = useStore()
  const [agrupamento, setAgrupamento] = useState<Agrupamento>('servico')
  const [ordemAberta, setOrdemAberta] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('todos')

  const ordensFiltradas = filtro === 'todos' ? ordens : ordens.filter((o) => o.status === filtro)
  const ordemAtual = ordens.find((o) => o.id === ordemAberta)

  const stats = {
    pendente: ordens.filter((o) => o.status === 'pendente').length,
    em_execucao: ordens.filter((o) => o.status === 'em_execucao').length,
    concluido: ordens.filter((o) => o.status === 'concluido').length,
    atrasado: ordens.filter((o) => o.status === 'atrasado').length,
  }

  // Agrupamento das ordens
  const grupos = useMemo(() => {
    const map: Record<string, { chave: string; titulo: string; subtitulo: string; ordens: OrdemServico[] }> = {}
    ordensFiltradas.forEach((o) => {
      let chave = ''
      let titulo = ''
      let subtitulo = ''
      const ct = contratos.find((c) => c.id === o.contratoId)
      const cli = ct ? clientes.find((x) => x.id === ct.clienteId) : null

      if (agrupamento === 'servico') {
        chave = o.tipo
        titulo = o.tipo
        subtitulo = 'Tipo de serviço'
      } else if (agrupamento === 'cliente') {
        chave = cli?.id || 'sem-cliente'
        titulo = cli?.nomeFantasia || 'Cliente não identificado'
        subtitulo = ct?.titulo || ''
      } else {
        chave = o.inicio.slice(0, 10)
        titulo = formatDate(chave)
        subtitulo = new Date(chave + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long' })
      }

      if (!map[chave]) map[chave] = { chave, titulo, subtitulo, ordens: [] }
      map[chave].ordens.push(o)
    })
    return Object.values(map).sort((a, b) => agrupamento === 'data' ? a.chave.localeCompare(b.chave) : a.titulo.localeCompare(b.titulo))
  }, [ordensFiltradas, agrupamento, contratos, clientes])

  return (
    <>
      <Header title="Operacional" subtitle="Serviços em execução · agrupados por serviço, cliente ou data" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Pendentes" value={stats.pendente} color="bg-slate-100 text-slate-700" icon={<Clock className="h-4 w-4" />} active={filtro === 'pendente'} onClick={() => setFiltro(filtro === 'pendente' ? 'todos' : 'pendente')} />
          <StatCard label="Em execução" value={stats.em_execucao} color="bg-sky-100 text-sky-700" icon={<PlayCircle className="h-4 w-4" />} active={filtro === 'em_execucao'} onClick={() => setFiltro(filtro === 'em_execucao' ? 'todos' : 'em_execucao')} />
          <StatCard label="Concluídas" value={stats.concluido} color="bg-emerald-100 text-emerald-700" icon={<CheckSquare className="h-4 w-4" />} active={filtro === 'concluido'} onClick={() => setFiltro(filtro === 'concluido' ? 'todos' : 'concluido')} />
          <StatCard label="Atrasadas" value={stats.atrasado} color="bg-red-100 text-red-700" icon={<Clock className="h-4 w-4" />} active={filtro === 'atrasado'} onClick={() => setFiltro(filtro === 'atrasado' ? 'todos' : 'atrasado')} />
        </div>

        <Card className="p-1">
          <div className="flex">
            {([
              ['servico', 'Por Serviço', Layers],
              ['cliente', 'Por Cliente', UsersIcon],
              ['data', 'Por Data', Calendar],
            ] as const).map(([k, l, Ic]) => (
              <button key={k} onClick={() => setAgrupamento(k)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${agrupamento === k ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Ic className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {grupos.map((g) => (
            <div key={g.chave}>
              <div className="flex items-center justify-between mb-2 px-1">
                <div>
                  <div className="font-semibold text-slate-900 text-lg">{g.titulo}</div>
                  <div className="text-xs text-slate-500">{g.subtitulo}</div>
                </div>
                <Badge tone="neutral">{g.ordens.length} {g.ordens.length === 1 ? 'ordem' : 'ordens'}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.ordens.map((o) => {
                  const ct = contratos.find((c) => c.id === o.contratoId)
                  const feitos = o.checklist.filter((i) => i.feito).length
                  return (
                    <Card key={o.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOrdemAberta(o.id)}>
                      <CardContent>
                        <div className="flex items-start justify-between mb-2">
                          <Badge tone={statusTone[o.status]}>{statusLabel[o.status]}</Badge>
                          <div className="text-xs text-slate-500">OS #{o.id.slice(-4)}</div>
                        </div>
                        <div className="font-semibold text-slate-900">{o.tipo}</div>
                        <div className="text-sm text-slate-600 mt-1 line-clamp-2">{o.descricao}</div>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                          <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {ct?.titulo}</div>
                          <div className="flex items-center gap-2"><User className="h-3 w-3" /> {o.responsavel}</div>
                          <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {formatDateTime(o.inicio)}</div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-600">Checklist {feitos}/{o.checklist.length}</span>
                            <span className="font-semibold text-slate-900">{o.progresso}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${o.progresso === 100 ? 'bg-emerald-500' : o.status === 'atrasado' ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${o.progresso}%` }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
          {grupos.length === 0 && (
            <Card><CardContent className="py-16 text-center text-slate-500">Nenhuma ordem de serviço encontrada com esse filtro</CardContent></Card>
          )}
        </div>
      </div>

      <OrdemDialog ordem={ordemAtual || null} onClose={() => setOrdemAberta(null)} />
    </>
  )
}

function OrdemDialog({ ordem, onClose }: { ordem: OrdemServico | null; onClose: () => void }) {
  const { contratos, toggleChecklistItem, atualizarStatusOrdem, addChecklistItem, updateChecklistItem, removeChecklistItem, pushToast } = useStore()
  const [novoItem, setNovoItem] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editTexto, setEditTexto] = useState('')

  if (!ordem) return null
  const ct = contratos.find((c) => c.id === ordem.contratoId)

  return (
    <Dialog
      open onClose={onClose} size="lg"
      title={ordem.tipo} description={ct?.titulo}
      footer={
        <>
          {ordem.status === 'pendente' && (
            <Button variant="primary" onClick={() => { atualizarStatusOrdem(ordem.id, 'em_execucao'); pushToast({ titulo: 'Ordem iniciada', tipo: 'success' }) }}>
              <Play className="h-4 w-4" /> Iniciar execução
            </Button>
          )}
          {ordem.status === 'em_execucao' && ordem.progresso < 100 && (
            <Button variant="outline" onClick={() => { atualizarStatusOrdem(ordem.id, 'pendente'); pushToast({ titulo: 'Execução pausada', tipo: 'info' }) }}>
              <Pause className="h-4 w-4" /> Pausar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">{ordem.descricao}</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs text-slate-500">Responsável</div><div className="font-medium">{ordem.responsavel}</div></div>
          <div><div className="text-xs text-slate-500">Início</div><div className="font-medium">{formatDateTime(ordem.inicio)}</div></div>
          <div><div className="text-xs text-slate-500">Status</div><Badge tone={statusTone[ordem.status]}>{statusLabel[ordem.status]}</Badge></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Checklist ({ordem.progresso}%)</h4>
            <span className="text-xs text-slate-500">{ordem.checklist.filter((i) => i.feito).length}/{ordem.checklist.length} concluídos</span>
          </div>
          <div className="space-y-1.5">
            {ordem.checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 group">
                <button onClick={() => toggleChecklistItem(ordem.id, i)} className="flex-shrink-0">
                  {item.feito
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5 text-slate-300" />}
                </button>
                {editIdx === i ? (
                  <>
                    <Input value={editTexto} onChange={(e) => setEditTexto(e.target.value)} className="flex-1 h-8" autoFocus />
                    <Button size="sm" onClick={() => { updateChecklistItem(ordem.id, i, { item: editTexto }); setEditIdx(null); pushToast({ titulo: 'Item atualizado', tipo: 'success' }) }}>
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 text-sm ${item.feito ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.item}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                      <Button variant="ghost" size="sm" onClick={() => { setEditIdx(i); setEditTexto(item.item) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm(`Remover "${item.item}"?`)) {
                          removeChecklistItem(ordem.id, i)
                          pushToast({ titulo: 'Item removido', tipo: 'success' })
                        }
                      }}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Adicionar novo item ao checklist..."
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && novoItem.trim()) {
                  addChecklistItem(ordem.id, novoItem.trim())
                  setNovoItem('')
                  pushToast({ titulo: 'Item adicionado', tipo: 'success' })
                }
              }}
            />
            <Button
              onClick={() => {
                if (!novoItem.trim()) return
                addChecklistItem(ordem.id, novoItem.trim())
                setNovoItem('')
                pushToast({ titulo: 'Item adicionado', tipo: 'success' })
              }}
              disabled={!novoItem.trim()}
            >
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function StatCard({
  label, value, color, icon, active, onClick,
}: { label: string; value: number; color: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 text-left hover:shadow-md transition-all ${active ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-600 mt-0.5">{label}</div>
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </button>
  )
}
