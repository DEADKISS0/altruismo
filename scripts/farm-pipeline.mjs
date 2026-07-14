// web/scripts/farm-pipeline.mjs
// Pipeline end-to-end de la granja de webs:
// 1. Investiga tendencias
// 2. Genera HTML con LLM (OpenRouter)
// 3. Valida HTML
// 4. Sube a Supabase Storage + BD
// 5. (Opcional) Crea repo en GitHub
//
// Uso local:
//   node web/scripts/farm-pipeline.mjs
//   UPLOAD_TO_SUPABASE=1 node web/scripts/farm-pipeline.mjs
//   UPLOAD_TO_SUPABASE=1 GITHUB_SYNC=1 node web/scripts/farm-pipeline.mjs
// Requiere: OPENROUTER_API_KEY en env (para LLM)

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_DIR = process.env.FARM_OUTPUT_DIR || join(__dirname, '..', '..', '..', 'farm-htmls');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const KIMI_MODEL = process.env.KIMI_MODEL || 'moonshot-v1-32k';
const KIMI_URL = 'https://api.moonshot.cn/v1/chat/completions';

// Preferencia: explícito > Anthropic > Groq > Kimi > OpenRouter fallback
function resolveLLM() {
  if (process.env.OPENROUTER_API_KEY) return { provider: 'openrouter', key: process.env.OPENROUTER_API_KEY, model: OPENROUTER_MODEL, url: OPENROUTER_URL };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', key: process.env.ANTHROPIC_API_KEY, model: ANTHROPIC_MODEL, url: ANTHROPIC_URL };
  if (process.env.GROQ_API_KEY) return { provider: 'groq', key: process.env.GROQ_API_KEY, model: GROQ_MODEL, url: GROQ_URL };
  if (process.env.KIMI_API_KEY) return { provider: 'kimi', key: process.env.KIMI_API_KEY, model: KIMI_MODEL, url: KIMI_URL };
  return { provider: 'groq', key: GROQ_API_KEY, model: GROQ_MODEL, url: GROQ_URL };
}

const LLM = resolveLLM();

const UPLOAD_TO_SUPABASE = process.env.UPLOAD_TO_SUPABASE === '1';
const GITHUB_SYNC = process.env.GITHUB_SYNC === '1';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_ORG_OR_USER || 'rr-aliados0';

const timestamp = Date.now();

const TRENDS = [
  { category: 'productivity', idea: 'Focus timer with Pomodoro cycles and ambient sounds', problem: 'Ayudar a mantener foco profundo con ciclos de trabajo/descanso personalizables.' },
  { category: 'data', idea: 'JSON formatter & validator with syntax highlighting', problem: 'Formatear, validar y explorar JSON de forma visual sin instalar nada.' },
  { category: 'productivity', idea: 'Habit tracker with streak visualization and reminders', problem: 'Construir hábitos duraderos viendo rachas y progreso visual.' },
  { category: 'professional', idea: 'Regex tester with live match highlighting and cheatsheet', problem: 'Probar y depurar expresiones regulares en tiempo real.' },
  { category: 'data', idea: 'Unit converter with 50+ categories and smart search', problem: 'Convertir cualquier unidad al instante con búsqueda difusa.' },
  { category: 'productivity', idea: 'Task batcher with Eisenhower matrix and time estimates', problem: 'Organizar tareas por urgencia/importancia y estimar tiempo real.' },
  { category: 'data', idea: 'Color palette generator with accessibility contrast checker', problem: 'Crear paletas accesibles WCAG AA/AAA para UI.' },
  { category: 'professional', idea: 'Markdown previewer with live sync and export', problem: 'Escribir y previsualizar Markdown con export a HTML/PDF.' },
  { category: 'productivity', idea: 'Password generator with entropy meter and passphrase mode', problem: 'Generar contraseñas seguras y memorables al instante.' },
  { category: 'data', idea: 'CSV explorer with filtering, sorting and chart preview', problem: 'Explorar archivos CSV grandes sin Excel, con gráficos rápidos.' },
];

const CATEGORY_ROTATION = [
  'productivity', 'data', 'productivity', 'professional', 'data', 'productivity',
];

function generateResearch() {
  const pick = TRENDS[Math.floor(Math.random() * TRENDS.length)];
  return {
    timestamp,
    category: pick.category,
    idea: pick.idea,
    problem: pick.problem,
    targetUser: 'Desarrolladores, creativos y profesionales que buscan micro-herramientas inmediatas.',
    aesthetic: 'Modo oscuro por defecto, acentos vibrantes (ember/void), tipografía Inter, animaciones CSS 200ms ease-out, mobile-first.',
  };
}

function generateDesign(research) {
  const palettes = {
    productivity: { bg: '#0F0F0F', surface: '#1A1A1A', text: '#F5E6D3', accent: '#CE3D1F', secondary: '#3F0035' },
    data: { bg: '#0A0F1A', surface: '#111827', text: '#E5E7EB', accent: '#06B6D4', secondary: '#1E3A5F' },
    professional: { bg: '#0D1117', surface: '#161B22', text: '#E6EDF3', accent: '#A371F7', secondary: '#2D1B4E4540' },
  };
  const p = palettes[research.category] || palettes.productivity;
  return {
    timestamp,
    category: research.category,
    colors: { background: p.bg, surface: p.surface, text: p.text, accent: p.accent, secondary: p.secondary, success: '#10B981', warning: '#F59E0B' },
    typography: { font: 'Inter, system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    animations: ['fade-in 300ms ease-out', 'slide-up 400ms ease-out', 'hover scale 1.02', 'focus ring 150ms', 'stagger children 50ms'],
    layout: 'mobile-first, single-column, hero + interaction area, max-width 720px centered',
  };
}

function generatePrompt(research, design) {
  return `Eres un desarrollador frontend experto. Crea una herramienta web interactiva, 100% funcional, en UN SOLO ARCHIVO HTML.

## Categoría
${research.category}

## Idea
${research.idea}

## Problema a resolver
${research.problem}

## Usuario objetivo
${research.targetUser}

## Diseño
- Paleta: background ${design.colors.background}, surface ${design.colors.surface}, text ${design.colors.text}, accent ${design.colors.accent}, secondary ${design.colors.secondary}
- Tipografía: ${design.typography.font}
- Estilo: ${research.aesthetic}
- Animaciones: ${design.animations.join(', ')}
- Layout: ${design.layout}

## Requisitos técnicos OBLIGATORIOS
- Archivo único HTML con CSS en <style> y JS en <script>
- Sin dependencias externas (salvo Google Fonts: Inter)
- Responsive: 320px a 1440px
- Funcional: debe resolver el problema, no solo decorativo
- Accesible: contraste WCAG AA, navegable por teclado, labels en inputs, ARIA donde aplique
- Sin backend, sin localStorage obligatorio, sin eval(), sin innerHTML con datos no confiables
- Código limpio, semántico, comentado en partes clave
- Meta viewport, charset, title descriptivo

## Output
Devuelve SOLO el código HTML completo, SIN explicaciones, SIN markdown, SIN bloques de código.`;
}

async function callLLM(prompt) {
  console.log(`\n🤖 Llamando a LLM (${LLM.model})...`);
  const system = 'Eres un desarrollador frontend experto. Generas HTML único, limpio y funcional. Nunca usas markdown en la respuesta.';
  const userMessage = { role: 'user', content: prompt };

  let res;
  if (LLM.provider === 'anthropic') {
    res = await fetch(LLM.url, {
      method: 'POST',
      headers: {
        'x-api-key': LLM.key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM.model,
        system,
        messages: [userMessage],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });
  } else {
    res = await fetch(LLM.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM.model,
        messages: [
          { role: 'system', content: system },
          userMessage,
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const html = LLM.provider === 'anthropic'
    ? data.content?.[0]?.text?.trim()
    : data.choices?.[0]?.message?.content?.trim();
  if (!html) throw new Error('Respuesta vacía del LLM');
  return html;
}

function validateHTML(html) {
  const checks = {
    hasDoctype: /<!doctype html>/i.test(html),
    hasHtmlTag: /<html/i.test(html),
    hasHead: /<head>/i.test(html),
    hasBody: /<body>/i.test(html),
    hasStyle: /<style>/i.test(html),
    hasScript: /<script>/i.test(html),
    noEval: !/eval\(/i.test(html),
    hasViewport: /viewport/i.test(html),
    hasCharset: /charset/i.test(html),
  };
  const passed = Object.values(checks).filter(v => v === true).length;
  const total = Object.keys(checks).length;
  return { checks, passed, total, ok: passed >= total - 1 };
}

// Supabase upload
async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getCategoryId(supabase, slug) {
  const { data, error } = await supabase.from('categories').select('id').eq('slug', slug).single();
  if (error) throw error;
  return data?.id || null;
}

function generateDescription(html) {
  const metaMatch = html.match(/<meta[^\u003e]*name=["']description["'][^\u003e]*content=["']([^"']*)["'][^\u003e]*>/i);
  if (metaMatch) return metaMatch[1];
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 160) || 'Herramienta interactiva generada por Chat RR aliados';
}

async function uploadToSupabase(supabase, botUserId, title, html, category) {
  if (!botUserId) throw new Error('Falta BOT_USER_ID');

  const categoryId = await getCategoryId(supabase, category);
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileName = `${safeTitle}.html`;
  const storagePath = `${botUserId}/${timestamp}/${fileName}`;
  const description = generateDescription(html);

  const { error: uploadError } = await supabase.storage
    .from('pages')
    .upload(storagePath, html, { contentType: 'text/html' });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('pages').getPublicUrl(storagePath);

  const { data: page, error: insertError } = await supabase
    .from('pages')
    .insert({
      author_id: botUserId,
      category_id: categoryId,
      title: title.replace(/[-_]/g, ' ').trim(),
      description,
      file_url: publicUrl,
      is_open_source: true,
      source_code: html,
    })
    .select('id')
    .single();
  if (insertError) throw insertError;

  return { id: page.id, publicUrl };
}

// GitHub sync
async function createGitHubRepo(name, description) {
  if (!GITHUB_TOKEN) throw new Error('Falta GITHUB_TOKEN');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const repoName = `altruismo-${slug}`;

  const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  if (checkRes.status === 404) {
    const createRes = await fetch(`https://api.github.com/${GITHUB_OWNER.includes('/') ? 'orgs' : 'users'}/${GITHUB_OWNER}/repos`, {
      method: 'POST',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        description,
        private: false,
        has_issues: false,
        has_projects: false,
        has_wiki: false,
      }),
    });
    if (!createRes.ok) throw new Error(`GitHub create repo failed: ${(await createRes.json()).message}`);
  } else if (!checkRes.ok) {
    throw new Error(`GitHub check repo failed: ${checkRes.status}`);
  }
  return repoName;
}

async function commitToGitHub(repoName, fileName, content) {
  const base64 = Buffer.from(content).toString('base64');
  const path = 'index.html';
  const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  const body = { message: `feat: add ${fileName}`, content: base64 };
  if (getRes.status === 200) {
    const existing = await getRes.json();
    body.sha = existing.sha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!putRes.ok) throw new Error(`GitHub commit failed: ${(await putRes.json()).message}`);
}

async function syncToGitHub(title, html) {
  if (!GITHUB_TOKEN) {
    console.log('⚠️ GITHUB_TOKEN no configurado, omitiendo GitHub');
    return null;
  }
  const description = generateDescription(html);
  const repoName = await createGitHubRepo(title, description);
  await commitToGitHub(repoName, `${title}.html`, html);
  return `https://github.com/${GITHUB_OWNER}/${repoName}`;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n🌱 FARM PIPELINE — Pipeline completo de la granja');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`🤖 Modelo LLM: ${LLM.model}`);
  console.log(`⬆️  Subir a Supabase: ${UPLOAD_TO_SUPABASE ? 'SÍ' : 'NO'}`);
  console.log(`🐙 Sincronizar GitHub: ${GITHUB_SYNC ? 'SÍ' : 'NO'}\n`);

  // Fase 1-2: Investigador + Diseñador
  const research = generateResearch();
  writeFileSync(join(OUTPUT_DIR, `research-${timestamp}.json`), JSON.stringify(research, null, 2));
  console.log(`🔍 Investigación: ${research.idea} [${research.category}]`);

  const design = generateDesign(research);
  writeFileSync(join(OUTPUT_DIR, `design-${timestamp}.json`), JSON.stringify(design, null, 2));
  console.log(`🎨 Diseño: paleta ${design.colors.accent}`);

  // Fase 3: Desarrollador (LLM)
  const prompt = generatePrompt(research, design);
  writeFileSync(join(OUTPUT_DIR, `prompt-${timestamp}.txt`), prompt);

  let html;
  try {
    html = await callLLM(prompt);
    console.log(`✅ HTML generado (${Math.round(html.length / 1024)} KB)`);
  } catch (e) {
    console.error(`❌ Error LLM: ${e.message}`);
    process.exit(1);
  }

  // Fase 4: Validador
  const validation = validateHTML(html);
  writeFileSync(join(OUTPUT_DIR, `validation-${timestamp}.json`), JSON.stringify(validation, null, 2));
  console.log(`🔍 Validación: ${validation.passed}/${validation.total} checks OK (${validation.ok ? 'PASS' : 'FAIL'})`);

  if (!validation.ok) {
    console.error('⚠️ HTML no pasó validación básica. Revisar validation-*.json');
    process.exit(1);
  }

  // Guardar HTML
  const safeTitle = research.idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const htmlFile = `tool-${safeTitle}-${timestamp}.html`;
  const htmlPath = join(OUTPUT_DIR, htmlFile);
  writeFileSync(htmlPath, html);
  console.log(`💾 Guardado: ${htmlFile}`);

  // Fase 5: Publicación en Supabase
  let pageUrl = null;
  if (UPLOAD_TO_SUPABASE) {
    try {
      const supabase = await createSupabaseClient();
      const result = await uploadToSupabase(supabase, process.env.BOT_USER_ID, safeTitle, html, research.category);
      pageUrl = `https://altruismo-web.vercel.app/page/${result.id}`;
      console.log(`✅ Publicado en Supabase: ${pageUrl}`);
      console.log(`   Storage: ${result.publicUrl}`);
    } catch (e) {
      console.error(`❌ Error subiendo a Supabase: ${e.message}`);
    }
  }

  // Fase 6: Sincronización GitHub
  let githubUrl = null;
  if (GITHUB_SYNC) {
    try {
      githubUrl = await syncToGitHub(safeTitle, html);
      console.log(`✅ GitHub: ${githubUrl}`);
    } catch (e) {
      console.error(`❌ Error GitHub: ${e.message}`);
    }
  }

  // Resumen
  console.log('\n✅ CICLO COMPLETO');
  console.log(`   Herramienta: ${research.idea}`);
  console.log(`   Categoría: ${research.category}`);
  console.log(`   Archivo: ${htmlFile}`);
  if (pageUrl) console.log(`   Página: ${pageUrl}`);
  if (githubUrl) console.log(`   GitHub: ${githubUrl}`);
  console.log('');
}

main().catch(e => {
  console.error('💥 Error fatal:', e);
  process.exit(1);
});