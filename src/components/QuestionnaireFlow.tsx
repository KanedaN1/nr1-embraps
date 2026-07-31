import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Workplace, JobPosition, DimensionId } from '../types';
import { HSE_QUESTIONS, DIMENSIONS } from '../data/hseQuestions';

interface QuestionnaireFlowProps {
  workplace: Workplace;
  jobPosition: JobPosition;
  onComplete: (dimensionScores: Record<DimensionId, number>, totalAverage: number, answers: Record<number, number>) => void;
}

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({ 
  workplace, 
  jobPosition, 
  onComplete 
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = HSE_QUESTIONS[currentIdx];
  const currentDimension = DIMENSIONS.find(d => d.id === currentQuestion.dimensionId) || DIMENSIONS[0];
  const totalQuestions = HSE_QUESTIONS.length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const likertOptions = [
    { value: 1, label: 'Nunca / Discordo Totalmente', color: '#EF4444', bg: '#FEE2E2' },
    { value: 2, label: 'Raramente / Discordo em Parte', color: '#F97316', bg: '#FFEDD5' },
    { value: 3, label: 'Às Vezes / Neutro', color: '#F59E0B', bg: '#FEF3C7' },
    { value: 4, label: 'Frequentemente / Concordo em Parte', color: '#3B82F6', bg: '#DBEAFE' },
    { value: 5, label: 'Sempre / Concordo Totalmente', color: '#10B981', bg: '#D1FAE5' },
  ];

  const handleSelectOption = (val: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: val };
    setAnswers(newAnswers);

  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1 && answers[currentQuestion.id] !== undefined) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    if (Object.keys(answers).length < totalQuestions) {
      alert(`Por favor, responda a todas as ${totalQuestions} questões antes de finalizar a avaliação.`);
      return;
    }

    setIsSubmitting(true);

    const dimensionScores: Record<DimensionId, number> = {
      demands: 0,
      control: 0,
      support_mgmt: 0,
      support_peers: 0,
      relationships: 0,
      role: 0,
      change: 0,
      harassment: 0,
    };

    const dimensionCounts: Record<DimensionId, number> = {
      demands: 0,
      control: 0,
      support_mgmt: 0,
      support_peers: 0,
      relationships: 0,
      role: 0,
      change: 0,
      harassment: 0,
    };

    HSE_QUESTIONS.forEach(q => {
      const rawVal = answers[q.id] || 3;
      const effectiveVal = q.reverseScore ? (6 - rawVal) : rawVal;
      
      dimensionScores[q.dimensionId] += effectiveVal;
      dimensionCounts[q.dimensionId] += 1;
    });

    let totalSum = 0;
    const dimIds: DimensionId[] = ['demands', 'control', 'support_mgmt', 'support_peers', 'relationships', 'role', 'change', 'harassment'];
    
    dimIds.forEach(dimId => {
      if (dimensionCounts[dimId] > 0) {
        dimensionScores[dimId] = Number((dimensionScores[dimId] / dimensionCounts[dimId]).toFixed(2));
      }
      totalSum += dimensionScores[dimId];
    });

    const totalAverage = Number((totalSum / dimIds.length).toFixed(2));

    setTimeout(() => {
      onComplete(dimensionScores, totalAverage, answers);
    }, 600);
  };

  return (
    <div className="questionnaire-page-wrapper">
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Card Header com Dados do Setor/Cargo e Barra de Progresso */}
        <div className="questionnaire-header">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avaliação em Andamento • NR-1 / PGR
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {workplace.name} — <span style={{ color: '#3399FF' }}>{jobPosition.name}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.8rem', borderRadius: '9999px' }}>
              {currentIdx + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '8px' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              backgroundColor: '#0066CC', 
              height: '100%', 
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} 
          />
        </div>

        {/* Card Principal de Pergunta - Otimizado para Mobile */}
        <div className="card questionnaire-card animate-fade-in">
          
          <div>
            {/* Texto da Pergunta */}
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.4, marginBottom: '2rem' }}>
              "{currentQuestion.text}"
            </h3>
          </div>

          {/* Opções de Resposta Likert (1 a 5) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {likertOptions.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className="likert-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid #0066CC` : '2px solid #F1F5F9',
                    backgroundColor: isSelected ? '#EBF5FF' : '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#002244' : '#334155',
                    boxShadow: isSelected ? '0 4px 12px rgba(0, 102, 204, 0.15)' : 'none',
                    width: '100%',
                    gap: '0.75rem'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#0066CC' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {opt.value}
                    </div>
                    <span style={{ lineHeight: 1.3 }}>{opt.label}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={20} color="#0066CC" style={{ flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navegação Inferior (Voltar / Próxima / Finalizar) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIdx === 0}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1rem', fontSize: '0.9rem' }}
            >
              <ArrowLeft size={16} />
              <span>Anterior</span>
            </button>

            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              {Object.keys(answers).length} de {totalQuestions} respondidas
            </div>

            {currentIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', borderColor: '#0066CC', color: '#0066CC', fontSize: '0.9rem' }}
              >
                <span>Próxima</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={Object.keys(answers).length < totalQuestions || isSubmitting}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10B981', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', fontSize: '0.95rem' }}
              >
                <span>{isSubmitting ? 'Gravando...' : 'Concluir e Enviar'}</span>
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
