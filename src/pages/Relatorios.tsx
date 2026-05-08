import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Select, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatBRL } from '@/lib/utils'
import { Download, Filter } from 'lucide-react'
import {
  LineChart, Line, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts'
import { serieFaturamento, serieAbsenteismo, serieHorasExtras, distribuicaoServicos } from '@/data/mockData'

const cores = ['#1e4ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export function Relatorios() {
  const { contratos, funcionarios, ocorrencias, financeiro } = useStore()
  const [contratoSel, setContratoSel] = useState('todos')
  const [periodo, setPeriodo] = useState('6m')

  const contratosFiltrados = useMemo(
    () => contratoSel === 'todos' ? contratos : contratos.filter((c) => c.id === contratoSel),
    [contratos, contratoSel],
  )

  const rentabilidade = contratosFiltrados.filter((c) => c.status === 'ativo').map((c) => ({
    nome: c.numero,
    cliente: c.titulo.slice(0, 20),
    receita: c.valorMensal,
    custo: c.custoMensal,
    margem: c.valorMensal - c.custoMensal,
    margemPct: +((c.valorMensal - c.custoMensal) / c.valorMensal * 100).toFixed(1),
  })).sort((a, b) => b.margem - a.margem)

  const produtividadeCargo = useMemo(() => {
    const byCargo: Record<string, number> = {}
    funcionarios.filter((f) => f.status === 'ativo').forEach((f) => {
      byCargo[f.cargo] = (byCargo[f.cargo] || 0) + 1
    })
    return Object.entries(byCargo).map(([cargo, qtd]) => ({ cargo, qtd }))
  }, [funcionarios])

  const ocoPorCriticidade = useMemo(() => {
    const bycrit: Record<string, number> = { baixa: 0, media: 0, alta: 0, critica: 0 }
    ocorrencias.forEach((o) => { bycrit[o.criticidade]++ })
    return Object.entries(bycrit).map(([name, value]) => ({ name, value }))
  }, [ocorrencias])

  const dsoProjection = useMemo(() => {
    return [
      { mes: 'Nov/25', dso: 38 },
      { mes: 'Dez/25', dso: 42 },
      { mes: 'Jan/26', dso: 35 },
      { mes: 'Fev/26', dso: 33 },
      { mes: 'Mar/26', dso: 31 },
      { mes: 'Abr/26', dso: 29 },
    ]
  }, [])

  const receitaTotal = contratosFiltrados.filter((c) => c.status === 'ativo').reduce((a, c) => a + c.valorMensal, 0)
  const custoTotal = contratosFiltrados.filter((c) => c.status === 'ativo').reduce((a, c) => a + c.custoMensal, 0)
  const margemTotal = receitaTotal - custoTotal
  const margemMedia = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0

  return (
    <>
      <Header title="Relatórios (BI)" subtitle="Análise de desempenho e inteligência operacional" />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4" /> <span className="text-sm font-medium">Filtros</span>
            </div>
            <div className="min-w-[200px]">
              <Label>Contrato</Label>
              <Select value={contratoSel} onChange={(e) => setContratoSel(e.target.value)}>
                <option value="todos">Todos os contratos</option>
                {contratos.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>)}
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="1m">Últimos 30 dias</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="12m">Últimos 12 meses</option>
              </Select>
            </div>
            <div className="flex-1" />
            <Button variant="outline"><Download className="h-4 w-4" /> Exportar PDF</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Exportar Excel</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <KPIBig label="Receita recorrente" value={formatBRL(receitaTotal)} />
          <KPIBig label="Custo direto" value={formatBRL(custoTotal)} />
          <KPIBig label="Margem bruta" value={formatBRL(margemTotal)} accent="positive" />
          <KPIBig label="Margem %" value={`${margemMedia.toFixed(1)}%`} accent={margemMedia > 15 ? 'positive' : margemMedia > 5 ? 'neutral' : 'negative'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita × Custo (6 meses)</CardTitle>
              <CardDescription>Evolução mensal consolidada</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={serieFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita" />
                  <Line type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} name="Custo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rentabilidade por contrato</CardTitle>
              <CardDescription>Margem mensal absoluta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rentabilidade} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="nome" stroke="#64748b" fontSize={12} width={80} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                    {rentabilidade.map((r, i) => (
                      <Cell key={i} fill={r.margemPct >= 15 ? '#10b981' : r.margemPct >= 5 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mix de serviços</CardTitle>
              <CardDescription>Distribuição % sobre faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={distribuicaoServicos} dataKey="valor" nameKey="servico" outerRadius={90} label>
                    {distribuicaoServicos.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Absenteísmo (%)</CardTitle>
              <CardDescription>Média mensal nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={serieAbsenteismo}>
                  <defs>
                    <linearGradient id="gAbs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="taxa" stroke="#f59e0b" strokeWidth={2} fill="url(#gAbs)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horas extras (semanal)</CardTitle>
              <CardDescription>Total de HE acumulada por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={serieHorasExtras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="semana" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v}h`} />
                  <Bar dataKey="horas" fill="#1e4ef5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DSO (dias de recebimento)</CardTitle>
              <CardDescription>Tempo médio para receber dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dsoProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v} dias`} />
                  <Line type="monotone" dataKey="dso" stroke="#8b5cf6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headcount por cargo</CardTitle>
              <CardDescription>Funcionários ativos por cargo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={produtividadeCargo} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="cargo" stroke="#64748b" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="qtd" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ocorrências por criticidade</CardTitle>
              <CardDescription>Acumulado no período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={ocoPorCriticidade} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                    <Cell fill="#94a3b8" />
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alertas inteligentes</CardTitle>
            <CardDescription>Sinais que exigem atenção gerencial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rentabilidade.filter((r) => r.margemPct < 8).slice(0, 3).map((r) => (
              <div key={r.nome} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <div>
                  <div className="font-semibold text-red-900">Margem crítica em {r.nome}</div>
                  <div className="text-xs text-red-700">Margem {r.margemPct}% — abaixo do limite de 8%. Revisar custos do contrato.</div>
                </div>
                <Badge tone="danger">crítico</Badge>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div>
                <div className="font-semibold text-amber-900">Absenteísmo acima da média</div>
                <div className="text-xs text-amber-700">Taxa atual 4,1% — acompanhar postos com maior incidência.</div>
              </div>
              <Badge tone="warning">atenção</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
              <div>
                <div className="font-semibold text-sky-900">DSO reduzindo 23% em 6 meses</div>
                <div className="text-xs text-sky-700">Tempo de recebimento melhorou — gestão de cobrança efetiva.</div>
              </div>
              <Badge tone="info">positivo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function KPIBig({ label, value, accent }: { label: string; value: string; accent?: 'positive' | 'negative' | 'neutral' }) {
  const cls = accent === 'positive' ? 'text-emerald-600' : accent === 'negative' ? 'text-red-600' : 'text-slate-900'
  return (
    <Card>
      <CardContent>
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`text-2xl font-bold ${cls} mt-1`}>{value}</div>
      </CardContent>
    </Card>
  )
}
