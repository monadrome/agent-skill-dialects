#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const skillDir = path.join(root, 'skills', 'agent-skill-dialects');
const skillPath = path.join(skillDir, 'SKILL.md');
const referencesDir = path.join(skillDir, 'references');
const skillName = 'agent-skill-dialects';

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function readRegularFile(filePath) {
  try {
    return fs.statSync(filePath).isFile() ? read(filePath) : '';
  } catch {
    return '';
  }
}

function walkMarkdown(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files.sort();
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|(.*))$`, 'm'));
  return match ? (match[1] ?? match[2] ?? match[3]).trim() : null;
}

function toRepoPosix(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

// ---- npm package contents (used by the coverage check below) ----
let packagedFiles = null;
try {
  const stdout = execSync('npm pack --json --dry-run', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const payload = JSON.parse(stdout);
  const candidates = Array.isArray(payload) ? payload : Object.values(payload);
  const info = candidates.find((entry) => entry && Array.isArray(entry.files));
  if (!info) throw new Error('npm pack --json output has no file list');
  packagedFiles = new Set(info.files.map((entry) => String(entry.path).replace(/^\.\//, '')));
} catch (error) {
  fail(`npm pack --dry-run failed: ${error.message}`);
}

// ---- SKILL.md frontmatter ----
const skill = read(skillPath);
const frontmatterMatch = skill.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);

if (!frontmatterMatch) {
  fail('SKILL.md frontmatter is missing or malformed.');
} else {
  const frontmatter = frontmatterMatch[1];
  try {
    const parsed = yaml.load(frontmatter);
    if (!parsed || typeof parsed !== 'object') fail('SKILL.md frontmatter must be a YAML mapping.');
    if (typeof parsed?.name !== 'string' || typeof parsed?.description !== 'string') {
      fail('SKILL.md frontmatter must include string name and description fields.');
    }
    if (typeof parsed?.metadata?.version !== 'string') fail('SKILL.md frontmatter metadata.version is missing.');
  } catch (error) {
    fail(`SKILL.md frontmatter is invalid YAML: ${error.message}`);
  }
  if (frontmatterValue(frontmatter, 'name') !== skillName) {
    fail(`SKILL.md name must be ${skillName}.`);
  }
}

const skillLines = skill.split('\n').length - Number(skill.endsWith('\n'));
if (skillLines > 500) fail(`SKILL.md exceeds the 500-line Agent Skills guideline (${skillLines}).`);

// ---- Mapping table must cover references/ exactly ----
const mappingPattern = /\|\s*`references\/([A-Za-z0-9-]+\.md)`\s*\|/g;
const mapped = new Set();
let mm;
while ((mm = mappingPattern.exec(skill)) !== null) mapped.add(mm[1]);

if (!fs.existsSync(referencesDir)) {
  fail('references/ directory is missing.');
} else {
  for (const entry of fs.readdirSync(referencesDir, { withFileTypes: true })) {
    if (entry.isDirectory() || entry.isSymbolicLink()) {
      fail(`references/ must stay single-level; found subdirectory or symlink: references/${entry.name}`);
    }
  }
  const files = fs.readdirSync(referencesDir).filter((name) => name.endsWith('.md')).sort();
  for (const file of files) {
    if (!mapped.has(file)) fail(`Reference is not listed in the SKILL.md mapping table: references/${file}`);
  }
  for (const file of mapped) {
    if (!files.includes(file)) fail(`SKILL.md mapping table references a missing file: references/${file}`);
  }
}

// ---- Reference document invariants ----
const referenceFiles = walkMarkdown(referencesDir);
const legacyNamePattern = /provider-enhanced-skill|Provider-Enhanced Skill/;
const citationMarkerPattern = /【[Ff]:|【[0-9]+[Ff]?[:：]/;
const headerDatePattern = /^> 核对日期:\d{4}-\d{2}-\d{2}\s*$/;
const headerSourcePattern = /^> 官方来源:/;
const headerPositionPattern = /^> 定位:/;

for (const referencePath of referenceFiles) {
  const content = read(referencePath);
  const name = path.basename(referencePath);
  if (content.startsWith(String.fromCharCode(0xFEFF))) fail(`${name} starts with a BOM.`);

  // The three header lines must appear, in order, inside the leading blockquote
  // (the 官方来源 line may span multiple '> - ' bullet lines).
  const lines = content.split('\n');
  const dateIdx = lines.findIndex((line) => headerDatePattern.test(line));
  const sourceIdx = lines.findIndex((line) => headerSourcePattern.test(line));
  const positionIdx = lines.findIndex((line) => headerPositionPattern.test(line));
  if (dateIdx < 0 || sourceIdx < 0 || positionIdx < 0) {
    fail(`${name} is missing the '> 核对日期:YYYY-MM-DD' / '> 官方来源:' / '> 定位:' header lines.`);
  } else if (!(dateIdx <= 5 && dateIdx < sourceIdx && sourceIdx < positionIdx && positionIdx <= 12)) {
    fail(`${name} header lines '> 核对日期' / '> 官方来源' / '> 定位' must appear in order near the top of the file.`);
  } else {
    for (let i = dateIdx; i <= positionIdx; i++) {
      const line = lines[i];
      if (line.trim() !== '' && !line.startsWith('>')) {
        fail(`${name} header block is interrupted by non-quote content at line ${i + 1}.`);
        break;
      }
    }
  }

  if (legacyNamePattern.test(content)) fail(`${name} must not contain the legacy skill name 'provider-enhanced-skill'.`);
  if (citationMarkerPattern.test(content)) fail(`${name} must not contain 【F: / 【<n>F: citation markers.`);

  let inBlock = false;
  let fenceLength = 0;
  for (const line of content.split('\n')) {
    const fence = line.match(/^(`{3,}|~{3,})/);
    if (fence) {
      const length = fence[1].length;
      if (!inBlock) {
        inBlock = true;
        fenceLength = length;
      } else if (length >= fenceLength) {
        inBlock = false;
        fenceLength = 0;
      }
    }
  }
  if (inBlock) fail(`${name} has an unclosed fenced code block.`);
}

// ---- Local documentation links must resolve inside the repository ----
const publicDocumentationFiles = [
  path.join(root, 'AGENTS.md'),
  path.join(root, 'CLAUDE.md'),
  path.join(root, 'README.md'),
  path.join(root, 'README-zh.md'),
  path.join(root, 'CHANGELOG.md'),
  path.join(root, 'CONTRIBUTING.md'),
  ...walkMarkdown(path.join(root, 'docs')),
  skillPath,
  ...referenceFiles,
];

for (const documentationPath of publicDocumentationFiles) {
  const content = readRegularFile(documentationPath);
  if (!content) continue;
  const base = path.dirname(documentationPath);
  const sourceRel = toRepoPosix(documentationPath);
  for (const linkMatch of content.matchAll(/\]\((?!https?:|mailto:|#)([^)#]+)(?:#[^)]+)?\)/g)) {
    let target;
    try {
      target = path.resolve(base, decodeURIComponent(linkMatch[1]));
    } catch (error) {
      fail(`${path.relative(root, documentationPath)} has an invalid local link ${linkMatch[1]}: ${error.message}`);
      continue;
    }
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      fail(`${path.relative(root, documentationPath)} links outside the repository: ${linkMatch[1]}`);
    } else if (!fs.existsSync(target)) {
      fail(`${path.relative(root, documentationPath)} links to missing file: ${linkMatch[1]}`);
    } else if (packagedFiles && packagedFiles.has(sourceRel) && !packagedFiles.has(toRepoPosix(target))) {
      fail(`${path.relative(root, documentationPath)} links to ${linkMatch[1]}, which is not included in the npm package.`);
    }
  }
}

// ---- Language separation: README.md and docs/en are English-only ----
const cjk = /[\u3400-\u4dbf\u4e00-\u9fff]/;
for (const documentationPath of [path.join(root, 'README.md'), ...walkMarkdown(path.join(root, 'docs', 'en'))]) {
  if (cjk.test(readRegularFile(documentationPath))) {
    fail(`${path.relative(root, documentationPath)} must contain English user documentation only.`);
  }
}

const englishSections = (readRegularFile(path.join(root, 'README.md')).match(/^## /gm) || []).length;
const chineseSections = (readRegularFile(path.join(root, 'README-zh.md')).match(/^## /gm) || []).length;
if (englishSections !== chineseSections) {
  fail(`README section counts differ: English=${englishSections}, Chinese=${chineseSections}`);
}

if (failures.length > 0) {
  console.error('Skill contract failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Skill contract OK: ${referenceFiles.length} references, ${mapped.size} mapping entries.`);
