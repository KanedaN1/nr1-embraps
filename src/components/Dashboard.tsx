import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  FileSpreadsheet,
  ArrowRight,
  FileText,
  Lock,
  Unlock,
  Upload,
  Database,
  Download,
  X
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  LabelList
} from 'recharts';
import type { CurrentUser, QuestionnaireResponse, DimensionId, Employee, CompanyCNPJ } from '../types';
import { DIMENSIONS, INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from '../data/hseQuestions';
import { parseEmployeeImportText } from '../data/mockEmployees';
import { AdminResponsesModal } from './AdminResponsesModal';

interface DashboardProps {
  currentUser: CurrentUser;
  responses: QuestionnaireResponse[];
  onNavigateToQuestionnaire?: () => void;
  onOpenReport?: (workplaceId: string) => void;
  onDeleteResponse?: (id: string) => void;
  surveyLocked?: boolean;
  onToggleLock?: () => void;
  employees: Employee[];
  onImportEmployees?: (employees: Employee[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  responses, 
  onNavigateToQuestionnaire,
  onOpenReport,
  onDeleteResponse,
  surveyLocked = false,
  onToggleLock,
  employees = [],
  onImportEmployees
}) => {
  const [activeTab, setActiveTab] = useState<'posto' | 'cargo'>('posto');
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string>(INITIAL_WORKPLACES[0].id);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<'ALL' | CompanyCNPJ>('EMBRAPS');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // 1. Cálculos Gerais e KPIs
  const totalResponses = responses.length;
  
  // Respostas Filtradas por Empresa (CNPJ)
  const companyFilteredResponses = useMemo(() => {
    if (selectedCompanyFilter === 'ALL') return responses;
    return responses.filter(r => (r.company || 'EMBRAPS') === selectedCompanyFilter);
  }, [responses, selectedCompanyFilter]);

  // Contagens e Metas de Amostragem (Meta = 80%) por CNPJ
  const embrapsEmployees = useMemo(() => employees.filter(e => e.company === 'EMBRAPS'), [employees]);
  const rmEmployees = useMemo(() => employees.filter(e => e.company === 'RM QUARESMA'), [employees]);

  const embrapsResponsesCount = useMemo(() => responses.filter(r => (r.company || 'EMBRAPS') === 'EMBRAPS').length, [responses]);
  const rmResponsesCount = useMemo(() => responses.filter(r => r.company === 'RM QUARESMA').length, [responses]);

  const embrapsTotalTarget = Math.max(embrapsEmployees.length, 1);
  const embrapsTarget80 = Math.ceil(embrapsTotalTarget * 0.8);

  const rmTotalTarget = Math.max(rmEmployees.length, 1);
  const rmTarget80 = Math.ceil(rmTotalTarget * 0.8);

  const overallCompanyAverage = useMemo(() => {
    if (totalResponses === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + r.totalAverage, 0);
    return Number((sum / totalResponses).toFixed(2));
  }, [responses, totalResponses]);

  const criticalDimensionsCount = useMemo(() => {
    if (totalResponses === 0) return 0;
    let crit = 0;
    DIMENSIONS.forEach(dim => {
      const sum = responses.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
      const avg = sum / totalResponses;
      if (avg < 3.2) crit++;
    });
    return crit;
  }, [responses, totalResponses]);

  // 2. Agregação por Posto de Trabalho
  const selectedWorkplace = INITIAL_WORKPLACES.find(w => w.id === selectedWorkplaceId) || INITIAL_WORKPLACES[0];
  
  const workplaceResponses = useMemo(() => {
    return responses.filter(r => r.workplaceId === selectedWorkplaceId);
  }, [responses, selectedWorkplaceId]);

  const workplaceChartData = useMemo(() => {
    return DIMENSIONS.map(dim => {
      const count = workplaceResponses.length;
      let wpAvg = 0;
      if (count > 0) {
        const sum = workplaceResponses.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
        wpAvg = Number((sum / count).toFixed(2));
      }

      const companySum = responses.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
      const compAvg = totalResponses > 0 ? Number((companySum / totalResponses).toFixed(2)) : 0;

      return {
        dimension: dim.label,
        fullName: dim.name,
        posto: wpAvg || 0,
        empresa: compAvg || 0,
        fullMax: 5.0
      };
    });
  }, [workplaceResponses, responses, totalResponses]);

  const workplaceTotalAvg = useMemo(() => {
    if (workplaceResponses.length === 0) return 0;
    const sum = workplaceResponses.reduce((acc, r) => acc + r.totalAverage, 0);
    return Number((sum / workplaceResponses.length).toFixed(2));
  }, [workplaceResponses]);

  // 3. Agregação por Cargo (Filtrado por CNPJ)
  const jobMatrixData = useMemo(() => {
    const matrix: Record<DimensionId, Record<string, { avg: number; count: number }>> = {
      demands: {},
      control: {},
      support_mgmt: {},
      support_peers: {},
      relationships: {},
      role: {},
      change: {},
      harassment: {},
    };

    INITIAL_JOB_POSITIONS.forEach(job => {
      const jobResponses = companyFilteredResponses.filter(r => r.jobPositionId === job.id);
      const count = jobResponses.length;

      DIMENSIONS.forEach(dim => {
        let avg = 0;
        if (count > 0) {
          const sum = jobResponses.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
          avg = Number((sum / count).toFixed(2));
        } else {
          avg = 0;
        }
        matrix[dim.id][job.id] = { avg, count };
      });
    });

    return matrix;
  }, [companyFilteredResponses]);

  const activeJobPositions = useMemo(() => {
    const jobs = INITIAL_JOB_POSITIONS.filter(job => 
      companyFilteredResponses.some(r => r.jobPositionId === job.id)
    );
    return jobs.length > 0 ? jobs : INITIAL_JOB_POSITIONS.slice(0, 5);
  }, [companyFilteredResponses]);

  const getScoreColor = (score: number) => {
    if (score === 0) return { bg: '#F1F5F9', text: '#64748B', label: 'Sem Dados / Aguardando', icon: '⚪' };
    if (score >= 3.8) return { bg: '#D1FAE5', text: '#065F46', label: 'Adequado / Seguro', icon: '🟢' };
    if (score >= 2.8) return { bg: '#FEF3C7', text: '#92400E', label: 'Alerta / Atenção', icon: '🟡' };
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Risco Crítico / Ação', icon: '🔴' };
  };

  const handleTriggerReport = () => {
    if (onOpenReport) {
      if (activeTab === 'cargo') {
        if (selectedCompanyFilter === 'EMBRAPS') {
          onOpenReport('ALL_CARGOS_EMBRAPS');
        } else if (selectedCompanyFilter === 'RM QUARESMA') {
          onOpenReport('ALL_CARGOS_RM_QUARESMA');
        } else {
          onOpenReport('ALL_CARGOS');
        }
      } else {
        onOpenReport(selectedWorkplaceId);
      }
    }
  };

  const handleExportBackupJSON = () => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      totalResponses: responses.length,
      responses,
      employeesCount: employees.length,
      surveyLocked
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_nr1_banco_respostas_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleProcessImport = () => {
    if (!importText.trim()) return;
    const parsed = parseEmployeeImportText(importText);
    if (parsed.length === 0) {
      alert('Nenhum colaborador válido identificado no texto. Verifique o formato fornecido.');
      return;
    }

    if (onImportEmployees) {
      onImportEmployees(parsed);
      setImportSuccessMsg(`Sucesso! ${parsed.length} colaboradores foram importados e salvos no sistema.`);
      setImportText('');
      setTimeout(() => {
        setImportSuccessMsg('');
        setIsImportModalOpen(false);
      }, 2500);
    }
  };

  return (
    <div style={{ flex: 1, padding: '1.5rem 0', backgroundColor: '#F8FAFC' }}>
      <div className="container">
        
        {/* Top Header Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                <BarChart3 size={14} /> Painel Executivo SESMT / NR-1
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Atualizado em tempo real</span>
            </div>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#002244', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Dashboard de Indicadores NR-1 (Embraps & RM Quaresma)
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Mapeamento psicossocial e avaliação de riscos segregados por CNPJ e Posto.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start' }}>
            
            {/* Botão de Travar / Destravar Questionário */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'SESMT') && onToggleLock && (
              <button 
                onClick={onToggleLock}
                className="btn"
                style={{ 
                  padding: '0.65rem 1.15rem', 
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: surveyLocked ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {surveyLocked ? <Lock size={18} /> : <Unlock size={18} />}
                <span>{surveyLocked ? 'Trava Ativa (Bloqueado)' : 'Questionário Liberado'}</span>
              </button>
            )}

            {currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Database size={16} />
                <span>Base de Colaboradores ({employees.length})</span>
              </button>
            )}

            {currentUser.role === 'ADMIN' && (
              <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Respostas Individuais</span>
              </button>
            )}

            {(currentUser.role === 'ADMIN' || currentUser.role === 'SESMT') && (
              <button 
                onClick={handleExportBackupJSON}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}
                title="Baixar cópia de segurança em arquivo JSON com todas as respostas e dados salvos"
              >
                <Download size={16} color="#0066CC" />
                <span>Baixar Backup (JSON)</span>
              </button>
            )}

            {currentUser.role === 'ADMIN' && onNavigateToQuestionnaire && (
              <button 
                onClick={onNavigateToQuestionnaire}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Visão Colaborador</span>
                <ArrowRight size={16} />
              </button>
            )}

            <button 
              onClick={handleTriggerReport} 
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem', backgroundColor: '#10B981', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              title="Gerar e Imprimir Relatório Oficial PDF conforme modelo da Psicologia / SESMT"
            >
              <FileText size={18} />
              <span>Exportar Relatório NR-1 (PDF Oficial)</span>
            </button>
          </div>
        </div>

        {/* CARDS DE METAS DE AMOSTRAGEM (80% META POR CNPJ) + KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Card Meta EMBRAPS */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: '6px solid #0066CC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0066CC', textTransform: 'uppercase' }}>
                  Amostragem: EMBRAPS
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#002244', marginTop: '0.15rem' }}>
                  {embrapsResponsesCount} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>de {embrapsTotalTarget} cad.</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#EBF5FF', padding: '0.75rem', borderRadius: '12px', color: '#0066CC' }}>
                <Users size={22} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: embrapsResponsesCount >= embrapsTarget80 ? '#10B981' : '#F59E0B' }}>
                  {embrapsResponsesCount >= embrapsTarget80 ? '✅ Meta de 80% Atingida' : `Meta 80% (${embrapsTarget80}): Faltam ${Math.max(embrapsTarget80 - embrapsResponsesCount, 0)}`}
                </span>
                <span style={{ color: '#0066CC' }}>{((embrapsResponsesCount / embrapsTotalTarget) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: embrapsResponsesCount >= embrapsTarget80 ? '#10B981' : '#3399FF', 
                    width: `${Math.min((embrapsResponsesCount / embrapsTotalTarget) * 100, 100)}%`,
                    transition: 'width 1s ease-in-out',
                    borderRadius: '999px'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Card Meta RM QUARESMA */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: '6px solid #8B5CF6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase' }}>
                  Amostragem: RM QUARESMA
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#002244', marginTop: '0.15rem' }}>
                  {rmResponsesCount} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>de {rmTotalTarget} cad.</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#F3E8FF', padding: '0.75rem', borderRadius: '12px', color: '#8B5CF6' }}>
                <Users size={22} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: rmResponsesCount >= rmTarget80 ? '#10B981' : '#F59E0B' }}>
                  {rmResponsesCount >= rmTarget80 ? '✅ Meta de 80% Atingida' : `Meta 80% (${rmTarget80}): Faltam ${Math.max(rmTarget80 - rmResponsesCount, 0)}`}
                </span>
                <span style={{ color: '#8B5CF6' }}>{((rmResponsesCount / rmTotalTarget) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: rmResponsesCount >= rmTarget80 ? '#10B981' : '#8B5CF6', 
                    width: `${Math.min((rmResponsesCount / rmTotalTarget) * 100, 100)}%`,
                    transition: 'width 1s ease-in-out',
                    borderRadius: '999px'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Card Média Geral */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Média Geral de Saúde
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: totalResponses === 0 ? '#64748B' : getScoreColor(overallCompanyAverage).text, marginTop: '0.15rem' }}>
                {totalResponses === 0 ? '0.00' : overallCompanyAverage} <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>/ 5</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: totalResponses === 0 ? '#64748B' : getScoreColor(overallCompanyAverage).text, fontWeight: 600, marginTop: '0.15rem' }}>
                {totalResponses === 0 ? '⚪ Aguardando envios' : `${getScoreColor(overallCompanyAverage).icon} ${getScoreColor(overallCompanyAverage).label.split('/')[0]}`}
              </div>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', padding: '0.75rem', borderRadius: '12px', color: '#10B981' }}>
              <CheckCircle size={22} />
            </div>
          </div>

          {/* Card Alertas */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Blocos em Alerta
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: criticalDimensionsCount > 0 ? '#EF4444' : '#10B981', marginTop: '0.15rem' }}>
                {criticalDimensionsCount} <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>de {DIMENSIONS.length}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: criticalDimensionsCount > 0 ? '#EF4444' : '#10B981', fontWeight: 600, marginTop: '0.15rem' }}>
                {totalResponses === 0 ? '⚪ Aguardando envios' : criticalDimensionsCount > 0 ? '⚠️ Requer Atenção' : '✅ Nenhum risco crítico'}
              </div>
            </div>
            <div style={{ backgroundColor: criticalDimensionsCount > 0 ? '#FEF2F2' : '#ECFDF5', padding: '0.75rem', borderRadius: '12px', color: criticalDimensionsCount > 0 ? '#EF4444' : '#10B981' }}>
              {criticalDimensionsCount > 0 ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
            </div>
          </div>

        </div>


        {/* Abas de Navegação */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('posto')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'posto' ? '#0066CC' : 'transparent',
              color: activeTab === 'posto' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'posto' ? '0 4px 12px rgba(0, 102, 204, 0.25)' : 'none',
              flexGrow: 1,
              justifyContent: 'center'
            }}
          >
            <Building2 size={18} />
            <span>1. Indicadores por Posto de Trabalho</span>
          </button>

          <button
            onClick={() => setActiveTab('cargo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'cargo' ? '#0066CC' : 'transparent',
              color: activeTab === 'cargo' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'cargo' ? '0 4px 12px rgba(0, 102, 204, 0.25)' : 'none',
              flexGrow: 1,
              justifyContent: 'center'
            }}
          >
            <FileSpreadsheet size={18} />
            <span>2. Indicadores por Cargos (Filtro por CNPJ)</span>
          </button>
        </div>

        {/* ABA 1: ANÁLISE POR POSTO DE TRABALHO */}
        {activeTab === 'posto' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Seletor de Posto */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#FFFFFF', borderLeft: '6px solid #0066CC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#EBF5FF', padding: '0.75rem', borderRadius: '10px', color: '#0066CC' }}>
                  <Filter size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#002244' }}>
                    Selecione o Posto de Trabalho:
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Média psicossocial do posto: <strong>{workplaceTotalAvg || '0.00'} / 5.0</strong> ({workplaceResponses.length} resp.).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
                <div style={{ minWidth: '240px' }}>
                  <select 
                    value={selectedWorkplaceId}
                    onChange={(e) => setSelectedWorkplaceId(e.target.value)}
                    className="select-field"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', fontWeight: 700, borderColor: '#0066CC', color: '#002244' }}
                  >
                    {INITIAL_WORKPLACES.map(wp => (
                      <option key={wp.id} value={wp.id}>
                        {wp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleTriggerReport} 
                  className="btn"
                  style={{ backgroundColor: '#EBF5FF', color: '#0066CC', border: '1px solid #3399FF', padding: '0.75rem 1.15rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FileText size={16} />
                  <span>Gerar Relatório Deste Posto</span>
                </button>
              </div>
            </div>

            {/* Grid de Gráficos do Posto */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
              
              {/* Gráfico 1: Radar Chart (Teia de Aranha HSE) */}
              <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '460px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#002244', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Radar de Saúde Psicossocial (HSE)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Comparativo entre o <strong>{selectedWorkplace.name}</strong> (azul) e a média global (cinza).
                  </p>
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={workplaceChartData}>
                      <PolarGrid stroke="#CBD5E1" />
                      <PolarAngleAxis dataKey="dimension" stroke="#334155" style={{ fontSize: '11px', fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#94A3B8" />
                      <Tooltip 
                        formatter={(value: any) => [`${value} / 5.0`, 'Nota Média']}
                        contentStyle={{ backgroundColor: '#002244', color: '#FFFFFF', borderRadius: '10px', border: 'none', padding: '8px 12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '12px' }} />
                      <Radar name="Posto Selecionado" dataKey="posto" stroke="#0066CC" fill="#0066CC" fillOpacity={0.5} strokeWidth={2} />
                      <Radar name="Média Global" dataKey="empresa" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} strokeWidth={1} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Bar Chart de Média por Bloco */}
              <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '460px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#002244', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Pontuação Média por Bloco
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Índices de 1.0 a 5.0 (Corte NR-1: abaixo de 3.2 requer atenção do SESMT).
                  </p>
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workplaceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 45, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis type="number" domain={[0, 5]} stroke="#64748B" style={{ fontSize: '11px' }} />
                      <YAxis dataKey="dimension" type="category" stroke="#334155" style={{ fontSize: '11px', fontWeight: 600 }} />
                      <Tooltip 
                        formatter={(val: any) => [`${val} / 5.0`, 'Média do Posto']}
                        contentStyle={{ backgroundColor: '#002244', color: '#FFFFFF', borderRadius: '10px', border: 'none', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar name="Média do Posto" dataKey="posto" fill="#0066CC" radius={[0, 6, 6, 0]} barSize={18}>
                        <LabelList dataKey="posto" position="right" style={{ fill: '#002244', fontSize: 11, fontWeight: 'bold' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Tabela de Detalhamento das 8 Dimensões */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#002244' }}>
                  Diagnóstico do Posto: {selectedWorkplace.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Deslize a tabela horizontalmente para ver todos os dados se estiver no smartphone.
                </p>
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                      <th style={{ padding: '0.85rem', color: '#002244', fontWeight: 700, fontSize: '0.9rem' }}>Dimensão (Bloco HSE)</th>
                      <th style={{ padding: '0.85rem', color: '#002244', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>Nota Média</th>
                      <th style={{ padding: '0.85rem', color: '#002244', fontWeight: 700, fontSize: '0.9rem' }}>Semáforo (NR-1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workplaceChartData.map((item, index) => {
                      const st = getScoreColor(item.posto);
                      return (
                        <tr key={item.dimension} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <td style={{ padding: '0.85rem', fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                            <div>{item.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>{DIMENSIONS.find(d => d.label === item.dimension)?.description}</div>
                          </td>
                          <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: st.text }}>
                            {item.posto} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>/ 5</span>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.3rem', 
                                backgroundColor: st.bg, 
                                color: st.text, 
                                padding: '0.35rem 0.75rem', 
                                borderRadius: '9999px',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                              }}
                            >
                              <span>{st.icon}</span>
                              <span>{st.label.split('/')[0].trim()}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ABA 2: ANÁLISE POR CARGO (COM SELEÇÃO DE CNPJ) */}
        {activeTab === 'cargo' && (
          <div className="card animate-fade-in" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            
            {/* Filtro por CNPJ na Aba de Cargos */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#002244', marginBottom: '0.35rem' }}>
                  🏢 Selecione qual CNPJ deseja visualizar na Matriz de Cargos:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedCompanyFilter('EMBRAPS')}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedCompanyFilter === 'EMBRAPS' ? '#0066CC' : '#E2E8F0',
                      color: selectedCompanyFilter === 'EMBRAPS' ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    1. EMBRAPS ({responses.filter(r => (r.company || 'EMBRAPS') === 'EMBRAPS').length} resp.)
                  </button>

                  <button
                    onClick={() => setSelectedCompanyFilter('RM QUARESMA')}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedCompanyFilter === 'RM QUARESMA' ? '#8B5CF6' : '#E2E8F0',
                      color: selectedCompanyFilter === 'RM QUARESMA' ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    2. RM QUARESMA ({responses.filter(r => r.company === 'RM QUARESMA').length} resp.)
                  </button>

                  <button
                    onClick={() => setSelectedCompanyFilter('ALL')}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedCompanyFilter === 'ALL' ? '#0F172A' : '#E2E8F0',
                      color: selectedCompanyFilter === 'ALL' ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Todos os CNPJs ({responses.length} resp.)
                  </button>
                </div>
              </div>

              <div>
                <button 
                  onClick={handleTriggerReport} 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem', backgroundColor: '#10B981', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  <FileText size={18} />
                  <span>Gerar Relatório de Cargos ({selectedCompanyFilter})</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#002244', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={22} color="#0066CC" />
                  Matriz Cruzada: Cargos × 8 Dimensões ({selectedCompanyFilter})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem', maxWidth: '750px' }}>
                  Exibindo indicadores dos colaboradores alocados na empresa <strong>{selectedCompanyFilter}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>🟢 ≥ 3.8</span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>🟡 2.8 - 3.7</span>
                <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>🔴 &lt; 2.8</span>
              </div>
            </div>

            {/* Tabela Matriz */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #CBD5E1', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '850px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#002244', color: '#FFFFFF' }}>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                      Dimensão HSE \ Cargo
                    </th>
                    {activeJobPositions.map(job => (
                      <th key={job.id} style={{ padding: '0.85rem 0.5rem', fontWeight: 700, fontSize: '0.8rem', minWidth: '110px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ lineHeight: 1.2 }}>{job.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 400, marginTop: '0.15rem' }}>{job.category}</div>
                      </th>
                    ))}
                    <th style={{ padding: '0.85rem', fontWeight: 800, fontSize: '0.85rem', backgroundColor: '#003B70', minWidth: '100px' }}>
                      Média Geral
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DIMENSIONS.map((dim, idx) => {
                    const rowScores = activeJobPositions.map(j => jobMatrixData[dim.id][j.id]?.avg || 0);
                    const rowAvg = rowScores.length > 0 ? Number((rowScores.reduce((a, b) => a + b, 0) / rowScores.length).toFixed(2)) : 0;
                    const rowSt = getScoreColor(rowAvg);

                    return (
                      <tr key={dim.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                        
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#0F172A', borderRight: '2px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dim.color, display: 'inline-block', flexShrink: 0 }} />
                          <div>
                            <div>{dim.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 400 }}>{dim.questionCount} perguntas</div>
                          </div>
                        </td>

                        {activeJobPositions.map(job => {
                          const cellData = jobMatrixData[dim.id][job.id] || { avg: 0, count: 0 };
                          const st = getScoreColor(cellData.avg);
                          
                          return (
                            <td key={job.id} style={{ padding: '0.75rem 0.4rem', borderRight: '1px solid #E2E8F0' }}>
                              <div 
                                style={{ 
                                  backgroundColor: st.bg, 
                                  color: st.text, 
                                  padding: '0.5rem 0.25rem', 
                                  borderRadius: '8px', 
                                  fontWeight: 800, 
                                  fontSize: '0.95rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1px solid ${st.text}20`
                                }}
                              >
                                <span>{cellData.avg}</span>
                                <span style={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>
                                  {st.label.split('/')[0].trim()}
                                </span>
                              </div>
                            </td>
                          );
                        })}

                        <td style={{ padding: '0.75rem', backgroundColor: `${rowSt.bg}60`, fontWeight: 800, fontSize: '1rem', color: rowSt.text }}>
                          {rowAvg}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Modal de Gestão e Importação da Base de Colaboradores */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '16px', position: 'relative' }}>
            <button 
              onClick={() => setIsImportModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#EBF5FF', padding: '0.75rem', borderRadius: '12px', color: '#0066CC' }}>
                <Database size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#002244' }}>
                  Base Cadastral de Colaboradores (RE + Ano Nasc.)
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Atualmente existem <strong>{employees.length} colaboradores</strong> cadastrados ({embrapsEmployees.length} Embraps / {rmEmployees.length} RM Quaresma).
                </p>
              </div>
            </div>

            {importSuccessMsg && (
              <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981', color: '#065F46', padding: '0.85rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                {importSuccessMsg}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#002244', marginBottom: '0.5rem' }}>
                Cole aqui os dados da sua planilha (XLSX / CSV / Texto):
              </label>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>
                Formato aceito: <code>RE: NOME: ANO DE NASCIMENTO: POSTO: EMPRESA: CARGO:</code> ou colado direto do Excel.
              </p>
              <textarea 
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Exemplo:\nRE: 2001 NOME: João da Silva ANO DE NASCIMENTO: 1985 POSTO: 4TH CREEK EMPRESA: EMBRAPS CARGO: PORTEIRO\nRE: 2002 NOME: Maria Santos ANO DE NASCIMENTO: 1990 POSTO: 9 DE JULHO EMPRESA: RM QUARESMA CARGO: ASG`}
                className="input-field"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                Cancelar
              </button>

              <button 
                onClick={handleProcessImport}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Upload size={18} />
                <span>Processar e Importar Planilha</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminResponsesModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        responses={responses}
        onDeleteResponse={onDeleteResponse}
      />
    </div>
  );
};
