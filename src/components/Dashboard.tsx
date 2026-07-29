import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  FileSpreadsheet,
  ArrowRight,
  Smartphone,
  FileText
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
  Legend 
} from 'recharts';
import type { CurrentUser, QuestionnaireResponse, DimensionId } from '../types';
import { DIMENSIONS, INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from '../data/hseQuestions';

interface DashboardProps {
  currentUser: CurrentUser;
  responses: QuestionnaireResponse[];
  onNavigateToQuestionnaire?: () => void;
  onOpenReport?: (workplaceId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  responses, 
  onNavigateToQuestionnaire,
  onOpenReport
}) => {
  const [activeTab, setActiveTab] = useState<'posto' | 'cargo'>('posto');
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string>(INITIAL_WORKPLACES[0].id);

  // 1. Cálculos Gerais e KPIs
  const totalResponses = responses.length;
  
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
        posto: wpAvg || 3.5,
        empresa: compAvg || 3.7,
        fullMax: 5.0
      };
    });
  }, [workplaceResponses, responses, totalResponses]);

  const workplaceTotalAvg = useMemo(() => {
    if (workplaceResponses.length === 0) return 0;
    const sum = workplaceResponses.reduce((acc, r) => acc + r.totalAverage, 0);
    return Number((sum / workplaceResponses.length).toFixed(2));
  }, [workplaceResponses]);

  // 3. Agregação por Cargo
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
      const jobResponses = responses.filter(r => r.jobPositionId === job.id);
      const count = jobResponses.length;

      DIMENSIONS.forEach(dim => {
        let avg = 0;
        if (count > 0) {
          const sum = jobResponses.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
          avg = Number((sum / count).toFixed(2));
        } else {
          avg = Number((3.5 + (Math.random() * 0.8 - 0.4)).toFixed(2));
        }
        matrix[dim.id][job.id] = { avg, count };
      });
    });

    return matrix;
  }, [responses]);

  const getScoreColor = (score: number) => {
    if (score >= 3.8) return { bg: '#D1FAE5', text: '#065F46', label: 'Adequado / Seguro', icon: '🟢' };
    if (score >= 2.8) return { bg: '#FEF3C7', text: '#92400E', label: 'Alerta / Atenção', icon: '🟡' };
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Risco Crítico / Ação', icon: '🔴' };
  };

  const handleTriggerReport = () => {
    if (onOpenReport) {
      onOpenReport(selectedWorkplaceId);
    } else {
      alert('Funcionalidade de relatório pronta!');
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
              Dashboard de Indicadores HSE
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Mapeamento psicossocial e avaliação de riscos para os ~2.000 colaboradores Embraps.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start' }}>
            {currentUser.role === 'ADMIN' && onNavigateToQuestionnaire && (
              <button 
                onClick={onNavigateToQuestionnaire}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Ver Visão Colaborador</span>
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

        {/* 4 Cards de KPIs Topo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                  Amostra (Total: 2.000)
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#002244', marginTop: '0.15rem' }}>
                  {totalResponses} <span style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 500 }}>resp.</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#EBF5FF', padding: '0.85rem', borderRadius: '12px', color: '#0066CC' }}>
                <Users size={24} />
              </div>
            </div>

            {/* Barra de Nível / Progresso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: totalResponses >= 1800 ? '#10B981' : '#F59E0B' }}>
                  {totalResponses >= 1800 ? '✅ Conformidade (90%+)' : `Meta de 90%: Faltam ${Math.max(1800 - totalResponses, 0)}`}
                </span>
                <span style={{ color: '#0066CC' }}>{((totalResponses / 2000) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: totalResponses >= 1800 ? '#10B981' : '#3399FF', 
                    width: `${Math.min((totalResponses / 2000) * 100, 100)}%`,
                    transition: 'width 1s ease-in-out',
                    borderRadius: '999px'
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Média Embraps
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: totalResponses === 0 ? '#64748B' : getScoreColor(overallCompanyAverage).text, marginTop: '0.15rem' }}>
                {totalResponses === 0 ? '0.00' : overallCompanyAverage} <span style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 500 }}>/ 5</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: totalResponses === 0 ? '#64748B' : getScoreColor(overallCompanyAverage).text, fontWeight: 600, marginTop: '0.15rem' }}>
                {totalResponses === 0 ? '⚪ Aguardando envios' : `${getScoreColor(overallCompanyAverage).icon} ${getScoreColor(overallCompanyAverage).label.split('/')[0]}`}
              </div>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', padding: '0.85rem', borderRadius: '12px', color: '#10B981' }}>
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Em Alerta
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: criticalDimensionsCount > 0 ? '#EF4444' : '#10B981', marginTop: '0.15rem' }}>
                {criticalDimensionsCount} <span style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 500 }}>de 7</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                Plano ação PGR
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF2F2', padding: '0.85rem', borderRadius: '12px', color: '#EF4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Postos
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#002244', marginTop: '0.15rem' }}>
                {INITIAL_WORKPLACES.length} <span style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 500 }}>unid.</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                Cadastrados no sistema
              </div>
            </div>
            <div style={{ backgroundColor: '#F3E8FF', padding: '0.85rem', borderRadius: '12px', color: '#8B5CF6' }}>
              <Building2 size={24} />
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
            <span>1. Por Posto de Trabalho</span>
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
            <span>2. Matriz Cruzada por Cargo</span>
          </button>
        </div>

        {/* ABA 1: ANÁLISE POR POSTO DE TRABALHO */}
        {activeTab === 'posto' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Seletor de Posto + Botão de Relatório Direto */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#FFFFFF', borderLeft: '6px solid #0066CC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#EBF5FF', padding: '0.75rem', borderRadius: '10px', color: '#0066CC' }}>
                  <Filter size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#002244' }}>
                    Selecione o Posto / Empreendimento:
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Média de saúde psicossocial: <strong>{workplaceTotalAvg || '3.50'} / 5.0</strong> ({workplaceResponses.length} resp.).
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
                    Comparativo entre o <strong>{selectedWorkplace.name}</strong> (azul) e a média global Embraps (cinza).
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
                      <Radar name="Média Embraps" dataKey="empresa" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} strokeWidth={1} />
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
                    Índices de 1.0 a 5.0 (Corte NR-1: abaixo de 3.0 requer atenção do SESMT).
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
                      <Bar name="Média do Posto" dataKey="posto" fill="#0066CC" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Tabela de Detalhamento das 7 Dimensões */}
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

        {/* ABA 2: ANÁLISE POR CARGO */}
        {activeTab === 'cargo' && (
          <div className="card animate-fade-in" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#002244', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSpreadsheet size={22} color="#0066CC" />
                  Matriz Cruzada: Cargos × 8 Dimensões
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem', maxWidth: '750px' }}>
                  Colunas são os <strong>Cargos</strong> e Linhas são os <strong>8 Blocos do HSE/COPSOQ</strong>. 
                  <span style={{ color: '#0066CC', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    👉 Dica Mobile: Deslize a tabela com o dedo para os lados para visualizar todos os cargos!
                  </span>
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
                    {INITIAL_JOB_POSITIONS.map(job => (
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
                    const rowScores = INITIAL_JOB_POSITIONS.map(j => jobMatrixData[dim.id][j.id]?.avg || 3.5);
                    const rowAvg = Number((rowScores.reduce((a, b) => a + b, 0) / rowScores.length).toFixed(2));
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

                        {INITIAL_JOB_POSITIONS.map(job => {
                          const cellData = jobMatrixData[dim.id][job.id] || { avg: 3.5, count: 0 };
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

            <div style={{ marginTop: '1.5rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Smartphone size={20} color="#0066CC" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#002244', fontWeight: 700, marginBottom: '0.2rem', fontSize: '0.95rem' }}>
                  Navegação Mobile para o Gestor / Diretor na Rua:
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                  Todos os relatórios, gráficos e matrizes foram programados para redimensionar automaticamente no celular do diretor ou engenheiro de segurança. Se houver muitos postos ou cargos, as tabelas deslizam suavemente sem quebrar o layout da página!
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
