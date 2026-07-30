import React, { useEffect } from 'react';
import { CheckCircle2, Shield, LogOut, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Workplace, JobPosition, CurrentUser } from '../types';

interface QuestionnaireSuccessProps {
  currentUser: CurrentUser;
  workplace?: Workplace;
  jobPosition?: JobPosition;
  totalAverage?: number;
  onLogout: () => void;
  onRestartTest?: () => void;
}

export const QuestionnaireSuccess: React.FC<QuestionnaireSuccessProps> = ({ 
  currentUser,

  onLogout,
  onRestartTest
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0066CC', '#10B981', '#3399FF', '#F59E0B']
      });
    } catch (e) {
      console.log('Confetti opcional não carregado.');
    }
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        
        <div className="card animate-fade-in" style={{ padding: '3.5rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0, 34, 68, 0.15)' }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: '#D1FAE5', 
            color: '#10B981',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
            animation: 'pulse-slow 3s infinite'
          }}>
            <CheckCircle2 size={44} />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#002244', marginBottom: '0.75rem' }}>
            Questionário Concluído!
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '1.5rem', maxWidth: '560px', margin: '0 auto' }}>
            Muito obrigado, <strong style={{ color: '#003B70' }}>{currentUser.name || currentUser.identifier}</strong>! Suas respostas foram criptografadas e enviadas ao banco de dados com segurança.
          </p>

          {/* Card de Respaldo LGPD Pós-Envio */}
          <div style={{ backgroundColor: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#003B70', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
              <Shield size={20} color="#10B981" />
              <span>Garantia de Desacoplamento Concluída (LGPD)</span>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
              O sistema acabou de realizar uma operação segura em nosso servidor:
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', paddingLeft: '1.5rem' }}>
              <li>
                <strong>Tabela de Matrículas (RE):</strong> Registrou que o colaborador participou para evitar duplicação no futuro.
              </li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
              <span>Nenhum colaborador tem acesso técnico para rastrear a autoria deste envio.</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={onLogout} 
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}
            >
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>

            {currentUser.role === 'TEST' && onRestartTest && (
              <button 
                onClick={onRestartTest} 
                className="btn btn-secondary"
                style={{ padding: '1rem 1.75rem', fontSize: '1.05rem' }}
              >
                <RefreshCw size={18} />
                <span>Refazer Teste (Modo TesteEmbraps)</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
