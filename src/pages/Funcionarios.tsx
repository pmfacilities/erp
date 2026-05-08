import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import type { Funcionario } from '@/data/mockData'
import { TURNOS_OPCOES, STATUS_OPCOES } from '@/data/mockData'

const statusTone: Record<string, any> = {
  ativo: 'success', avulso: 'brand', ferias: 'info', afastado: 'warning', desligado: 'neutral',
}
const turnoLabel = (v: string) => TURNOS_OPCOES.find((t) => t.value === v)?.label || v
const statusLabel = (v: string) => STATUS_OPCOES.find((s) => s.value === v)?.label || v

export function Funcionarios() {
  const { funcionarios, contratos, addFuncionario, updateFuncionario, removeFuncionario, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Funcionario | null>(null)

  const filtrados = useMemo(() =>
    funcionarios.filter((f) => {
      const b = [f.nome, f.cpf, f.cargo].some((v) => v.toLowerCase().includes(busca.toLowerCase()))
      const s = filtroStatus === 'todos' || f.status === filtroStatus
      return b && s
    }), [funcionarios, busca, filtroStatus],
  )

  const stats = {
    ativos: funcionarios.filter((f) => f.status === 'ativo').length,
    ferias: funcionarios.filter((f) => f.status === 'ferias').length,
    afastados: funcionarios.filter((f) => f.status === 'afastado').length,
    desligados: funcionarios.filter((f) => f.status === 'desligado').length,
  }

  return (
    <>
      <Header title="Funcionários" subtitle={`${funcionarios.length} cadastrados · ${stats.ativos} ativos`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.ativos}</div>
            <div className="text-xs text-slate-600">Ativos</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-sky-600">{stats.ferias}</div>
            <div className="text-xs text-slate-600">Em férias</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.afastados}</div>
            <div className="text-xs text-slate-600">Afastados</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-slate-500">{stats.desligados}</div>
            <div className="text-xs text-slate-600">Desligados</div>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar por nome, CPF ou cargo..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-44">
              <option value="todos">Todos</option>
              {STATUS_OPCOES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Button onClick={() => { setEdit(null); setOpen(true) }}>
              <Plus className="h-4 w-4" /> Novo funcionário
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtrados.length === 0 ? (
            <EmptyState title="Nenhum funcionário encontrado" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Nome</TH>
                  <TH>CPF</TH>
                  <TH>Cargo</TH>
                  <TH>Contrato / Posto</TH>
                  <TH>Turno</TH>
                  <TH>Salário</TH>
                  <TH>ASO</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtrados.map((f) => {
                  const ct = contratos.find((c) => c.id === f.contratoId)
                  const hoje = new Date('2026-04-23')
                  const asoDate = new Date(f.asoValidade)
                  const diasAso = Math.ceil((asoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <TR key={f.id}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold flex items-center justify-center text-xs">
                            {f.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="font-medium text-slate-900">{f.nome}</div>
                        </div>
                      </TD>
                      <TD className="text-xs font-mono">{f.cpf}</TD>
                      <TD>{f.cargo}</TD>
                      <TD className="text-xs">
                        <div className="font-medium text-slate-900">{ct?.numero || '—'}</div>
                        <div className="text-slate-500">{f.postoNome || '—'}</div>
                      </TD>
                      <TD className="text-xs">{turnoLabel(f.turno)}</TD>
                      <TD className="text-sm">{formatBRL(f.salario)}</TD>
                      <TD className="text-xs">
                        <div className={diasAso < 30 ? 'text-red-600 font-semibold' : diasAso < 60 ? 'text-amber-600' : 'text-slate-600'}>
                          {formatDate(f.asoValidade)}
                        </div>
                        <div className="text-[10px] text-slate-500">{diasAso > 0 ? `em ${diasAso}d` : 'vencido'}</div>
                      </TD>
                      <TD><Badge tone={statusTone[f.status]}>{f.status}</Badge></TD>
                      <TD className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => { setEdit(f); setOpen(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => {
                            if (confirm(`Remover ${f.nome}?`)) {
                              removeFuncionario(f.id)
                              pushToast({ titulo: 'Funcionário removido', tipo: 'success' })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <FuncionarioDialog
        open={open} onClose={() => setOpen(false)} funcionario={edit}
        onSave={(data) => {
          if (edit) {
            updateFuncionario(edit.id, data)
            pushToast({ titulo: 'Funcionário atualizado', tipo: 'success' })
          } else {
            addFuncionario(data)
            pushToast({ titulo: 'Funcionário cadastrado', tipo: 'success' })
          }
          setOpen(false)
        }}
      />
    </>
  )
}

function FuncionarioDialog({
  open, onClose, funcionario, onSave,
}: {
  open: boolean; onClose: () => void; funcionario: Funcionario | null
  onSave: (f: Omit<Funcionario, 'id'>) => void
}) {
  const { contratos } = useStore()
  const [form, setForm] = useState<Omit<Funcionario, 'id'>>(() =>
    funcionario || {
      nome: '', cpf: '', cargo: '', turno: 'manha', salario: 1570,
      admissao: '2026-05-01', status: 'ativo', telefone: '', asoValidade: '2027-05-01',
    },
  )

  useMemo(() => {
    setForm(
      funcionario || {
        nome: '', cpf: '', cargo: '', turno: 'manha', salario: 1570,
        admissao: '2026-05-01', status: 'ativo', telefone: '', asoValidade: '2027-05-01',
      },
    )
  }, [funcionario, open])

  const set = <K extends keyof Omit<Funcionario, 'id'>>(k: K, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const contratoSel = contratos.find((c) => c.id === form.contratoId)

  return (
    <Dialog
      open={open} onClose={onClose}
      title={funcionario ? 'Editar funcionário' : 'Novo funcionário'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} disabled={!form.nome || !form.cpf}>Salvar</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label required>Nome completo</Label>
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} />
        </div>
        <div>
          <Label required>CPF</Label>
          <Input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
        </div>
        <div>
          <Label required>Cargo</Label>
          <Input value={form.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Ex: Aux. Limpeza" />
        </div>
        <div>
          <Label>Turno</Label>
          <Select value={form.turno} onChange={(e) => set('turno', e.target.value)}>
            {TURNOS_OPCOES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
        <div>
          <Label>Contrato</Label>
          <Select value={form.contratoId || ''} onChange={(e) => set('contratoId', e.target.value || undefined)}>
            <option value="">— sem alocação —</option>
            {contratos.filter((c) => c.status === 'ativo').map((c) => (
              <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Posto</Label>
          <Select value={form.postoNome || ''} onChange={(e) => set('postoNome', e.target.value || undefined)}>
            <option value="">—</option>
            {contratoSel?.postos.map((p) => <option key={p.nome}>{p.nome}</option>)}
          </Select>
        </div>
        <div>
          <Label>Salário</Label>
          <Input type="number" value={form.salario} onChange={(e) => set('salario', Number(e.target.value))} />
        </div>
        <div>
          <Label>Admissão</Label>
          <Input type="date" value={form.admissao} onChange={(e) => set('admissao', e.target.value)} />
        </div>
        <div>
          <Label>ASO válido até</Label>
          <Input type="date" value={form.asoValidade} onChange={(e) => set('asoValidade', e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUS_OPCOES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </div>
    </Dialog>
  )
}
