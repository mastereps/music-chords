import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Usage: node fix-esm-imports.mjs <dist-dir>');
  process.exit(1);
}

const JS_FILE_EXTENSION = '.js';
const SKIP_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.json', '.node']);

function hasKnownExtension(specifier) {
  const lastSegment = specifier.split('/').pop() ?? '';
  const dotIndex = lastSegment.lastIndexOf('.');

  if (dotIndex === -1) {
    return false;
  }

  return SKIP_EXTENSIONS.has(lastSegment.slice(dotIndex));
}

function resolveRuntimeSpecifier(filePath, specifier) {
  const fileDirectory = dirname(filePath);
  const emittedFileCandidate = resolve(fileDirectory, `${specifier}${JS_FILE_EXTENSION}`);

  if (existsSync(emittedFileCandidate)) {
    return `${specifier}${JS_FILE_EXTENSION}`;
  }

  const emittedDirectoryIndexCandidate = resolve(fileDirectory, specifier, `index${JS_FILE_EXTENSION}`);

  if (existsSync(emittedDirectoryIndexCandidate)) {
    return `${specifier}/index${JS_FILE_EXTENSION}`;
  }

  return `${specifier}${JS_FILE_EXTENSION}`;
}

function addJsExtension(filePath, specifier) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return specifier;
  }

  return hasKnownExtension(specifier) ? specifier : resolveRuntimeSpecifier(filePath, specifier);
}

function rewriteImports(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const updated = source
    .replace(/(from\s+['"])(\.?\.?\/[^'"]+)(['"])/g, (_, prefix, specifier, suffix) => `${prefix}${addJsExtension(filePath, specifier)}${suffix}`)
    .replace(/(import\(\s*['"])(\.?\.?\/[^'"]+)(['"]\s*\))/g, (_, prefix, specifier, suffix) => `${prefix}${addJsExtension(filePath, specifier)}${suffix}`);

  if (updated !== source) {
    writeFileSync(filePath, updated, 'utf8');
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entryPath.endsWith(JS_FILE_EXTENSION)) {
      rewriteImports(entryPath);
    }
  }
}

walk(targetDir);