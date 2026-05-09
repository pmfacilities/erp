import React, { useState, useMemo } from 'react'
import { 
  Plus, Search, FileText, Download, Share2, 
  Trash2, Edit, ChevronRight, CheckCircle, 
  Clock, XCircle, MoreVertical, Printer, 
  Copy, MessageSquare, Building2, User, 
  Phone, Mail, MapPin, Calendar, CreditCard, AlertTriangle
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Input'
import { formatBRL, cn } from '@/lib/utils'
import { Orcamento, OrcamentoItem } from '@/data/mockExtras'

export function Orcamentos() {
  const orcamentos = useStore((s) => s.orcamentos)
  const addOrcamento = useStore((s) => s.addOrcamento)
  const removeOrcamento = useStore((s) => s.removeOrcamento)
  const pushToast = useStore((s) => s.pushToast)
  const empresa = useStore((s) => s.empresa)

  const [busca, setBusca] = useState('')
  const [modalNovo, setModalNovo] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState<Orcamento | null>(null)
  
  // Estado para novo orçamento
  const [novo, setNovo] = useState({
    clienteNome: '',
    clienteContato: '',
    clienteEmail: '',
    clienteEndereco: '',
    observacoes: '',
    condicoesPagamento: '30 dias',
    validadeDias: 7
  })
  
  const [itens, setItens] = useState<Array<{ descricao: string; quantidade: number; valorUnitario: number }>>([
    { descricao: '', quantidade: 1, valorUnitario: 0 }
  ])

  const orcamentosFiltrados = useMemo(() => {
    return orcamentos.filter(o => 
      o.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      o.numero.toLowerCase().includes(busca.toLowerCase())
    )
  }, [orcamentos, busca])

  const totalOrcamento = itens.reduce((acc, it) => acc + (Number(it.valorUnitario) * Number(it.quantidade)), 0)

  const handleAddItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valorUnitario: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (itens.length === 1) return
    setItens(itens.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItens = [...itens]
    // @ts-ignore
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }

  const handleSalvar = async () => {
    if (!novo.clienteNome || itens.some(it => !it.descricao)) {
      pushToast({ titulo: 'Campos obrigatórios', descricao: 'Preencha o cliente e a descrição dos itens.', tipo: 'warning' })
      return
    }

    const numero = `ORC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    const success = await addOrcamento({
      ...novo,
      numero,
      dataEmissao: new Date().toISOString().slice(0, 10),
      status: 'rascunho',
      total: totalOrcamento
    }, itens.map(it => ({
      ...it,
      valorTotal: Number(it.quantidade) * Number(it.valorUnitario)
    })))

    if (success) {
      setModalNovo(false)
      setNovo({
        clienteNome: '', clienteContato: '', clienteEmail: '', clienteEndereco: '',
        observacoes: '', condicoesPagamento: '30 dias', validadeDias: 7
      })
      setItens([{ descricao: '', quantidade: 1, valorUnitario: 0 }])
    }
  }

  const handleCopyWhatsApp = (o: Orcamento) => {
    const text = `*ORÇAMENTO - ${empresa.nomeFantasia}*\n` +
      `Número: ${o.numero}\n` +
      `Cliente: ${o.clienteNome}\n` +
      `Data: ${new Date(o.dataEmissao).toLocaleDateString('pt-BR')}\n\n` +
      `*Serviços:*\n` +
      o.itens.map(it => `- ${it.descricao}: ${formatBRL(it.valorUnitario)} x ${it.quantidade} = ${formatBRL(it.valorTotal)}`).join('\n') +
      `\n\n*Total: ${formatBRL(o.total)}*\n\n` +
      `Condições: ${o.condicoesPagamento || 'A combinar'}\n` +
      `Validade: ${o.validadeDias} dias`

    navigator.clipboard.writeText(text)
    pushToast({ titulo: 'Copiado!', descricao: 'Texto formatado para WhatsApp copiado.', tipo: 'success' })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gerador de Orçamentos</h1>
          <p className="text-slate-500 text-sm">Crie, envie e gerencie propostas comerciais</p>
        </div>
        <Button onClick={() => setModalNovo(true)} className="bg-brand-600 hover:bg-brand-700 w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
        </Button>
      </div>

      <div className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por cliente ou número..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orcamentosFiltrados.map((o) => (
          <Card key={o.id} className="hover:shadow-md transition-all border-slate-200 group">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{o.numero}</div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate max-w-[150px]">{o.clienteNome}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-50">
                <div className="text-xs text-slate-500">Valor Total</div>
                <div className="font-bold text-lg text-slate-900">{formatBRL(o.total)}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8" 
                  onClick={() => setModalDetalhes(o)}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" /> Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-2 h-8"
                  onClick={() => handleCopyWhatsApp(o)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-2 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Excluir orçamento?')) removeOrcamento(o.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: Novo Orçamento */}
      <Dialog 
        open={modalNovo} 
        onClose={() => setModalNovo(false)} 
        title="Criar Novo Orçamento"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Input 
                  placeholder="Nome da empresa ou pessoa"
                  value={novo.clienteNome}
                  onChange={(e) => setNovo({...novo, clienteNome: e.target.value})}
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input 
                  placeholder="Local do serviço"
                  value={novo.clienteEndereco}
                  onChange={(e) => setNovo({...novo, clienteEndereco: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Contato / WhatsApp</Label>
                <Input 
                  placeholder="(00) 00000-0000"
                  value={novo.clienteContato}
                  onChange={(e) => setNovo({...novo, clienteContato: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="cliente@email.com"
                  value={novo.clienteEmail}
                  onChange={(e) => setNovo({...novo, clienteEmail: e.target.value})}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Itens e Serviços</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-8 text-[10px]">
                <Plus className="h-3 w-3 mr-1" /> Adicionar Item
              </Button>
            </div>
            <div className="space-y-3">
              {itens.map((it, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 items-end bg-slate-50/50 p-3 rounded-lg border border-slate-100 relative group/item">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Descrição do Serviço</span>
                    <Input 
                      placeholder="Ex: Limpeza de fachada"
                      className="bg-white"
                      value={it.descricao}
                      onChange={(e) => handleItemChange(idx, 'descricao', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="w-20">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Qtd</span>
                      <Input 
                        type="number"
                        className="bg-white"
                        value={it.quantidade}
                        onChange={(e) => handleItemChange(idx, 'quantidade', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 md:w-32">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vlr Unitário</span>
                      <Input 
                        type="number"
                        className="bg-white"
                        value={it.valorUnitario}
                        onChange={(e) => handleItemChange(idx, 'valorUnitario', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-32">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</span>
                    <div className="mt-1 p-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-600 h-[38px] flex items-center">
                      {formatBRL(Number(it.quantidade) * Number(it.valorUnitario))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors md:relative absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
              <div>
                <Label>Condições de Pagto</Label>
                <Input 
                  className="bg-white"
                  value={novo.condicoesPagamento}
                  onChange={(e) => setNovo({...novo, condicoesPagamento: e.target.value})}
                />
              </div>
              <div>
                <Label>Validade (Dias)</Label>
                <Input 
                  type="number"
                  className="bg-white"
                  value={novo.validadeDias}
                  onChange={(e) => setNovo({...novo, validadeDias: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0 w-full md:w-auto">
              <div className="text-xs text-brand-600 font-bold uppercase tracking-widest">Total Geral</div>
              <div className="text-3xl font-black text-brand-900">{formatBRL(totalOrcamento)}</div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalNovo(false)} className="w-full md:w-auto">Cancelar</Button>
            <Button onClick={handleSalvar} className="bg-brand-600 hover:bg-brand-700 px-8 w-full md:w-auto">Salvar Orçamento</Button>
          </div>
        </div>
      </Dialog>

      {/* Modal: Detalhes / Visualização PDF */}
      <Dialog 
        open={!!modalDetalhes} 
        onClose={() => setModalDetalhes(null)} 
        title={`Orçamento: ${modalDetalhes?.numero}`}
        size="xl"
        contentClassName="p-2 md:p-6"
      >
        {modalDetalhes && (
          <div className="space-y-6">
            <div id="pdf-content" className="bg-white p-4 md:p-10 border border-slate-200 rounded-lg shadow-sm font-sans text-slate-800 overflow-x-hidden">
              {/* Cabeçalho do Orçamento */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand-600 font-black text-2xl italic uppercase tracking-tighter">
                    <Building2 className="h-8 w-8" /> {empresa.nomeFantasia}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed uppercase max-w-[250px]">
                    {empresa.razaoSocial} • CNPJ: {empresa.cnpj}<br />
                    {empresa.endereco}, {empresa.cidade}-{empresa.uf}
                  </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                  <div className="text-2xl font-black text-slate-900 uppercase italic leading-none">Orçamento</div>
                  <div className="text-sm font-bold text-brand-600 mt-1">{modalDetalhes.numero}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(modalDetalhes.dataEmissao).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Infos do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User className="h-3 w-3" /> Destinatário
                  </div>
                  <div className="font-bold text-slate-900 uppercase text-lg">{modalDetalhes.clienteNome}</div>
                  <div className="text-xs text-slate-600 space-y-2">
                    {modalDetalhes.clienteEndereco && <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> <span>{modalDetalhes.clienteEndereco}</span></div>}
                    {modalDetalhes.clienteContato && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" /> <span>{modalDetalhes.clienteContato}</span></div>}
                    {modalDetalhes.clienteEmail && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" /> <span>{modalDetalhes.clienteEmail}</span></div>}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Resumo de Condições</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Pagamento:</span> 
                      <span className="font-bold text-slate-700">{modalDetalhes.condicoesPagamento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validade:</span> 
                      <span className="font-bold text-slate-700">{modalDetalhes.validadeDias} dias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens (Responsiva) */}
              <div className="mb-8 overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <div className="hidden md:grid grid-cols-12 gap-2 bg-slate-900 text-white p-3 text-[10px] font-bold uppercase tracking-wider">
                  <div className="col-span-6">Descrição do Serviço</div>
                  <div className="col-span-2 text-center">Qtd</div>
                  <div className="col-span-2 text-right">Unitário</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {modalDetalhes.itens.map((it) => (
                    <div key={it.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-4 text-sm items-center hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-6 font-semibold text-slate-800 md:font-medium">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 block uppercase mb-1">Serviço</span>
                        {it.descricao}
                      </div>
                      <div className="col-span-2 text-slate-600 flex md:block justify-between items-center border-t md:border-t-0 pt-2 md:pt-0 mt-2 md:mt-0">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Qtd</span>
                        <span className="md:text-center md:block">{it.quantidade}</span>
                      </div>
                      <div className="col-span-2 text-slate-600 flex md:block justify-between items-center">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Valor Unit.</span>
                        <span className="md:text-right md:block">{formatBRL(it.valorUnitario)}</span>
                      </div>
                      <div className="col-span-2 flex md:block justify-between items-center">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase">Subtotal</span>
                        <span className="md:text-right md:block font-black text-slate-900">{formatBRL(it.valorTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total e Observações */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-8">
                <div className="flex-1 space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Observações Importantes
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed min-h-[80px]">
                    {modalDetalhes.observacoes || "Nenhuma observação adicional."}
                  </div>
                </div>
                <div className="w-full md:w-72 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">Subtotal</span>
                    <span className="font-bold text-slate-700">{formatBRL(modalDetalhes.total)}</span>
                  </div>
                  <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
                    <span className="text-sm font-black text-slate-900 uppercase italic">Total Líquido</span>
                    <span className="text-3xl font-black text-brand-600 italic leading-none tabular-nums">{formatBRL(modalDetalhes.total)}</span>
                  </div>
                </div>
              </div>

              {/* Assinatura */}
              <div className="mt-16 flex flex-col items-center justify-center gap-2 opacity-60">
                <div className="h-[1px] w-64 bg-slate-300"></div>
                <div className="text-[10px] font-bold uppercase text-slate-400 italic tracking-widest">Departamento Comercial</div>
                <div className="text-xs font-bold text-slate-600">{empresa.nomeFantasia}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 no-print p-2 md:p-0">
              <Button variant="outline" onClick={() => handleCopyWhatsApp(modalDetalhes)} className="w-full md:w-auto">
                <MessageSquare className="h-4 w-4 mr-2" /> Copiar para WhatsApp
              </Button>
              <Button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white w-full md:w-auto">
                <Printer className="h-4 w-4 mr-2" /> Imprimir / PDF
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    rascunho: 'bg-slate-100 text-slate-600',
    enviado: 'bg-blue-100 text-blue-600',
    aprovado: 'bg-emerald-100 text-emerald-600',
    reprovado: 'bg-red-100 text-red-600',
    cancelado: 'bg-slate-300 text-slate-800',
    warning: 'bg-amber-100 text-amber-600',
  }
  
  const icons: any = {
    rascunho: <Clock className="h-3 w-3 mr-1" />,
    enviado: <Share2 className="h-3 w-3 mr-1" />,
    aprovado: <CheckCircle className="h-3 w-3 mr-1" />,
    reprovado: <XCircle className="h-3 w-3 mr-1" />,
    cancelado: <XCircle className="h-3 w-3 mr-1" />,
    warning: <AlertTriangle className="h-3 w-3 mr-1" />,
  }

  const labels: any = {
    rascunho: 'Rascunho',
    enviado: 'Enviado',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    cancelado: 'Cancelado',
    warning: 'Atenção',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  )
}
