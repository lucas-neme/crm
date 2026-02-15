const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'apps');
const TARGET_DIRS = [
  'cliente',
  'produto',
  'negocio',
  'financeiro',
  'produto-imobiliaria',
  'integrations',
];
const METHODS = ['findAll(', 'findOne(', 'findByPk(', 'create('];

const ALLOWLIST = [
  // scheduler is a system-wide process, not request-scoped.
  path.join('financeiro', 'services', 'notification-scheduler.service.ts'),
];

function listTsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listTsFiles(full));
    else if (entry.isFile() && full.endsWith('.ts')) files.push(full);
  }
  return files;
}

function lineFromIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (ALLOWLIST.includes(rel.replace(/\//g, path.sep))) return [];

  const text = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  for (const method of METHODS) {
    let pos = 0;
    while (true) {
      const idx = text.indexOf(`.${method}`, pos);
      if (idx === -1) break;

      const end = text.indexOf(');', idx);
      if (end === -1) break;

      const snippet = text.slice(idx, end + 2);
      const hasTenant = snippet.includes('tenantId');
      const hasWhereObject = snippet.includes('where:') || snippet.includes('where,');
      const isCreate = method === 'create(';
      const accepted = isCreate ? hasTenant : (hasTenant || hasWhereObject);
      if (!accepted) {
        findings.push({
          file: rel,
          line: lineFromIndex(text, idx),
          method: method.replace('(', ''),
        });
      }
      pos = idx + method.length + 1;
    }
  }

  return findings;
}

function main() {
  const dirs = TARGET_DIRS.map((d) => path.join(ROOT, d));
  const files = dirs.flatMap((d) => listTsFiles(d));

  const findings = files.flatMap(checkFile);

  if (findings.length) {
    console.error('Tenant scope check failed. Unscoped operations found:');
    for (const f of findings) {
      console.error(`- ${f.file}:${f.line} (${f.method})`);
    }
    process.exit(1);
  }

  console.log('Tenant scope check passed.');
}

main();
