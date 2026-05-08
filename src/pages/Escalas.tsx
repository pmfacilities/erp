import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, Input, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { useStore } from '@/store/useStore'
import { Plus, ChevronLeft, ChevronRight, User } from 'lucide-react'

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getSemana(baseDate: Date) {
  const start = new Date(baseDate)
  const dia = start.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  start.setDate(start.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

const statusTone: Record<string, any> = {
  agendado: 'info', presente: 'success', falta: 'danger', coberto: 'warning',
}

export function Escalas() {
  const { escalas, funcionarios, contratos, addEscala, updateEscala, pushToast } = useStore()
  const [dataBase, setDataBase] = useState(new Date('2026-04-20'))
  const [filtroContrato, setFiltroContrato] = useState('todos')
  const [openNova, setOpenNova] = useState<string | null>(null) // YYYY-MM-DD

  const semana = useMemo(() => getSemana(dataBase), [dataBase])

  const escalasSemana = useMemo(() => {
    const ini = semana[0].toISOString().slice(0, 10)
    const fim = semana[6].toISOString().slice(0, 10)
    return escalas.filter((e) => {
      const c = filtroContrato === 'todos' || e.contratoId === filtroContrato
      return c && e.data >= ini && e.data <= fim
    })
  }, [escalas, semana, filtroContrato])

  const mover = (dias: number) => {
    const d = new Date(dataBase)
    d.setDate(d.getDate() + dias)
    setDataBase(d)
  }

  return (
    <>
      <Header title="Escalas" subtitle="Planejamento semanal de turnos" />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap gap-3 items-center">
            <Button variant="outline" size="icon" onClick={() => mover(-7)}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="font-semibold text-slate-900 min-w-[220px] text-center">
              {semana[0].toLocaleDateString('pt-BR')} — {semana[6].toLocaleDateString('pt-BR')}
            </div>
            <Button variant="outline" size="icon" onClick={() => mover(7)}><ChevronRight className="h-4 w-4" /></Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <Select value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} className="w-auto">
              <option value="todos">Todos os contratos</option>
              {contratos.filter((c) => c.status === 'ativo').map((c) => (
                <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>
              ))}
            </Select>
            <div className="flex-1" />
            <Button onClick={() => setOpenNova(semana[0].toISOString().slice(0, 10))}>
              <Plus className="h-4 w-4" /> Alocar turno
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {semana.map((d, i) => (
              <div key={i} className="p-3 border-r border-slate-200 last:border-r-0 text-center bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase">{diasSemana[i]}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {d.getDate().toString().padStart(2, '0')}/{(d.getMonth() + 1).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {semana.map((d, i) => {
              const dia = d.toISOString().slice(0, 10)
              const turnos = escalasSemana.filter((e) => e.data === dia)
              return (
                <div key={i} className="border-r border-slate-200 last:border-r-0 p-2 space-y-2 min-h-full">
                  {turnos.map((t) => {
                    const func = funcionarios.find((f) => f.id === t.funcionarioId)
                    return (
                      <div
                        key={t.id}
                        className="bg-white border border-slate-200 rounded-lg p-2 text-xs hover:shadow-sm cursor-pointer"
                        onClick={() => {
                          const next = t.status === 'agendado' ? 'presente' : t.status === 'presente' ? 'falta' : t.status === 'falta' ? 'coberto' : 'agendado'
                          updateEscala(t.id, { status: next })
                          pushToast({ titulo: 'Status atualizado', descricao: `${func?.nome} → ${next}`, tipo: 'info' })
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[11px] text-slate-600">{t.inicio}-{t.fim}</span>
                          <Badge tone={statusTone[t.status]} className="text-[10px] py-0 px-1.5">{t.status}</Badge>
                        </div>
                        <div className="flex items-start gap-1 mt-1">
                          <User className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-slate-800 line-clamp-1">{func?.nome}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{t.postoNome}</div>
                      </div>
                    )
                  })}
                  <button
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded border border-dashed border-slate-200"
                    onClick={() => setOpenNova(dia)}
                  >
                    + alocar
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <NovaEscalaDialog
        open={!!openNova} data={openNova || ''} onClose={() => setOpenNova(null)}
        onSave={(t) => {
          addEscala(t)
          pushToast({ titulo: 'Turno alocado', tipo: 'success' })
          setOpenNova(null)
        }}
      />
    </>
  )
}

function NovaEscalaDialog({
  open, data, onClose, onSave,
}: {
  open: boolean; data: string; onClose: () => void
  onSave: (t: { data: string; funcionarioId: string; postoNome: string; contratoId?: string; servicoAvulsoId?: string; inicio: string; fim: string; status: 'agendado' }) => void
}) {
  const { funcionarios, contratos, servicosAvulsos } = useStore()
  const [form, setForm] = useState({ funcionarioId: '', contratoId: '', servicoAvulsoId: '', postoNome: '', inicio: '06:00', fim: '14:00' })

  const contratoSel = contratos.find((c) => c.id === form.contratoId)

  return (
    <Dialog
      open={open} onClose={onClose} title="Alocar turno" description={`Data: ${data ? new Date(data + 'T00:00').toLocaleDateString('pt-BR') : ''}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!form.funcionarioId || (!form.contratoId && !form.servicoAvulsoId)) return
              onSave({ 
                data, 
                funcionarioId: form.funcionarioId,
                postoNome: form.postoNome || (form.servicoAvulsoId ? 'Serviço Avulso' : ''),
                contratoId: form.contratoId || undefined,
                servicoAvulsoId: form.servicoAvulsoId || undefined,
                inicio: form.inicio,
                fim: form.fim,
                status: 'agendado' 
              })
            }}
            disabled={!form.funcionarioId || (!form.contratoId && !form.servicoAvulsoId)}
          >
            Alocar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>Vincular a Contrato</Label>
          <Select value={form.contratoId} onChange={(e) => setForm((f) => ({ ...f, contratoId: e.target.value, servicoAvulsoId: '', postoNome: '' }))}>
            <option value="">Selecione um contrato...</option>
            {contratos.filter((c) => c.status === 'ativo').map((c) => (
              <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">ou</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div>
          <Label>Vincular a Serviço Avulso</Label>
          <Select value={form.servicoAvulsoId} onChange={(e) => setForm((f) => ({ ...f, servicoAvulsoId: e.target.value, contratoId: '', postoNome: 'Serviço Avulso' }))}>
            <option value="">Selecione um serviço avulso...</option>
            {servicosAvulsos.map((s) => (
              <option key={s.id} value={s.id}>{s.numero || 'S/N'} — {s.cliente}</option>
            ))}
          </Select>
        </div>
        {contratoSel && (
          <div>
            <Label required>Posto</Label>
            <Select value={form.postoNome} onChange={(e) => setForm((f) => ({ ...f, postoNome: e.target.value }))}>
              <option value="">Selecione...</option>
              {contratoSel.postos.map((p) => (
                <option key={p.nome} value={p.nome}>{p.nome} ({p.funcao})</option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label required>Funcionário</Label>
          <Select value={form.funcionarioId} onChange={(e) => setForm((f) => ({ ...f, funcionarioId: e.target.value }))}>
            <option value="">Selecione...</option>
            {funcionarios.filter((f) => f.status === 'ativo' || f.status === 'avulso').map((f) => (
              <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Início</Label>
            <Input type="time" value={form.inicio} onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))} />
          </div>
          <div>
            <Label>Fim</Label>
            <Input type="time" value={form.fim} onChange={(e) => setForm((f) => ({ ...f, fim: e.target.value }))} />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
