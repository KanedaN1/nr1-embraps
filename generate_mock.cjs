const xlsx = require('xlsx');
const fs = require('fs');

const normalizeMap = {
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


try {
  const workbook = xlsx.readFile('NR 1 DADOS .xlsx', { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

  const employees = data.map(row => {
    // Helper function to safely get string values
    const getVal = (key) => (row[key] || '').toString().trim();
    
    // Fix the "SOUSÃO" bug
    let name = getVal('NOME').toUpperCase();
    name = name.replace(/SOUSÃO/g, 'SOUSA').replace(/SOUZÃO/g, 'SOUZA');
    
    return {
      re: getVal('RE'),
      name: name,
      birthYear: getVal('ANO DE NASCIMENTO'),
      workplace: normalizeName(getVal('POSTO')),
      company: getVal('EMPRESA'),
      jobPosition: getVal('CARGO')
    };
  }).filter(e => e.name && e.re); // only keep valid entries

  let content = "import type { Employee } from '../types';\n\n";
  content += "export const INITIAL_EMPLOYEES: Employee[] = [\n";
  
  employees.forEach((emp, index) => {
    content += "  {\n";
    content += `    re: ${JSON.stringify(emp.re)},\n`;
    content += `    name: ${JSON.stringify(emp.name)},\n`;
    content += `    birthYear: ${JSON.stringify(emp.birthYear)},\n`;
    content += `    workplace: ${JSON.stringify(emp.workplace)},\n`;
    content += `    company: ${JSON.stringify(emp.company)},\n`;
    content += `    jobPosition: ${JSON.stringify(emp.jobPosition)}\n`;
    content += "  }" + (index < employees.length - 1 ? ",\n" : "\n");
  });
  
  content += "];\n\n";
  content += `/**
 * Função utilitária para importar dados colados pelo usuário em texto ou CSV/TSV
 */
export function parseEmployeeImportText(rawText: string): Employee[] {
  const lines = rawText.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
  const parsedEmployees: Employee[] = [];

  for (const line of lines) {
    if (/^re[\\s;:\\t,-]/i.test(line) && /nome/i.test(line)) continue;

    let re = '';
    let name = '';
    let birthYear = '';
    let workplace = '';
    let companyStr = '';
    let jobPosition = '';

    if (line.includes('\\t') || line.includes(';') || line.includes(',')) {
      const delimiter = line.includes('\\t') ? '\\t' : line.includes(';') ? ';' : ',';
      const parts = line.split(delimiter).map(p => p.trim());
      if (parts.length >= 4) {
        companyStr = parts[0] || '';
        re = parts[1] || '';
        name = parts[2] || '';
        jobPosition = parts[3] || '';
        birthYear = parts[4] || '';
        workplace = parts[5] || parts[4] || '';
      }
    }

    re = re.replace(/\\D/g, '') || re;
    const yearMatch = birthYear.match(/\\b(19\\d\\d|20\\d\\d|\\d\\d)\\b/);
    if (yearMatch) {
      birthYear = yearMatch[1].length === 2 ? \`19\${yearMatch[1]}\` : yearMatch[1];
    }

    const company = /rm|quaresma/i.test(companyStr) ? 'RM QUARESMA' : 'EMBRAPS';

    if (re && birthYear) {
      parsedEmployees.push({
        re,
        name: name || \`Colaborador RE \${re}\`,
        birthYear,
        workplace: workplace || 'EMBRAPS SEDE',
        company,
        jobPosition: jobPosition || 'PORTEIRO'
      });
    }
  }

  return parsedEmployees;
}
`;

  fs.writeFileSync('./src/data/mockEmployees.ts', content, 'utf-8');
  console.log(`Successfully generated mockEmployees.ts with ${employees.length} employees.`);
} catch (e) {
  console.error("Error reading file or writing mock data:", e);
}
