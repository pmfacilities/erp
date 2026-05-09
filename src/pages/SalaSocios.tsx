import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { useCaixaConsolidado, aplicarRegra } from '@/lib/caixaConsolidado'
import {
  CheckCircle2, XCircle, Target, Lock, Download, Zap, ArrowDown, ArrowUp, TrendingUp, AlertCircle,
} from 'lucide-react'
import { AcertoSociosCard } from '@/components/AcertoSociosCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

// =====================================================
// SALA DOS SÓCIOS
// Área privada com ancoragem ao caixa real do sistema.
// 5 abas: Caixa Consolidado · Gatilho · Cenários 40/60 ·
// Projeção 12 Meses · Benchmark RJ
// =====================================================

const cenariosBase = [
  { nome: 'Cenário A — abaixo do gatilho', caixa: 10000 },
  { nome: 'Cenário B — exato no gatilho', caixa: 17143 },
  { nome: 'Cenário C — modesto', caixa: 25000 },
  { nome: 'Cenário D — Fase 1 consolidada', caixa: 42000 },
  { nome: 'Cenário E — transição Fase 2', caixa: 75000 },
  { nome: 'Cenário F — Fase 2 madura', caixa: 150000 },
]

const projecao12m = [
  { mes: 'Mês 1', receita: 2000 }, { mes: 'Mês 2', receita: 5000 }, { mes: 'Mês 3', receita: 12000 },
  { mes: 'Mês 4', receita: 18000 }, { mes: 'Mês 5', receita: 24000 }, { mes: 'Mês 6', receita: 30000 },
  { mes: 'Mês 7', receita: 42000 }, { mes: 'Mês 8', receita: 55000 }, { mes: 'Mês 9', receita: 70000 },
  { mes: 'Mês 10', receita: 82000 }, { mes: 'Mês 11', receita: 95000 }, { mes: 'Mês 12', receita: 110000 },
]

const benchmarkCCT = [
  { cargo: 'ASG (Auxiliar Serviços Gerais)', jornada: '44h semanais', piso: 1730.75, sindicato: 'SIEMACO-RIO' },
  { cargo: 'Porteiro', jornada: '12x36', piso: 1953.06, sindicato: 'SEEMRJ' },
  { cargo: 'Vigia não armado', jornada: '12x36', piso: 1953.06, sindicato: 'SEEMRJ' },
  { cargo: 'Zelador', jornada: '44h semanais', piso: 1953.06, sindicato: 'SEEMRJ' },
  { cargo: 'Porteiro Nível I (mercado)', jornada: '8h diurno', piso: 1617, sindicato: 'Salario.com.br' },
  { cargo: 'Porteiro Nível II', jornada: '8h diurno', piso: 2156, sindicato: 'Salario.com.br' },
  { cargo: 'Porteiro Nível III', jornada: '8h diurno', piso: 2784, sindicato: 'Salario.com.br' },
]

const benchmarkMercado = [
  { servico: 'Portaria 12x36 diurna', min: 2189, max: 10500, unidade: 'R$/mês' },
  { servico: 'Portaria 12x36 noturna', min: 4500, max: 5950, unidade: 'R$/mês' },
  { servico: 'Portaria 8h 5x2', min: 2295, max: 9500, unidade: 'R$/mês' },
  { servico: 'Limpeza predial (ASG 44h/sem)', min: 3500, max: 7200, unidade: 'R$/mês' },
  { servico: 'Limpeza predial (2x/sem 4h)', min: 1095, max: 1900, unidade: 'R$/mês' },
  { servico: 'Limpeza pós-obra residencial', min: 8, max: 23, unidade: 'R$/m²' },
  { servico: 'Limpeza pós-obra premium', min: 15, max: 45, unidade: 'R$/m²' },
  { servico: 'Diária pós-obra até 100m²', min: 250, max: 600, unidade: 'R$/dia' },
  { servico: 'Residencial premium 8h/sem', min: 1095, max: 1500, unidade: 'R$/mês' },
  { servico: 'Copeira por evento 4-6h', min: 280, max: 500, unidade: 'R$/evento' },
  { servico: 'Zelador part-time 20h/sem', min: 1500, max: 2400, unidade: 'R$/mês' },
]

export function SalaSocios() {
  const { proLabore, updateProLabore, pushToast, empresa } = useStore()
  const [tab, setTab] = useState<'caixa' | 'gatilho' | 'cenarios' | 'projecao' | 'benchmark'>('caixa')
  const caixaReal = useCaixaConsolidado()
  const [caixaBruto, setCaixaBruto] = useState(17143)

  const aplicacao = useMemo(() => aplicarRegra(caixaBruto || 0, proLabore || { reservaDAS: 0.2, reservaOperacional: 0.1, gatilhoMinimo: 12000, pctCapitalizacao: 0.4, pctDistribuicao: 0.6, numSocios: 4 }), [caixaBruto, proLabore])
  const aplicacaoReal = useMemo(() => aplicarRegra(caixaReal?.caixaBrutoAcumulado || 0, proLabore || { reservaDAS: 0.2, reservaOperacional: 0.1, gatilhoMinimo: 12000, pctCapitalizacao: 0.4, pctDistribuicao: 0.6, numSocios: 4 }), [caixaReal, proLabore])

  return (
    <>
      <Header title="Sala dos Sócios" subtitle="Área confidencial · Modelo financeiro PS Facilities · Regra 40/60" />
      <div className="p-6 space-y-4">
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-11 w-11 rounded-full bg-brand-500 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Área restrita aos sócios da PS Facilities</div>
              <div className="text-sm text-slate-300">
                Informações aqui são confidenciais e não acessíveis a colaboradores ou gerentes operacionais.
                Dados do sistema alimentam automaticamente o cálculo (ancoragem).
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="h-4 w-4" /> Exportar ata
            </Button>
          </CardContent>
        </Card>

        <Card className="p-1">
          <div className="flex flex-wrap">
            {([
              ['caixa', 'Caixa Consolidado'],
              ['gatilho', 'Calculadora do Gatilho'],
              ['cenarios', 'Cenários 40/60'],
              ['projecao', 'Projeção 12 meses'],
              ['benchmark', 'Benchmark RJ'],
            ] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 min-w-[140px] py-2.5 text-sm font-medium rounded-lg ${tab === k ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
              >{l}</button>
            ))}
          </div>
        </Card>

        {tab === 'caixa' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Caixa Consolidado do Sistema
                  <Badge tone="brand"><Zap className="h-3 w-3" /> Ancorado</Badge>
                </CardTitle>
                <CardDescription>
                  Receitas e saídas registradas em todo o sistema no período {formatDate(caixaReal.periodoInicio)} a {formatDate(caixaReal.periodoFim)}.
                  Atualiza automaticamente a cada lançamento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50">
                    <div className="text-xs font-semibold text-emerald-700 uppercase">Entradas</div>
                    <div className="text-2xl font-bold text-emerald-900 mt-1">{formatBRL(caixaReal.receitaTotal)}</div>
                    <div className="text-xs text-emerald-700 mt-2 space-y-0.5">
                      <div className="flex justify-between"><span>Contratos (recebidos)</span><span>{formatBRL(caixaReal.receitaContratos)}</span></div>
                      <div className="flex justify-between"><span>Serviços avulsos</span><span>{formatBRL(caixaReal.receitaServicosAvulsos)}</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                    <div className="text-xs font-semibold text-red-700 uppercase">Saídas</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">{formatBRL(caixaReal.saidasTotais)}</div>
                    <div className="text-xs text-red-700 mt-2 space-y-0.5">
                      <div className="flex justify-between"><span>Despesas operacionais</span><span>{formatBRL(caixaReal.despesasOperacionais)}</span></div>
                      <div className="flex justify-between"><span>Pagamentos avulsos</span><span>{formatBRL(caixaReal.pagamentosColaboradoresAvulsos)}</span></div>
                      <div className="flex justify-between"><span>Contas pagas</span><span>{formatBRL(caixaReal.contasAPagarPagas)}</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-brand-200 bg-brand-50">
                    <div className="text-xs font-semibold text-brand-700 uppercase">Caixa bruto acumulado</div>
                    <div className="text-3xl font-bold text-brand-900 mt-1">{formatBRL(caixaReal.caixaBrutoAcumulado)}</div>
                    <div className="text-xs text-brand-700 mt-2">
                      = Entradas − Saídas do período
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-slate-900">Aplicando a regra do Gatilho sobre o caixa real</div>
                      <div className="text-xs text-slate-500">
                        Reserva DAS {(proLabore.reservaDAS * 100).toFixed(0)}% + Op. {(proLabore.reservaOperacional * 100).toFixed(0)}% · gatilho {formatBRL(proLabore.gatilhoMinimo)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline"
                      onClick={() => { setCaixaBruto(caixaReal.caixaBrutoAcumulado); setTab('gatilho'); pushToast({ titulo: 'Caixa real aplicado', descricao: 'Calculadora atualizada', tipo: 'success' }) }}
                    >
                      <Zap className="h-3.5 w-3.5" /> Simular na calculadora
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div><div className="text-xs text-slate-500">Caixa bruto</div><div className="font-semibold">{formatBRL(aplicacaoReal.caixaBruto)}</div></div>
                    <div><div className="text-xs text-slate-500">(−) DAS</div><div className="font-semibold text-red-600">-{formatBRL(aplicacaoReal.reservaDAS)}</div></div>
                    <div><div className="text-xs text-slate-500">(−) Operacional</div><div className="font-semibold text-red-600">-{formatBRL(aplicacaoReal.reservaOperacional)}</div></div>
                    <div><div className="text-xs text-slate-500">(=) Líquido</div><div className="font-semibold">{formatBRL(aplicacaoReal.caixaLiquido)}</div></div>
                    <div><div className="text-xs text-slate-500">Gatilho</div>{aplicacaoReal.atingiuGatilho ? <Badge tone="success">ATIVO</Badge> : <Badge tone="warning">INATIVO</Badge>}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200">
                      <div className="text-xs text-sky-700">Retido ({(proLabore.pctCapitalizacao * 100).toFixed(0)}%)</div>
                      <div className="text-lg font-bold text-sky-900">{formatBRL(aplicacaoReal.retencaoCapitalizacao)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="text-xs text-emerald-700">Total aos sócios ({(proLabore.pctDistribuicao * 100).toFixed(0)}%)</div>
                      <div className="text-lg font-bold text-emerald-900">{formatBRL(aplicacaoReal.totalDistribuido)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <div className="text-xs text-slate-500">Por sócio ({(100 / proLabore.numSocios).toFixed(1)}%)</div>
                      <div className="text-lg font-bold text-slate-900">{formatBRL(aplicacaoReal.porSocio)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por sócio (automática)</CardTitle>
                <CardDescription>Baseada no caixa consolidado real do sistema</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {empresa.socios.slice(0, proLabore.numSocios).map((s, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold flex items-center justify-center text-sm">
                      {s.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{s.nome}</div>
                      <div className="text-xs text-slate-500">{(100 / proLabore.numSocios).toFixed(1)}%</div>
                      <div className="text-lg font-bold text-emerald-600 mt-1">{formatBRL(aplicacaoReal.porSocio)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <AcertoSociosCard />

            <Card>
              <CardHeader>
                <CardTitle>Origem dos valores (ancoragem)</CardTitle>
                <CardDescription>Quais módulos alimentam o caixa consolidado</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <THead>
                    <TR>
                      <TH>Módulo</TH>
                      <TH>Tipo</TH>
                      <TH className="text-right">Valor apurado</TH>
                      <TH>Apuração</TH>
                    </TR>
                  </THead>
                  <TBody>
                    <TR>
                      <TD className="font-medium">Financeiro → A receber</TD>
                      <TD><Badge tone="success"><ArrowUp className="h-3 w-3" /> Entrada</Badge></TD>
                      <TD className="text-right font-semibold">{formatBRL(caixaReal.receitaContratos)}</TD>
                      <TD className="text-xs text-slate-500">Lançamentos quitados no período</TD>
                    </TR>
                    <TR>
                      <TD className="font-medium">Serviços Avulsos → concluídos/faturados</TD>
                      <TD><Badge tone="success"><ArrowUp className="h-3 w-3" /> Entrada</Badge></TD>
                      <TD className="text-right font-semibold">{formatBRL(caixaReal.receitaServicosAvulsos)}</TD>
                      <TD className="text-xs text-slate-500">Valor bruto dos jobs</TD>
                    </TR>
                    <TR>
                      <TD className="font-medium">Despesas → todas</TD>
                      <TD><Badge tone="danger"><ArrowDown className="h-3 w-3" /> Saída</Badge></TD>
                      <TD className="text-right font-semibold">{formatBRL(caixaReal.despesasOperacionais)}</TD>
                      <TD className="text-xs text-slate-500">Compras diretas dos sócios</TD>
                    </TR>
                    <TR>
                      <TD className="font-medium">Serviços Avulsos → pagamentos</TD>
                      <TD><Badge tone="danger"><ArrowDown className="h-3 w-3" /> Saída</Badge></TD>
                      <TD className="text-right font-semibold">{formatBRL(caixaReal.pagamentosColaboradoresAvulsos)}</TD>
                      <TD className="text-xs text-slate-500">Diárias de Lucas, Alessandra, etc.</TD>
                    </TR>
                    <TR>
                      <TD className="font-medium">Financeiro → A pagar (quitadas)</TD>
                      <TD><Badge tone="danger"><ArrowDown className="h-3 w-3" /> Saída</Badge></TD>
                      <TD className="text-right font-semibold">{formatBRL(caixaReal.contasAPagarPagas)}</TD>
                      <TD className="text-xs text-slate-500">Folha, INSS, FGTS, fornecedores</TD>
                    </TR>
                    <TR className="bg-slate-50 font-bold">
                      <TD colSpan={2}>CAIXA BRUTO ACUMULADO</TD>
                      <TD className="text-right text-brand-700">{formatBRL(caixaReal.caixaBrutoAcumulado)}</TD>
                      <TD className="text-xs">Valor que alimenta o gatilho</TD>
                    </TR>
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'gatilho' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros da regra</CardTitle>
                <CardDescription>Revisão semestral (deliberação unânime dos 4 sócios)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Reserva DAS (Simples) %</Label>
                  <Input type="number" step="0.01" value={(proLabore.reservaDAS * 100).toFixed(2)}
                    onChange={(e) => updateProLabore({ reservaDAS: Number(e.target.value) / 100 })} />
                </div>
                <div><Label>Reserva Operacional %</Label>
                  <Input type="number" step="0.01" value={(proLabore.reservaOperacional * 100).toFixed(2)}
                    onChange={(e) => updateProLabore({ reservaOperacional: Number(e.target.value) / 100 })} />
                </div>
                <div><Label>Gatilho mínimo (R$)</Label>
                  <Input type="number" step="100" value={proLabore.gatilhoMinimo}
                    onChange={(e) => updateProLabore({ gatilhoMinimo: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>% Retenção</Label>
                    <Input type="number" step="0.01" value={(proLabore.pctCapitalizacao * 100).toFixed(2)}
                      onChange={(e) => { const v = Number(e.target.value) / 100; updateProLabore({ pctCapitalizacao: v, pctDistribuicao: 1 - v }) }} />
                  </div>
                  <div><Label>% Distribuição</Label>
                    <Input type="number" step="0.01" value={(proLabore.pctDistribuicao * 100).toFixed(2)}
                      onChange={(e) => { const v = Number(e.target.value) / 100; updateProLabore({ pctDistribuicao: v, pctCapitalizacao: 1 - v }) }} />
                  </div>
                </div>
                <div><Label>Nº de sócios</Label>
                  <Input type="number" min={1} value={proLabore.numSocios}
                    onChange={(e) => updateProLabore({ numSocios: Number(e.target.value) })} />
                </div>
                <Button variant="outline" className="w-full"
                  onClick={() => { updateProLabore({ reservaDAS: 0.20, reservaOperacional: 0.10, gatilhoMinimo: 12000, pctCapitalizacao: 0.40, pctDistribuicao: 0.60, numSocios: 4 }); pushToast({ titulo: 'Regra restaurada', tipo: 'success' }) }}
                >Restaurar 20/10/12k/40/60</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Simulador manual</CardTitle>
                <CardDescription>Digite o caixa bruto ou use o valor ancorado do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label required>Caixa bruto (R$)</Label>
                    <Input type="number" step="100" value={caixaBruto} onChange={(e) => setCaixaBruto(Number(e.target.value))} className="text-lg font-semibold" />
                  </div>
                  <div className="pt-6">
                    <Button variant="outline" onClick={() => { setCaixaBruto(caixaReal.caixaBrutoAcumulado); pushToast({ titulo: 'Aplicado valor real do sistema', tipo: 'success' }) }}>
                      <Zap className="h-4 w-4" /> Usar caixa real
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Linha label="Caixa bruto" valor={aplicacao.caixaBruto} />
                  <Linha label={`(−) Reserva DAS (${(proLabore.reservaDAS * 100).toFixed(0)}%)`} valor={-aplicacao.reservaDAS} />
                  <Linha label={`(−) Reserva Operacional (${(proLabore.reservaOperacional * 100).toFixed(0)}%)`} valor={-aplicacao.reservaOperacional} />
                  <div className="border-t border-slate-200 my-1" />
                  <Linha label="(=) Caixa Líquido" valor={aplicacao.caixaLiquido} strong />
                </div>

                <div className={`p-4 rounded-lg border-2 ${aplicacao.atingiuGatilho ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
                  <div className="flex items-center gap-2">
                    {aplicacao.atingiuGatilho ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-600" />}
                    <div className="font-semibold">
                      {aplicacao.atingiuGatilho ? 'Gatilho ATINGIDO — distribuição ativa' : 'Gatilho NÃO atingido — 100% retido'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    {formatBRL(aplicacao.caixaLiquido)} {aplicacao.atingiuGatilho ? '≥' : '<'} {formatBRL(proLabore.gatilhoMinimo)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sky-50">
                    <div className="text-xs text-sky-700 font-medium">Retido ({(proLabore.pctCapitalizacao * 100).toFixed(0)}%)</div>
                    <div className="text-xl font-bold text-sky-900">{formatBRL(aplicacao.retencaoCapitalizacao)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50">
                    <div className="text-xs text-emerald-700 font-medium">Por sócio ({(100 / proLabore.numSocios).toFixed(1)}%)</div>
                    <div className="text-xl font-bold text-emerald-900">{formatBRL(aplicacao.porSocio)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'cenarios' && (
          <Card>
            <CardHeader>
              <CardTitle>Cenários 40/60 — 6 níveis de caixa</CardTitle>
              <CardDescription>Recalculados dinamicamente pelos parâmetros atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cenariosBase.map((c) => { const r = aplicarRegra(c.caixa, proLabore); return { ...c, ret: r.retencaoCapitalizacao, dist: r.totalDistribuido } })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={10} tickFormatter={(n) => n.split('—')[0].trim()} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend />
                  <Bar dataKey="ret" fill="#1e4ef5" name="Retenção 40%" />
                  <Bar dataKey="dist" fill="#10b981" name="Distribuição 60%" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Cenário</TH><TH>Caixa bruto</TH><TH>DAS</TH><TH>Operacional</TH>
                      <TH>Líquido</TH><TH>Gatilho</TH><TH>Retenção</TH><TH>Distribuição</TH><TH>Por sócio</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {cenariosBase.map((c) => {
                      const r = aplicarRegra(c.caixa, proLabore)
                      return (
                        <TR key={c.nome}>
                          <TD className="font-medium text-xs">{c.nome}</TD>
                          <TD>{formatBRL(c.caixa)}</TD>
                          <TD className="text-red-600">-{formatBRL(r.reservaDAS)}</TD>
                          <TD className="text-red-600">-{formatBRL(r.reservaOperacional)}</TD>
                          <TD className="font-semibold">{formatBRL(r.caixaLiquido)}</TD>
                          <TD>{r.atingiuGatilho ? <Badge tone="success">Ativo</Badge> : <Badge tone="neutral">Inativo</Badge>}</TD>
                          <TD>{formatBRL(r.retencaoCapitalizacao)}</TD>
                          <TD>{formatBRL(r.totalDistribuido)}</TD>
                          <TD className="font-semibold text-emerald-600">{formatBRL(r.porSocio)}</TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'projecao' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent><div className="text-xs text-slate-500">Meta M3</div><div className="text-xl font-bold">R$ 12.000</div></CardContent></Card>
              <Card><CardContent><div className="text-xs text-slate-500">Meta M6 (fim Fase 1)</div><div className="text-xl font-bold">R$ 30.000</div></CardContent></Card>
              <Card><CardContent><div className="text-xs text-slate-500">Meta M9</div><div className="text-xl font-bold">R$ 60.000</div></CardContent></Card>
              <Card><CardContent><div className="text-xs text-slate-500">Meta M12 (Fase 2)</div><div className="text-xl font-bold">R$ 100.000</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Projeção 12 meses</CardTitle><CardDescription>Custos fixos: 50% mão de obra · 8% material · 8% DAS</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(() => {
                    let acumulado = 0
                    return projecao12m.map((m) => {
                      const lucro = m.receita - m.receita * 0.66 - Math.max(200, m.receita * 0.03)
                      acumulado += lucro
                      const r = aplicarRegra(acumulado, proLabore)
                      return { ...m, lucro, acumulado, liquido: r.caixaLiquido, porSoc: r.porSocio }
                    })
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                    <Line dataKey="receita" stroke="#1e4ef5" strokeWidth={2} name="Receita" />
                    <Line dataKey="liquido" stroke="#10b981" strokeWidth={2} name="Caixa líquido acumulado" />
                    <Line dataKey="porSoc" stroke="#f59e0b" strokeWidth={2} name="Por sócio" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'benchmark' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Pisos CCT — Rio de Janeiro</CardTitle><CardDescription>SIEMACO-RIO e SEEMRJ 2025/2026</CardDescription></CardHeader>
              <Table>
                <THead><TR><TH>Cargo</TH><TH>Jornada</TH><TH>Piso</TH><TH>Sindicato</TH></TR></THead>
                <TBody>
                  {benchmarkCCT.map((b, i) => (
                    <TR key={i}>
                      <TD className="font-medium">{b.cargo}</TD>
                      <TD className="text-xs">{b.jornada}</TD>
                      <TD className="font-semibold">{formatBRL(b.piso)}</TD>
                      <TD className="text-xs"><Badge tone="neutral">{b.sindicato}</Badge></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
            <Card>
              <CardHeader><CardTitle>Preços de mercado</CardTitle><CardDescription>Faixas de referência para orçamentos</CardDescription></CardHeader>
              <Table>
                <THead><TR><TH>Serviço</TH><TH>Mín.</TH><TH>Máx.</TH><TH>Unidade</TH></TR></THead>
                <TBody>
                  {benchmarkMercado.map((b, i) => (
                    <TR key={i}>
                      <TD className="font-medium">{b.servico}</TD>
                      <TD>{b.unidade.startsWith('R$/m²') ? `R$ ${b.min}` : formatBRL(b.min)}</TD>
                      <TD>{b.unidade.startsWith('R$/m²') ? `R$ ${b.max}` : formatBRL(b.max)}</TD>
                      <TD className="text-xs">{b.unidade}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
            <Card className="lg:col-span-2 bg-amber-50 border-amber-200">
              <CardContent>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-amber-700 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900">Metas de margem — PS Facilities</div>
                    <ul className="text-sm text-amber-800 mt-1 space-y-0.5 list-disc ml-4">
                      <li>Serviços avulsos (Fase 1): margem alvo mínima <strong>25%</strong></li>
                      <li>Contratos fixos (Fase 2+): margem alvo mínima <strong>22%</strong></li>
                      <li>Posicionamento: faixa média-alta do mercado</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

function Linha({ label, valor, strong }: { label: string; valor: number; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
      <span className="text-sm">{label}</span>
      <span className={valor < 0 ? 'text-red-600' : ''}>{formatBRL(valor)}</span>
    </div>
  )
}
