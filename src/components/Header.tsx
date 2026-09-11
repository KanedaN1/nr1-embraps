import React from 'react';
import { LogOut, Lock, Unlock } from 'lucide-react';
import type { CurrentUser } from '../types';

interface HeaderProps {
  currentUser: CurrentUser | null;
  onLogout: () => void;
  surveyLocked?: boolean;
  onToggleLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout,
  surveyLocked = false,
  onToggleLock
}) => {
  return (
    <header style={{ 
      background: 'linear-gradient(90deg, #002244 0%, #003B70 50%, #005B9A 100%)', 
      color: '#FFFFFF',
      boxShadow: '0 4px 20px rgba(0, 34, 68, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '0.85rem', 
        paddingBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        {/* Logo da Empresa & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '46px'
          }}>
            <img 
              src="/assets/img/logo.png" 
              alt="Logo Embraps" 
              style={{ maxHeight: '38px', maxWidth: '140px', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback caso a imagem não carregue
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerText = 'EMBRAPS';
                  e.currentTarget.parentElement.style.color = '#003B70';
                  e.currentTarget.parentElement.style.fontWeight = '800';
                }
              }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              EMBRAPS / RM QUARESMA
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#EBF5FF', opacity: 0.9, fontWeight: 400 }}>
              Gestão de Riscos Ocupacionais • NR-1 / PGR
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Botão de Trava de Questionário para ADMIN e SESMT */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'SESMT') && onToggleLock && (
              <button
                onClick={onToggleLock}
                style={{
                  backgroundColor: surveyLocked ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                title={surveyLocked ? "Clique para destravar o questionário" : "Clique para travar o questionário"}
              >
                {surveyLocked ? <Lock size={15} /> : <Unlock size={15} />}
                <span>{surveyLocked ? 'Questionário Bloqueado' : 'Questionário Liberado'}</span>
              </button>
            )}

            <button 
              onClick={onLogout} 
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        ) : null}

      </div>
    </header>
  );
};

