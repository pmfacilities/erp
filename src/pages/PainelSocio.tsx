import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { useCaixaConsolidado, aplicarRegra } from '@/lib/caixaConsolidado'
import { CheckCircle2, XCircle, Target, TrendingUp, Calendar, Users } from 'lucide-react'
import { AcertoSociosCard } from '@/components/AcertoSociosCard'

// =====================================================
// PAINEL DO SÓCIO — versão enxuta
// Visível para todos os sócios (gestor + comuns).
// Mostra só o essencial: distribuição do mês, meta, alerta.
// Sem parâmetros, sem benchmark, sem cenários editáveis.
// =====================================================

export function PainelSocio() {
  const { proLabore, empresa, sessao, servicosAvulsos, contratos } = useStore()
  const caixaReal = useCaixaConsolidado()
  const aplicacao = aplicarRegra(caixaReal.caixaBrutoAcumulado, proLabore)

  const metaMes = 30000 // meta fim Fase 1
  const progressoMeta = Math.min(100, (caixaReal.receitaTotal / metaMes) * 100)
  const receitaRecorrente = contratos.filter((c) => c.status === 'ativo').reduce((a, c) => a + c.valorMensal, 0)
  const servicosAvulsosMes = servicosAvulsos.filter((s) => ['concluido', 'faturado'].includes(s.status)).length

  return (
    <>
      <Header title="Painel do Sócio" subtitle={`Olá, ${sessao?.nome.split(' ')[0] || 'sócio'} · resumo executivo do mês`} />
      <div className="p-6 space-y-4">
        {/* Card principal: sua distribuição */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm opacity-90">Sua distribuição deste mês</div>
                <div className="text-5xl font-bold mt-1">{formatBRL(aplicacao.porSocio)}</div>
                <div className="text-sm opacity-90 mt-1">
                  Participação {(100 / proLabore.numSocios).toFixed(1)}% · Regra 40/60 aplicada sobre caixa líquido
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80">Status do gatilho</div>
                {aplicacao.atingiuGatilho
                  ? <div className="flex items-center gap-1.5 text-emerald-100 font-semibold mt-1"><CheckCircle2 className="h-5 w-5" /> ATINGIDO</div>
                  : <div className="flex items-center gap-1.5 text-amber-200 font-semibold mt-1"><XCircle className="h-5 w-5" /> NÃO ATINGIDO</div>}
                <div className="text-xs opacity-80 mt-2">Líquido: {formatBRL(aplicacao.caixaLiquido)}</div>
                <div className="text-xs opacity-80">Gatilho: {formatBRL(proLabore.gatilhoMinimo)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs resumidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 text-slate-500 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Receita total</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{formatBRL(caixaReal.receitaTotal)}</div>
              <div className="text-xs text-slate-500 mt-1">Contratos + avulsos do mês</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 text-slate-500 text-xs"><Calendar className="h-3.5 w-3.5" /> Serviços avulsos</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{servicosAvulsosMes}</div>
              <div className="text-xs text-slate-500 mt-1">Jobs executados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 text-slate-500 text-xs"><Users className="h-3.5 w-3.5" /> Contratos ativos</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{contratos.filter((c) => c.status === 'ativo').length}</div>
              <div className="text-xs text-slate-500 mt-1">Receita recorrente {formatBRL(receitaRecorrente)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 text-slate-500 text-xs"><Target className="h-3.5 w-3.5" /> Próxima meta</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{formatBRL(metaMes)}</div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${progressoMeta}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{progressoMeta.toFixed(1)}% atingido · M6 (Fase 1)</div>
            </CardContent>
          </Card>
        </div>

        {/* Saldo compacto do próprio sócio no acerto */}
        <AcertoSociosCard compacto />

        {/* Distribuição por sócio */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição entre os sócios</CardTitle>
            <CardDescription>Participação igualitária · atualizada em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {empresa.socios.slice(0, proLabore.numSocios).map((s, i) => {
              const vocêÉ = s.nome === sessao?.nome
              return (
                <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 ${vocêÉ ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200'}`}>
                  <div className={`h-10 w-10 rounded-full font-semibold flex items-center justify-center text-sm ${vocêÉ ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {s.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {s.nome}
                      {vocêÉ && <Badge tone="brand" className="ml-1.5 text-[10px]">VOCÊ</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">{(100 / proLabore.numSocios).toFixed(1)}%</div>
                    <div className="text-lg font-bold text-emerald-600 mt-1">{formatBRL(aplicacao.porSocio)}</div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Meta e jornada */}
        <Card>
          <CardHeader>
            <CardTitle>Jornada do modelo financeiro</CardTitle>
            <CardDescription>Fases planejadas — regra 40/60 vigente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <JornadaItem mes="M3" meta="R$ 12.000" rotulo="Primeiro gatilho ativo" atingido={caixaReal.caixaBrutoAcumulado >= 12000} />
              <JornadaItem mes="M6" meta="R$ 30.000" rotulo="Fim Fase 1 — bootstrap" atingido={caixaReal.caixaBrutoAcumulado >= 30000} />
              <JornadaItem mes="M9" meta="R$ 60.000" rotulo="Transição Fase 2" atingido={caixaReal.caixaBrutoAcumulado >= 60000} />
              <JornadaItem mes="M12" meta="R$ 100.000" rotulo="Fase 2 consolidada" atingido={caixaReal.caixaBrutoAcumulado >= 100000} />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
              <strong>Período apurado:</strong> {formatDate(caixaReal.periodoInicio)} a {formatDate(caixaReal.periodoFim)} ·
              Caixa bruto consolidado: <strong className="text-slate-900">{formatBRL(caixaReal.caixaBrutoAcumulado)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50">
          <CardContent className="flex items-start gap-3">
            <Target className="h-5 w-5 text-sky-700 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-sky-900">
              <div className="font-semibold">Regra de distribuição vigente</div>
              <div className="text-xs mt-1">
                Do caixa bruto, separamos {(proLabore.reservaDAS * 100).toFixed(0)}% para DAS e {(proLabore.reservaOperacional * 100).toFixed(0)}% para reserva operacional.
                Quando o caixa líquido atinge {formatBRL(proLabore.gatilhoMinimo)}, {(proLabore.pctDistribuicao * 100).toFixed(0)}% é distribuído aos {proLabore.numSocios} sócios (igualmente) e {(proLabore.pctCapitalizacao * 100).toFixed(0)}% fica retido em Reserva de Capitalização.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function JornadaItem({ mes, meta, rotulo, atingido }: { mes: string; meta: string; rotulo: string; atingido: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${atingido ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
      <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${atingido ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {mes}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900">{rotulo}</div>
        <div className="text-xs text-slate-500">Receita alvo: {meta}</div>
      </div>
      {atingido
        ? <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Atingida</Badge>
        : <Badge tone="neutral">Pendente</Badge>}
    </div>
  )
}
