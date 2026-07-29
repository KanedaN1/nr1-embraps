export type UserRole = 'COLLABORATOR' | 'SESMT' | 'DIRECTOR' | 'ADMIN' | 'TEST';

export type DimensionId = 
  | 'demands'       // Demandas
  | 'control'       // Controle
  | 'support_mgmt'  // Apoio da Gestão
  | 'support_peers' // Apoio dos Colegas
  | 'relationships' // Relacionamentos
  | 'role'          // Papel / Cargo
  | 'change'        // Mudanças
  | 'harassment';   // Assédio e Comportamentos Ofensivos

export interface DimensionInfo {
  id: DimensionId;
  name: string;
  label: string;
  description: string;
  questionCount: number;
  color: string;
}

export interface Question {
  id: number;
  dimensionId: DimensionId;
  text: string;
  reverseScore?: boolean; // Algumas questões têm pontuação invertida (ex: pressão excessiva)
}

export interface Workplace {
  id: string;
  name: string;
  code: string;
}

export interface JobPosition {
  id: string;
  name: string;
  category: string;
}

export interface DimensionScore {
  dimensionId: DimensionId;
  score: number; // Média da dimensão (1.0 a 5.0)
  count: number;
}

export interface QuestionnaireResponse {
  id: string;
  timestamp: string;
  workplaceId: string;
  jobPositionId: string;
  workplaceName: string;
  jobPositionName: string;
  answers: Record<number, number>; // questionId -> score (1 to 5)
  dimensionScores: Record<DimensionId, number>; // dimensionId -> average score
  totalAverage: number;
  // NOTA: Nenhuma informação pessoal ou RE é salva aqui para garantir anonimato da LGPD!
}

export interface CurrentUser {
  identifier: string; // RE ou nome de usuário (ex: "1001", "SESMT", "Diretor")
  role: UserRole;
  name?: string;
}
