import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co'
const supabaseAnonKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.rpc('get_tables') // if it exists
  if (error) {
     const { data: d2, error: e2 } = await supabase.from('servicos_avulsos').select('*').limit(1)
     console.log('Servicos Avulsos exists?', !e2)
     
     // Let's try to find the correct table name by guessing or checking if I can query pg_catalog (usually not via anon key)
  }
  console.log('Data:', data)
}

check()
