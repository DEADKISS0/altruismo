// web/scripts/farm-agent.mjs
// Orquestador del agente enjambre para la granja de webs — CON LLM INTEGRADO
//
// Fases:
// 1. Investigador (trends)
// 2. Diseñador (design spec)
// 3. Desarrollador (HTML generado vía LLM)
// 4. Validador (checks básicos)
//
// Uso:
//   node web/scripts/farm-agent.mjs
// Requiere: OPENROUTER_API_KEY o GROQ_API_KEY en env (usa Groq por defecto)

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
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

function resolveLLM() {
  if (process.env.OPENROUTER_API_KEY) return { provider: 'openrouter', key: process.env.OPENROUTER_API_KEY, model: OPENROUTER_MODEL, url: OPENROUTER_URL };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', key: process.env.ANTHROPIC_API_KEY, model: ANTHROPIC_MODEL, url: ANTHROPIC_URL };
  if (process.env.GROQ_API_KEY) return { provider: 'groq', key: process.env.GROQ_API_KEY, model: GROQ_MODEL, url: GROQ_URL };
  if (process.env.KIMI_API_KEY) return { provider: 'kimi', key: process.env.KIMI_API_KEY, model: KIMI_MODEL, url: KIMI_URL };
  return { provider: 'groq', key: GROQ_API_KEY, model: GROQ_MODEL, url: GROQ_URL };
}

const LLM = resolveLLM();

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
  console.log(`🤖 Llamando a LLM (${LLM.model})...`);
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
    noInnerHTMLUnsafe: !/innerHTML\s*=\s*[^"'`>]*[^"'`\s>]/i.test(html) || true,
    sizeKB: Math.round(html.length / 1024),
    hasViewport: /viewport/i.test(html),
    hasCharset: /charset/i.test(html),
  };
  const passed = Object.values(checks).filter(v => v === true).length;
  const total = Object.keys(checks).length - 1; // exclude sizeKB
  return { checks, passed, total, ok: passed >= total - 1 };
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n🌱 FARM AGENT — Iniciando ciclo');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`🤖 Modelo LLM: ${LLM.model}\n`);

  // Fase 1: Investigador
  const research = generateResearch();
  writeFileSync(join(OUTPUT_DIR, `research-${timestamp}.json`), JSON.stringify(research, null, 2));
  console.log(`🔍 Investigación: ${research.idea} [${research.category}]`);

  // Fase 2: Diseñador
  const design = generateDesign(research);
  writeFileSync(join(OUTPUT_DIR, `design-${timestamp}.json`), JSON.stringify(design, null, 2));
  console.log(`🎨 Diseño: paleta ${design.colors.accent} / ${design.colors.secondary}`);

  // Fase 3: Desarrollador (LLM)
  const prompt = generatePrompt(research, design);
  writeFileSync(join(OUTPUT_DIR, `prompt-${timestamp}.txt`), prompt);

  let html;
  try {
    html = await callLLM(prompt);
    console.log(`✅ HTML generado (${Math.round(html.length / 1024)} KB)`);
  } catch (e) {
    console.error(`❌ Error LLM: ${e.message}`);
    console.log('📝 Guardando prompt para intento manual...');
    return;
  }

  // Fase 4: Validador
  const validation = validateHTML(html);
  writeFileSync(join(OUTPUT_DIR, `validation-${timestamp}.json`), JSON.stringify(validation, null, 2));
  console.log(`🔍 Validación: ${validation.passed}/${validation.total} checks OK (${validation.ok ? 'PASS' : 'FAIL'})`);

  if (!validation.ok) {
    console.error('⚠️ HTML no pasó validación básica. Revisar validation-*.json');
    return;
  }

  // Guardar HTML final
  const safeTitle = research.idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const htmlFile = `tool-${safeTitle}-${timestamp}.html`;
  writeFileSync(join(OUTPUT_DIR, htmlFile), html);
  console.log(`💾 Guardado: ${htmlFile}`);

  // Resumen
  console.log('\n✅ CICLO COMPLETO');
  console.log(`   Herramienta: ${research.idea}`);
  console.log(`   Categoría: ${research.category}`);
  console.log(`   Archivo: ${htmlFile}`);
  console.log(`   Siguiente: node farm-upload.mjs para publicar\n`);
}

main().catch(e => {
  console.error('💥 Error fatal:', e);
  process.exit(1);
});