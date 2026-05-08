const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co';
const supabaseKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v';
const supabase = createClient(supabaseUrl, supabaseKey);

const usuariosMock = [
  { nome: 'Jonathan da Silva', email: 'jonathan@psfacilities.com.br', login: 'silva',   senha: 'silva123',   perfil: 'Administrador', status: 'ativo', avatar_iniciais: 'JS' },
  { nome: 'David Souza',       email: 'david@psfacilities.com.br',    login: 'david',   senha: 'david123',   perfil: 'Administrador', status: 'ativo', avatar_iniciais: 'DS' },
  { nome: 'Márcio Kerol',      email: 'kerol@psfacilities.com.br',    login: 'kerol',   senha: 'kerol123',   perfil: 'Administrador', status: 'ativo', avatar_iniciais: 'MK' },
  { nome: 'Junior Alamar',     email: 'junior@psfacilities.com.br',   login: 'junior',  senha: 'junior123',  perfil: 'Administrador', status: 'ativo', avatar_iniciais: 'JA' },
  { nome: 'Paula Mendes',      email: 'paula@psfacilities.com.br',    login: 'paula',   senha: 'paula123',   perfil: 'RH',            status: 'ativo', avatar_iniciais: 'PM' },
  { nome: 'Shopping Friburgo', email: 'admin@shoppingfriburgo.com.br', login: 'shopping', senha: 'cliente123', perfil: 'Cliente',      status: 'ativo', avatar_iniciais: 'SF' },
];

async function seed() {
  console.log('Semeando usuários...');
  const { error } = await supabase.from('usuarios').insert(usuariosMock);
  if (error) console.error('Erro:', error);
  else console.log('Sucesso!');
}
seed();
