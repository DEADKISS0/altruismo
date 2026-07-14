import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Map DB titles to local fix files
const titleToFile = {
  'color palette generator with accessibility contrast checker': 'color-palette-generator.html',
  'color converter': 'color-converter.html',
  'Markdown Previewer': 'markdown-previewer.html',
  'Pomodoro Timer': 'pomodoro-timer.html',
  'Password Generator': 'password-generator.html',
  'JSON Formatter': 'json-formatter.html',
  'Unit Converter': 'unit-converter.html',
};

// Map DB titles to new descriptions
const titleToDesc = {
  'color palette generator with accessibility contrast checker': 'Genera paletas armónicas de 5 colores, verifica contraste WCAG AA/AAA y copia al instante.',
  'color converter': 'Conversor de colores HEX/RGB/HSL/HWB con escalas de tonos, contraste AA/AAA y colores aleatorios.',
  'Markdown Previewer': 'Editor Markdown en vivo con syntax highlighting, toolbar de formato, copiar HTML y descargar .md.',
  'Pomodoro Timer': 'Temporizador de productividad con ciclos trabajo/descanso, sonido, configuración inline y estadísticas.',
  'Password Generator': 'Generador de contraseñas seguras con modo passphrase, entropía visual y tiempo estimado de crackeo.',
  'JSON Formatter': 'Validador y formateador JSON con auto-detect al pegar, error messages con línea/columna y shortcuts.',
  'Unit Converter': 'Conversor universal: longitud, peso, temperatura, datos, velocidad, volumen, área y tiempo.',
};

// Map DB titles to new categories (slug)
const titleToCategory = {
  'color palette generator with accessibility contrast checker': 'productivity',
  'color converter': 'productivity',
  'Markdown Previewer': 'productivity',
  'Pomodoro Timer': 'productivity',
  'Password Generator': 'data',
  'JSON Formatter': 'data',
  'Unit Converter': 'data',
};

async function main() {
  // Get all pages
  const { data: pages, error } = await supabase
    .from('pages')
    .select('id, title, file_url, source_code')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pages:', error);
    process.exit(1);
  }

  console.log(`Found ${pages.length} pages\n`);

  let success = 0;
  let failed = 0;

  for (const page of pages) {
    const normalTitle = page.title.trim().toLowerCase();
    const fileName = titleToFile[page.title.trim()] || titleToFile[Object.keys(titleToFile).find(k => k.toLowerCase() === normalTitle)];

    if (!fileName) {
      console.log(`SKIP ${page.title} (no matching fix file)`);
      continue;
    }

    console.log(`Processing: ${page.title} -> ${fileName}`);

    try {
      // Read the improved HTML
      const htmlPath = join(process.cwd(), 'scripts', 'fixes', fileName);
      let html;
      try {
        html = readFileSync(htmlPath, 'utf8');
      } catch (e) {
        // Try from temp tools-analysis path
        const altPath = join('C:\\Users\\santi\\AppData\\Local\\Temp\\opencode\\tools-analysis\\fixes', fileName);
        html = readFileSync(altPath, 'utf8');
      }

      // Extract storage path from file_url
      const urlParts = page.file_url.split('/');
      const pagesIdx = urlParts.indexOf('pages');
      const storagePath = urlParts.slice(pagesIdx + 1).join('/');

      // Upload to Storage (overwrite)
      const { error: uploadErr } = await supabase.storage
        .from('pages')
        .upload(storagePath, html, {
          contentType: 'text/html',
          upsert: true,
        });

      if (uploadErr) {
        console.error(`  Upload error: ${uploadErr.message}`);
        failed++;
        continue;
      }

      // Update source_code and description in DB
      const newDesc = titleToDesc[page.title.trim()] || page.title;
      const { error: updateErr } = await supabase
        .from('pages')
        .update({
          source_code: html,
          description: newDesc,
        })
        .eq('id', page.id);

      if (updateErr) {
        console.error(`  DB update error: ${updateErr.message}`);
        failed++;
        continue;
      }

      console.log(`  OK (${html.length} bytes)`);
      success++;
    } catch (e) {
      console.error(`  Error: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} OK, ${failed} failed`);
}

main().catch(e => { console.error(e); process.exit(1); });
