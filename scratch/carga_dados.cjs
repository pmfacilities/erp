const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co';
const supabaseKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Iniciando carga de dados...');

  // 1. Inserir Funcionários (Colaboradores)
  const colaboradores = [
    { nome: 'Natasha Neto de Souza', cpf: '000.000.001-01', cargo: 'Colaborador Avulso', status: 'avulso', telefone: '', salario: 90, admissao: '2026-04-23', pix: '' },
    { nome: 'Gerson Neto de Souza', cpf: '000.000.002-02', cargo: 'Colaborador Avulso', status: 'avulso', telefone: '', salario: 90, admissao: '2026-04-23', pix: '' },
    { nome: 'Lucas Costa do Nascimento', cpf: '000.000.003-03', cargo: 'Colaborador Avulso', status: 'avulso', telefone: 'lucascostap.33@gmail.com', salario: 120, admissao: '2026-04-16', pix: 'lucascostap.33@gmail.com' },
    { nome: 'Alessandra Scheles Lima', cpf: '000.000.004-04', cargo: 'Colaborador Avulso', status: 'avulso', telefone: '02692480724', salario: 120, admissao: '2026-04-20', pix: '02692480724' },
  ];

  console.log('Inserindo funcionários...');
  const { data: newFuns, error: ef } = await supabase.from('funcionarios').insert(colaboradores).select();
  if (ef) { console.error('Erro funcionarios:', ef); return; }

  const idNatasha = newFuns.find(f => f.nome.includes('Natasha')).id;
  const idGerson = newFuns.find(f => f.nome.includes('Gerson')).id;
  const idLucas = newFuns.find(f => f.nome.includes('Lucas')).id;
  const idAlessandra = newFuns.find(f => f.nome.includes('Alessandra')).id;

  // 2. Inserir Escalas (Histórico)
  // Natasha: 23/04
  // Gerson: 23/04
  // Lucas: 16/04, 20/04, 21/04, 23/04
  // Alessandra: 20/04, 21/04, 23/04
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

  // 3. Inserir Estoque
  const estoque = [
    { sku: 'FER-003', nome: 'Escada de Alumínio', categoria: 'Ferramentas', unidade: 'Unidade', quantidade: 1, estoque_minimo: 1, custo_unitario: 200.00, local: 'Almox. Central' },
    { sku: 'LIM-013', nome: 'Thiner', categoria: 'outros materiais', unidade: 'Litro', quantidade: 5, estoque_minimo: 2, custo_unitario: 35.80, local: 'Almox. Central' },
    { sku: 'FER-004', nome: 'Estilete Profissional', categoria: 'Ferramentas', unidade: 'Unidade', quantidade: 2, estoque_minimo: 1, custo_unitario: 7.00, local: 'Almox. Central' },
    { sku: 'LIM-014', nome: 'Produtos de Limpeza Diversos', categoria: 'outros materiais', unidade: 'Kit', quantidade: 1, estoque_minimo: 1, custo_unitario: 127.00, local: 'Almox. Central' },
    { sku: 'FER-005', nome: 'Espátula de Aço', categoria: 'Ferramentas', unidade: 'Unidade', quantidade: 2, estoque_minimo: 1, custo_unitario: 7.00, local: 'Almox. Central' },
    { sku: 'LIM-015', nome: 'Álcool 70', categoria: 'outros materiais', unidade: 'Litro', quantidade: 10, estoque_minimo: 5, custo_unitario: 15.87, local: 'Almox. Central' },
  ];

  console.log('Inserindo estoque...');
  const { error: es } = await supabase.from('estoque').insert(estoque);
  if (es) console.error('Erro estoque:', es);

  console.log('Carga concluída!');
}

run();
