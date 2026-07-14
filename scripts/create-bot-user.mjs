// scripts/create-bot-user.mjs
// Crea el usuario "Chat RR aliados" en Supabase Auth y perfil
//
// Uso:
//   node scripts/create-bot-user.mjs
// Requiere variables de entorno:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BOT_EMAIL = 'chat-rr-aliados@altruismo.app';
const BOT_PASSWORD = process.env.BOT_USER_PASSWORD || crypto.randomUUID();

async function main() {
  // 1. Verificar si el usuario ya existe
  const { data: existing, error: findError } = await supabase.auth.admin.listUsers();
  if (findError) {
    console.error('Error listando usuarios:', findError.message);
    process.exit(1);
  }

  const found = existing.users.find(u => u.email === BOT_EMAIL);
  let userId = found?.id;

  if (found) {
    console.log(`Usuario ya existe: ${userId}`);
  } else {
    // 2. Crear usuario
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: BOT_EMAIL,
      password: BOT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Chat RR aliados',
      },
    });

    if (createError) {
      console.error('Error creando usuario:', createError.message);
      process.exit(1);
    }

    userId = created.user.id;
    console.log(`Usuario creado: ${userId}`);
    console.log(`Contraseña temporal: ${BOT_PASSWORD}`);
  }

  // 3. Actualizar perfil
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: BOT_EMAIL,
    name: 'Chat RR aliados',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChatRR',
    bio: 'Agente autónomo de RR ALIADOS — Genera herramientas interactivas vanguardistas cada 2 horas.',
    role: 'developer',
    points: 0,
    level: 1,
  }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error actualizando perfil:', profileError.message);
    process.exit(1);
  }

  console.log(`Perfil actualizado para: ${userId}`);
  console.log(`\nAnota este UUID: ${userId}`);
  console.log(`Uso en scripts: BOT_USER_ID=${userId}`);
}

main().catch(console.error);