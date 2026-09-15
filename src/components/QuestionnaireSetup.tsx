import React, { useState } from 'react';
import { Building2, Briefcase, ArrowRight, Lock } from 'lucide-react';
import type { Workplace, JobPosition, CurrentUser } from '../types';
import { INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from '../data/hseQuestions';

interface QuestionnaireSetupProps {
  currentUser: CurrentUser;
  onStartQuestionnaire: (workplace: Workplace, jobPosition: JobPosition) => void;
  surveyLocked?: boolean;
}

export const QuestionnaireSetup: React.FC<QuestionnaireSetupProps> = ({ 
  currentUser, 
  onStartQuestionnaire,
  surveyLocked = false
}) => {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(INITIAL_JOB_POSITIONS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyLocked) {
      alert('O período do questionário está finalizado. Agradecemos a participação!');
      return;
    }
    if (!selectedWorkplaceId) {
      alert('Por favor, selecione um posto de trabalho.');
      return;
    }
    const wp = INITIAL_WORKPLACES.find(w => w.id === selectedWorkplaceId) || INITIAL_WORKPLACES[0];
    const job = INITIAL_JOB_POSITIONS.find(j => j.id === selectedJobId) || INITIAL_JOB_POSITIONS[0];
    onStartQuestionnaire(wp, job);
  };

  return (
    <div className="setup-page-wrapper">
      <div className="container" style={{ maxWidth: '780px' }}>
        
        <div className="card setup-card animate-fade-in">
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              backgroundColor: surveyLocked ? '#FEF2F2' : '#EBF5FF', 
              color: surveyLocked ? '#EF4444' : '#0066CC',
              marginBottom: '1rem',
              boxShadow: surveyLocked ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 4px 12px rgba(0, 102, 204, 0.15)'
            }}>
              {surveyLocked ? <Lock size={32} /> : <Building2 size={32} />}
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#002244', marginBottom: '0.5rem' }}>
              {surveyLocked ? 'Questionário Bloqueado' : 'Selecione seu Setor e Cargo'}
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
              Bem-vindo(a), <strong style={{ color: '#003B70' }}>{currentUser.name || currentUser.identifier}</strong>! 
              {surveyLocked 
                ? ' O período de coleta do questionário NR-1 foi encerrado pela administração.' 
                : ' Antes de respondermos às 40 questões, precisamos identificar o grupo ao qual você pertence para os indicadores do PGR.'}
            </p>
          </div>

          {surveyLocked && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem 1.25rem', borderRadius: '14px', color: '#991B1B', textAlign: 'center', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Lock size={20} />
              <span>🔒 A etapa de avaliação psicossocial foi encerrada. Agradecemos sua colaboração!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Posto de Trabalho */}
            <div>
              <label htmlFor="workplace-select" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#002244', marginBottom: '0.5rem' }}>
                <Building2 size={20} color="#0066CC" />
                <span>Posto de Trabalho:</span>
              </label>
              
              <select 
                id="workplace-select"
                value={selectedWorkplaceId} 
                onChange={(e) => setSelectedWorkplaceId(e.target.value)}
                className="select-field"
                style={{ fontSize: '1.05rem', padding: '1rem', fontWeight: 500, backgroundColor: '#FFFFFF', cursor: 'pointer', width: '100%' }}
                required
                disabled={surveyLocked}
              >
                <option value="" disabled>Selecionar posto...</option>
                {INITIAL_WORKPLACES.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cargo Exercido */}
            <div>
              <label htmlFor="job-select" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#002244', marginBottom: '0.5rem' }}>
                <Briefcase size={20} color="#10B981" />
                <span>Cargo / Função Exercida:</span>
              </label>
              
              <select 
                id="job-select"
                value={selectedJobId} 
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="select-field"
                style={{ fontSize: '1.05rem', padding: '1rem', fontWeight: 500, backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                disabled={surveyLocked}
              >
                {INITIAL_JOB_POSITIONS.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name} — {job.category}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={surveyLocked}
              className="btn btn-primary"
              style={{ padding: '1.15rem', fontSize: '1.15rem', width: '100%', marginTop: '0.5rem', opacity: surveyLocked ? 0.6 : 1 }}
            >
              <span>{surveyLocked ? 'Questionário Encerrado' : 'Iniciar Questionário (40 Questões)'}</span>
              {!surveyLocked && <ArrowRight size={22} />}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

