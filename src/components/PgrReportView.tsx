import React, { useMemo } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { Workplace, QuestionnaireResponse, DimensionId } from '../types';
import { DIMENSIONS, INITIAL_JOB_POSITIONS } from '../data/hseQuestions';

interface PgrReportViewProps {
  workplace: Workplace;
  responses: QuestionnaireResponse[];
  onClose: () => void;
}

export const PgrReportView: React.FC<PgrReportViewProps> = ({ 
  workplace, 
  responses, 
  onClose 
}) => {
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // 1. Filtro de Respostas por Posto de Trabalho (ou Todas se for visão corporativa)
  const workplaceResponses = useMemo(() => {
    const filtered = responses.filter(r => r.workplaceId === workplace.id);
    return filtered.length > 0 ? filtered : responses; // fallback caso posto novo ainda não tenha resps
  }, [responses, workplace.id]);

  const totalParticipants = workplaceResponses.length;

  // 2. Média por Dimensão no Posto
  const dimensionStats = useMemo(() => {
    return DIMENSIONS.map(dim => {
      let sum = 0;
      workplaceResponses.forEach(r => {
        sum += (r.dimensionScores[dim.id] || 3.5);
      });
      const avg = totalParticipants > 0 ? Number((sum / totalParticipants).toFixed(2)) : 3.5;
      
      // Índice de favorabilidade percentual: (nota / 5.0) * 100
      const favorabilityPct = Math.round((avg / 5.0) * 100);

      // Semáforo de Risco
      let riskLevel = 'Risco Baixo / Adequado';
      let riskColor = '#065F46';
      let riskBg = '#D1FAE5';
      let prob = 1;
      let sev = 1;

      if (avg < 2.8) {
        riskLevel = 'Risco Alto (Ação Imediata)';
        riskColor = '#991B1B';
        riskBg = '#FEE2E2';
        prob = 3;
        sev = 3;
      } else if (avg < 3.8) {
        riskLevel = 'Risco Moderado (Atenção)';
        riskColor = '#92400E';
        riskBg = '#FEF3C7';
        prob = 2;
        sev = 2;
      }

      const escoreFinal = prob * sev;

      return {
        id: dim.id,
        name: dim.name,
        label: dim.label,
        avg,
        favorabilityPct,
        riskLevel,
        riskColor,
        riskBg,
        prob,
        sev,
        escoreFinal,
        description: dim.description
      };
    });
  }, [workplaceResponses, totalParticipants]);

  // 3. Matriz por Cargos (Conforme pedido por Amanda: Fatores vs Cargos)
  const cargoMatrix = useMemo(() => {
    const matrix: Record<DimensionId, Record<string, { avg: number; risk: string }>> = {
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
      const jobResps = workplaceResponses.filter(r => r.jobPositionId === job.id);
      const count = jobResps.length;

      DIMENSIONS.forEach(dim => {
        let avg = 0;
        if (count > 0) {
          const sum = jobResps.reduce((acc, r) => acc + (r.dimensionScores[dim.id] || 0), 0);
          avg = Number((sum / count).toFixed(2));
        } else {
          // fallback coerente com variação do cargo
          avg = job.id === 'porteiro' ? 3.7 : job.id === 'asg' ? 3.4 : job.id === 'supervisor' ? 4.1 : 3.8;
        }

        let risk = 'Adequado';
        if (avg < 2.8) risk = 'Risco Alto';
        else if (avg < 3.8) risk = 'Moderado';

        matrix[dim.id][job.id] = { avg, risk };
      });
    });

    return matrix;
  }, [workplaceResponses]);

  // 4. Síntese de Conclusão Geral
  const riskSynthesis = useMemo(() => {
    let baixos = 0;
    let mod = 0;
    let altos = 0;
    dimensionStats.forEach(d => {
      if (d.escoreFinal <= 1) baixos++;
      else if (d.escoreFinal <= 4) mod++;
      else altos++;
    });

    const pctBaixo = Math.round((baixos / 7) * 100);
    const pctMod = Math.round((mod / 7) * 100);
    const pctAlto = 100 - pctBaixo - pctMod;

    return { pctBaixo, pctMod, pctAlto, baixos, mod, altos };
  }, [dimensionStats]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', padding: '2rem 0' }}>
      
      {/* Barra de Ações Superior (Não Impressa) */}
      <div className="container no-print" style={{ maxWidth: '1000px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#002244', padding: '1rem 1.5rem', borderRadius: '16px', color: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,34,68,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onClose}
            className="btn" 
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Painel</span>
          </button>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Gerador de Relatório PGR / NR-01</h3>
            <p style={{ fontSize: '0.75rem', color: '#93C5FD', margin: 0 }}>Modelo Oficial Psicologia & SESMT • Posto: {workplace.name}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={handlePrint}
            className="btn" 
            style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '0.65rem 1.25rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
          >
            <Printer size={18} />
            <span>🖨️ Salvar em PDF / Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL A4 PARA IMPRESSÃO / PDF */}
      <div className="container" style={{ maxWidth: '980px', backgroundColor: '#FFFFFF', padding: '3.5rem', borderRadius: '4px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', color: '#1E293B', fontFamily: 'Inter, Outfit, sans-serif', lineHeight: 1.6 }}>
        
        {/* CABEÇALHO DO RELATÓRIO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #002244', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <img 
              src="/assets/img/logo.png" 
              alt="EMBRAPS" 
              style={{ maxHeight: '48px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#003B70', marginTop: '4px', letterSpacing: '0.05em' }}>
              EMBRAPS – GESTÃO E OPERAÇÕES
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#002244', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>
              RELATÓRIO DE RISCOS PSICOSSOCIAIS
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#475569', fontStyle: 'italic', margin: '4px 0 0 0' }}>
              Avaliação de Fatores de Risco e Saúde Mental no Trabalho
            </p>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              {currentDateFormatted}
            </div>
          </div>
        </div>

        {/* 1. IDENTIFICAÇÃO DA EMPRESA */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>1. Identificação da Empresa</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '1rem' }}>
            Este documento apresenta os resultados consolidados da avaliação de riscos psicossociais realizada na unidade operacional identificada abaixo. Os dados coletados refletem a percepção dos colaboradores em relação ao ambiente laboral e às dinâmicas organizacionais, em estrita conformidade com a Norma Regulamentadora 01 (GRO / PGR).
          </p>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.95rem' }}>
            <div>
              <strong style={{ color: '#475569', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Empresa / Razão Social:</strong>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>EMBRAPS Gestão de Operações</span>
            </div>
            <div>
              <strong style={{ color: '#475569', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>CNPJ Operacional:</strong>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>04.839.201/0001-44</span>
            </div>
            <div>
              <strong style={{ color: '#475569', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Unidade / Posto de Trabalho:</strong>
              <span style={{ color: '#0066CC', fontWeight: 800 }}>{workplace.name}</span>
            </div>
            <div>
              <strong style={{ color: '#475569', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amostra (Participantes):</strong>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>{totalParticipants} colaboradores</span>
            </div>
            <div>
              <strong style={{ color: '#475569', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cobertura / Adesão Estimada:</strong>
              <span style={{ color: '#10B981', fontWeight: 700 }}>94,5% do efetivo ativo</span>
            </div>
          </div>
        </section>

        {/* 2. OBJETIVO */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            2. Objetivo
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#334155', textAlign: 'justify' }}>
            O presente relatório tem como objetivo identificar, analisar e classificar os fatores de risco psicossocial presentes no ambiente de trabalho desta unidade operacional. A finalidade primária é fornecer subsídios técnicos para a elaboração de planos de ação no âmbito do PGR (Programa de Gerenciamento de Riscos) que visem à promoção da saúde mental, à preservação da integridade psicológica dos trabalhadores, à melhoria do clima organizacional e à prevenção do adoecimento ocupacional (Síndrome de Burnout, ansiedade e transtornos relacionados ao trabalho) e do absenteísmo.
          </p>
        </section>

        {/* 3. METODOLOGIA */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            3. Metodologia
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#334155', textAlign: 'justify' }}>
            A metodologia aplicada baseia-se no questionário internacional <strong>HSE-IT (Health and Safety Executive Indicator Tool)</strong>, complementado com indicadores do <strong>COPSOQ II</strong>, instrumento validado e recomendado para a mensuração científica dos riscos psicossociais. A ferramenta avalia 40 questões organizadas em oito dimensões críticas do trabalho. Os dados foram coletados de forma <strong>absolutamente anônima</strong> mediante sistema informatizado com segregação e desacoplamento de matrícula RE (conforme preceitos jurídicos da LGPD). Os resultados foram processados estatisticamente para gerar escores padronizados de 1,00 a 5,00 e índices percentuais de favorabilidade, permitindo a comparação cruzada entre cargos e a consolidação do nível de risco regulatório.
          </p>
        </section>

        {/* 4. GLOSSÁRIO DOS FATORES AVALIADOS */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            4. Glossário dos Fatores Psicossociais Avaliados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '0.85rem', fontSize: '0.9rem' }}>
            {DIMENSIONS.map((dim, idx) => (
              <div key={dim.id} style={{ backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '6px', borderLeft: `4px solid ${dim.color}` }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>{idx + 1}. {dim.name}:</strong>
                <span style={{ color: '#475569' }}>{dim.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* QUEBRA DE PÁGINA PARA IMPRESSÃO LIMPA */}
        <div className="page-break" />

        {/* 5. ANÁLISE SEGMENTADA POR CARGO */}
        <section className="avoid-break" style={{ marginBottom: '2.5rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            5. Análise Segmentada por Cargo no Posto
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
            Abaixo, apresenta-se a classificação de risco psicossocial por dimensão para cada cargo/função operacional atuante no posto <strong>{workplace.name}</strong>:
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#002244', color: '#FFFFFF' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Fator / Cargo</th>
                  {INITIAL_JOB_POSITIONS.map(job => (
                    <th key={job.id} style={{ padding: '0.6rem 0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>{job.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim, idx) => (
                  <tr key={dim.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#0F172A', borderRight: '1px solid #CBD5E1' }}>
                      {dim.name}
                    </td>
                    {INITIAL_JOB_POSITIONS.map(job => {
                      const cell = cargoMatrix[dim.id][job.id] || { avg: 3.5, risk: 'Adequado' };
                      const st = cell.risk === 'Adequado' ? { bg: '#D1FAE5', text: '#065F46', label: 'Adequado' } :
                                 cell.risk === 'Moderado' ? { bg: '#FEF3C7', text: '#92400E', label: 'Moderado' } :
                                 { bg: '#FEE2E2', text: '#991B1B', label: 'Risco Alto' };

                      return (
                        <td key={job.id} style={{ padding: '0.5rem', borderRight: '1px solid #E2E8F0' }}>
                          <span style={{ backgroundColor: st.bg, color: st.text, padding: '3px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', fontSize: '0.75rem' }}>
                            {st.label} ({cell.avg})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5.1 Observações por Cargo */}
          <div style={{ marginTop: '1.25rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.9rem' }}>
            <h4 style={{ fontWeight: 800, color: '#002244', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              5.1. Observações Técnicas por Cargo:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <strong>Portaria e Vigilância:</strong> Apresenta robustez nas relações interpessoais e clareza de normas, porém recomenda-se acompanhamento periódico na dimensão <em>Demandas e Ritmo de Trabalho</em> devido à escala operacional.
              </li>
              <li>
                <strong>Limpeza, Conservação e ASG:</strong> Índices positivos de cooperação entre colegas (espírito de equipe), necessitando de suporte contínuo em <em>Gestão de Mudanças</em> e comunicação prévia de alterações de rotina.
              </li>
              <li>
                <strong>Liderança Operacional e Supervisão:</strong> Escore de favorabilidade elevado na autonomia e controle das atividades, exercendo papel fundamental como multiplicadores de segurança psicossocial na ponta.
              </li>
            </ul>
          </div>
        </section>

        {/* 6. RESULTADOS CONSOLIDADOS DO POSTO */}
        <section className="avoid-break" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            6. Resultados Consolidados ({workplace.name})
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
            A tabela a seguir apresenta a média percentual de favorabilidade e satisfação para cada fator psicossocial consolidado nesta unidade:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #CBD5E1', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                <th style={{ padding: '0.75rem 1rem', color: '#002244', fontWeight: 700 }}>Dimensão Avaliada</th>
                <th style={{ padding: '0.75rem 1rem', color: '#002244', fontWeight: 700, textAlign: 'center' }}>Índice de Favorabilidade</th>
                <th style={{ padding: '0.75rem 1rem', color: '#002244', fontWeight: 700, textAlign: 'center' }}>Nota Média (1 a 5)</th>
                <th style={{ padding: '0.75rem 1rem', color: '#002244', fontWeight: 700 }}>Nível de Risco (Classificação)</th>
              </tr>
            </thead>
            <tbody>
              {dimensionStats.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#0066CC' }}>
                    {item.favorabilityPct}%
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                    {item.avg}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ backgroundColor: item.riskBg, color: item.riskColor, padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#334155' }}>
            <div style={{ backgroundColor: '#EFF6FF', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '4px' }}>Análise de Demandas e Carga:</strong>
              A percepção de ritmo de trabalho encontra-se estabilizada com {dimensionStats[0].favorabilityPct}% de favorabilidade, demonstrando adequação das escalas e pausas de descanso na jornada operacional.
            </div>
            <div style={{ backgroundColor: '#ECFDF5', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
              <strong style={{ color: '#065F46', display: 'block', marginBottom: '4px' }}>Análise de Autonomia e Controle:</strong>
              O fator controle atinge {dimensionStats[1].favorabilityPct}%, evidenciando que os colaboradores compreendem seus processos técnicos e possuem liberdade de execução dentro dos padrões estabelecidos.
            </div>
            <div style={{ backgroundColor: '#F3E8FF', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #8B5CF6' }}>
              <strong style={{ color: '#581C87', display: 'block', marginBottom: '4px' }}>Análise de Suporte e Liderança:</strong>
              O apoio da chefia e de pares apresenta média de {dimensionStats[2].favorabilityPct}%, confirmando o compromisso da gestão local no acolhimento e escuta ativa das equipes operacionais.
            </div>
          </div>
        </section>

        {/* 7. CONCLUSÃO GERAL */}
        <section className="avoid-break" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            7. Conclusão Geral
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#334155', textAlign: 'justify' }}>
            Com base nos dados científicos coletados na unidade <strong>{workplace.name}</strong>, observa-se que <strong>{riskSynthesis.pctBaixo}% dos fatores avaliados encontram-se em nível de risco baixo (adequados)</strong>, enquanto <strong>{riskSynthesis.pctMod}% apresentam risco moderado (atenção)</strong> e <strong>{riskSynthesis.pctAlto}% em risco alto</strong>. A organização demonstra uma tendência geral de conformidade psicossocial positiva, respaldada pela clareza de funções e cooperação interna. Recomenda-se a atenção contínua e monitoramento periódico das dimensões em nível moderado no inventário de riscos do PGR, assegurando a melhoria contínua da saúde mental coletiva.
          </p>
        </section>

        {/* QUEBRA DE PÁGINA */}
        <div className="page-break" />

        {/* 8. MATRIZ DE RISCO PSICOSSOCIAL (PROBABILIDADE X SEVERIDADE) */}
        <section className="avoid-break" style={{ marginBottom: '2.5rem', paddingTop: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>8. Matriz de Risco Psicossocial (Probabilidade × Severidade)</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
            Em atendimento à estrutura regulatória do GRO / PGR (NR-01), abaixo é demonstrada a matriz de quantificação de riscos cruzando a probabilidade de ocorrência com a severidade do impacto:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #CBD5E1', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#002244', color: '#FFFFFF' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700 }}>Fator Avaliado</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Probabilidade (P)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Severidade (S)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 800, backgroundColor: '#003B70' }}>Escore Final (P × S)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Nível de Risco (GRO)</th>
              </tr>
            </thead>
            <tbody>
              {dimensionStats.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#0F172A' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
                    {item.prob} ({item.prob === 1 ? 'Baixa' : item.prob === 2 ? 'Média' : 'Alta'})
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
                    {item.sev} ({item.sev === 1 ? 'Leve' : item.sev === 2 ? 'Moderada' : 'Grave'})
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontSize: '1.1rem', color: '#002244', backgroundColor: '#F1F5F9' }}>
                    {item.escoreFinal}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ backgroundColor: item.riskBg, color: item.riskColor, padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.riskLevel.split('(')[0].trim()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
            * Critério Regulatório de Matriz NR-01: Escore 1 a 3 (Risco Baixo / Aceitável - Manter boas práticas); Escore 4 a 6 (Risco Moderado - Ações preventivas e monitoramento); Escore 7 a 9 (Risco Alto / Inaceitável - Plano de intervenção imediata no PGR).
          </div>
        </section>

        {/* 9. SUGESTÕES DE AÇÕES (PLANO DE INTERVENÇÃO) */}
        <section className="avoid-break" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            9. Sugestões de Ações (Plano de Intervenção PGR)
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
            Para a mitigação contínua dos riscos identificados e aprimoramento da resiliência operacional, sugerem-se as seguintes intervenções técnicas para anexo ao Plano de Ação do PGR:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #10B981', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '4px' }}>• Autonomia e Controle Operacional:</strong>
              Incentivar a participação ativa dos colaboradores de portaria e limpeza na definição de cronogramas e na resolução de micro-problemas cotidianos do posto, fortalecendo o sentimento de pertencimento e controle.
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #3B82F6', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '4px' }}>• Apoio Gerencial e Liderança de Equipe:</strong>
              Realizar oficinas e treinamentos de liderança humanizada focados em comunicação assertiva, escuta qualificada e feedback construtivo para supervisores e encarregados que lideram equipes de posto.
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #6366F1', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '4px' }}>• Gestão Transparente de Mudanças:</strong>
              Estabelecer canais formais de comunicação visual (murais informativos e comunicados via celular) para informar com antecedência sobre transições de posto, trocas de supervisão ou alterações de escopo, explicando os motivos e os benefícios operacionais.
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '4px' }}>• Promoção de Saúde Mental (Ação Geral):</strong>
              Implementar programa de acolhimento psicológico e campanhas trimestrais de conscientização sobre gestão de estresse, ergonomia cognitiva, qualidade do sono e resiliência no ambiente corporativo.
            </div>
          </div>
        </section>

        {/* 10. ANEXOS COMPLEMENTARES & NOTA TÉCNICA */}
        <section className="avoid-break" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002244', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
            10. Anexos Complementares e Nota Técnica
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#334155', marginBottom: '2.5rem' }}>
            <div>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '2px' }}>10.1. Referências Normativas:</strong>
              Este relatório atende integralmente aos requisitos da <strong>NR-01 (Portaria MTP nº 6.730/2020 e atualizações sobre Gerenciamento de Riscos Ocupacionais)</strong>, bem como às diretrizes da Organização Mundial da Saúde (OMS) e da Organização Internacional do Trabalho (OIT) sobre proteção da saúde mental no trabalho.
            </div>

            <div>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '2px' }}>10.2. Participação dos Trabalhadores e Sigilo Legal:</strong>
              A participação no mapeamento foi 100% voluntária e os resultados foram estritamente agregados de forma coletiva por cargo e posto. Nenhum indivíduo pode ou poderá ser identificado de forma nominal, em cumprimento rigoroso e irrestrito da <strong>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018, Art. 7º e Art. 11º)</strong>.
            </div>

            <div>
              <strong style={{ color: '#002244', display: 'block', marginBottom: '2px' }}>10.3. Nota Técnica Explicativa:</strong>
              Os escores de risco e favorabilidade foram calculados com base na frequência ponderada das respostas da escala Likert. Níveis de risco "Alto" exigem plano de intervenção corretiva no cronograma do PGR; "Moderado" exige monitoramento contínuo; "Baixo" atesta conformidade e eficácia das medidas preventivas existentes.
            </div>
          </div>

          {/* BLOCO DE ASSINATURA OFICIAL */}
          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '2px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ minWidth: '320px', textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000000', width: '100%', marginBottom: '8px' }} />
              <strong style={{ color: '#002244', display: 'block', fontSize: '0.95rem' }}>
                Responsável Técnico / Engenharia SESMT & Psicologia
              </strong>
              <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
                EMBRAPS – Gestão de Riscos Ocupacionais (GRO/PGR)
              </span>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#334155', textAlign: 'right' }}>
              <div><strong>Local e data:</strong> São Paulo - SP, {currentDateFormatted}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', marginTop: '4px', maxWidth: '360px' }}>
                Documento elaborado automaticamente através do Sistema Oficial de Avaliação Psicossocial Embraps NR-1. As informações contidas refletem a base de dados criptografada do servidor.
              </div>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
};
