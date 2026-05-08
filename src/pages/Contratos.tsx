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
import { Plus, Search, Eye, Trash2, TrendingUp, TrendingDown, Pencil } from 'lucide-react'
import type { Contrato } from '@/data/mockData'

const statusTone: Record<string, any> = {
  ativo: 'success', rascunho: 'info', suspenso: 'warning', encerrado: 'neutral',
}

export function Contratos() {
  const { contratos, clientes, addContrato, updateContrato, removeContrato, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [openNovo, setOpenNovo] = useState(false)
  const [editContrato, setEditContrato] = useState<Contrato | null>(null)
  const [detalhe, setDetalhe] = useState<Contrato | null>(null)

  const filtrados = useMemo(() => {
    return contratos.filter((c) => {
      const clienteNome = clientes.find((cli) => cli.id === c.clienteId)?.nomeFantasia || ''
      const match =
        c.numero.toLowerCase().includes(busca.toLowerCase()) ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        clienteNome.toLowerCase().includes(busca.toLowerCase())
      const statusOk = filtroStatus === 'todos' || c.status === filtroStatus
      return match && statusOk
    })
  }, [contratos, clientes, busca, filtroStatus])

  return (
    <>
      <Header title="Contratos" subtitle={`${contratos.length} contratos cadastrados`} />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar por número, título ou cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-48">
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="rascunho">Rascunho</option>
              <option value="suspenso">Suspenso</option>
              <option value="encerrado">Encerrado</option>
            </Select>
            <Button onClick={() => { setEditContrato(null); setOpenNovo(true) }}>
              <Plus className="h-4 w-4" /> Novo contrato
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtrados.length === 0 ? (
            <EmptyState title="Nenhum contrato encontrado" description="Ajuste os filtros ou crie um novo contrato" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Número</TH>
                  <TH>Título / Cliente</TH>
                  <TH>Vigência</TH>
                  <TH>Valor mensal</TH>
                  <TH>Margem</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtrados.map((c) => {
                  const cliente = clientes.find((cli) => cli.id === c.clienteId)
                  const margemPct = ((c.valorMensal - c.custoMensal) / c.valorMensal) * 100
                  return (
                    <TR key={c.id}>
                      <TD className="font-medium text-slate-900">{c.numero}</TD>
                      <TD>
                        <div className="font-medium text-slate-900">{c.titulo}</div>
                        <div className="text-xs text-slate-500">{cliente?.nomeFantasia}</div>
                      </TD>
                      <TD className="text-xs">
                        {formatDate(c.vigenciaInicio)} <br />
                        <span className="text-slate-500">até {formatDate(c.vigenciaFim)}</span>
                      </TD>
                      <TD className="font-medium">{formatBRL(c.valorMensal)}</TD>
                      <TD>
                        <div className="flex items-center gap-1">
                          {margemPct >= 10 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                          <span className={margemPct >= 10 ? 'text-emerald-700' : margemPct >= 5 ? 'text-amber-700' : 'text-red-600'}>
                            {margemPct.toFixed(1)}%
                          </span>
                        </div>
                      </TD>
                      <TD><Badge tone={statusTone[c.status]}>{c.status}</Badge></TD>
                      <TD className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => setDetalhe(c)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditContrato(c); setOpenNovo(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Remover contrato ${c.numero}?`)) {
                              removeContrato(c.id)
                              pushToast({ titulo: 'Contrato removido', tipo: 'success' })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <NovoContratoDialog
        open={openNovo}
        onClose={() => setOpenNovo(false)}
        contrato={editContrato}
        onSave={(c) => {
          if (editContrato) {
            updateContrato(editContrato.id, c)
            pushToast({ titulo: 'Contrato atualizado', descricao: c.numero, tipo: 'success' })
          } else {
            addContrato(c)
            pushToast({ titulo: 'Contrato criado', descricao: c.numero, tipo: 'success' })
          }
          setOpenNovo(false)
        }}
      />
      <DetalheContrato contrato={detalhe} onClose={() => setDetalhe(null)} />
    </>
  )
}

function NovoContratoDialog({
  open, onClose, onSave, contrato,
}: { open: boolean; onClose: () => void; onSave: (c: Omit<Contrato, 'id' | 'criadoEm'>) => void; contrato: Contrato | null }) {
  const { clientes } = useStore()
  const [numero, setNumero] = useState('CT-2026-' + String(Math.floor(Math.random() * 900) + 100))
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '')
  const [titulo, setTitulo] = useState('')
  const [servico, setServico] = useState('limpeza')
  const [vigenciaInicio, setVigenciaInicio] = useState('2026-05-01')
  const [vigenciaFim, setVigenciaFim] = useState('2028-04-30')
  const [valorMensal, setValorMensal] = useState('')
  const [custoMensal, setCustoMensal] = useState('')
  const [indice, setIndice] = useState<Contrato['indiceReajuste']>('IPCA')
  const [statusEdit, setStatusEdit] = useState<Contrato['status']>('rascunho')
  const [saving, setSaving] = useState(false)

  useMemo(() => {
    if (contrato) {
      setNumero(contrato.numero)
      setClienteId(contrato.clienteId)
      setTitulo(contrato.titulo)
      setServico(contrato.servicos[0] || 'limpeza')
      setVigenciaInicio(contrato.vigenciaInicio)
      setVigenciaFim(contrato.vigenciaFim)
      setValorMensal(String(contrato.valorMensal))
      setCustoMensal(String(contrato.custoMensal))
      setIndice(contrato.indiceReajuste)
      setStatusEdit(contrato.status)
    } else {
      setNumero('CT-2026-' + String(Math.floor(Math.random() * 900) + 100))
      setClienteId(clientes[0]?.id || '')
      setTitulo(''); setServico('limpeza'); setValorMensal(''); setCustoMensal('')
      setVigenciaInicio('2026-05-01'); setVigenciaFim('2028-04-30')
      setIndice('IPCA'); setStatusEdit('rascunho')
    }
  }, [contrato, open])

  const salvar = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    onSave({
      numero, clienteId, titulo, servicos: [servico],
      vigenciaInicio, vigenciaFim,
      valorMensal: Number(valorMensal || 0), custoMensal: Number(custoMensal || 0),
      indiceReajuste: indice, proximoReajuste: vigenciaInicio,
      postos: contrato?.postos || [], status: statusEdit,
    })
    setSaving(false)
  }

  return (
    <Dialog
      open={open} onClose={onClose}
      title={contrato ? `Editar contrato ${contrato.numero}` : 'Novo contrato'}
      description="Dados básicos · postos permanecem vinculados"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} loading={saving} disabled={!titulo || !clienteId}>
            {contrato ? 'Salvar alterações' : 'Criar contrato'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Número do contrato</Label>
          <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
        </div>
        <div>
          <Label required>Cliente</Label>
          <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nomeFantasia}</option>)}
          </Select>
        </div>
        <div className="col-span-2">
          <Label required>Título / Objeto</Label>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Limpeza e portaria 24h" />
        </div>
        <div>
          <Label>Serviço principal</Label>
          <Select value={servico} onChange={(e) => setServico(e.target.value)}>
            <option value="limpeza">Limpeza</option>
            <option value="portaria">Portaria</option>
            <option value="manutencao">Manutenção</option>
            <option value="seguranca">Segurança</option>
            <option value="jardinagem">Jardinagem</option>
          </Select>
        </div>
        <div>
          <Label>Índice de reajuste</Label>
          <Select value={indice} onChange={(e) => setIndice(e.target.value as any)}>
            <option value="IPCA">IPCA</option>
            <option value="IGPM">IGP-M</option>
            <option value="INPC">INPC</option>
            <option value="CCT">CCT (Convenção)</option>
          </Select>
        </div>
        <div>
          <Label required>Vigência início</Label>
          <Input type="date" value={vigenciaInicio} onChange={(e) => setVigenciaInicio(e.target.value)} />
        </div>
        <div>
          <Label required>Vigência fim</Label>
          <Input type="date" value={vigenciaFim} onChange={(e) => setVigenciaFim(e.target.value)} />
        </div>
        <div>
          <Label required>Valor mensal (R$)</Label>
          <Input type="number" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <Label>Custo mensal estimado (R$)</Label>
          <Input type="number" value={custoMensal} onChange={(e) => setCustoMensal(e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={statusEdit} onChange={(e) => setStatusEdit(e.target.value as any)}>
            <option value="rascunho">Rascunho</option>
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="encerrado">Encerrado</option>
          </Select>
        </div>
      </div>
    </Dialog>
  )
}

function DetalheContrato({ contrato, onClose }: { contrato: Contrato | null; onClose: () => void }) {
  const { clientes, funcionarios } = useStore()
  if (!contrato) return null
  const cliente = clientes.find((c) => c.id === contrato.clienteId)
  const equipe = funcionarios.filter((f) => f.contratoId === contrato.id)
  const margem = contrato.valorMensal - contrato.custoMensal
  const margemPct = (margem / contrato.valorMensal) * 100
  const receitaAno = contrato.valorMensal * 12
  const custoAno = contrato.custoMensal * 12
  return (
    <Dialog open onClose={onClose} title={contrato.numero} description={contrato.titulo} size="xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <InfoCell label="Cliente" value={cliente?.nomeFantasia || '-'} />
        <InfoCell label="Vigência" value={`${formatDate(contrato.vigenciaInicio)} → ${formatDate(contrato.vigenciaFim)}`} />
        <InfoCell label="Status" value={<Badge tone={statusTone[contrato.status]}>{contrato.status}</Badge>} />
        <InfoCell label="Valor mensal" value={formatBRL(contrato.valorMensal)} />
        <InfoCell label="Custo mensal" value={formatBRL(contrato.custoMensal)} />
        <InfoCell label="Margem" value={<span className={margemPct >= 10 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{formatBRL(margem)} ({margemPct.toFixed(1)}%)</span>} />
      </div>

      <Card className="mb-4">
        <CardHeader><CardTitle>Rentabilidade projetada (12 meses)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><div className="text-xs text-slate-500">Receita anual</div><div className="text-lg font-semibold text-emerald-600">{formatBRL(receitaAno)}</div></div>
          <div><div className="text-xs text-slate-500">Custo anual</div><div className="text-lg font-semibold text-red-600">{formatBRL(custoAno)}</div></div>
          <div><div className="text-xs text-slate-500">Lucro anual</div><div className="text-lg font-semibold text-brand-600">{formatBRL(receitaAno - custoAno)}</div></div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader><CardTitle>Postos de serviço ({contrato.postos.length})</CardTitle></CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {contrato.postos.map((p, i) => (
            <div key={i} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{p.nome}</div>
                <div className="text-xs text-slate-500">{p.endereco}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{p.funcao}</div>
                <div className="text-xs text-slate-500">{p.efetivos} efetivos</div>
              </div>
            </div>
          ))}
          {contrato.postos.length === 0 && <div className="text-sm text-slate-500 py-2">Nenhum posto cadastrado</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Equipe alocada ({equipe.length})</CardTitle></CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {equipe.slice(0, 6).map((f) => (
            <div key={f.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{f.nome}</div>
                <div className="text-xs text-slate-500">{f.cargo} · {f.postoNome}</div>
              </div>
              <Badge tone={f.status === 'ativo' ? 'success' : 'warning'}>{f.status}</Badge>
            </div>
          ))}
          {equipe.length === 0 && <div className="text-sm text-slate-500 py-2">Nenhum funcionário alocado</div>}
        </CardContent>
      </Card>
    </Dialog>
  )
}

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm mt-1 text-slate-900">{value}</div>
    </div>
  )
}
