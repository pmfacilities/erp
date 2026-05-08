import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Search, Trash2, Pencil, Trophy, TrendingDown, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import type { PropostaConcorrente } from '@/data/mockExtras'

const vencedoraTone: Record<string, any> = {
  ps_facilities: 'success', concorrente: 'danger', em_andamento: 'warning', cancelada: 'neutral',
}
const vencedoraLabel: Record<string, string> = {
  ps_facilities: 'PS Facilities', concorrente: 'Concorrente', em_andamento: 'Em andamento', cancelada: 'Cancelada',
}

export function Concorrentes() {
  const { concorrentes, addConcorrente, updateConcorrente, removeConcorrente, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroVenc, setFiltroVenc] = useState('todas')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<PropostaConcorrente | null>(null)

  const filtrados = useMemo(() =>
    concorrentes
      .filter((c) => filtroVenc === 'todas' || c.vencedora === filtroVenc)
      .filter((c) => [c.empresa, c.contratoDisputado, c.cliente].some((v) => v.toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => b.dataProposta.localeCompare(a.dataProposta)),
    [concorrentes, busca, filtroVenc],
  )

  const stats = useMemo(() => {
    const ganhas = concorrentes.filter((c) => c.vencedora === 'ps_facilities').length
    const perdidas = concorrentes.filter((c) => c.vencedora === 'concorrente').length
    const pendentes = concorrentes.filter((c) => c.vencedora === 'em_andamento').length
    const total = ganhas + perdidas
    const taxaSucesso = total > 0 ? (ganhas / total) * 100 : 0
    return { ganhas, perdidas, pendentes, taxaSucesso }
  }, [concorrentes])

  const distribuicaoEmpresas = useMemo(() => {
    const m: Record<string, { empresa: string; total: number; ganhas: number; perdidas: number }> = {}
    concorrentes.forEach((c) => {
      m[c.empresa] = m[c.empresa] || { empresa: c.empresa, total: 0, ganhas: 0, perdidas: 0 }
      m[c.empresa].total++
      if (c.vencedora === 'ps_facilities') m[c.empresa].ganhas++
      if (c.vencedora === 'concorrente') m[c.empresa].perdidas++
    })
    return Object.values(m).sort((a, b) => b.total - a.total)
  }, [concorrentes])

  return (
    <>
      <Header title="Propostas de concorrentes" subtitle={`${concorrentes.length} propostas mapeadas — benchmark de mercado`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Ganhas pela PSF</div><div className="text-2xl font-bold text-emerald-600">{stats.ganhas}</div></div><Trophy className="h-5 w-5 text-emerald-500" /></CardContent></Card>
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Perdidas</div><div className="text-2xl font-bold text-red-600">{stats.perdidas}</div></div><TrendingDown className="h-5 w-5 text-red-500" /></CardContent></Card>
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Em andamento</div><div className="text-2xl font-bold text-amber-600">{stats.pendentes}</div></div><Clock className="h-5 w-5 text-amber-500" /></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Taxa de sucesso</div><div className="text-2xl font-bold text-brand-600">{stats.taxaSucesso.toFixed(1)}%</div><div className="text-xs text-slate-500 mt-0.5">{stats.ganhas}/{stats.ganhas + stats.perdidas}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Concorrentes mais frequentes</CardTitle>
            <CardDescription>Empresas que mais disputam contratos com a PSF</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribuicaoEmpresas} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="empresa" stroke="#64748b" fontSize={11} width={180} />
                <Tooltip />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {distribuicaoEmpresas.map((d, i) => <Cell key={i} fill={d.ganhas > d.perdidas ? '#10b981' : '#f59e0b'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Empresa, contrato, cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroVenc} onChange={(e) => setFiltroVenc(e.target.value)} className="md:w-52">
              <option value="todas">Todas as propostas</option>
              <option value="ps_facilities">Ganhas pela PSF</option>
              <option value="concorrente">Perdidas</option>
              <option value="em_andamento">Em andamento</option>
              <option value="cancelada">Canceladas</option>
            </Select>
            <Button onClick={() => { setEdit(null); setOpen(true) }}><Plus className="h-4 w-4" /> Nova proposta</Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtrados.length === 0 ? (
            <EmptyState title="Nenhuma proposta encontrada" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Empresa concorrente</TH>
                  <TH>Contrato disputado</TH>
                  <TH>Cliente</TH>
                  <TH>Data</TH>
                  <TH>Valor mensal</TH>
                  <TH>Resultado</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtrados.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="font-medium text-slate-900">{c.empresa}</div>
                      {c.cnpj && <div className="text-xs text-slate-500 font-mono">{c.cnpj}</div>}
                    </TD>
                    <TD>
                      <div className="font-medium text-slate-900 line-clamp-1">{c.contratoDisputado}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{c.escopo}</div>
                    </TD>
                    <TD className="text-sm">{c.cliente}</TD>
                    <TD className="whitespace-nowrap text-xs">{formatDate(c.dataProposta)}</TD>
                    <TD className="font-semibold whitespace-nowrap">{formatBRL(c.valorMensal)}</TD>
                    <TD><Badge tone={vencedoraTone[c.vencedora]}>{vencedoraLabel[c.vencedora]}</Badge></TD>
                    <TD className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => { setEdit(c); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm(`Remover proposta de ${c.empresa}?`)) { removeConcorrente(c.id); pushToast({ titulo: 'Removida', tipo: 'success' }) }
                      }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <ConcorrenteDialog
        open={open} onClose={() => setOpen(false)} proposta={edit}
        onSave={(data) => {
          if (edit) { updateConcorrente(edit.id, data); pushToast({ titulo: 'Atualizada', tipo: 'success' }) }
          else { addConcorrente(data); pushToast({ titulo: 'Proposta cadastrada', tipo: 'success' }) }
          setOpen(false)
        }}
      />
    </>
  )
}

function ConcorrenteDialog({
  open, onClose, proposta, onSave,
}: {
  open: boolean; onClose: () => void; proposta: PropostaConcorrente | null
  onSave: (p: Omit<PropostaConcorrente, 'id'>) => void
}) {
  const [f, setF] = useState<Omit<PropostaConcorrente, 'id'>>(() => proposta || {
    empresa: '', contratoDisputado: '', cliente: '',
    dataProposta: new Date().toISOString().slice(0, 10),
    valorMensal: 0, escopo: '', vencedora: 'em_andamento',
  })
  useMemo(() => setF(proposta || {
    empresa: '', contratoDisputado: '', cliente: '',
    dataProposta: new Date().toISOString().slice(0, 10),
    valorMensal: 0, escopo: '', vencedora: 'em_andamento',
  }), [proposta, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <Dialog open={open} onClose={onClose} title={proposta ? 'Editar proposta' : 'Nova proposta concorrente'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.empresa || !f.contratoDisputado}>Salvar</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><Label required>Empresa concorrente</Label><Input value={f.empresa} onChange={(e) => set('empresa', e.target.value)} /></div>
        <div><Label>CNPJ</Label><Input value={f.cnpj || ''} onChange={(e) => set('cnpj', e.target.value || undefined)} placeholder="00.000.000/0001-00" /></div>
        <div className="col-span-2"><Label required>Contrato disputado / licitação</Label><Input value={f.contratoDisputado} onChange={(e) => set('contratoDisputado', e.target.value)} /></div>
        <div className="col-span-2"><Label required>Cliente</Label><Input value={f.cliente} onChange={(e) => set('cliente', e.target.value)} /></div>
        <div><Label>Data da proposta</Label><Input type="date" value={f.dataProposta} onChange={(e) => set('dataProposta', e.target.value)} /></div>
        <div><Label>Valor mensal (R$)</Label><Input type="number" step="0.01" value={f.valorMensal} onChange={(e) => set('valorMensal', Number(e.target.value))} /></div>
        <div className="col-span-2"><Label>Escopo apresentado</Label><Textarea rows={2} value={f.escopo} onChange={(e) => set('escopo', e.target.value)} /></div>
        <div>
          <Label>Resultado</Label>
          <Select value={f.vencedora} onChange={(e) => set('vencedora', e.target.value)}>
            <option value="ps_facilities">Ganha pela PS Facilities</option>
            <option value="concorrente">Perdida (ganha pelo concorrente)</option>
            <option value="em_andamento">Em andamento</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </div>
        <div className="col-span-2"><Label>Observações</Label><Textarea rows={2} value={f.observacao || ''} onChange={(e) => set('observacao', e.target.value)} /></div>
      </div>
    </Dialog>
  )
}
