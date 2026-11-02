const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(__dirname, '../openapi.json');
const target = path.resolve(__dirname, '../dist/openapi.json');

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);

console.log('Contract placeholder generated at dist/openapi.json');
