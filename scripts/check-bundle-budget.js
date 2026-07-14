const fs = require('fs');
const path = require('path');

const BUDGETS = {
  'shared': { maxSize: 102 * 1024, description: 'First Load JS shared by all' },
  'page-home': { maxSize: 102 * 1024, description: 'Home page' },
  'page-dashboard': { maxSize: 266 * 1024, description: 'Dashboard page' },
  'page-page': { maxSize: 208 * 1024, description: 'Tool page' },
  'page-profile': { maxSize: 217 * 1024, description: 'Profile page' },
  'page-login': { maxSize: 189 * 1024, description: 'Login page' },
  'page-feed': { maxSize: 211 * 1024, description: 'Feed page' },
  'page-challenges': { maxSize: 131 * 1024, description: 'Challenges page' },
  'page-leaderboard': { maxSize: 126 * 1024, description: 'Leaderboard page' },
  'page-upload': { maxSize: 250 * 1024, description: 'Upload page' },
  'page-sponsors': { maxSize: 202 * 1024, description: 'Sponsors page' },
};

function parseBundleAnalysis(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const results = {};

  for (const page of data.pages) {
    const route = page.route;
    const size = page.size;
    const key = route === '/' ? 'page-home' : route.replace(/\//g, '-').replace(/^\[.*\]-/, 'page-');
    results[key] = size;
  }

  for (const chunk of data.chunks) {
    if (chunk.names && chunk.names.includes('shared')) {
      results['shared'] = chunk.size;
    }
  }

  return results;
}

function checkBudgets(actualSizes) {
  let passed = true;
  const violations = [];

  for (const [key, budget] of Object.entries(BUDGETS)) {
    const actual = actualSizes[key];
    if (actual === undefined) {
      console.warn(`⚠️  No data for ${key} (${budget.description})`);
      continue;
    }

    const maxKB = budget.maxSize / 1024;
    const actualKB = (actual / 1024).toFixed(1);
    const percent = ((actual / budget.maxSize) * 100).toFixed(1);

    if (actual > budget.maxSize) {
      console.error(`❌ ${key} (${budget.description}): ${actualKB}KB > ${maxKB}KB (${percent}%)`);
      violations.push({ key, actual, max: budget.maxSize, percent });
      passed = false;
    } else {
      console.log(`✅ ${key} (${budget.description}): ${actualKB}KB / ${maxKB}KB (${percent}%)`);
    }
  }

  return { passed, violations };
}

const analysisFile = process.argv[2] || 'bundle-analysis.json';

if (!fs.existsSync(analysisFile)) {
  console.error(`❌ Bundle analysis file not found: ${analysisFile}`);
  process.exit(1);
}

console.log('📦 Checking bundle size budgets...\n');

const actualSizes = parseBundleAnalysis(analysisFile);
const { passed, violations } = checkBudgets(actualSizes);

console.log('\n' + '='.repeat(50));

if (passed) {
  console.log('🎉 All bundle budgets passed!');
  process.exit(0);
} else {
  console.error(`\n❌ ${violations.length} budget violation(s) found.`);
  console.error('Run with ANALYZE=true to see detailed breakdown.');
  process.exit(1);
}