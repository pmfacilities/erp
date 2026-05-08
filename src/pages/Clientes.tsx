import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Building2, FileText } from 'lucide-react'
import type { Cliente } from '@/data/mockData'

export function Clientes() {
  const { clientes, contratos, addCliente, updateCliente, removeCliente, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Cliente | null>(null)

  const filtrados = useMemo(() =>
    clientes.filter((c) =>
      [c.razaoSocial, c.nomeFantasia, c.cnpj, c.cidade].some((v) => v.toLowerCase().includes(busca.toLowerCase()))
    ), [clientes, busca],
  )

  return (
    <>
      <Header title="Clientes" subtitle={`${clientes.length} clientes cadastrados`} />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Button onClick={() => { setEdit(null); setOpen(true) }}>
              <Plus className="h-4 w-4" /> Novo cliente
            </Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtrados.length === 0 ? (
            <EmptyState title="Nenhum cliente encontrado" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Cliente</TH>
                  <TH>CNPJ</TH>
                  <TH>Cidade/UF</TH>
                  <TH>Contatos</TH>
                  <TH>Contratos</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtrados.map((c) => {
                  const cts = contratos.filter((ct) => ct.clienteId === c.id)
                  return (
                    <TR key={c.id}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{c.nomeFantasia}</div>
                            <div className="text-xs text-slate-500">{c.razaoSocial}</div>
                          </div>
                        </div>
                      </TD>
                      <TD className="text-xs font-mono">{c.cnpj}</TD>
                      <TD className="text-sm">{c.cidade}/{c.uf}</TD>
                      <TD className="text-xs">
                        <div>{c.contatoResponsavel}</div>
                        <div className="text-slate-500">{c.telefone}</div>
                      </TD>
                      <TD>
                        <Badge tone="brand"><FileText className="h-3 w-3" /> {cts.length}</Badge>
                      </TD>
                      <TD><Badge tone={c.status === 'ativo' ? 'success' : 'neutral'}>{c.status}</Badge></TD>
                      <TD className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEdit(c); setOpen(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => {
                            if (cts.length > 0) {
                              pushToast({ titulo: 'Não é possível remover', descricao: `${cts.length} contrato(s) vinculado(s)`, tipo: 'error' })
                              return
                            }
                            if (confirm(`Remover cliente ${c.nomeFantasia}?`)) {
                              removeCliente(c.id)
                              pushToast({ titulo: 'Cliente removido', tipo: 'success' })
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

      <ClienteDialog
        open={open} onClose={() => setOpen(false)} cliente={edit}
        onSave={(data) => {
          if (edit) {
            updateCliente(edit.id, data)
            pushToast({ titulo: 'Cliente atualizado', tipo: 'success' })
          } else {
            addCliente(data)
            pushToast({ titulo: 'Cliente criado', descricao: data.nomeFantasia, tipo: 'success' })
          }
          setOpen(false)
        }}
      />
    </>
  )
}

function ClienteDialog({
  open, onClose, cliente, onSave,
}: {
  open: boolean; onClose: () => void; cliente: Cliente | null
  onSave: (c: Omit<Cliente, 'id' | 'criadoEm'>) => void
}) {
  const [form, setForm] = useState<Omit<Cliente, 'id' | 'criadoEm'>>(() =>
    cliente || {
      razaoSocial: '', nomeFantasia: '', cnpj: '', email: '', telefone: '',
      cidade: '', uf: 'RJ', status: 'ativo', contatoResponsavel: '',
    },
  )
  const [saving, setSaving] = useState(false)

  // refresh form when cliente changes
  useMemo(() => {
    setForm(
      cliente || {
        razaoSocial: '', nomeFantasia: '', cnpj: '', email: '', telefone: '',
        cidade: '', uf: 'RJ', status: 'ativo', contatoResponsavel: '',
      },
    )
  }, [cliente, open])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const salvar = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    onSave(form)
    setSaving(false)
  }

  return (
    <Dialog
      open={open} onClose={onClose}
      title={cliente ? 'Editar cliente' : 'Novo cliente'}
      description="Dados cadastrais e de contato"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} loading={saving} disabled={!form.nomeFantasia || !form.cnpj}>
            {cliente ? 'Salvar alterações' : 'Criar cliente'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label required>Razão Social</Label>
          <Input value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} />
        </div>
        <div>
          <Label required>Nome Fantasia</Label>
          <Input value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} />
        </div>
        <div>
          <Label required>CNPJ</Label>
          <Input value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
        </div>
        <div>
          <Label>Cidade</Label>
          <Input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
        </div>
        <div>
          <Label>UF</Label>
          <Select value={form.uf} onChange={(e) => set('uf', e.target.value)}>
            {['RJ', 'SP', 'MG', 'ES', 'BA', 'RS', 'PR', 'SC', 'DF'].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Contato responsável</Label>
          <Input value={form.contatoResponsavel} onChange={(e) => set('contatoResponsavel', e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => set('status', e.target.value as any)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>
      </div>
    </Dialog>
  )
}
