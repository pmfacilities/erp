import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, FileText, Eye, Mail, Phone } from 'lucide-react'
import type { Curriculo } from '@/data/mockExtras'

const statusTone: Record<Curriculo['status'], any> = {
  novo: 'info', em_analise: 'warning', entrevistado: 'brand',
  contratado: 'success', descartado: 'neutral',
}
const statusLabel: Record<Curriculo['status'], string> = {
  novo: 'Novo', em_analise: 'Em análise', entrevistado: 'Entrevistado',
  contratado: 'Contratado', descartado: 'Descartado',
}

export function Curriculos() {
  const { curriculos, addCurriculo, updateCurriculo, removeCurriculo, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCargo, setFiltroCargo] = useState('todos')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Curriculo | null>(null)
  const [detalhe, setDetalhe] = useState<Curriculo | null>(null)

  const cargos = useMemo(() => Array.from(new Set(curriculos.map((c) => c.cargoInteresse))), [curriculos])

  const filtrados = useMemo(() =>
    curriculos
      .filter((c) => filtroStatus === 'todos' || c.status === filtroStatus)
      .filter((c) => filtroCargo === 'todos' || c.cargoInteresse === filtroCargo)
      .filter((c) => [c.nome, c.email, c.cargoInteresse, c.cidade].some((v) => v.toLowerCase().includes(busca.toLowerCase())))
      .sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio)),
    [curriculos, busca, filtroStatus, filtroCargo],
  )

  const stats = {
    novos: curriculos.filter((c) => c.status === 'novo').length,
    analise: curriculos.filter((c) => c.status === 'em_analise').length,
    entrevistados: curriculos.filter((c) => c.status === 'entrevistado').length,
    contratados: curriculos.filter((c) => c.status === 'contratado').length,
  }

  return (
    <>
      <Header title="Banco de Currículos" subtitle={`${curriculos.length} currículos · ${stats.novos} novos`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent><div className="text-xs text-slate-500">Novos</div><div className="text-2xl font-bold text-sky-600">{stats.novos}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Em análise</div><div className="text-2xl font-bold text-amber-600">{stats.analise}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Entrevistados</div><div className="text-2xl font-bold text-brand-600">{stats.entrevistados}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Contratados</div><div className="text-2xl font-bold text-emerald-600">{stats.contratados}</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Nome, e-mail, cargo ou cidade..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="md:w-44">
              <option value="todos">Todos os status</option>
              {Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Select value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)} className="md:w-52">
              <option value="todos">Todos os cargos</option>
              {cargos.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Button onClick={() => { setEdit(null); setOpen(true) }}><Plus className="h-4 w-4" /> Cadastrar currículo</Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {filtrados.length === 0 ? (
            <EmptyState title="Nenhum currículo encontrado" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Candidato</TH>
                  <TH>Cargo de interesse</TH>
                  <TH>Localização</TH>
                  <TH>Experiência</TH>
                  <TH>Origem</TH>
                  <TH>Enviado</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {filtrados.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold flex items-center justify-center text-xs">
                          {c.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{c.nome}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefone}</span>
                          </div>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium">{c.cargoInteresse}</div>
                      <div className="text-xs text-slate-500">{c.escolaridade}</div>
                    </TD>
                    <TD className="text-sm">{c.cidade}/{c.uf}</TD>
                    <TD className="text-sm">{c.experienciaAnos} {c.experienciaAnos === 1 ? 'ano' : 'anos'} {c.temCarteira && <Badge tone="success" className="ml-1">CTPS</Badge>}</TD>
                    <TD><Badge tone="neutral">{c.origem}</Badge></TD>
                    <TD className="text-xs">{formatDate(c.dataEnvio)}</TD>
                    <TD>
                      <Select value={c.status}
                        onChange={(e) => { updateCurriculo(c.id, { status: e.target.value as any }); pushToast({ titulo: 'Status atualizado', tipo: 'success' }) }}
                        className="h-7 text-xs py-0 w-32"
                      >
                        {Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </Select>
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setDetalhe(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEdit(c); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm(`Remover ${c.nome}?`)) { removeCurriculo(c.id); pushToast({ titulo: 'Removido', tipo: 'success' }) }
                      }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <CurriculoDialog
        open={open} onClose={() => setOpen(false)} curriculo={edit}
        onSave={(data) => {
          if (edit) { updateCurriculo(edit.id, data); pushToast({ titulo: 'Atualizado', tipo: 'success' }) }
          else { addCurriculo(data); pushToast({ titulo: 'Currículo cadastrado', tipo: 'success' }) }
          setOpen(false)
        }}
      />
      {detalhe && (
        <Dialog open onClose={() => setDetalhe(null)} title={detalhe.nome} description={`${detalhe.cargoInteresse} · ${detalhe.cidade}/${detalhe.uf}`}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs text-slate-500">Telefone</div><div className="font-medium">{detalhe.telefone}</div></div>
              <div><div className="text-xs text-slate-500">E-mail</div><div className="font-medium truncate">{detalhe.email}</div></div>
              <div><div className="text-xs text-slate-500">Escolaridade</div><div className="font-medium">{detalhe.escolaridade}</div></div>
              <div><div className="text-xs text-slate-500">Experiência</div><div className="font-medium">{detalhe.experienciaAnos} {detalhe.experienciaAnos === 1 ? 'ano' : 'anos'}</div></div>
              <div><div className="text-xs text-slate-500">CTPS</div><div>{detalhe.temCarteira ? <Badge tone="success">Já possui</Badge> : <Badge tone="warning">Primeiro emprego</Badge>}</div></div>
              <div><div className="text-xs text-slate-500">Origem</div><div><Badge tone="neutral">{detalhe.origem}</Badge></div></div>
              <div><div className="text-xs text-slate-500">Enviado em</div><div className="font-medium">{formatDate(detalhe.dataEnvio)}</div></div>
              <div><div className="text-xs text-slate-500">Status</div><Badge tone={statusTone[detalhe.status]}>{statusLabel[detalhe.status]}</Badge></div>
            </div>
            {detalhe.observacao && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Observações</div>
                <div className="text-sm">{detalhe.observacao}</div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => window.open(`mailto:${detalhe.email}`)}><Mail className="h-4 w-4" /> E-mail</Button>
              <Button variant="outline"><FileText className="h-4 w-4" /> Baixar CV</Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

function CurriculoDialog({
  open, onClose, curriculo, onSave,
}: {
  open: boolean; onClose: () => void; curriculo: Curriculo | null
  onSave: (c: Omit<Curriculo, 'id'>) => void
}) {
  const [f, setF] = useState<Omit<Curriculo, 'id'>>(() => curriculo || {
    nome: '', telefone: '', email: '', cargoInteresse: '', cidade: '', uf: 'RJ',
    escolaridade: 'Ensino Médio Completo', experienciaAnos: 0,
    dataEnvio: new Date().toISOString().slice(0, 10),
    origem: 'Site', status: 'novo', temCarteira: true,
  })
  useMemo(() => setF(curriculo || {
    nome: '', telefone: '', email: '', cargoInteresse: '', cidade: '', uf: 'RJ',
    escolaridade: 'Ensino Médio Completo', experienciaAnos: 0,
    dataEnvio: new Date().toISOString().slice(0, 10),
    origem: 'Site', status: 'novo', temCarteira: true,
  }), [curriculo, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <Dialog open={open} onClose={onClose} title={curriculo ? 'Editar currículo' : 'Novo currículo'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.nome || !f.telefone}>Salvar</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label required>Nome completo</Label><Input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></div>
        <div><Label required>Telefone</Label><Input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} /></div>
        <div><Label>E-mail</Label><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><Label required>Cargo de interesse</Label><Input value={f.cargoInteresse} onChange={(e) => set('cargoInteresse', e.target.value)} placeholder="Ex: Porteiro" /></div>
        <div>
          <Label>Escolaridade</Label>
          <Select value={f.escolaridade} onChange={(e) => set('escolaridade', e.target.value)}>
            <option>Ensino Fundamental Incompleto</option>
            <option>Ensino Fundamental Completo</option>
            <option>Ensino Médio Incompleto</option>
            <option>Ensino Médio Completo</option>
            <option>Curso Técnico</option>
            <option>Ensino Superior Incompleto</option>
            <option>Ensino Superior Completo</option>
          </Select>
        </div>
        <div><Label>Cidade</Label><Input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} /></div>
        <div><Label>UF</Label>
          <Select value={f.uf} onChange={(e) => set('uf', e.target.value)}>
            {['RJ', 'SP', 'MG', 'ES'].map((u) => <option key={u}>{u}</option>)}
          </Select>
        </div>
        <div><Label>Experiência (anos)</Label><Input type="number" min={0} value={f.experienciaAnos} onChange={(e) => set('experienciaAnos', Number(e.target.value))} /></div>
        <div>
          <Label>Origem</Label>
          <Select value={f.origem} onChange={(e) => set('origem', e.target.value)}>
            <option value="Site">Site</option>
            <option value="Indicação">Indicação</option>
            <option value="Mural">Mural</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Outro">Outro</option>
          </Select>
        </div>
        <div><Label>Data de envio</Label><Input type="date" value={f.dataEnvio} onChange={(e) => set('dataEnvio', e.target.value)} /></div>
        <div>
          <Label>Status</Label>
          <Select value={f.status} onChange={(e) => set('status', e.target.value as any)}>
            {Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="ctps" checked={f.temCarteira} onChange={(e) => set('temCarteira', e.target.checked)} className="h-4 w-4 accent-brand-600" />
          <label htmlFor="ctps" className="text-sm">Possui CTPS (já teve registro)</label>
        </div>
        <div className="col-span-2"><Label>Observações</Label><Textarea rows={2} value={f.observacao || ''} onChange={(e) => set('observacao', e.target.value)} /></div>
      </div>
    </Dialog>
  )
}
