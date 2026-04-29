#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const SCAN_DIRS = [
  path.resolve(__dirname, '../../apps'),
  path.resolve(__dirname, '../../packages'),
];

const ALLOWED_FILES = [
  'ai-adapters/src/',
  'ai/src/',
  'node_modules/',
  '.d.ts',
];

const SDK_PATTERNS = [
  /new\s+OpenAI\s*\(/,
  /new\s+Anthropic\s*\(/,
  /import\s+.*from\s+['"]openai['"]/,
  /import\s+.*from\s+['"]@anthropic-ai/,
  /require\s*\(\s*['"]openai['"]\s*\)/,
  /fetch\s*\(\s*['"]https:\/\/api\.openai\.com/,
  /fetch\s*\(\s*['"]https:\/\/api\.anthropic\.com/,
  /process\.env\.(OPENAI|ANTHROPIC|GROQ|GEMINI|AI)_(KEY|SECRET|TOKEN|URL)\b/,
  /\bnew\s+Groq\s*\(/,
  /\bgroq\s*\.\s*chat\b/i,
];

let failures = 0;

function isAllowed(filePath: string): boolean {
  return ALLOWED_FILES.some((a) => filePath.includes(a));
}

function isAiRelated(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('https://api.openai.com') ||
         t.includes('https://api.anthropic.com') ||
         t.includes('https://api.groq.com') ||
         t.includes('openai') ||
         t.includes('anthropic') ||
         t.includes('groq') ||
         t.includes('gemini') ||
         t.includes('llm') ||
         t.includes('gpt') ||
         t.includes('ai_url') ||
         t.includes('ai_endpoint');
}

function checkFileAST(filePath: string, content: string): void {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const dangerousVars = new Set<string>();
  const dangerousProps = new Set<string>();

  function visitDecl(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const text = node.initializer.getText(sourceFile);
      if (isAiRelated(text) || text.includes('OPENAI_') || text.includes('ANTHROPIC_')) {
        dangerousVars.add(node.name.text);
      }
    }
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.initializer) {
      const text = node.initializer.getText(sourceFile);
      if (isAiRelated(text) || text.includes('OPENAI_') || text.includes('ANTHROPIC_')) {
        dangerousProps.add(node.name.text);
      }
    }
    ts.forEachChild(node, visitDecl);
  }

  function visitFetch(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'fetch') {
      if (node.arguments.length > 0) {
        const arg = node.arguments[0];
        const argText = arg.getText(sourceFile);
        let isDangerous = false;

        // Check if the whole argument text contains any dangerous keywords
        if (isAiRelated(argText) || argText.includes('OPENAI_') || argText.includes('ANTHROPIC_')) {
            isDangerous = true;
        }

        // Check if any sub-node is an identifier from our dangerous sets
        function findDangerousIdentifier(subNode: ts.Node) {
            if (ts.isIdentifier(subNode) && dangerousVars.has(subNode.text)) {
                isDangerous = true;
            }
            if (ts.isPropertyAccessExpression(subNode) && ts.isIdentifier(subNode.name) && dangerousProps.has(subNode.name.text)) {
                isDangerous = true;
            }
            ts.forEachChild(subNode, findDangerousIdentifier);
        }

        findDangerousIdentifier(arg);

        if (isDangerous) {
          console.error(`FAIL: ${filePath} — direct AI SDK call (dynamic variable): fetch(${argText})`);
          failures++;
        }
      }
    }
    ts.forEachChild(node, visitFetch);
  }

  visitDecl(sourceFile);
  visitFetch(sourceFile);
}

function checkFile(filePath: string): void {
  if (isAllowed(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Regex checks
  for (const pattern of SDK_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      console.error(`FAIL: ${filePath} — direct AI SDK call: ${match[0]}`);
      failures++;
    }
  }

  // AST dynamic checks (BUG-018 replacement)
  checkFileAST(filePath, content);
}

function walkDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      checkFile(fullPath);
    }
  }
}

function main(): void {
  for (const dir of SCAN_DIRS) {
    walkDir(dir);
  }

  if (failures > 0) {
    console.error(`\n${failures} direct AI SDK call(s) found. Use @webwaka/ai-adapters (P7).`);
    process.exit(1);
  }

  console.log('PASS: No direct AI SDK calls detected (P7 compliant).');
}

main();
