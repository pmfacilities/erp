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
import { Plus, Search, Check, Download, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import type { LancamentoFinanceiro } from '@/data/mockData'

const statusTone: Record<string, any> = { aberto: 'info', pago: 'success', atrasado: 'danger' }

export function Financeiro() {
  const { financeiro, contratos, addLancamento, marcarPago, pushToast } = useStore()
  const [tab, setTab] = useState<'receber' | 'pagar'>('receber')
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [open, setOpen] = useState(false)

  const lista = useMemo(() => {
    return financeiro
      .filter((f) => f.tipo === tab)
      .filter((f) => filtroStatus === 'todos' || f.status === filtroStatus)
      .filter((f) => [f.descricao, f.fornecedorCliente].some((v) => v.toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
  }, [financeiro, tab, filtroStatus, busca])

  const totais = useMemo(() => {
    const rec = financeiro.filter((f) => f.tipo === 'receber')
    const pag = financeiro.filter((f) => f.tipo === 'pagar')
    return {
      aReceber: rec.filter((f) => f.status !== 'pago').reduce((a, f) => a + f.valor, 0),
      recebido: rec.filter((f) => f.status === 'pago').reduce((a, f) => a + f.valor, 0),
      aPagar: pag.filter((f) => f.status !== 'pago').reduce((a, f) => a + f.valor, 0),
      pago: pag.filter((f) => f.status === 'pago').reduce((a, f) => a + f.valor, 0),
      atrasadoReceber: rec.filter((f) => f.status === 'atrasado').reduce((a, f) => a + f.valor, 0),
    }
  }, [financeiro])

  // fluxo por semana (mock simples)
  const fluxoCaixa = useMemo(() => {
    const semanas = ['S1', 'S2', 'S3', 'S4']
    return semanas.map((s, i) => ({
      semana: s,
      entradas: Math.round(totais.aReceber / 4 * (0.8 + i * 0.08)),
      saidas: Math.round(totais.aPagar / 4 * (0.9 + i * 0.05)),
    }))
  }, [totais])

  return (
    <>
      <Header title="Financeiro" subtitle="Contas a receber, contas a pagar e fluxo de caixa" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiFin label="A receber" value={formatBRL(totais.aReceber)} sub={totais.atrasadoReceber > 0 ? `${formatBRL(totais.atrasadoReceber)} atrasado` : 'Sem atrasos'} tone="brand" icon={<ArrowUpRight />} />
          <KpiFin label="Recebido mês" value={formatBRL(totais.recebido)} tone="success" icon={<Check />} />
          <KpiFin label="A pagar" value={formatBRL(totais.aPagar)} tone="warning" icon={<ArrowDownRight />} />
          <KpiFin label="Saldo projetado" value={formatBRL(totais.aReceber - totais.aPagar)} tone={totais.aReceber - totais.aPagar > 0 ? 'success' : 'danger'} icon={<TrendingUp />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa — mês corrente</CardTitle>
            <CardDescription>Projeção por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fluxoCaixa}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semana" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Legend />
                <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} name="Entradas" />
                <Bar dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <div className="p-1 border-b border-slate-100 flex">
            {(['receber', 'pagar'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium rounded-lg ${tab === t ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Contas a {t === 'receber' ? 'Receber' : 'Pagar'}
              </button>
            ))}
          </div>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-44">
              <option value="todos">Todos</option>
              <option value="aberto">Em aberto</option>
              <option value="pago">Pagos</option>
              <option value="atrasado">Atrasados</option>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4" /> Exportar</Button>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo lançamento</Button>
          </CardContent>
          {lista.length === 0 ? (
            <EmptyState title="Nenhum lançamento" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Descrição</TH>
                  <TH>{tab === 'receber' ? 'Cliente' : 'Fornecedor'}</TH>
                  <TH>Centro custo</TH>
                  <TH>Vencimento</TH>
                  <TH>Valor</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {lista.map((l) => (
                  <TR key={l.id}>
                    <TD>
                      <div className="font-medium text-slate-900">{l.descricao}</div>
                      {l.contratoId && <div className="text-xs text-slate-500">{contratos.find((c) => c.id === l.contratoId)?.numero}</div>}
                    </TD>
                    <TD className="text-sm">{l.fornecedorCliente}</TD>
                    <TD><Badge tone="neutral">{l.centroCusto}</Badge></TD>
                    <TD className="text-sm">{formatDate(l.vencimento)}</TD>
                    <TD className="font-semibold">{formatBRL(l.valor)}</TD>
                    <TD><Badge tone={statusTone[l.status]}>{l.status}</Badge></TD>
                    <TD className="text-right">
                      {l.status !== 'pago' && (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => {
                            marcarPago(l.id, new Date().toISOString().slice(0, 10))
                            pushToast({ titulo: 'Lançamento baixado', descricao: l.descricao, tipo: 'success' })
                          }}
                        >
                          <Check className="h-4 w-4 text-emerald-600" /> Dar baixa
                        </Button>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <LancamentoDialog
        open={open} onClose={() => setOpen(false)} tipoDefault={tab}
        onSave={(l) => {
          addLancamento(l)
          pushToast({ titulo: 'Lançamento criado', tipo: 'success' })
          setOpen(false)
        }}
      />
    </>
  )
}

function KpiFin({
  label, value, sub, tone, icon,
}: { label: string; value: string; sub?: string; tone: 'brand' | 'success' | 'warning' | 'danger'; icon: React.ReactNode }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  }
  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colors[tone]}`}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function LancamentoDialog({
  open, onClose, tipoDefault, onSave,
}: {
  open: boolean; onClose: () => void; tipoDefault: 'receber' | 'pagar'
  onSave: (l: Omit<LancamentoFinanceiro, 'id'>) => void
}) {
  const { contratos } = useStore()
  const [form, setForm] = useState<Omit<LancamentoFinanceiro, 'id'>>({
    tipo: tipoDefault, descricao: '', fornecedorCliente: '', valor: 0,
    vencimento: '2026-05-10', status: 'aberto', centroCusto: 'Comercial',
  })

  useMemo(() => setForm((f) => ({ ...f, tipo: tipoDefault })), [tipoDefault, open])

  return (
    <Dialog
      open={open} onClose={onClose} title="Novo lançamento" size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} disabled={!form.descricao || !form.fornecedorCliente || form.valor <= 0}>
            Criar lançamento
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Tipo</Label>
          <Select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}>
            <option value="receber">A receber</option>
            <option value="pagar">A pagar</option>
          </Select>
        </div>
        <div>
          <Label>Centro de custo</Label>
          <Select value={form.centroCusto} onChange={(e) => setForm((f) => ({ ...f, centroCusto: e.target.value }))}>
            <option>Comercial</option>
            <option>RH</option>
            <option>Suprimentos</option>
            <option>Tributos</option>
            <option>Administrativo</option>
          </Select>
        </div>
        <div className="col-span-2">
          <Label required>Descrição</Label>
          <Input value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
        </div>
        <div>
          <Label required>{form.tipo === 'receber' ? 'Cliente' : 'Fornecedor'}</Label>
          <Input value={form.fornecedorCliente} onChange={(e) => setForm((f) => ({ ...f, fornecedorCliente: e.target.value }))} />
        </div>
        <div>
          <Label>Contrato (opcional)</Label>
          <Select value={form.contratoId || ''} onChange={(e) => setForm((f) => ({ ...f, contratoId: e.target.value || undefined }))}>
            <option value="">—</option>
            {contratos.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>)}
          </Select>
        </div>
        <div>
          <Label required>Valor</Label>
          <Input type="number" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))} />
        </div>
        <div>
          <Label required>Vencimento</Label>
          <Input type="date" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} />
        </div>
      </div>
    </Dialog>
  )
}
