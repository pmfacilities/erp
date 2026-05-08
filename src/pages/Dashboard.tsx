import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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
  const { contratos, funcionarios, financeiro, ocorrencias, estoque } = useStore()

  const contratosAtivos = contratos.filter((c) => c.status === 'ativo')
  const receitaMensal = contratosAtivos.reduce((a, c) => a + c.valorMensal, 0)
  const custoMensal = contratosAtivos.reduce((a, c) => a + c.custoMensal, 0)
  const margem = receitaMensal - custoMensal
  const margemPct = (margem / receitaMensal) * 100
  const funcAtivos = funcionarios.filter((f) => f.status === 'ativo').length
  const aReceberAberto = financeiro.filter((f) => f.tipo === 'receber' && f.status !== 'pago').reduce((a, f) => a + f.valor, 0)
  const aPagarAberto = financeiro.filter((f) => f.tipo === 'pagar' && f.status !== 'pago').reduce((a, f) => a + f.valor, 0)
  const ocoAbertas = ocorrencias.filter((o) => o.status !== 'resolvida')
  const estoqueBaixo = estoque.filter((e) => e.quantidade < e.estoqueMinimo)

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral da operação · Abril 2026" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            icon={<DollarSign className="h-5 w-5" />}
            label="Receita contratada"
            value={formatBRL(receitaMensal)}
            delta="+2,0%"
            deltaUp
            sub="vs. mês anterior"
            color="bg-brand-50 text-brand-700"
          />
          <KPI
            icon={<TrendingUp className="h-5 w-5" />}
            label="Margem bruta"
            value={formatBRL(margem)}
            delta={`${margemPct.toFixed(1)}%`}
            deltaUp={margemPct > 15}
            sub={`${contratosAtivos.length} contratos ativos`}
            color="bg-emerald-50 text-emerald-700"
          />
          <KPI
            icon={<Users className="h-5 w-5" />}
            label="Funcionários ativos"
            value={String(funcAtivos)}
            delta="+3"
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
              <CardTitle>Faturamento × Custo (6 meses)</CardTitle>
              <CardDescription>Evolução da receita contratada e custo operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={serieFaturamento}>
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
              <CardTitle>Mix de serviços</CardTitle>
              <CardDescription>Distribuição por faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={distribuicaoServicos} dataKey="valor" nameKey="servico" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {distribuicaoServicos.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
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
              <CardDescription>Posição do mês corrente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MiniStat label="A receber (aberto)" value={formatBRL(aReceberAberto)} icon={<ArrowUpRight className="h-4 w-4 text-emerald-600" />} />
              <MiniStat label="A pagar (aberto)" value={formatBRL(aPagarAberto)} icon={<ArrowDownRight className="h-4 w-4 text-red-500" />} />
              <MiniStat label="Saldo projetado" value={formatBRL(aReceberAberto - aPagarAberto)} tone={aReceberAberto - aPagarAberto > 0 ? 'positive' : 'negative'} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Absenteísmo (%)</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={serieAbsenteismo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="taxa" stroke="#1e4ef5" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Alertas
                <Badge tone="danger">{ocoAbertas.length + estoqueBaixo.length}</Badge>
              </CardTitle>
              <CardDescription>Itens que exigem atenção</CardDescription>
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

        {/* Top contratos rentabilidade */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade por contrato</CardTitle>
            <CardDescription>Top contratos ativos — margem % sobre receita</CardDescription>
          </CardHeader>
          <CardContent>
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
