// =====================================================
// Ancoragem financeira
// Calcula o Caixa Bruto Consolidado real a partir de TODAS
// as entradas e saídas registradas no sistema.
// Esse valor alimenta a Calculadora do Gatilho (Sala dos Sócios).
// =====================================================

import { useStore } from '@/store/useStore'
import { useMemo } from 'react'

export interface CaixaConsolidado {
  // entradas
  receitaContratos: number
  receitaServicosAvulsos: number
  receitaTotal: number
  // saídas
  despesasOperacionais: number
  pagamentosColaboradoresAvulsos: number
  contasAPagarPagas: number
  saidasTotais: number
  // resultado
  caixaBrutoAcumulado: number
  // detalhes por período (mês corrente)
  periodoInicio: string
  periodoFim: string
  // apuração
  apuradoEm: string
}

export function useCaixaConsolidado(opts?: { inicio?: string; fim?: string }): CaixaConsolidado {
  const financeiro = useStore((s) => s.financeiro)
  const servicosAvulsos = useStore((s) => s.servicosAvulsos)
  const despesas = useStore((s) => s.despesas)
  const pagamentosAvulsos = useStore((s) => s.pagamentosAvulsos)

  return useMemo(() => {
    const inicio = opts?.inicio || '2026-04-01'
    const fim = opts?.fim || '2026-04-30'
    const inPeriodo = (d: string) => d >= inicio && d <= fim

    // entradas
    const receitaContratos = financeiro
      .filter((l) => l.tipo === 'receber' && l.status === 'pago' && l.pagamento && inPeriodo(l.pagamento))
      .reduce((a, l) => a + l.valor, 0)

    const receitaServicosAvulsos = servicosAvulsos
      .filter((s) => ['concluido', 'faturado'].includes(s.status) && inPeriodo(s.data))
      .reduce((a, s) => a + s.valorBruto, 0)

    const receitaTotal = receitaContratos + receitaServicosAvulsos

    // saídas
    const despesasOperacionais = despesas
      .filter((d) => inPeriodo(d.data))
      .reduce((a, d) => a + d.valor, 0)

    const pagamentosColaboradoresAvulsos = pagamentosAvulsos
      .filter((p) => p.status === 'pago' && inPeriodo(p.diaTrabalhado))
      .reduce((a, p) => a + p.valor, 0)

    const contasAPagarPagas = financeiro
      .filter((l) => l.tipo === 'pagar' && l.status === 'pago' && l.pagamento && inPeriodo(l.pagamento))
      .reduce((a, l) => a + l.valor, 0)

    const saidasTotais = despesasOperacionais + pagamentosColaboradoresAvulsos + contasAPagarPagas

    const caixaBrutoAcumulado = Math.max(0, receitaTotal - saidasTotais)

    return {
      receitaContratos,
      receitaServicosAvulsos,
      receitaTotal,
      despesasOperacionais,
      pagamentosColaboradoresAvulsos,
      contasAPagarPagas,
      saidasTotais,
      caixaBrutoAcumulado,
      periodoInicio: inicio,
      periodoFim: fim,
      apuradoEm: new Date().toISOString(),
    }
  }, [financeiro, servicosAvulsos, despesas, pagamentosAvulsos, opts?.inicio, opts?.fim])
}

// =====================================================
// Aplica a regra 20/10/40/60 (mesmos parâmetros da planilha)
// sobre um valor de caixa bruto informado
// =====================================================

export interface AplicacaoRegra {
  caixaBruto: number
  reservaDAS: number
  reservaOperacional: number
  caixaLiquido: number
  atingiuGatilho: boolean
  retencaoCapitalizacao: number
  totalDistribuido: number
  porSocio: number
}

export function aplicarRegra(
  caixaBruto: number,
  regra: { reservaDAS: number; reservaOperacional: number; gatilhoMinimo: number; pctCapitalizacao: number; pctDistribuicao: number; numSocios: number },
): AplicacaoRegra {
  const reservaDAS = caixaBruto * regra.reservaDAS
  const reservaOperacional = caixaBruto * regra.reservaOperacional
  const caixaLiquido = caixaBruto - reservaDAS - reservaOperacional
  const atingiu = caixaLiquido >= regra.gatilhoMinimo
  const totalDistribuido = atingiu ? caixaLiquido * regra.pctDistribuicao : 0
  const retencao = atingiu ? caixaLiquido * regra.pctCapitalizacao : caixaLiquido
  const porSocio = atingiu ? totalDistribuido / regra.numSocios : 0
  return {
    caixaBruto,
    reservaDAS,
    reservaOperacional,
    caixaLiquido,
    atingiuGatilho: atingiu,
    retencaoCapitalizacao: retencao,
    totalDistribuido,
    porSocio,
  }
}
