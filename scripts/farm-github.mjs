// web/scripts/farm-github.mjs
// Crea un repositorio de GitHub por cada HTML generado y sube el archivo
//
// Uso:
//   node web/scripts/farm-github.mjs
// Requiere:
//   GITHUB_TOKEN (personal access token con permisos repo)
//   GITHUB_ORG_OR_USER (opcional, default: rr-aliados0)

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_ORG_OR_USER || 'rr-aliados0';
const HTML_SOURCE_DIR = process.env.HTML_SOURCE_DIR || join(__dirname, '..', '..', '..', 'farm-htmls');

if (!GITHUB_TOKEN) {
  console.error('Falta GITHUB_TOKEN');
  process.exit(1);
}

async function createRepo(name, description) {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const repoName = `altruismo-${slug}`;
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  if (res.status === 404) {
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
    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(`GitHub create repo failed: ${err.message}`);
    }
  } else if (!res.ok) {
    throw new Error(`GitHub check repo failed: ${res.status}`);
  }

  return { repoName, fullName: `${GITHUB_OWNER}/${repoName}` };
}

async function commitHtml(repoName, fileName, content) {
  const base64 = Buffer.from(content).toString('base64');
  const path = 'index.html';

  // Verificar si ya existe
  const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
  });

  const method = getRes.status === 200 ? 'PUT' : 'PUT';
  const body = {
    message: `feat: add ${fileName}`,
    content: base64,
  };

  if (getRes.status === 200) {
    const existing = await getRes.json();
    body.sha = existing.sha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`, {
    method,
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(`GitHub commit failed: ${err.message}`);
  }
}

async function main() {
  const files = readdirSync(HTML_SOURCE_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => join(HTML_SOURCE_DIR, f));

  for (const file of files) {
    const fileName = basename(file);
    const title = fileName.replace('.html', '').replace(/[-_]/g, ' ');
    const html = readFileSync(file, 'utf-8');

    try {
      const { repoName, fullName } = await createRepo(title, `Herramienta interactiva generada por Chat RR aliados: ${title}`);
      await commitHtml(repoName, fileName, html);
      console.log(`✅ GitHub: ${fullName}`);
    } catch (err) {
      console.error(`❌ GitHub error para ${title}:`, err.message);
    }
  }
}

main().catch(console.error);