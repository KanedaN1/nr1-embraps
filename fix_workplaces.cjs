const fs = require('fs');

const normalizeMap = {
  // Fix the "SÃO" replace bugs
  "SÃOPESP": "SOPESP",
  "SÃOCIETA ITALIANA": "SOCIETA ITALIANA",
  "SÃOLAR DA POMPÉIA": "SOLAR DA POMPÉIA",
  "SÃOLAR DOS FREIS": "SOLAR DOS FREIS",
  "CASA DO SÃOL": "CASA DO SOL",
  "COSTA DO SÃOL SANTOS": "COSTA DO SOL SANTOS",
  "BELVEDERE PRESIDENTE WILSÃON": "BELVEDERE PRESIDENTE WILSON",
  "WINDSÃOR": "WINDSOR",
  "ASSÃOCIAÇÃO COMERCIAL": "ASSOCIAÇÃO COMERCIAL",
  "ASSÃOCIAÇÃO NIPO BRASILEIRA": "ASSOCIAÇÃO NIPO BRASILEIRA",
  "MAISÃON V LOBOS": "MAISON V LOBOS",
  "MAISÃON VIVRE": "MAISON VIVRE",
  "PANEIRA E MANACA": "PAINEIRA E MANACA",

  // Logical duplicates
  "OSAN SV": "OSAN SÃO VICENTE",
  "OSAN PG": "OSAN PRAIA GRANDE",
  "SÃO JUDAS TADEU IGREJA": "IGREJA SÃO JUDAS TADEU",
  "SAO LOURENÇO": "SÃO LOURENÇO",
  "SAO DIMAS": "SÃO DIMAS",
  "PATIO IPORANGA": "PÁTIO IPORANGA",
  "PATIO EMPRESARIAL EMPRESARIAL": "PÁTIO EMPRESARIAL",
  "TERRAZA": "TERRAÇO BEIJA FLOR",
  "TERRACO BEIJA FLOR": "TERRAÇO BEIJA FLOR",
  "EDIFICIO CIDAMAR II": "EDIFÍCIO CIDAMAR II",
  "EDIFICIO RONCHAMP": "EDIFÍCIO RONCHAMP",
  "EDIFICIO W. ALBA": "EDIFÍCIO W. ALBA",
  "EDIFICIO COMERCIAL CENTRAL AVENUE": "EDIFÍCIO CENTRAL AVENUE",
  "CENTRAL AVENUE": "EDIFÍCIO CENTRAL AVENUE",
  "FUNDACAO ACADEMIA": "FUNDAÇÃO ACADEMIA",
  "FUNDACAO AMBULATORIO": "FUNDAÇÃO AMBULATORIO",
  "FUNDACAO CAMPUS 1": "FUNDAÇÃO CAMPUS 1",
  "FUNDACAO CAMPUS 2": "FUNDAÇÃO CAMPUS 2",
  "FUNDACAO CAMPUS 3": "FUNDAÇÃO CAMPUS 3",
  "FUNDACAO LUSIADA": "FUNDAÇÃO LUSIADA",
  "ACRÓPOLE": "ACRÓPOLE",
  "ACR\u00d3POLE": "ACRÓPOLE",
  "S\u00c3OPESP": "SOPESP",
  "WINDS\u00c3OR": "WINDSOR"
};

function normalizeName(name) {
  let newName = name.replace(/SÃOPESP/g, "SOPESP")
                    .replace(/SÃOCIETA/g, "SOCIETA")
                    .replace(/SÃOLAR/g, "SOLAR")
                    .replace(/SÃOL/g, "SOL")
                    .replace(/WILSÃON/g, "WILSON")
                    .replace(/WINDSÃOR/g, "WINDSOR")
                    .replace(/ASSÃOCIA/g, "ASSOCIA")
                    .replace(/MAISÃON/g, "MAISON")
                    .replace(/EDIFICIO/g, "EDIFÍCIO")
                    .replace(/SAO /g, "SÃO ");

  if (normalizeMap[newName]) {
    newName = normalizeMap[newName];
  }
  if (normalizeMap[name]) {
    newName = normalizeMap[name];
  }
  return newName.trim();
}

// 1. Update mockEmployees.ts
let mockEmp = fs.readFileSync('./src/data/mockEmployees.ts', 'utf-8');
mockEmp = mockEmp.replace(/workplace:\s*"([^"]+)"/g, (match, p1) => {
  try { p1 = JSON.parse('"' + p1 + '"'); } catch (e) {} // decode any unicode
  return `workplace: "${normalizeName(p1)}"`;
});
fs.writeFileSync('./src/data/mockEmployees.ts', mockEmp, 'utf-8');

// 2. Read and update hseQuestions.ts INITIAL_WORKPLACES
let hseQuestions = fs.readFileSync('./src/data/hseQuestions.ts', 'utf-8');

const wpRegex = /export const INITIAL_WORKPLACES: Workplace\[\] = \[([\s\S]*?)\];/;
const match = hseQuestions.match(wpRegex);
if (match) {
  const block = match[1];
  const items = [];
  const itemRegex = /\{[^}]+\}/g;
  let m;
  while ((m = itemRegex.exec(block)) !== null) {
    items.push(m[0]);
  }

  const uniqueWorkplaces = new Map();
  for (const itemStr of items) {
    const idMatch = itemStr.match(/id:\s*"([^"]+)"/);
    const nameMatch = itemStr.match(/name:\s*"([^"]+)"/);
    const codeMatch = itemStr.match(/code:\s*'([^']+)'/);
    
    if (nameMatch && idMatch && codeMatch) {
      let originalName = nameMatch[1];
      try { originalName = JSON.parse('"' + originalName + '"'); } catch(e) {}
      
      let normName = normalizeName(originalName);
      
      if (!uniqueWorkplaces.has(normName)) {
        uniqueWorkplaces.set(normName, {
          id: idMatch[1],
          name: normName,
          code: codeMatch[1]
        });
      } else {
        let existing = uniqueWorkplaces.get(normName);
        let existingNum = parseInt(existing.code.substring(1));
        let newNum = parseInt(codeMatch[1].substring(1));
        if (newNum < existingNum) {
           existing.code = codeMatch[1];
           existing.id = idMatch[1];
        }
      }
    }
  }

  let newBlock = '\n';
  const sortedNames = Array.from(uniqueWorkplaces.keys()).sort();
  for (let i = 0; i < sortedNames.length; i++) {
    const wp = uniqueWorkplaces.get(sortedNames[i]);
    const safeId = sortedNames[i].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    newBlock += `  { id: "${safeId}", name: "${wp.name}", code: '${wp.code}' }${i < sortedNames.length - 1 ? ',' : ''}\n`;
  }

  const newHseQuestions = hseQuestions.replace(wpRegex, `export const INITIAL_WORKPLACES: Workplace[] = [${newBlock}];`);
  fs.writeFileSync('./src/data/hseQuestions.ts', newHseQuestions, 'utf-8');
  console.log("Updated hseQuestions.ts and mockEmployees.ts, removed duplicates, and fixed 'SÃO' bugs.");
} else {
  console.error("Could not find INITIAL_WORKPLACES block");
}
