import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatDateTime } from '@/lib/utils'
import { Plus, Pencil, Trash2, Save, Building2, Users as UsersIcon, Bell, Shield } from 'lucide-react'
import type { Usuario } from '@/data/mockData'

export function Configuracoes() {
  const [tab, setTab] = useState<'empresa' | 'usuarios' | 'preferencias' | 'seguranca'>('empresa')
  const tabs = [
    { key: 'empresa', label: 'Empresa', icon: Building2 },
    { key: 'usuarios', label: 'Usuários', icon: UsersIcon },
    { key: 'preferencias', label: 'Preferências', icon: Bell },
    { key: 'seguranca', label: 'Segurança', icon: Shield },
  ] as const
  return (
    <>
      <Header title="Configurações" subtitle="Ajustes da conta, usuários e preferências" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <Card className="p-2 h-max">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${tab === t.key ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </Card>
          <div>
            {tab === 'empresa' && <AbaEmpresa />}
            {tab === 'usuarios' && <AbaUsuarios />}
            {tab === 'preferencias' && <AbaPreferencias />}
            {tab === 'seguranca' && <AbaSeguranca />}
          </div>
        </div>
      </div>
    </>
  )
}

function AbaEmpresa() {
  const { empresa, updateEmpresa, pushToast } = useStore()
  const [f, setF] = useState(empresa)
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
          <CardDescription>Informações usadas em documentos, notas e faturas</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Razão Social</Label><Input value={f.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} /></div>
          <div><Label>Nome Fantasia</Label><Input value={f.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} /></div>
          <div><Label>CNPJ</Label><Input value={f.cnpj} onChange={(e) => set('cnpj', e.target.value)} /></div>
          <div><Label>Inscrição Estadual</Label><Input value={f.inscricaoEstadual} onChange={(e) => set('inscricaoEstadual', e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} /></div>
          <div className="col-span-2"><Label>Endereço</Label><Input value={f.endereco} onChange={(e) => set('endereco', e.target.value)} /></div>
          <div className="col-span-2"><Label>E-mail</Label><Input value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        </CardContent>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/50">
          <Button onClick={() => { updateEmpresa(f); pushToast({ titulo: 'Empresa atualizada', tipo: 'success' }) }}>
            <Save className="h-4 w-4" /> Salvar alterações
          </Button>
        </div>
      </Card>

      <SociosCrud />
    </div>
  )
}

function SociosCrud() {
  const { empresa, addSocio, updateSocio, removeSocio, pushToast } = useStore()
  const [open, setOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState({ nome: '', telefone: '' })

  const abrirNovo = () => { setEditIndex(null); setForm({ nome: '', telefone: '' }); setOpen(true) }
  const abrirEdit = (i: number) => {
    setEditIndex(i); setForm(empresa.socios[i]); setOpen(true)
  }
  const salvar = () => {
    if (!form.nome) return
    if (editIndex === null) {
      addSocio(form)
      pushToast({ titulo: 'Sócio adicionado', descricao: form.nome, tipo: 'success' })
    } else {
      updateSocio(editIndex, form)
      pushToast({ titulo: 'Sócio atualizado', tipo: 'success' })
    }
    setOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Sócios e contatos</CardTitle>
            <CardDescription>
              Pessoas autorizadas como representantes legais · {empresa.socios.length} cadastrados
              <span className="block text-xs text-amber-700 mt-1">
                ⚠️ Alterar o nº de sócios aqui afeta o rateio (atualize também em Sala dos Sócios → Parâmetros se necessário).
              </span>
            </CardDescription>
          </div>
          <Button onClick={abrirNovo}><Plus className="h-4 w-4" /> Adicionar sócio</Button>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {empresa.socios.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold flex items-center justify-center text-sm">
                  {s.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{s.nome}</div>
                  <div className="text-xs text-slate-500">Sócio administrador</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">{s.telefone}</div>
                <Button variant="ghost" size="sm" onClick={() => abrirEdit(i)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (empresa.socios.length <= 1) {
                    pushToast({ titulo: 'Não é possível remover', descricao: 'A empresa precisa de pelo menos 1 sócio', tipo: 'error' })
                    return
                  }
                  if (confirm(`Remover sócio ${s.nome}?`)) {
                    removeSocio(i)
                    pushToast({ titulo: 'Sócio removido', tipo: 'success' })
                  }
                }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {empresa.socios.length === 0 && <div className="py-6 text-sm text-slate-500 text-center">Nenhum sócio cadastrado</div>}
        </CardContent>
      </Card>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editIndex === null ? 'Adicionar sócio' : 'Editar sócio'} size="md"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={!form.nome}>Salvar</Button>
        </>}
      >
        <div className="space-y-3">
          <div><Label required>Nome completo</Label>
            <Input value={form.nome} onChange={(e) => setForm((x) => ({ ...x, nome: e.target.value }))} />
          </div>
          <div><Label>Telefone</Label>
            <Input value={form.telefone} onChange={(e) => setForm((x) => ({ ...x, telefone: e.target.value }))} placeholder="+55 22 9...." />
          </div>
        </div>
      </Dialog>
    </>
  )
}

function AbaUsuarios() {
  const { usuarios, sessao, addUsuario, updateUsuario, removeUsuario, pushToast } = useStore()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Usuario | null>(null)
  const admin = sessao?.perfil === 'socio_gestor'

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuários e permissões</CardTitle>
            <CardDescription>
              {usuarios.length} usuários · 4 sócios administradores + usuários administrativos
              {!admin && <span className="block text-xs text-amber-700 mt-1">⚠️ Apenas sócios administradores podem criar/editar usuários</span>}
            </CardDescription>
          </div>
          {admin && <Button onClick={() => { setEdit(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo usuário</Button>}
        </CardHeader>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>Login</TH>
              <TH>E-mail</TH>
              <TH>Perfil</TH>
              <TH>Último acesso</TH>
              <TH>Status</TH>
              {admin && <TH className="text-right">Ações</TH>}
            </TR>
          </THead>
          <TBody>
            {usuarios.map((u) => (
              <TR key={u.id}>
                <TD className="font-medium">{u.nome}</TD>
                <TD className="font-mono text-xs">@{u.login}</TD>
                <TD className="text-sm">{u.email}</TD>
                <TD><Badge tone={u.perfil === 'Administrador' ? 'brand' : 'neutral'}>{u.perfil}</Badge></TD>
                <TD className="text-xs text-slate-500">{formatDateTime(u.ultimoAcesso)}</TD>
                <TD><Badge tone={u.status === 'ativo' ? 'success' : 'neutral'}>{u.status}</Badge></TD>
                {admin && (
                  <TD className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEdit(u); setOpen(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (u.id === sessao?.id) {
                        pushToast({ titulo: 'Não é possível remover a si mesmo', tipo: 'error' })
                        return
                      }
                      if (confirm(`Remover usuário ${u.nome}?`)) {
                        removeUsuario(u.id)
                        pushToast({ titulo: 'Usuário removido', tipo: 'success' })
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <UsuarioDialog
        open={open} onClose={() => setOpen(false)} usuario={edit} usuariosExistentes={usuarios}
        onSave={(data) => {
          if (edit) { updateUsuario(edit.id, data); pushToast({ titulo: 'Usuário atualizado', tipo: 'success' }) }
          else { addUsuario(data); pushToast({ titulo: 'Usuário criado', descricao: `Login: ${data.login}`, tipo: 'success' }) }
          setOpen(false)
        }}
      />
    </>
  )
}

function UsuarioDialog({
  open, onClose, usuario, onSave, usuariosExistentes,
}: {
  open: boolean; onClose: () => void; usuario: Usuario | null
  onSave: (u: Omit<Usuario, 'id' | 'ultimoAcesso'>) => void
  usuariosExistentes: Usuario[]
}) {
  const defaults = (): Omit<Usuario, 'id' | 'ultimoAcesso'> => ({
    nome: '', email: '', login: '', senha: '', perfil: 'Operacional', status: 'ativo',
  })
  const [f, setF] = useState<Omit<Usuario, 'id' | 'ultimoAcesso'>>(() => usuario || defaults())
  const [erro, setErro] = useState('')
  useMemo(() => { setF(usuario || defaults()); setErro('') }, [usuario, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))

  const salvar = () => {
    if (!f.nome || !f.email) { setErro('Preencha nome e e-mail'); return }
    if (!f.login) { setErro('Login é obrigatório'); return }
    if (!usuario && !f.senha) { setErro('Senha é obrigatória para novo usuário'); return }
    if (!usuario && usuariosExistentes.some((u) => u.login.toLowerCase() === f.login.toLowerCase())) {
      setErro('Este login já está em uso'); return
    }
    if (usuario && usuariosExistentes.some((u) => u.id !== usuario.id && u.login.toLowerCase() === f.login.toLowerCase())) {
      setErro('Este login já está em uso por outro usuário'); return
    }
    onSave(f)
  }

  return (
    <Dialog open={open} onClose={onClose} title={usuario ? 'Editar usuário' : 'Novo usuário administrativo'}
      description={usuario ? undefined : 'Cadastre usuários das áreas Comercial, RH, Operacional, Financeiro ou Portal do Cliente'}
      size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={salvar}>{usuario ? 'Salvar alterações' : 'Criar usuário'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label required>Nome completo</Label><Input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></div>
        <div><Label required>E-mail</Label><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div>
          <Label>Perfil (cargo)</Label>
          <Select value={f.perfil} onChange={(e) => set('perfil', e.target.value as any)}>
            <option>Administrador</option>
            <option>Financeiro</option>
            <option>Operacional</option>
            <option>RH</option>
            <option>Cliente</option>
          </Select>
        </div>
        <div>
          <Label required>Login (usuário)</Label>
          <Input value={f.login} onChange={(e) => set('login', e.target.value.trim().toLowerCase())} placeholder="sem espaços, minúsculo" />
        </div>
        <div>
          <Label>{usuario ? 'Nova senha (deixe vazio para não alterar)' : 'Senha'}</Label>
          <Input type="text" value={f.senha} onChange={(e) => set('senha', e.target.value)} placeholder={usuario ? '••••••••' : 'mínimo 4 caracteres'} />
        </div>
        <div className="col-span-2">
          <Label>Status</Label>
          <Select value={f.status} onChange={(e) => set('status', e.target.value as any)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>
        {erro && (
          <div className="col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{erro}</div>
        )}
        <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
          <strong>Regras de acesso:</strong><br />
          · <strong>Administrador</strong> — acesso total, inclui Sala dos Sócios<br />
          · <strong>Financeiro / Operacional / RH</strong> — sistema completo exceto área dos sócios<br />
          · <strong>Cliente</strong> — acesso apenas ao portal do cliente
        </div>
      </div>
    </Dialog>
  )
}

function AbaPreferencias() {
  const { pushToast } = useStore()
  const [notif, setNotif] = useState({ email: true, push: true, sms: false })
  const [tema, setTema] = useState('auto')
  const [idioma, setIdioma] = useState('pt-BR')
  const [fuso, setFuso] = useState('America/Sao_Paulo')
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências da conta</CardTitle>
        <CardDescription>Notificações, idioma e aparência</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Notificações</Label>
          <div className="space-y-2 mt-2">
            {([['email', 'E-mail'], ['push', 'Push (navegador)'], ['sms', 'SMS']] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox" checked={notif[k]}
                  onChange={(e) => setNotif((n) => ({ ...n, [k]: e.target.checked }))}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Tema</Label>
            <Select value={tema} onChange={(e) => setTema(e.target.value)}>
              <option value="auto">Automático</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </Select>
          </div>
          <div>
            <Label>Idioma</Label>
            <Select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </Select>
          </div>
          <div>
            <Label>Fuso horário</Label>
            <Select value={fuso} onChange={(e) => setFuso(e.target.value)}>
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/Manaus">Manaus (GMT-4)</option>
            </Select>
          </div>
        </div>
      </CardContent>
      <div className="flex justify-end p-5 border-t border-slate-100">
        <Button onClick={() => pushToast({ titulo: 'Preferências salvas', tipo: 'success' })}>
          <Save className="h-4 w-4" /> Salvar preferências
        </Button>
      </div>
    </Card>
  )
}

function AbaSeguranca() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação e senha</CardTitle>
          <CardDescription>Gerencie sua senha e métodos de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div>
              <div className="font-medium text-sm">Autenticação em dois fatores (MFA)</div>
              <div className="text-xs text-slate-500">Proteção adicional via aplicativo autenticador</div>
            </div>
            <Badge tone="success">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div>
              <div className="font-medium text-sm">Sessões ativas</div>
              <div className="text-xs text-slate-500">2 dispositivos conectados</div>
            </div>
            <Button variant="outline" size="sm">Ver sessões</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div>
              <div className="font-medium text-sm">Alterar senha</div>
              <div className="text-xs text-slate-500">Última troca: há 42 dias</div>
            </div>
            <Button variant="outline" size="sm">Alterar</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LGPD e privacidade</CardTitle>
          <CardDescription>Direitos do titular e conformidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline">Exportar meus dados</Button>
          <Button variant="outline">Solicitar anonimização</Button>
          <div className="text-xs text-slate-500 pt-2">
            Processamos seus dados conforme nossa Política de Privacidade e em total conformidade com a LGPD (Lei 13.709/2018).
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
