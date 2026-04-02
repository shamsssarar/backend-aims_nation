#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Files that need ESM import fixes in the dist folder
const filesToFix = [
  'dist/generated/prisma/client.js',
  'dist/generated/prisma/browser.js',
  'dist/generated/prisma/commonInputTypes.js',
  'dist/generated/prisma/models.js',
  'dist/generated/prisma/enums.js',
  'dist/generated/prisma/internal/class.js',
  'dist/generated/prisma/internal/prismaNamespace.js',
  'dist/generated/prisma/internal/prismaNamespaceBrowser.js',
];

// Also all model files
const modelsDir = path.join(projectRoot, 'dist/generated/prisma/models');
if (fs.existsSync(modelsDir)) {
  fs.readdirSync(modelsDir).forEach((file) => {
    if (file.endsWith('.js')) {
      filesToFix.push(path.join('dist/generated/prisma/models', file));
    }
  });
}

function fixFile(filePath) {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    // Fix double-quoted imports
    content = content.replace(/from\s+"([^"]+)";/g, (match, importPath) => {
      if (
        (importPath.startsWith('./') || importPath.startsWith('../')) &&
        !importPath.endsWith('.js')
      ) {
        return `from "${importPath}.js";`;
      }
      return match;
    });

    // Fix single-quoted imports
    content = content.replace(/from\s+'([^']+)';/g, (match, importPath) => {
      if (
        (importPath.startsWith('./') || importPath.startsWith('../')) &&
        !importPath.endsWith('.js')
      ) {
        return `from '${importPath}.js';`;
      }
      return match;
    });

    if (originalContent !== content) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`✓ Fixed imports in ${path.relative(projectRoot, fullPath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all files
let fixedCount = 0;
filesToFix.forEach((file) => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✔ ESM import fixes completed! Fixed ${fixedCount} file(s).`);
