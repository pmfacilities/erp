import React from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { formatBRL } from '@/lib/utils'
import {
  DollarSign, TrendingUp, Users, FileText, AlertTriangle, Package,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { serieFaturamento, serieAbsenteismo, distribuicaoServicos } from '@/data/mockData'
import { Link } from 'react-router-dom'

const chartColors = ['#1e4ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function Dashboard() {
  const { contratos, funcionarios, financeiro, ocorrencias, estoque, servicosAvulsos, despesas, pagamentosAvulsos, addServicoAvulso, addLancamento } = useStore()

  // KPIs Reais
  const contratosAtivos = (contratos || []).filter((c) => c.status === 'ativo')
  const servicosMes = (servicosAvulsos || []).filter((s) => ['concluido', 'faturado'].includes(s.status))
  
  const receitaContratos = contratosAtivos.reduce((a, c) => a + c.valorMensal, 0)
  const receitaAvulsos = servicosMes.reduce((a, s) => a + s.valorBruto, 0)
  const receitaTotal = receitaContratos + receitaAvulsos

  const custoFixos = contratosAtivos.reduce((a, c) => a + c.custoMensal, 0)
  const custoMaoAvulso = servicosMes.reduce((a, s) => a + s.custoMaoDeObra, 0)
  const custoMatAvulso = servicosMes.reduce((a, s) => a + s.custoMaterial, 0)
  const totalDespesas = (despesas || []).reduce((a, d) => a + d.valor, 0)
  
  const margem = receitaTotal - custoFixos - custoMaoAvulso - custoMatAvulso - totalDespesas
  const margemPct = receitaTotal > 0 ? (margem / receitaTotal) * 100 : 0
  
  const funcAtivos = (funcionarios || []).filter((f) => f.status === 'ativo' || f.status === 'avulso').length
  const ocoAbertas = (ocorrencias || []).filter((o) => o.status !== 'resolvida')
  
  const aReceberAberto = (financeiro || []).filter((f) => f.tipo === 'receber' && f.status !== 'pago').reduce((a, f) => a + f.valor, 0)
  const aPagarAberto = (financeiro || []).filter((f) => f.tipo === 'pagar' && f.status !== 'pago').reduce((a, f) => a + f.valor, 0)
  const estoqueBaixo = (estoque || []).filter((e) => e.quantidade < e.estoqueMinimo)

  // Gráfico de faturamento real (simulado com base nos dados atuais como 'ponto de agora')
  const chartData = [
    { mes: 'Meta', receita: 30000, custo: 22000 },
    { mes: 'Real (Atual)', receita: receitaTotal, custo: receitaTotal - margem },
  ]

  const mixServicos = [
    { servico: 'Contratos Fixos', valor: receitaContratos },
    { servico: 'Serviços Avulsos', valor: receitaAvulsos },
  ]

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral da operação · Real-time" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            icon={<DollarSign className="h-5 w-5" />}
            label="Receita total"
            value={formatBRL(receitaTotal)}
            delta={formatBRL(receitaAvulsos)}
            deltaUp
            sub="incl. avulsos"
            color="bg-brand-50 text-brand-700"
          />
          <KPI
            icon={<TrendingUp className="h-5 w-5" />}
            label="Margem estimada"
            value={formatBRL(margem)}
            delta={`${margemPct.toFixed(1)}%`}
            deltaUp={margemPct > 15}
            sub={`${contratosAtivos.length} contratos ativos`}
            color="bg-emerald-50 text-emerald-700"
          />
          <KPI
            icon={<Users className="h-5 w-5" />}
            label="Equipe ativa"
            value={String(funcAtivos)}
            delta={String(funcionarios.filter(f => f.status === 'avulso').length) + ' avulsos'}
            deltaUp
            sub={`${funcionarios.length} no total`}
            color="bg-sky-50 text-sky-700"
          />
          <KPI
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Ocorrências abertas"
            value={String(ocoAbertas.length)}
            delta={String(ocoAbertas.filter((o) => o.criticidade === 'critica').length) + ' críticas'}
            deltaUp={false}
            sub="requer atenção"
            color="bg-amber-50 text-amber-700"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Desempenho Financeiro Real</CardTitle>
              <CardDescription>Receita Total vs Custo Operacional (Consolidado)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e4ef5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1e4ef5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Area type="monotone" dataKey="receita" stroke="#1e4ef5" fill="url(#g1)" strokeWidth={2} name="Receita" />
                  <Area type="monotone" dataKey="custo" stroke="#ef4444" fill="url(#g2)" strokeWidth={2} name="Custo" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mix de Faturamento</CardTitle>
              <CardDescription>Distribuição Fixos vs Avulsos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={mixServicos} dataKey="valor" nameKey="servico" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {mixServicos.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>Fluxo de caixa aberto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MiniStat label="A receber (aberto)" value={formatBRL(aReceberAberto)} icon={<ArrowUpRight className="h-4 w-4 text-emerald-600" />} />
              <MiniStat label="A pagar (aberto)" value={formatBRL(aPagarAberto)} icon={<ArrowDownRight className="h-4 w-4 text-red-500" />} />
              <MiniStat label="Saldo projetado" value={formatBRL(aReceberAberto - aPagarAberto)} tone={aReceberAberto - aPagarAberto > 0 ? 'positive' : 'negative'} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Escalas e Turnos</CardTitle>
              <CardDescription>Cobertura operacional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Alocações no mês</span>
                  <span className="font-semibold">{useStore.getState().escalas.length}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Faltas registradas</span>
                  <span className="font-semibold text-red-600">{useStore.getState().escalas.filter(e => e.status === 'falta').length}</span>
               </div>
               <Button variant="outline" className="w-full text-xs" asChild><Link to="/escalas">Ver escalas completas</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Alertas
                <Badge tone="danger">{ocoAbertas.length + estoqueBaixo.length}</Badge>
              </CardTitle>
              <CardDescription>Prioridade máxima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ocoAbertas.slice(0, 3).map((o) => (
                <Link to="/ocorrencias" key={o.id} className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{o.titulo}</div>
                      <div className="text-xs text-slate-500 truncate">{o.postoNome}</div>
                    </div>
                    <Badge tone={o.criticidade === 'critica' ? 'danger' : o.criticidade === 'alta' ? 'warning' : 'info'}>
                      {o.criticidade}
                    </Badge>
                  </div>
                </Link>
              ))}
              {estoqueBaixo.slice(0, 2).map((e) => (
                <Link to="/estoque" key={e.id} className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{e.nome}</div>
                      <div className="text-xs text-slate-500">Estoque {e.quantidade} / mín {e.estoqueMinimo}</div>
                    </div>
                    <Badge tone="danger">Baixo</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Rentabilidade real dos contratos ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade por contrato</CardTitle>
            <CardDescription>Margem real calculada (Receita - Custo Mensal)</CardDescription>
          </CardHeader>
          <CardContent>
            {contratosAtivos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm italic">Nenhum contrato ativo para exibir rentabilidade.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={contratosAtivos.map((c) => ({
                  nome: c.numero,
                  margem: +((c.valorMensal - c.custoMensal) / c.valorMensal * 100).toFixed(1),
                  receita: c.valorMensal,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="margem" radius={[4, 4, 0, 0]}>
                    {contratosAtivos.map((c, i) => {
                      const m = (c.valorMensal - c.custoMensal) / c.valorMensal * 100
                      const color = m < 5 ? '#ef4444' : m < 12 ? '#f59e0b' : '#10b981'
                      return <Cell key={i} fill={color} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function KPI({
  icon, label, value, delta, deltaUp, sub, color,
}: { icon: React.ReactNode; label: string; value: string; delta?: string; deltaUp?: boolean; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
          <div className="flex items-center gap-2 mt-2">
            {delta && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${deltaUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {deltaUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {delta}
              </span>
            )}
            {sub && <span className="text-xs text-slate-500">{sub}</span>}
          </div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value, icon, tone }: { label: string; value: string; icon?: React.ReactNode; tone?: 'positive' | 'negative' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-red-600' : 'text-slate-900'}`}>
        {icon}{value}
      </div>
    </div>
  )
}
