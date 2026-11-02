import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = path.resolve(__dirname, '../openapi.json');
const target = path.resolve(__dirname, '../dist/openapi.json');

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);

console.log('Contract placeholder generated at dist/openapi.json');
