const xlsx = require('xlsx');
const fs = require('fs');

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
      workplace: getVal('POSTO'),
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
  
  content += "];\n";

  fs.writeFileSync('./src/data/mockEmployees.ts', content, 'utf-8');
  console.log(`Successfully generated mockEmployees.ts with ${employees.length} employees.`);
} catch (e) {
  console.error("Error reading file or writing mock data:", e);
}
