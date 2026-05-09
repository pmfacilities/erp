import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Trash2, DollarSign, TrendingUp, Users, Calendar, Eye, Pencil } from 'lucide-react'
import type { ServicoAvulso, PagamentoAvulso } from '@/data/mockExtras'

const statusTone: Record<string, any> = {
  orcamento: 'neutral', agendado: 'info', em_execucao: 'warning',
  concluido: 'success', faturado: 'brand', cancelado: 'danger',
}
const statusLabel: Record<string, string> = {
  orcamento: 'Orçamento', agendado: 'Agendado', em_execucao: 'Em execução',
  concluido: 'Concluído', faturado: 'Faturado', cancelado: 'Cancelado',
}

export function ServicosAvulsos() {
  const { servicosAvulsos, pagamentosAvulsos, addServicoAvulso, updateServicoAvulso,
    removeServicoAvulso, addPagamentoAvulso, updatePagamentoAvulso, removePagamentoAvulso, pushToast } = useStore()
  const [tab, setTab] = useState<'servicos' | 'pagamentos'>('servicos')
  const [open, setOpen] = useState(false)
  const [editServico, setEditServico] = useState<ServicoAvulso | null>(null)
  const [detalhe, setDetalhe] = useState<ServicoAvulso | null>(null)
  const [openPagamento, setOpenPagamento] = useState(false)
  const [editPagamento, setEditPagamento] = useState<PagamentoAvulso | null>(null)

  const totais = useMemo(() => {
    // Apenas serviços não cancelados entram na conta
    const ativos = servicosAvulsos.filter(s => s.status !== 'cancelado')
    const receita = ativos.reduce((a, s) => a + s.valorBruto, 0)
    const custoMat = ativos.reduce((a, s) => a + s.custoMaterial, 0)
    
    // O pagamento real vem da tabela de pagamentos avulsos
    const totalPagamentos = pagamentosAvulsos.reduce((a, p) => a + p.valor, 0)
    
    const margem = receita - totalPagamentos - custoMat
    const margemPct = receita > 0 ? (margem / receita) * 100 : 0
    return { receita, custoMat, margem, margemPct, totalPagamentos }
  }, [servicosAvulsos, pagamentosAvulsos])

  return (
    <>
      <Header title="Serviços Avulsos" subtitle="Jobs pontuais · Fase 1 bootstrap" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Receita total</div><div className="text-2xl font-bold text-slate-900">{formatBRL(totais.receita)}</div></div><DollarSign className="h-5 w-5 text-brand-500" /></CardContent></Card>
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Pagto colaboradores</div><div className="text-2xl font-bold text-red-600">{formatBRL(totais.totalPagamentos)}</div></div><Users className="h-5 w-5 text-red-500" /></CardContent></Card>
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Margem real</div><div className="text-2xl font-bold text-emerald-600">{formatBRL(totais.margem)}</div><div className="text-xs text-slate-500">{totais.margemPct.toFixed(1)}%</div></div><TrendingUp className="h-5 w-5 text-emerald-500" /></CardContent></Card>
          <Card><CardContent className="flex items-start justify-between"><div><div className="text-xs text-slate-500">Jobs abertos</div><div className="text-2xl font-bold text-slate-900">{servicosAvulsos.filter((s) => !['concluido', 'faturado', 'cancelado'].includes(s.status)).length}</div></div><Calendar className="h-5 w-5 text-slate-400" /></CardContent></Card>
        </div>

        <Card>
          <div className="p-1 border-b border-slate-100 flex">
            <button onClick={() => setTab('servicos')} className={`flex-1 py-3 text-sm font-medium rounded-lg ${tab === 'servicos' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}>Serviços avulsos ({servicosAvulsos.length})</button>
            <button onClick={() => setTab('pagamentos')} className={`flex-1 py-3 text-sm font-medium rounded-lg ${tab === 'pagamentos' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}>Pagamentos a colaboradores ({pagamentosAvulsos.length})</button>
          </div>
          <CardContent className="flex items-center justify-end">
            {tab === 'servicos'
              ? <Button onClick={() => { setEditServico(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo serviço avulso</Button>
              : <Button onClick={() => { setEditPagamento(null); setOpenPagamento(true) }}><Plus className="h-4 w-4" /> Novo pagamento</Button>}
          </CardContent>

          {tab === 'servicos' && (
            servicosAvulsos.length === 0
              ? <EmptyState title="Nenhum serviço avulso" />
              : <Table>
                  <THead>
                    <TR>
                      <TH>Número</TH>
                      <TH>Data</TH>
                      <TH>Cliente / Tipo</TH>
                      <TH>Valor bruto</TH>
                      <TH>Mão de obra</TH>
                      <TH>Material</TH>
                      <TH>Margem</TH>
                      <TH>Status</TH>
                      <TH className="text-right">Ações</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {servicosAvulsos.map((s) => {
                      const margem = s.valorBruto - s.custoMaoDeObra - s.custoMaterial
                      const margemPct = s.valorBruto > 0 ? (margem / s.valorBruto) * 100 : 0
                      return (
                        <TR key={s.id}>
                          <TD className="font-mono text-xs">{s.numero}</TD>
                          <TD className="text-sm">{formatDate(s.data)}</TD>
                          <TD>
                            <div className="font-medium text-slate-900">{s.cliente}</div>
                            <div className="text-xs text-slate-500">{s.tipo}</div>
                          </TD>
                          <TD className="font-medium">{formatBRL(s.valorBruto)}</TD>
                          <TD>{formatBRL(s.custoMaoDeObra)}</TD>
                          <TD>{formatBRL(s.custoMaterial)}</TD>
                          <TD>
                            <div className={`font-semibold ${margemPct >= 25 ? 'text-emerald-600' : margemPct >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                              {formatBRL(margem)}
                            </div>
                            <div className="text-xs text-slate-500">{margemPct.toFixed(1)}%</div>
                          </TD>
                          <TD>
                            <Select value={s.status}
                              onChange={(e) => { updateServicoAvulso(s.id, { status: e.target.value as any }); pushToast({ titulo: 'Status atualizado', tipo: 'success' }) }}
                              className="h-7 text-xs py-0 w-32"
                            >
                              {Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </Select>
                          </TD>
                          <TD className="text-right whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => setDetalhe(s)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditServico(s); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (confirm(`Remover ${s.numero}?`)) { removeServicoAvulso(s.id); pushToast({ titulo: 'Removido', tipo: 'success' }) }
                            }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
          )}

          {tab === 'pagamentos' && (
            pagamentosAvulsos.length === 0
              ? <EmptyState title="Nenhum pagamento registrado" />
              : <Table>
                  <THead>
                    <TR>
                      <TH>Dia trabalhado</TH>
                      <TH>Colaborador</TH>
                      <TH>Serviço vinculado</TH>
                      <TH>Descrição</TH>
                      <TH>Valor</TH>
                      <TH>Quem pagou</TH>
                      <TH>Status</TH>
                      <TH className="text-right">Ações</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {pagamentosAvulsos.sort((a, b) => b.diaTrabalhado.localeCompare(a.diaTrabalhado)).map((p) => {
                      const sa = servicosAvulsos.find((x) => x.id === p.servicoAvulsoId)
                      return (
                        <TR key={p.id}>
                          <TD className="whitespace-nowrap text-sm">{formatDate(p.diaTrabalhado)}</TD>
                          <TD className="font-medium text-slate-900">{p.colaborador}</TD>
                          <TD><Badge tone="info">{sa?.numero || '—'}</Badge></TD>
                          <TD className="text-sm text-slate-500">{p.descricao || '—'}</TD>
                          <TD className="font-semibold">{formatBRL(p.valor)}</TD>
                          <TD><Badge tone={p.quemPagou === 'Rateado 4 sócios' ? 'brand' : 'neutral'}>{p.quemPagou}</Badge></TD>
                          <TD><Badge tone={p.status === 'pago' ? 'success' : 'warning'}>{p.status}</Badge></TD>
                          <TD className="text-right whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => { setEditPagamento(p); setOpenPagamento(true) }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (confirm('Remover pagamento?')) { removePagamentoAvulso(p.id); pushToast({ titulo: 'Removido', tipo: 'success' }) }
                            }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TD>
                        </TR>
                      )
                    })}
                    <TR className="bg-slate-50 font-semibold">
                      <TD colSpan={4} className="text-right">TOTAL GERAL</TD>
                      <TD>{formatBRL(totais.totalPagamentos)}</TD>
                      <TD colSpan={3} />
                    </TR>
                  </TBody>
                </Table>
          )}
        </Card>

        {tab === 'pagamentos' && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo por colaborador</CardTitle>
              <CardDescription>Total de pagamentos avulsos agregado por colaborador</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>Colaborador</TH>
                    <TH>Nº de diárias</TH>
                    <TH className="text-right">Total pago</TH>
                  </TR>
                </THead>
                <TBody>
                  {Object.entries(pagamentosAvulsos.reduce<Record<string, { qtd: number; total: number }>>((m, p) => {
                    m[p.colaborador] = m[p.colaborador] || { qtd: 0, total: 0 }
                    m[p.colaborador].qtd += 1
                    m[p.colaborador].total += p.valor
                    return m
                  }, {})).sort((a, b) => b[1].total - a[1].total).map(([nome, v]) => (
                    <TR key={nome}>
                      <TD className="font-medium">{nome}</TD>
                      <TD>{v.qtd}</TD>
                      <TD className="text-right font-semibold">{formatBRL(v.total)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <NovoServicoDialog open={open} onClose={() => setOpen(false)} servico={editServico}
        onSave={(s) => {
          if (editServico) { updateServicoAvulso(editServico.id, s); pushToast({ titulo: 'Serviço atualizado', descricao: s.numero, tipo: 'success' }) }
          else { addServicoAvulso(s); pushToast({ titulo: 'Serviço registrado', descricao: s.numero, tipo: 'success' }) }
          setOpen(false)
        }}
      />
      <NovoPagamentoDialog open={openPagamento} onClose={() => setOpenPagamento(false)} pagamento={editPagamento}
        onSave={(p) => {
          if (editPagamento) { updatePagamentoAvulso(editPagamento.id, p); pushToast({ titulo: 'Pagamento atualizado', tipo: 'success' }) }
          else { addPagamentoAvulso(p); pushToast({ titulo: 'Pagamento registrado', tipo: 'success' }) }
          setOpenPagamento(false)
        }}
      />
      {detalhe && <DetalheServico servico={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  )
}

function NovoServicoDialog({ open, onClose, onSave, servico }: { open: boolean; onClose: () => void; onSave: (s: Omit<ServicoAvulso, 'id'>) => void; servico: ServicoAvulso | null }) {
  const defaults = (): Omit<ServicoAvulso, 'id'> => ({
    numero: 'SA-2026-' + String(Math.floor(Math.random() * 900) + 100),
    data: new Date().toISOString().slice(0, 10),
    cliente: '', tipo: 'Limpeza pós-obra', descricao: '', endereco: '',
    valorBruto: 0, custoMaoDeObra: 0, custoMaterial: 0,
    status: 'orcamento', responsavel: 'Jonathan da Silva',
  })
  const [f, setF] = useState<Omit<ServicoAvulso, 'id'>>(() => servico || defaults())
  useMemo(() => setF(servico || defaults()), [servico, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  const margem = f.valorBruto - f.custoMaoDeObra - f.custoMaterial
  return (
    <Dialog open={open} onClose={onClose} title={servico ? 'Editar serviço avulso' : 'Novo serviço avulso'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.cliente || f.valorBruto <= 0}>{servico ? 'Salvar' : 'Registrar'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><Label required>Número</Label><Input value={f.numero} onChange={(e) => set('numero', e.target.value)} /></div>
        <div><Label required>Data</Label><Input type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></div>
        <div className="col-span-2"><Label required>Cliente</Label><Input value={f.cliente} onChange={(e) => set('cliente', e.target.value)} placeholder="Nome do contratante" /></div>
        <div>
          <Label>Tipo de serviço</Label>
          <Select value={f.tipo} onChange={(e) => set('tipo', e.target.value)}>
            <option>Limpeza pós-obra</option>
            <option>Diária residencial</option>
            <option>Diária corporativa</option>
            <option>Mutirão</option>
            <option>Limpeza pós-evento</option>
            <option>Copeira evento</option>
            <option>Outro</option>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={f.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
        </div>
        <div className="col-span-2"><Label>Endereço</Label><Input value={f.endereco} onChange={(e) => set('endereco', e.target.value)} /></div>
        <div className="col-span-2"><Label>Descrição</Label><Textarea rows={2} value={f.descricao} onChange={(e) => set('descricao', e.target.value)} /></div>
        <div><Label required>Valor bruto (R$)</Label><Input type="number" step="0.01" value={f.valorBruto} onChange={(e) => set('valorBruto', Number(e.target.value))} /></div>
        <div><Label>Responsável</Label>
          <Select value={f.responsavel} onChange={(e) => set('responsavel', e.target.value)}>
            <option>Jonathan da Silva</option>
            <option>David Souza</option>
            <option>Márcio Kerol</option>
            <option>Junior Alamar</option>
          </Select>
        </div>
        <div><Label>Custo mão de obra (R$)</Label><Input type="number" step="0.01" value={f.custoMaoDeObra} onChange={(e) => set('custoMaoDeObra', Number(e.target.value))} /></div>
        <div><Label>Custo material (R$)</Label><Input type="number" step="0.01" value={f.custoMaterial} onChange={(e) => set('custoMaterial', Number(e.target.value))} /></div>
        <div className="col-span-2 bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500">Margem calculada</div>
          <div className={`text-xl font-bold ${margem >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatBRL(margem)} <span className="text-sm font-normal">({f.valorBruto > 0 ? ((margem / f.valorBruto) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function NovoPagamentoDialog({ open, onClose, onSave, pagamento }: { open: boolean; onClose: () => void; onSave: (p: Omit<PagamentoAvulso, 'id'>) => void; pagamento: PagamentoAvulso | null }) {
  const { servicosAvulsos } = useStore()
  const defaults = (): Omit<PagamentoAvulso, 'id'> => ({
    diaTrabalhado: new Date().toISOString().slice(0, 10),
    colaborador: '', valor: 0, quemPagou: 'Rateado 4 sócios', status: 'pago',
  })
  const [f, setF] = useState<Omit<PagamentoAvulso, 'id'>>(() => pagamento || defaults())
  useMemo(() => setF(pagamento || defaults()), [pagamento, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <Dialog open={open} onClose={onClose} title={pagamento ? 'Editar pagamento' : 'Novo pagamento a colaborador avulso'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.colaborador || f.valor <= 0}>{pagamento ? 'Salvar' : 'Registrar'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><Label required>Dia trabalhado</Label><Input type="date" value={f.diaTrabalhado} onChange={(e) => set('diaTrabalhado', e.target.value)} /></div>
        <div><Label required>Valor</Label><Input type="number" step="0.01" value={f.valor} onChange={(e) => set('valor', Number(e.target.value))} /></div>
        <div className="col-span-2"><Label required>Nome do colaborador</Label><Input value={f.colaborador} onChange={(e) => set('colaborador', e.target.value)} placeholder="Ex: Lucas / Alessandra / Equipe de 4..." /></div>
        <div>
          <Label>Serviço avulso vinculado</Label>
          <Select value={f.servicoAvulsoId || ''} onChange={(e) => set('servicoAvulsoId', e.target.value || undefined)}>
            <option value="">—</option>
            {servicosAvulsos.map((s) => <option key={s.id} value={s.id}>{s.numero} — {s.cliente}</option>)}
          </Select>
        </div>
        <div>
          <Label>Quem pagou</Label>
          <Select value={f.quemPagou} onChange={(e) => set('quemPagou', e.target.value as any)}>
            <option>Jonathan</option>
            <option>David</option>
            <option>Kerol</option>
            <option>Junior</option>
            <option>Rateado 4 sócios</option>
            <option>Outro</option>
          </Select>
        </div>
        <div className="col-span-2"><Label>Descrição / Obs</Label><Input value={f.descricao || ''} onChange={(e) => set('descricao', e.target.value)} /></div>
        <div>
          <Label>Status</Label>
          <Select value={f.status} onChange={(e) => set('status', e.target.value as any)}>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
          </Select>
        </div>
      </div>
    </Dialog>
  )
}

function DetalheServico({ servico, onClose }: { servico: ServicoAvulso; onClose: () => void }) {
  const { pagamentosAvulsos, despesas } = useStore()
  const pagsVinculados = pagamentosAvulsos.filter((p) => p.servicoAvulsoId === servico.id)
  const despesasVinc = despesas.filter((d) => d.servicoAvulsoId === servico.id)
  const margem = servico.valorBruto - servico.custoMaoDeObra - servico.custoMaterial
  const margemPct = servico.valorBruto > 0 ? (margem / servico.valorBruto) * 100 : 0
  return (
    <Dialog open onClose={onClose} title={servico.numero} description={`${servico.cliente} — ${servico.tipo}`} size="lg">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><div className="text-xs text-slate-500">Data</div><div className="font-medium">{formatDate(servico.data)}</div></div>
        <div><div className="text-xs text-slate-500">Responsável</div><div className="font-medium">{servico.responsavel}</div></div>
        <div><div className="text-xs text-slate-500">Status</div><Badge tone={statusTone[servico.status]}>{statusLabel[servico.status]}</Badge></div>
        <div className="col-span-3"><div className="text-xs text-slate-500">Endereço</div><div className="text-sm">{servico.endereco}</div></div>
        <div className="col-span-3"><div className="text-xs text-slate-500">Descrição</div><div className="text-sm">{servico.descricao}</div></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Rentabilidade</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-3 text-sm">
          <div><div className="text-xs text-slate-500">Receita</div><div className="font-semibold text-emerald-600">{formatBRL(servico.valorBruto)}</div></div>
          <div><div className="text-xs text-slate-500">Mão de obra</div><div className="font-semibold text-red-600">{formatBRL(servico.custoMaoDeObra)}</div></div>
          <div><div className="text-xs text-slate-500">Material</div><div className="font-semibold text-red-600">{formatBRL(servico.custoMaterial)}</div></div>
          <div><div className="text-xs text-slate-500">Margem</div><div className={`font-semibold ${margemPct >= 25 ? 'text-emerald-600' : 'text-amber-600'}`}>{formatBRL(margem)} ({margemPct.toFixed(1)}%)</div></div>
        </CardContent>
      </Card>
      {pagsVinculados.length > 0 && (
        <Card className="mt-3">
          <CardHeader><CardTitle>Pagamentos vinculados ({pagsVinculados.length})</CardTitle></CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {pagsVinculados.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{p.colaborador}</div>
                  <div className="text-xs text-slate-500">{formatDate(p.diaTrabalhado)} · {p.quemPagou}</div>
                </div>
                <div className="font-semibold">{formatBRL(p.valor)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {despesasVinc.length > 0 && (
        <Card className="mt-3">
          <CardHeader><CardTitle>Despesas vinculadas ({despesasVinc.length})</CardTitle></CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {despesasVinc.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{d.descricao}</div>
                  <div className="text-xs text-slate-500">{formatDate(d.data)} · {d.quemComprou}</div>
                </div>
                <div className="font-semibold">{formatBRL(d.valor)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </Dialog>
  )
}
