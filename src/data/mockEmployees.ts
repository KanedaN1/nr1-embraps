import type { Employee, CompanyCNPJ } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    re: '1001',
    name: 'Carlos Alberto Silva',
    birthYear: '1988',
    workplace: '4TH CREEK',
    company: 'EMBRAPS',
    jobPosition: 'PORTEIRO'
  },
  {
    re: '1002',
    name: 'Mariana Souza Santos',
    birthYear: '1992',
    workplace: '9 DE JULHO',
    company: 'RM QUARESMA',
    jobPosition: 'AUXILIAR DE SERVIÇOS GERAIS'
  },
  {
    re: '1003',
    name: 'Roberto Alves Oliveira',
    birthYear: '1985',
    workplace: 'EMBRAPS SEDE',
    company: 'EMBRAPS',
    jobPosition: 'EMBRAPS ADMINISTRATIVO'
  },
  {
    re: '1004',
    name: 'Ana Paula Lima',
    birthYear: '1995',
    workplace: 'ABAETE',
    company: 'RM QUARESMA',
    jobPosition: 'RECEPCIONISTA'
  },
  {
    re: '1005',
    name: 'Fernando Costa Ferreira',
    birthYear: '1980',
    workplace: 'ALABAMA',
    company: 'EMBRAPS',
    jobPosition: 'OFICIAL DE MANUTENCAO'
  },
  {
    re: '1006',
    name: 'Luciana Santos Pereira',
    birthYear: '1991',
    workplace: 'ALLINK',
    company: 'RM QUARESMA',
    jobPosition: 'ENCARREGADA DE LIMPEZA'
  },
  {
    re: '1007',
    name: 'João Pedro Rocha',
    birthYear: '1994',
    workplace: 'ACQUA PLAY',
    company: 'EMBRAPS',
    jobPosition: 'FISCAL DE PISO'
  },
  {
    re: '1008',
    name: 'Beatriz Mendes Cardoso',
    birthYear: '1987',
    workplace: 'ACRÓPOLE',
    company: 'RM QUARESMA',
    jobPosition: 'LÍDER ASG'
  },
  {
    re: '1009',
    name: 'Gabriel Ribeiro Barbosa',
    birthYear: '1996',
    workplace: 'ALAMEDA PARK',
    company: 'EMBRAPS',
    jobPosition: 'JARDINEIRO'
  },
  {
    re: '1010',
    name: 'Fernanda Martins Gomes',
    birthYear: '1990',
    workplace: 'ALMAR',
    company: 'RM QUARESMA',
    jobPosition: 'MENSAGEIRO'
  }
];

/**
 * Função utilitária para importar dados colados pelo usuário em texto ou CSV/TSV
 * Formatos suportados:
 * 1. RE: NOME: ANO DE NASCIMENTO: POSTO: EMPRESA: CARGO:
 * 2. RE;NOME;ANO DE NASCIMENTO;POSTO;EMPRESA;CARGO
 * 3. RE\tNOME\tANO DE NASCIMENTO\tPOSTO\tEMPRESA\tCARGO
 */
export function parseEmployeeImportText(rawText: string): Employee[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const parsedEmployees: Employee[] = [];

  for (const line of lines) {
    // Ignorar cabeçalhos comuns se colados da planilha
    if (/^re[\s;:\t,-]/i.test(line) && /nome/i.test(line)) {
      continue;
    }

    let re = '';
    let name = '';
    let birthYear = '';
    let workplace = '';
    let companyStr = '';
    let jobPosition = '';

    // Tentar separação por padrão com rótulos (RE: ... NOME: ... ANO: ... etc)
    if (/re\s*:/i.test(line) || /nome\s*:/i.test(line)) {
      const matchRe = line.match(/re\s*:\s*([^:\t;\n,]+?)(?=\s*(?:nome|ano|nascimento|posto|empresa|cargo)|$)/i);
      const matchNome = line.match(/nome\s*:\s*([^:\t;\n,]+?)(?=\s*(?:re|ano|nascimento|posto|empresa|cargo)|$)/i);
      const matchAno = line.match(/(?:ano\s*(?:de\s*)?nascimento|ano)\s*:\s*([^:\t;\n,]+?)(?=\s*(?:re|nome|posto|empresa|cargo)|$)/i);
      const matchPosto = line.match(/posto\s*:\s*([^:\t;\n,]+?)(?=\s*(?:re|nome|ano|empresa|cargo)|$)/i);
      const matchEmpresa = line.match(/empresa\s*:\s*([^:\t;\n,]+?)(?=\s*(?:re|nome|ano|posto|cargo)|$)/i);
      const matchCargo = line.match(/cargo\s*:\s*([^:\t;\n,]+?)(?=\s*(?:re|nome|ano|posto|empresa)|$)/i);

      if (matchRe) re = matchRe[1].trim();
      if (matchNome) name = matchNome[1].trim();
      if (matchAno) birthYear = matchAno[1].trim();
      if (matchPosto) workplace = matchPosto[1].trim();
      if (matchEmpresa) companyStr = matchEmpresa[1].trim();
      if (matchCargo) jobPosition = matchCargo[1].trim();
    }

    // Se não encontrou por rótulos, tentar delimitadores (tabulação, ponto e vírgula, vírgula, dois pontos)
    if (!re || !name) {
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(':')) {
        parts = line.split(':');
      }

      parts = parts.map(p => p.trim());
      if (parts.length >= 4) {
        re = parts[0] || '';
        name = parts[1] || '';
        birthYear = parts[2] || '';
        workplace = parts[3] || '';
        companyStr = parts[4] || '';
        jobPosition = parts[5] || parts[3] || '';
      }
    }

    // Limpeza e normalização do RE
    re = re.replace(/\D/g, '') || re;
    // Normalização do Ano (extrair 4 dígitos de ano, ex: 1990)
    const yearMatch = birthYear.match(/\b(19\d\d|20\d\d|\d\d)\b/);
    if (yearMatch) {
      birthYear = yearMatch[1].length === 2 ? `19${yearMatch[1]}` : yearMatch[1];
    }

    // Normalização da Empresa (EMBRAPS ou RM QUARESMA)
    let company: CompanyCNPJ = 'EMBRAPS';
    if (/rm|quaresma/i.test(companyStr)) {
      company = 'RM QUARESMA';
    }

    if (re && birthYear) {
      parsedEmployees.push({
        re,
        name: name || `Colaborador RE ${re}`,
        birthYear,
        workplace: workplace || 'EMBRAPS SEDE',
        company,
        jobPosition: jobPosition || 'PORTEIRO'
      });
    }
  }

  return parsedEmployees;
}
