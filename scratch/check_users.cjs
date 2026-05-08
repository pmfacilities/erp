const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co';
const supabaseKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('usuarios').select('login, senha');
  console.log('Usuarios no banco:', data);
  if (error) console.error('Erro:', error);
}
check();
