import React, { useState } from 'react';
import { Building2, Briefcase, ArrowRight, Lock } from 'lucide-react';
import type { Workplace, JobPosition, CurrentUser } from '../types';
import { INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from '../data/hseQuestions';

interface QuestionnaireSetupProps {
  currentUser: CurrentUser;
  onStartQuestionnaire: (workplace: Workplace, jobPosition: JobPosition) => void;
  onOpenSecurityModal: () => void;
}

export const QuestionnaireSetup: React.FC<QuestionnaireSetupProps> = ({ 
  currentUser, 
  onStartQuestionnaire,
  onOpenSecurityModal 
}) => {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(INITIAL_WORKPLACES[0].id);
  const [selectedJobId, setSelectedJobId] = useState(INITIAL_JOB_POSITIONS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wp = INITIAL_WORKPLACES.find(w => w.id === selectedWorkplaceId) || INITIAL_WORKPLACES[0];
    const job = INITIAL_JOB_POSITIONS.find(j => j.id === selectedJobId) || INITIAL_JOB_POSITIONS[0];
    onStartQuestionnaire(wp, job);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        <div className="card animate-fade-in" style={{ padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 34, 68, 0.12)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '20px', 
              backgroundColor: '#EBF5FF', 
              color: '#0066CC',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(0, 102, 204, 0.15)'
            }}>
              <Building2 size={32} />
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#002244', marginBottom: '0.5rem' }}>
              Selecione seu Setor e Cargo
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
              Bem-vindo(a), <strong style={{ color: '#003B70' }}>{currentUser.name || currentUser.identifier}</strong>! 
              Antes de respondermos às 40 questões, precisamos identificar o grupo ao qual você pertence para os indicadores do PGR.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Posto de Trabalho */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <label htmlFor="workplace-select" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#002244', marginBottom: '0.75rem' }}>
                <Building2 size={20} color="#0066CC" />
                <span>Posto de Trabalho (Unidade / Empreendimento):</span>
              </label>
              
              <select 
                id="workplace-select"
                value={selectedWorkplaceId} 
                onChange={(e) => setSelectedWorkplaceId(e.target.value)}
                className="select-field"
                style={{ fontSize: '1.05rem', padding: '1rem', fontWeight: 500, backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                {INITIAL_WORKPLACES.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem', fontStyle: 'italic' }}>
                * Nota: Cadastramos o "Posto de Teste" e exemplos. Em breve adicionaremos a lista completa de 370 postos.
              </p>
            </div>

            {/* Cargo Exercido */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <label htmlFor="job-select" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#002244', marginBottom: '0.75rem' }}>
                <Briefcase size={20} color="#10B981" />
                <span>Cargo / Função Exercida:</span>
              </label>
              
              <select 
                id="job-select"
                value={selectedJobId} 
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="select-field"
                style={{ fontSize: '1.05rem', padding: '1rem', fontWeight: 500, backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                {INITIAL_JOB_POSITIONS.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name} — {job.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Reafirmação de Anonimato LGPD */}
            <div 
              onClick={onOpenSecurityModal}
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <Lock size={24} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#065F46' }}>
                <strong>Segregação de Identidade Ativada:</strong> Ao clicar abaixo, iniciaremos o questionário. 
                Sua matrícula e nome não serão vinculados a este Posto ou Cargo na tabela de respostas finais.
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '1.15rem', fontSize: '1.15rem', width: '100%' }}
            >
              <span>Iniciar Questionário (40 Questões)</span>
              <ArrowRight size={22} />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};
