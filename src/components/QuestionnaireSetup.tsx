import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Briefcase, ArrowRight, Lock, Search } from 'lucide-react';
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
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(INITIAL_JOB_POSITIONS[0].id);
  const [workplaceSearch, setWorkplaceSearch] = useState('');

  const filteredWorkplaces = useMemo(() => {
    const searchLower = workplaceSearch.toLowerCase();
    return INITIAL_WORKPLACES.filter(wp => 
      wp.name.toLowerCase().includes(searchLower) || 
      wp.code.toLowerCase().includes(searchLower)
    );
  }, [workplaceSearch]);

  useEffect(() => {
    if (selectedWorkplaceId !== '' && filteredWorkplaces.length > 0 && !filteredWorkplaces.find(w => w.id === selectedWorkplaceId)) {
      setSelectedWorkplaceId('');
    }
  }, [filteredWorkplaces, selectedWorkplaceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkplaceId) {
      alert('Por favor, selecione um posto de trabalho.');
      return;
    }
    const wp = INITIAL_WORKPLACES.find(w => w.id === selectedWorkplaceId) || filteredWorkplaces[0] || INITIAL_WORKPLACES[0];
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
                <span>Posto de Trabalho:</span>
              </label>

              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar posto por nome ou código..." 
                  value={workplaceSearch}
                  onChange={(e) => setWorkplaceSearch(e.target.value)}
                  style={{ fontSize: '1rem', padding: '0.85rem 1rem 0.85rem 2.5rem', backgroundColor: '#FFFFFF', width: '100%', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
              
              <select 
                id="workplace-select"
                value={selectedWorkplaceId} 
                onChange={(e) => setSelectedWorkplaceId(e.target.value)}
                className="select-field"
                style={{ fontSize: '1.05rem', padding: '1rem', fontWeight: 500, backgroundColor: '#FFFFFF', cursor: 'pointer', width: '100%' }}
                required
              >
                <option value="" disabled>Selecionar posto...</option>
                {filteredWorkplaces.length > 0 ? (
                  filteredWorkplaces.map((wp) => (
                    <option key={wp.id} value={wp.id}>
                      {wp.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum posto encontrado</option>
                )}
              </select>
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
