const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co';
const supabaseKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Iniciando carga de escalas e estoque...');

  const { data: funs } = await supabase.from('funcionarios').select('id, nome');
  
  const idNatasha = funs.find(f => f.nome.includes('Natasha'))?.id;
  const idGerson = funs.find(f => f.nome.includes('Gerson'))?.id;
  const idLucas = funs.find(f => f.nome.includes('Lucas'))?.id;
  const idAlessandra = funs.find(f => f.nome.includes('Alessandra'))?.id;

  if (!idNatasha) { console.log('Funcionários não encontrados. Rode o script anterior primeiro.'); return; }

  const escalas = [
    { data: '2026-04-23', funcionario_id: idNatasha, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-23', funcionario_id: idGerson, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-16', funcionario_id: idLucas, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-20', funcionario_id: idLucas, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-21', funcionario_id: idLucas, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-23', funcionario_id: idLucas, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-20', funcionario_id: idAlessandra, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-21', funcionario_id: idAlessandra, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
    { data: '2026-04-23', funcionario_id: idAlessandra, posto_nome: 'Serviço Avulso', status: 'presente', inicio: '08:00', fim: '17:00' },
  ];

  console.log('Inserindo escalas...');
  const { error: ee } = await supabase.from('escalas').insert(escalas);
  if (ee) console.error('Erro escalas:', ee);

  console.log('Carga concluída!');
}

run();
