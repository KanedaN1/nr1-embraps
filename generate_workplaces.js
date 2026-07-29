const fs = require('fs');

const raw = fs.readFileSync('raw_workplaces.txt', 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const uniqueLines = [...new Set(lines)];

let code = `export const INITIAL_WORKPLACES: Workplace[] = [\n`;

uniqueLines.forEach((name, i) => {
  // Generate a code like 'P001'
  const codeStr = `P${(i + 1).toString().padStart(3, '0')}`;
  
  // Create an ID from the name (lowercase, replace spaces and special chars with hyphens)
  const id = name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-|-$/g, ''); // remove leading/trailing hyphens

  code += `  { id: '${id}', name: '${name}', code: '${codeStr}' },\n`;
});

code += `];\n`;

fs.writeFileSync('workplaces_code.ts', code);
console.log('Generated workplaces_code.ts');
