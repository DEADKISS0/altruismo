import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_DIR = process.env.FARM_OUTPUT_DIR || join(__dirname, '..', '..', '..', 'farm-htmls');
const LAST_RUN_FILE = join(OUTPUT_DIR, 'last-run.json');

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
const GITHUB_TOKEN = process.env.GH_PAT;
const GITHUB_OWNER = process.env.GH_OWNER || 'DEADKISS0';
const BOT_USER_ID = process.env.BOT_USER_ID || '9767656b-dee1-4fe3-880b-866dfdade98e';

const INTERVAL_MS = 2 * 60 * 60 * 1000;

function getAllowedCategories() {
  return ['productivity', 'data', 'professional'];
}

const TOOL_IDEAS = [
  { category: 'productivity', idea: 'Task prioritizer with Eisenhower matrix and drag-drop', problem: 'Organizar tareas por urgencia/importancia con interfaz arrastrable.' },
  { category: 'data', idea: 'Regex tester with match highlighting and cheatsheet', problem: 'Probar y depurar expresiones regulares en tiempo real.' },
  { category: 'professional', idea: 'CSS grid generator with visual preview', problem: 'Crear layouts CSS grid visualmente sin escribir código.' },
  { category: 'productivity', idea: 'Pomodoro timer with ambient sounds', problem: 'Timer de foco con sonidos ambientales para concentración.' },
  { category: 'data', idea: 'Base64 encoder/decoder with file support', problem: 'Codificar y decodificar texto y archivos en Base64.' },
  { category: 'professional', idea: 'Color palette generator from image upload', problem: 'Extraer paleta de colores de una imagen automáticamente.' },
  { category: 'productivity', idea: 'Markdown to HTML converter with live preview', problem: 'Convertir Markdown a HTML con vista previa instantánea.' },
  { category: 'data', idea: 'QR code generator with custom styling', problem: 'Crear códigos QR personalizados con colores y estilos.' },
  { category: 'professional', idea: 'JavaScript playground with instant execution', problem: 'Escribir y ejecutar JavaScript en el navegador al instante.' },
  { category: 'productivity', idea: 'Decision wheel with weighted options', problem: 'Tomar decisiones girando una ruleta con pesos personalizados.' },
  { category: 'data', idea: 'Unix timestamp converter with timezone support', problem: 'Convertir timestamps Unix a fechas legibles con zonas horarias.' },
  { category: 'professional', idea: 'Gradient generator with CSS export', problem: 'Crear gradientes CSS con preview en vivo y export.' },
  { category: 'productivity', idea: 'Breathing exercise with animated circle', problem: 'Ejercicios de respiración guiados con animación visual.' },
  { category: 'data', idea: 'JSON diff tool comparing two objects', problem: 'Comparar dos JSONs y ver las diferencias al instante.' },
  { category: 'professional', idea: 'HTML entity encoder/decoder', problem: 'Codificar y decodificar entidades HTML rápidamente.' },
  { category: 'productivity', idea: 'Study timer with spaced repetition schedule', problem: 'Timer de estudio con agenda de repetición espaciada.' },
  { category: 'data', idea: 'IP address lookup with geolocation', problem: 'Buscar información de direcciones IP con geolocalización.' },
  { category: 'professional', idea: 'SVG path editor with preview', problem: 'Editar paths SVG con vista previa en tiempo real.' },
  { category: 'productivity', idea: 'Kanban board with localStorage persistence', problem: 'Tablero Kanban con persistencia local.' },
  { category: 'data', idea: 'Binary/decimal/hex converter', problem: 'Convertir entre binario, decimal y hexadecimal.' },
  { category: 'professional', idea: 'Tailwind color palette explorer', problem: 'Explorar la paleta de colores de Tailwind CSS.' },
  { category: 'productivity', idea: 'Goal tracker with progress visualization', problem: 'Seguimiento de metas con visualización de progreso.' },
  { category: 'data', idea: 'Lorem ipsum generator with paragraph control', problem: 'Generar texto Lorem Ipsum con control de párrafos.' },
  { category: 'professional', idea: 'CSS unit converter (rem/em/px)', problem: 'Convertir entre unidades CSS rápidamente.' },
];

function getLastRunInfo() {
  if (!existsSync(LAST_RUN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LAST_RUN_FILE, 'utf8'));
  } catch { return null; }
}

function saveLastRunInfo(toolsGenerated, lastTimestamp) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(LAST_RUN_FILE, JSON.stringify({
    lastTimestamp,
    toolsGenerated,
    updatedAt: new Date().toISOString(),
  }, null, 2));
}

async function getExistingTitles(supabase) {
  const { data, error } = await supabase.from('pages').select('title');
  if (error) { console.error('Error fetching titles:', error.message); return []; }
  return (data || []).map(p => p.title.toLowerCase().trim());
}

function normalizeTitle(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '').trim();
}

function pickUniqueIdea(existingTitles) {
  const normalizedExisting = existingTitles.map(normalizeTitle);
  const available = TOOL_IDEAS.filter(idea => {
    const normalizedIdea = normalizeTitle(idea.idea);
    return !normalizedExisting.some(et =>
      et === normalizedIdea ||
      et.includes(normalizedIdea) ||
      normalizedIdea.includes(et)
    );
  });

  if (available.length === 0) {
    const timestamp = Date.now();
    const categories = getAllowedCategories();
    const cat = categories[Math.floor(Math.random() * categories.length)];
    return {
      category: cat,
      idea: `Custom tool ${timestamp}`,
      problem: `Herramienta única generada el ${new Date().toISOString()}`,
    };
  }

  return available[Math.floor(Math.random() * available.length)];
}

async function researchPhase(supabase, idea) {
  const existingTitles = await getExistingTitles(supabase);
  const existingCount = existingTitles.length;
  console.log(`📊 Herramientas existentes: ${existingCount}`);
  console.log(`🎯 Idea seleccionada: ${idea.idea} [${idea.category}]`);

  return {
    timestamp: Date.now(),
    category: idea.category,
    idea: idea.idea,
    problem: idea.problem,
    targetUser: 'Desarrolladores, creativos y profesionales que buscan micro-herramientas inmediatas.',
    aesthetic: 'Modo oscuro por defecto, acentos vibrantes (ember/void), tipografía Inter, animaciones CSS 200ms ease-out, mobile-first.',
    existingTools: existingCount,
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
    timestamp: research.timestamp,
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
- Que NO sea una herramienta duplicada (no copiar herramientas existentes)

## Output
Devuelve SOLO el código HTML completo, SIN explicaciones, SIN markdown, SIN bloques de código.`;
}

async function callLLM(prompt) {
  console.log(`🤖 Llamando a LLM (${LLM.model})...`);
  const system = 'Eres un desarrollador frontend experto. Generas HTML único, limpio y funcional. Nunca usas markdown en la respuesta.';
  const userMessage = { role: 'user', content: prompt };

  let res;
  if (LLM.provider === 'anthropic') {
    res = await fetch(LLM.url, {
      method: 'POST',
      headers: { 'x-api-key': LLM.key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LLM.model, system, messages: [userMessage], temperature: 0.7, max_tokens: 8000 }),
    });
  } else {
    res = await fetch(LLM.url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LLM.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LLM.model, messages: [{ role: 'system', content: system }, userMessage], temperature: 0.7, max_tokens: 8000 }),
    });
  }

  if (!res.ok) { const err = await res.text(); throw new Error(`LLM API error ${res.status}: ${err}`); }
  const data = await res.json();
  const html = LLM.provider === 'anthropic' ? data.content?.[0]?.text?.trim() : data.choices?.[0]?.message?.content?.trim();
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

async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Faltan Supabase env vars');
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getCategoryId(supabase, slug) {
  const { data, error } = await supabase.from('categories').select('id').eq('slug', slug).single();
  if (error) throw error;
  return data?.id || null;
}

function generateDescription(html) {
  const metaMatch = html.match(/<meta[^\u003e]*name=["']description["'][^\u003e]*content=["']([^"']*)["']/i);
  if (metaMatch) return metaMatch[1];
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 160) || 'Herramienta interactiva generada por Chat RR aliados';
}

async function uploadToSupabase(supabase, botUserId, title, html, category) {
  if (!botUserId) throw new Error('Falta BOT_USER_ID');
  const categoryId = await getCategoryId(supabase, category).catch(() => null);
  const timestamp = Date.now();
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileName = `${safeTitle}.html`;
  const storagePath = `${botUserId}/${timestamp}/${fileName}`;
  const description = generateDescription(html);

  const { error: uploadError } = await supabase.storage
    .from('pages').upload(storagePath, html, { contentType: 'text/html' });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('pages').getPublicUrl(storagePath);

  const { data: page, error: insertError } = await supabase
    .from('pages').insert({
      author_id: botUserId, category_id: categoryId,
      title: title.replace(/[-_]/g, ' ').trim(),
      description, file_url: publicUrl,
      is_open_source: true, source_code: html,
    }).select('id').single();
  if (insertError) throw insertError;

  return { id: page.id, publicUrl };
}

async function createGitHubRepo(name, description) {
  if (!GITHUB_TOKEN) throw new Error('Falta GH_PAT');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const repoName = `tool-${slug}`;

  const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  if (checkRes.status === 404) {
    const createRes = await fetch(`https://api.github.com/users/${GITHUB_OWNER}/repos`, {
      method: 'POST',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: repoName, description, private: false, auto_init: true }),
    });
    if (!createRes.ok) throw new Error(`GitHub create failed: ${(await createRes.json()).message}`);
  } else if (!checkRes.ok) {
    throw new Error(`GitHub check failed: ${checkRes.status}`);
  }
  return repoName;
}

async function commitToGitHub(repoName, content) {
  const base64 = Buffer.from(content).toString('base64');
  const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/index.html`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  const body = { message: 'feat: update tool', content: base64 };
  if (getRes.status === 200) {
    const existing = await getRes.json();
    body.sha = existing.sha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/index.html`, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!putRes.ok) throw new Error(`GitHub commit failed: ${(await putRes.json()).message}`);
}

async function syncToGitHub(title, html) {
  const description = generateDescription(html);
  const repoName = await createGitHubRepo(title, description);
  await commitToGitHub(repoName, html);
  return `https://github.com/${GITHUB_OWNER}/${repoName}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runCycle(supabase, cycleNum) {
  const timestamp = Date.now();
  console.log(`\n--- Ciclo ${cycleNum} ---`);

  const existingTitles = await getExistingTitles(supabase);
  const idea = pickUniqueIdea(existingTitles);

  const research = await researchPhase(supabase, idea);
  writeFileSync(join(OUTPUT_DIR, `research-${timestamp}.json`), JSON.stringify(research, null, 2));
  console.log(`🔍 Investigación: ${research.idea} [${research.category}]`);

  const design = generateDesign(research);
  writeFileSync(join(OUTPUT_DIR, `design-${timestamp}.json`), JSON.stringify(design, null, 2));
  console.log(`🎨 Diseño: paleta ${design.colors.accent}`);

  const prompt = generatePrompt(research, design);
  writeFileSync(join(OUTPUT_DIR, `prompt-${timestamp}.txt`), prompt);

  let html;
  try {
    html = await callLLM(prompt);
    console.log(`✅ HTML generado (${Math.round(html.length / 1024)} KB)`);
  } catch (e) {
    console.error(`❌ Error LLM: ${e.message}`);
    return null;
  }

  const validation = validateHTML(html);
  console.log(`🔍 Validación: ${validation.passed}/${validation.total} (${validation.ok ? 'PASS' : 'FAIL'})`);
  if (!validation.ok) {
    console.error('⚠️ HTML no pasó validación. Saltando.');
    return null;
  }

  const safeTitle = research.idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const htmlFile = `tool-${safeTitle}-${timestamp}.html`;
  writeFileSync(join(OUTPUT_DIR, htmlFile), html);

  let pageUrl = null;
  if (UPLOAD_TO_SUPABASE) {
    try {
      const result = await uploadToSupabase(supabase, BOT_USER_ID, safeTitle, html, research.category);
      pageUrl = `https://altruismo-web.vercel.app/page/${result.id}`;
      console.log(`✅ Publicado: ${pageUrl}`);
    } catch (e) {
      console.error(`❌ Error Supabase: ${e.message}`);
    }
  }

  let githubUrl = null;
  if (GITHUB_SYNC && GITHUB_TOKEN) {
    try {
      githubUrl = await syncToGitHub(safeTitle, html);
      console.log(`🐙 GitHub: ${githubUrl}`);
    } catch (e) {
      console.error(`❌ Error GitHub: ${e.message}`);
    }
  }

  return { idea: research.idea, category: research.category, file: htmlFile, url: pageUrl, githubUrl };
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n🌱 FARM PIPELINE — Pipeline completo de la granja');
  console.log(`🤖 Modelo: ${LLM.model}`);
  console.log(`⏰ Intervalo: 2h`);
  console.log(`🐙 GitHub Sync: ${GITHUB_SYNC ? 'SÍ' : 'NO'}`);

  const supabase = await createSupabaseClient();

  const lastRun = getLastRunInfo();
  let cyclesToRun = 1;

  if (lastRun?.lastTimestamp) {
    const elapsed = Date.now() - lastRun.lastTimestamp;
    const missed = Math.floor(elapsed / INTERVAL_MS);
    if (missed > 1) {
      cyclesToRun = Math.min(missed, 6);
      console.log(`\n⚠️  Sistema estuvo offline. Generando ${cyclesToRun} herramientas perdidas.`);
    }
  }

  const results = [];
  for (let i = 1; i <= cyclesToRun; i++) {
    const result = await runCycle(supabase, i);
    if (result) results.push(result);
    if (i < cyclesToRun) {
      console.log(`\n⏳ Esperando 5s antes del siguiente ciclo...`);
      await sleep(5000);
    }
  }

  saveLastRunInfo(results.length, Date.now());

  console.log('\n✅ RESUMEN');
  console.log(`   Herramientas generadas: ${results.length}/${cyclesToRun}`);
  results.forEach((r, i) => {
    console.log(`   ${i+1}. ${r.idea} [${r.category}]${r.url ? ` → ${r.url}` : ''}${r.githubUrl ? ` | ${r.githubUrl}` : ''}`);
  });
  console.log('');
}

main().catch(e => {
  console.error('💥 Error fatal:', e);
  process.exit(1);
});
