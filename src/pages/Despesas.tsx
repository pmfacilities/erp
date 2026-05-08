import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Search, Trash2, CheckCircle2, Pencil } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import type { Despesa } from '@/data/mockExtras'
import { AcertoSociosCard } from '@/components/AcertoSociosCard'

const CATEGORIAS: Despesa['categoria'][] = ['Material de Limpeza', 'Ferramenta', 'Alimentação', 'Uniforme', 'Marca/Marketing', 'Transporte', 'Outros']
const SOCIOS = ['Jonathan da Silva', 'David Souza', 'Márcio Kerol', 'Junior Alamar']

const corCategoria: Record<string, string> = {
  'Material de Limpeza': '#1e4ef5',
  'Ferramenta': '#8b5cf6',
  'Alimentação': '#f59e0b',
  'Uniforme': '#06b6d4',
  'Marca/Marketing': '#ec4899',
  'Transporte': '#10b981',
  'Outros': '#64748b',
}

export function Despesas() {
  const { despesas, contratos, servicosAvulsos, addDespesa, removeDespesa, updateDespesa, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState('todas')
  const [filtroQuem, setFiltroQuem] = useState('todos')
  const [filtroData, setFiltroData] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Despesa | null>(null)

  const filtradas = useMemo(() =>
    despesas
      .filter((d) => filtroCat === 'todas' || d.categoria === filtroCat)
      .filter((d) => filtroQuem === 'todos' || d.quemComprou === filtroQuem)
      .filter((d) => !filtroData || d.data === filtroData)
      .filter((d) => [d.descricao, d.quemComprou].some((v) => v.toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => b.data.localeCompare(a.data)),
    [despesas, filtroCat, filtroQuem, filtroData, busca],
  )

  const totalGeral = despesas.reduce((a, d) => a + d.valor, 0)
  const totalFiltrado = filtradas.reduce((a, d) => a + d.valor, 0)

  const porCategoria = useMemo(() => {
    const m: Record<string, number> = {}
    despesas.forEach((d) => { m[d.categoria] = (m[d.categoria] || 0) + d.valor })
    return Object.entries(m).map(([categoria, valor]) => ({ categoria, valor }))
  }, [despesas])

  const porPessoa = useMemo(() => {
    const m: Record<string, number> = {}
    despesas.forEach((d) => { m[d.quemComprou] = (m[d.quemComprou] || 0) + d.valor })
    return Object.entries(m).map(([nome, valor]) => ({ nome, valor: +valor.toFixed(2) }))
  }, [despesas])

  const porDia = useMemo(() => {
    const m: Record<string, number> = {}
    despesas.forEach((d) => { m[d.data] = (m[d.data] || 0) + d.valor })
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([data, total]) => ({
      data: new Date(data + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: +total.toFixed(2),
    }))
  }, [despesas])

  return (
    <>
      <Header title="Despesas" subtitle={`${despesas.length} lançamentos · Total: ${formatBRL(totalGeral)}`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent><div className="text-xs text-slate-500">Total período</div><div className="text-2xl font-bold text-slate-900">{formatBRL(totalGeral)}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Filtrado</div><div className="text-2xl font-bold text-brand-600">{formatBRL(totalFiltrado)}</div><div className="text-xs text-slate-500 mt-0.5">{filtradas.length} itens</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Maior categoria</div><div className="text-lg font-bold text-slate-900 truncate">{porCategoria.sort((a, b) => b.valor - a.valor)[0]?.categoria || '—'}</div><div className="text-xs text-slate-500">{formatBRL(porCategoria.sort((a, b) => b.valor - a.valor)[0]?.valor || 0)}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Maior pagador</div><div className="text-lg font-bold text-slate-900 truncate">{porPessoa.sort((a, b) => b.valor - a.valor)[0]?.nome || '—'}</div><div className="text-xs text-slate-500">{formatBRL(porPessoa.sort((a, b) => b.valor - a.valor)[0]?.valor || 0)}</div></CardContent></Card>
        </div>

        <AcertoSociosCard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Despesas por dia</CardTitle><CardDescription>Gasto diário consolidado</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Bar dataKey="total" fill="#1e4ef5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Por categoria</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={porCategoria} dataKey="valor" nameKey="categoria" outerRadius={80} label={(e) => `${e.categoria}`}>
                    {porCategoria.map((c) => <Cell key={c.categoria} fill={corCategoria[c.categoria]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar descrição ou comprador..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="md:w-48">
              <option value="todas">Todas categorias</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select value={filtroQuem} onChange={(e) => setFiltroQuem(e.target.value)} className="md:w-52">
              <option value="todos">Todos os compradores</option>
              {Array.from(new Set(despesas.map((d) => d.quemComprou))).map((p) => <option key={p}>{p}</option>)}
            </Select>
            <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="md:w-44" />
            <Button onClick={() => { setEdit(null); setOpen(true) }}><Plus className="h-4 w-4" /> Nova despesa</Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtradas.length === 0 ? (
            <EmptyState title="Nenhuma despesa encontrada" description="Ajuste os filtros ou cadastre uma nova despesa" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Data</TH>
                  <TH>Descrição</TH>
                  <TH>Categoria</TH>
                  <TH>Quem comprou</TH>
                  <TH>Vínculo</TH>
                  <TH className="text-right">Valor</TH>
                  <TH>Reembolso</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtradas.map((d) => {
                  const ct = contratos.find((c) => c.id === d.contratoId)
                  const sa = servicosAvulsos.find((s) => s.id === d.servicoAvulsoId)
                  return (
                    <TR key={d.id}>
                      <TD className="whitespace-nowrap text-sm">{formatDate(d.data)}</TD>
                      <TD className="font-medium">{d.descricao}</TD>
                      <TD>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: corCategoria[d.categoria] }} />
                          <span className="text-sm">{d.categoria}</span>
                        </span>
                      </TD>
                      <TD className="text-sm">{d.quemComprou}</TD>
                      <TD className="text-xs">
                        {ct && <Badge tone="brand">{ct.numero}</Badge>}
                        {sa && <Badge tone="info">{sa.numero}</Badge>}
                        {!ct && !sa && <span className="text-slate-400">—</span>}
                      </TD>
                      <TD className="text-right font-semibold">{formatBRL(d.valor)}</TD>
                      <TD>
                        {d.reembolsado
                          ? <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Reembolsado</Badge>
                          : <button onClick={() => {
                              updateDespesa(d.id, { reembolsado: true })
                              pushToast({ titulo: 'Reembolso marcado', tipo: 'success' })
                            }} className="text-xs text-brand-600 hover:underline">Marcar reembolsado</button>}
                      </TD>
                      <TD className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => { setEdit(d); setOpen(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Remover despesa?')) { removeDespesa(d.id); pushToast({ titulo: 'Removida', tipo: 'success' }) }
                        }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TD>
                    </TR>
                  )
                })}
                <TR className="bg-slate-50 font-semibold">
                  <TD colSpan={5} className="text-right">TOTAL FILTRADO</TD>
                  <TD className="text-right text-slate-900">{formatBRL(totalFiltrado)}</TD>
                  <TD colSpan={2} />
                </TR>
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <NovaDespesaDialog
        open={open} onClose={() => setOpen(false)} despesa={edit}
        onSave={(d) => {
          if (edit) { updateDespesa(edit.id, d); pushToast({ titulo: 'Despesa atualizada', descricao: d.descricao, tipo: 'success' }) }
          else { addDespesa(d); pushToast({ titulo: 'Despesa registrada', descricao: d.descricao, tipo: 'success' }) }
          setOpen(false)
        }}
      />
    </>
  )
}

function NovaDespesaDialog({
  open, onClose, onSave, despesa,
}: { open: boolean; onClose: () => void; onSave: (d: Omit<Despesa, 'id'>) => void; despesa: Despesa | null }) {
  const { contratos, servicosAvulsos } = useStore()
  const [f, setF] = useState<Omit<Despesa, 'id'>>(() => despesa || {
    data: new Date().toISOString().slice(0, 10),
    descricao: '', categoria: 'Material de Limpeza', valor: 0,
    quemComprou: 'Jonathan da Silva', reembolsado: false,
  })
  useMemo(() => {
    setF(despesa || {
      data: new Date().toISOString().slice(0, 10),
      descricao: '', categoria: 'Material de Limpeza', valor: 0,
      quemComprou: 'Jonathan da Silva', reembolsado: false,
    })
  }, [despesa, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <Dialog open={open} onClose={onClose} title={despesa ? 'Editar despesa' : 'Nova despesa'} description="Quem comprou, data e valor"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.descricao || f.valor <= 0}>{despesa ? 'Salvar' : 'Registrar'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><Label required>Data</Label><Input type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></div>
        <div><Label required>Valor (R$)</Label><Input type="number" step="0.01" value={f.valor} onChange={(e) => set('valor', Number(e.target.value))} /></div>
        <div className="col-span-2"><Label required>Descrição</Label><Input value={f.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex: Material de Limpeza" /></div>
        <div>
          <Label>Categoria</Label>
          <Select value={f.categoria} onChange={(e) => set('categoria', e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label required>Quem comprou</Label>
          <Select value={f.quemComprou} onChange={(e) => set('quemComprou', e.target.value)}>
            {SOCIOS.map((s) => <option key={s}>{s}</option>)}
            <option value="Outro colaborador">Outro colaborador</option>
          </Select>
        </div>
        <div>
          <Label>Vincular a contrato (opcional)</Label>
          <Select value={f.contratoId || ''} onChange={(e) => set('contratoId', e.target.value || undefined)}>
            <option value="">—</option>
            {contratos.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>)}
          </Select>
        </div>
        <div>
          <Label>Vincular a serviço avulso (opcional)</Label>
          <Select value={f.servicoAvulsoId || ''} onChange={(e) => set('servicoAvulsoId', e.target.value || undefined)}>
            <option value="">—</option>
            {servicosAvulsos.map((s) => <option key={s.id} value={s.id}>{s.numero} — {s.cliente}</option>)}
          </Select>
        </div>
      </div>
    </Dialog>
  )
}
