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
import { Plus, Search, Check, Download, ArrowDownRight, ArrowUpRight, TrendingUp, Pencil, Trash2, Undo2, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import type { LancamentoFinanceiro } from '@/data/mockData'

const statusTone: Record<string, any> = { aberto: 'info', pago: 'success', atrasado: 'danger' }

const TABS = [
  { key: 'receber', label: 'Contas a Receber' },
  { key: 'pagar', label: 'Contas a Pagar' },
  { key: 'pagamento_colaborador', label: 'Pgto Colaborador' },
] as const
type TabKey = typeof TABS[number]['key']

export function Financeiro() {
  const { financeiro, contratos, addLancamento, updateLancamento, removeLancamento, marcarPago, pushToast } = useStore()
  const [tab, setTab] = useState<TabKey>('receber')
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [open, setOpen] = useState(false)
  const [editLanc, setEditLanc] = useState<LancamentoFinanceiro | null>(null)

  const lista = useMemo(() =>
    financeiro
      .filter((f) => f.tipo === tab)
      .filter((f) => filtroStatus === 'todos' || f.status === filtroStatus)
      .filter((f) => [f.descricao, f.fornecedorCliente].some((v) => v.toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()),
    [financeiro, tab, filtroStatus, busca])

  const totais = useMemo(() => {
    const rec = financeiro.filter((f) => f.tipo === 'receber')
    const pag = financeiro.filter((f) => f.tipo === 'pagar')
    const pgC = financeiro.filter((f) => f.tipo === 'pagamento_colaborador')
    return {
      aReceber: rec.filter((f) => f.status !== 'pago').reduce((a, f) => a + f.valor, 0),
      recebido: rec.filter((f) => f.status === 'pago').reduce((a, f) => a + f.valor, 0),
      aPagar: pag.filter((f) => f.status !== 'pago').reduce((a, f) => a + f.valor, 0),
      pgColabTotal: pgC.reduce((a, f) => a + f.valor, 0),
      pgColabPendente: pgC.filter((f) => f.status !== 'pago').reduce((a, f) => a + f.valor, 0),
      atrasadoReceber: rec.filter((f) => f.status === 'atrasado').reduce((a, f) => a + f.valor, 0),
    }
  }, [financeiro])

  const fluxoCaixa = useMemo(() => ['S1', 'S2', 'S3', 'S4'].map((s, i) => ({
    semana: s,
    entradas: Math.round(totais.aReceber / 4 * (0.8 + i * 0.08)),
    saidas: Math.round((totais.aPagar + totais.pgColabTotal) / 4 * (0.9 + i * 0.05)),
  })), [totais])

  const colEntidade = tab === 'receber' ? 'Cliente' : tab === 'pagar' ? 'Fornecedor' : 'Colaborador'

  return (
    <>
      <Header title="Financeiro" subtitle="Contas a receber, contas a pagar e fluxo de caixa" />
      <div className="p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiFin label="A receber" value={formatBRL(totais.aReceber)} sub={totais.atrasadoReceber > 0 ? `${formatBRL(totais.atrasadoReceber)} atrasado` : 'Sem atrasos'} tone="brand" icon={<ArrowUpRight />} />
          <KpiFin label="Recebido mês" value={formatBRL(totais.recebido)} tone="success" icon={<Check />} />
          <KpiFin label="A pagar" value={formatBRL(totais.aPagar)} tone="warning" icon={<ArrowDownRight />} />
          <KpiFin label="Pgto Colaboradores" value={formatBRL(totais.pgColabTotal)} sub={totais.pgColabPendente > 0 ? `${formatBRL(totais.pgColabPendente)} pendente` : 'Tudo quitado'} tone={totais.pgColabPendente > 0 ? 'warning' : 'success'} icon={<Users />} />
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader><CardTitle>Fluxo de caixa — mês corrente</CardTitle><CardDescription>Projeção por semana</CardDescription></CardHeader>
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

        {/* Tabela */}
        <Card>
          <div className="p-1 border-b border-slate-100 flex">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-sm font-medium rounded-lg ${tab === t.key ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                {t.label} ({financeiro.filter(f => f.tipo === t.key).length})
              </button>
            ))}
          </div>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-44">
              <option value="todos">Todos</option><option value="aberto">Em aberto</option>
              <option value="pago">Pagos</option><option value="atrasado">Atrasados</option>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4" /> Exportar</Button>
            <Button onClick={() => { setEditLanc(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo lançamento</Button>
          </CardContent>
          {lista.length === 0 ? <EmptyState title="Nenhum lançamento" /> : (
            <Table>
              <THead><TR>
                <TH>Descrição</TH><TH>{colEntidade}</TH><TH>Centro custo</TH>
                <TH>Vencimento</TH><TH>Valor</TH><TH>Status</TH><TH className="text-right">Ações</TH>
              </TR></THead>
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
                    <TD className="text-right whitespace-nowrap">
                      {l.status !== 'pago' ? (
                        <Button variant="ghost" size="sm" onClick={() => { marcarPago(l.id, new Date().toISOString().slice(0, 10)); pushToast({ titulo: 'Baixado', tipo: 'success' }) }}>
                          <Check className="h-4 w-4 text-emerald-600" /> Baixa
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => { updateLancamento(l.id, { status: 'aberto', pagamento: undefined }); pushToast({ titulo: 'Revertido', tipo: 'info' }) }}>
                          <Undo2 className="h-4 w-4 text-amber-600" /> Reverter
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { setEditLanc(l); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Remover "${l.descricao}"?`)) { removeLancamento(l.id); pushToast({ titulo: 'Removido', tipo: 'success' }) } }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <LancamentoDialog open={open} onClose={() => setOpen(false)} tipoDefault={tab} lancamento={editLanc}
        onSave={(l) => {
          if (editLanc) { updateLancamento(editLanc.id, l); pushToast({ titulo: 'Atualizado', tipo: 'success' }) }
          else { addLancamento(l); pushToast({ titulo: 'Lançamento criado', tipo: 'success' }) }
          setOpen(false)
        }}
      />
    </>
  )
}

/* ==================== KPI CARD ==================== */
function KpiFin({ label, value, sub, tone, icon }: {
  label: string; value: string; sub?: string; tone: 'brand' | 'success' | 'warning' | 'danger'; icon: React.ReactNode
}) {
  const c = { brand: 'bg-brand-50 text-brand-700', success: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', danger: 'bg-red-50 text-red-700' }
  return (
    <Card><CardContent className="flex items-start justify-between">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${c[tone]}`}>{icon}</div>
    </CardContent></Card>
  )
}

/* ==================== DIALOG ==================== */
function LancamentoDialog({ open, onClose, tipoDefault, lancamento, onSave }: {
  open: boolean; onClose: () => void; tipoDefault: TabKey
  lancamento: LancamentoFinanceiro | null
  onSave: (l: Omit<LancamentoFinanceiro, 'id'>) => void
}) {
  const { contratos, clientes, funcionarios, prestadores, addCliente, pushToast } = useStore()

  const mkDefault = (): Omit<LancamentoFinanceiro, 'id'> => ({
    tipo: tipoDefault, descricao: '', fornecedorCliente: '', valor: 0,
    vencimento: new Date().toISOString().slice(0, 10), status: 'aberto', centroCusto: 'Comercial',
  })

  const [form, setForm] = useState(() => lancamento ? { ...lancamento } : mkDefault())
  const [modoManual, setModoManual] = useState(false)
  // Controla se o campo "Colaborador" está em modo manual (separado do campo Cliente)
  const [modoManualColab, setModoManualColab] = useState(false)
  // Campo "Cliente vinculado" para pagamento_colaborador (não mistura com fornecedorCliente)
  const [clienteVinculado, setClienteVinculado] = useState('')
  const [modoManualCliente, setModoManualCliente] = useState(false)

  useMemo(() => {
    if (lancamento) {
      setForm({ ...lancamento })
      // Detecta se era digitação manual
      const naListaClientes = clientes.some(c => c.razaoSocial === lancamento.fornecedorCliente || c.nomeFantasia === lancamento.fornecedorCliente)
      const naListaColabs = funcionarios.some(f => f.nome === lancamento.fornecedorCliente) || prestadores.some(p => p.nomeFantasia === lancamento.fornecedorCliente)
      if (lancamento.tipo === 'pagamento_colaborador') {
        setModoManualColab(!naListaColabs && lancamento.fornecedorCliente !== '')
      } else {
        setModoManual(!naListaClientes && lancamento.fornecedorCliente !== '')
      }
    } else {
      setForm(mkDefault())
      setModoManual(false)
      setModoManualColab(false)
      setClienteVinculado('')
      setModoManualCliente(false)
    }
  }, [lancamento, open])

  const handleSave = async () => {
    // Auto-cadastro de cliente digitado manualmente (para receber/pagar)
    if (modoManual && form.fornecedorCliente.trim() && form.tipo !== 'pagamento_colaborador') {
      const existe = clientes.some(c =>
        c.nomeFantasia.toLowerCase() === form.fornecedorCliente.trim().toLowerCase() ||
        c.razaoSocial.toLowerCase() === form.fornecedorCliente.trim().toLowerCase()
      )
      if (!existe) {
        await addCliente({
          razaoSocial: form.fornecedorCliente.trim(), nomeFantasia: form.fornecedorCliente.trim(),
          cnpj: '', email: '', telefone: '', cidade: '', uf: 'SP', status: 'ativo', contatoResponsavel: '',
        })
        pushToast({ titulo: 'Cliente cadastrado', descricao: `"${form.fornecedorCliente.trim()}" adicionado. Complete os dados em Clientes.`, tipo: 'info' })
      }
    }
    // Auto-cadastro de cliente vinculado ao pagamento de colaborador
    if (modoManualCliente && clienteVinculado.trim()) {
      const existe = clientes.some(c =>
        c.nomeFantasia.toLowerCase() === clienteVinculado.trim().toLowerCase() ||
        c.razaoSocial.toLowerCase() === clienteVinculado.trim().toLowerCase()
      )
      if (!existe) {
        await addCliente({
          razaoSocial: clienteVinculado.trim(), nomeFantasia: clienteVinculado.trim(),
          cnpj: '', email: '', telefone: '', cidade: '', uf: 'SP', status: 'ativo', contatoResponsavel: '',
        })
        pushToast({ titulo: 'Cliente cadastrado', descricao: `"${clienteVinculado.trim()}" adicionado. Complete os dados em Clientes.`, tipo: 'info' })
      }
    }
    onSave(form)
  }

  /* ---- Helper: dropdown com lista + digitar manualmente ---- */
  const renderDropdownComManual = (
    value: string,
    onChange: (v: string) => void,
    options: { key: string; value: string; label: string; group?: string }[],
    placeholder: string,
    isManual: boolean,
    setIsManual: (v: boolean) => void,
    manualPlaceholder: string,
    autoRegisterLabel?: string,
  ) => {
    if (isManual) {
      return (
        <div className="space-y-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={manualPlaceholder} autoFocus />
          <div className="flex items-center gap-2">
            {autoRegisterLabel && <span className="text-xs text-amber-600 font-medium">⚡ {autoRegisterLabel}</span>}
            {!autoRegisterLabel && <span className="text-xs text-slate-500">Digitado manualmente</span>}
            <button type="button" className="text-xs text-brand-600 hover:underline ml-auto"
              onClick={() => { setIsManual(false); onChange('') }}>← Voltar para lista</button>
          </div>
        </div>
      )
    }

    // Agrupa options por group
    const groups = new Map<string, typeof options>()
    options.forEach(o => {
      const g = o.group || ''
      if (!groups.has(g)) groups.set(g, [])
      groups.get(g)!.push(o)
    })

    return (
      <Select value={value} onChange={(e) => {
        if (e.target.value === '__manual__') { setIsManual(true); onChange('') }
        else { onChange(e.target.value) }
      }}>
        <option value="">— Selecione —</option>
        {[...groups.entries()].map(([group, opts]) =>
          group ? (
            <optgroup key={group} label={group}>
              {opts.map(o => <option key={o.key} value={o.value}>{o.label}</option>)}
            </optgroup>
          ) : (
            opts.map(o => <option key={o.key} value={o.value}>{o.label}</option>)
          )
        )}
        <option value="__manual__">✏️ Digitar manualmente...</option>
      </Select>
    )
  }

  // Monta lista de opções para colaboradores
  const colabOptions = [
    ...funcionarios.map(f => ({ key: f.id, value: f.nome, label: `${f.nome} — ${f.cargo}`, group: 'Funcionários' })),
    ...prestadores.map(p => ({ key: p.id, value: p.nomeFantasia, label: p.nomeFantasia, group: 'Prestadores' })),
  ]

  // Monta lista de opções para clientes
  const clienteOptions = clientes.filter(c => c.status === 'ativo').map(c => ({
    key: c.id,
    value: c.razaoSocial,
    label: c.nomeFantasia !== c.razaoSocial ? `${c.nomeFantasia} (${c.razaoSocial})` : c.nomeFantasia,
  }))

  const isPgColab = form.tipo === 'pagamento_colaborador'
  const labelEntidade = form.tipo === 'receber' ? 'Cliente' : form.tipo === 'pagar' ? 'Fornecedor' : 'Colaborador'

  return (
    <Dialog open={open} onClose={onClose}
      title={lancamento ? 'Editar lançamento' : 'Novo lançamento'} size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!form.descricao || !form.fornecedorCliente || form.valor <= 0}>
          {lancamento ? 'Salvar alterações' : 'Criar lançamento'}
        </Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Tipo */}
        <div>
          <Label required>Tipo</Label>
          <Select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any, fornecedorCliente: '' }))}>
            <option value="receber">A receber</option>
            <option value="pagar">A pagar</option>
            <option value="pagamento_colaborador">Pagamento Colaborador</option>
          </Select>
        </div>
        {/* Centro de custo */}
        <div>
          <Label>Centro de custo</Label>
          <Select value={form.centroCusto} onChange={(e) => setForm((f) => ({ ...f, centroCusto: e.target.value }))}>
            <option>Comercial</option><option>RH</option><option>Suprimentos</option>
            <option>Tributos</option><option>Administrativo</option><option>Operacional</option>
          </Select>
        </div>
        {/* Descrição */}
        <div className="col-span-2">
          <Label required>Descrição</Label>
          <Input value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            placeholder={isPgColab ? 'Ex: Diária limpeza pós-obra 20/04' : 'Ex: NFS-e 4 — Limpeza Hera'} />
        </div>

        {/* === COLABORADOR (só em Pagamento Colaborador) === */}
        {isPgColab && (
          <div className="col-span-2">
            <Label required>Colaborador</Label>
            {renderDropdownComManual(
              form.fornecedorCliente,
              (v) => setForm((f) => ({ ...f, fornecedorCliente: v })),
              colabOptions,
              '— Selecione —',
              modoManualColab,
              setModoManualColab,
              'Nome do colaborador',
            )}
          </div>
        )}

        {/* === CLIENTE (em todos os tipos) === */}
        <div className="col-span-2">
          <Label {...(!isPgColab ? { required: true } : {})}>{isPgColab ? 'Cliente vinculado (opcional)' : labelEntidade}</Label>
          {isPgColab ? (
            // Para pgto colaborador: dropdown simples dos clientes, sem obrigatoriedade
            renderDropdownComManual(
              clienteVinculado,
              setClienteVinculado,
              clienteOptions,
              '— Selecione —',
              modoManualCliente,
              setModoManualCliente,
              'Nome do cliente',
              'Será cadastrado automaticamente em Clientes',
            )
          ) : (
            // Para receber/pagar: dropdown dos clientes com auto-cadastro
            renderDropdownComManual(
              form.fornecedorCliente,
              (v) => setForm((f) => ({ ...f, fornecedorCliente: v })),
              clienteOptions,
              '— Selecione —',
              modoManual,
              setModoManual,
              'Nome do cliente/fornecedor',
              'Será cadastrado automaticamente em Clientes',
            )
          )}
        </div>

        {/* Contrato */}
        <div>
          <Label>Contrato (opcional)</Label>
          <Select value={form.contratoId || ''} onChange={(e) => setForm((f) => ({ ...f, contratoId: e.target.value || undefined }))}>
            <option value="">—</option>
            {contratos.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>)}
          </Select>
        </div>
        {/* Valor */}
        <div>
          <Label required>Valor (R$)</Label>
          <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))} />
        </div>
        {/* Vencimento */}
        <div>
          <Label required>Vencimento</Label>
          <Input type="date" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} />
        </div>
        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
            <option value="aberto">Em aberto</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </Select>
        </div>
      </div>
    </Dialog>
  )
}
