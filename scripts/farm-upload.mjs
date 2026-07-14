// web/scripts/farm-upload.mjs
// Subida automática de herramientas HTML generadas por el agente enjambre
// Se ejecuta cada 2 horas vía Vercel Cron (7:30, 9:00, 11:00, ...)
//
// Uso local:
//   node web/scripts/farm-upload.mjs
// Requiere:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   BOT_USER_ID (UUID de "Chat RR aliados")

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BOT_USER_ID = process.env.BOT_USER_ID;

if (!supabaseUrl || !serviceRoleKey || !BOT_USER_ID) {
  console.error('Faltan variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOT_USER_ID');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Origen de los HTMLs generados por el agente
const HTML_SOURCE_DIR = process.env.HTML_SOURCE_DIR || join(__dirname, '..', '..', 'farm-htmls');

const CATEGORY_ROTATION = [
  'productivity',
  'data',
  'productivity',
  'professional', // development-related
  'data',
  'productivity',
];

async function getCategoryId(slug) {
  const { data, error } = await supabase.from('categories').select('id').eq('slug', slug).single();
  if (error) throw error;
  return data?.id || null;
}

function generateDescription(title, html) {
  // Extraer primera meta descripción si existe
  const metaMatch = html.match(/\u003cmeta[^\u003e]*name=["']description["'][^\u003e]*content=["']([^"']*)["'][^\u003e]*\u003e/i);
  if (metaMatch) return metaMatch[1];

  // Extraer primer párrafo de texto
  const text = html.replace(/\u003c[^\u003e]*\u003e/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 160) || `Herramienta interactiva generada por Chat RR aliados: ${title}`;
}

async function uploadTool(filePath, index) {
  const fileName = basename(filePath);
  const title = fileName.replace(/\.html?$/i, '').replace(/[-_]/g, ' ').trim();
  const html = readFileSync(filePath, 'utf-8');
  const description = generateDescription(title, html);

  const categorySlug = CATEGORY_ROTATION[index % CATEGORY_ROTATION.length];
  const categoryId = await getCategoryId(categorySlug);

  // 1. Subir a Storage
  const timestamp = Date.now();
  const storagePath = `${BOT_USER_ID}/${timestamp}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('pages')
    .upload(storagePath, html, { contentType: 'text/html' });

  if (uploadError) throw uploadError;

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage.from('pages').getPublicUrl(storagePath);

  // 3. Crear registro en BD
  const { data: page, error: insertError } = await supabase
    .from('pages')
    .insert({
      author_id: BOT_USER_ID,
      category_id: categoryId,
      title,
      description,
      file_url: publicUrl,
      is_open_source: true,
      source_code: html,
    })
    .select('id')
    .single();

  if (insertError) throw insertError;

  return { id: page.id, title, publicUrl };
}

async function main() {
  let files;
  try {
    files = readdirSync(HTML_SOURCE_DIR)
      .filter(f => f.endsWith('.html') || f.endsWith('.htm'))
      .map(f => join(HTML_SOURCE_DIR, f))
      .filter(f => statSync(f).isFile());
  } catch (e) {
    console.error(`No se encontró carpeta de HTMLs: ${HTML_SOURCE_DIR}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No hay HTMLs para subir. El agente debe generar archivos primero.');
    return;
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadTool(files[i], i);
      results.push(result);
      console.log(`✅ Subido: ${result.title} → /page/${result.id}`);
    } catch (err) {
      console.error(`❌ Error subiendo ${files[i]}:`, err.message);
    }
  }

  console.log(`\nTotal subidos: ${results.length}/${files.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});