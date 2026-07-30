import React from 'react';
import { Shield, Lock, LogOut, UserCheck, Smartphone } from 'lucide-react';
import type { CurrentUser } from '../types';

interface HeaderProps {
  currentUser: CurrentUser | null;
  onLogout: () => void;
  onOpenSecurityModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout, 
  onOpenSecurityModal
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SESMT': return <span className="badge badge-blue">Engenharia SESMT</span>;
      case 'DIRECTOR': return <span className="badge badge-green">Diretoria Executiva</span>;
      case 'ADMIN': return <span className="badge badge-yellow">Administrador</span>;
      case 'TEST': return <span className="badge badge-blue">Modo Teste Embraps</span>;
      default: return <span className="badge badge-green">Colaborador Embraps</span>;
    }
  };

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
              EMBRAPS
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#EBF5FF', opacity: 0.9, fontWeight: 400 }}>
              Gestão de Riscos Ocupacionais • NR-1 / PGR
            </p>
          </div>
        </div>

        {/* Botoes Centrais: Simulador Mobile & Selo LGPD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          


          {/* Security / Anonymity Badge (Trust Design) */}
          <div 
            onClick={onOpenSecurityModal}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.12)', 
              backdropFilter: 'blur(8px)', 
              padding: '0.45rem 0.9rem', 
              borderRadius: '9999px', 
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
            title="Clique para ver detalhes de segurança jurídica e anonimato"
          >
            <Lock size={15} color="#10B981" style={{ flexShrink: 0 }} />
            <span><strong style={{ color: '#FFFFFF' }}>100% Anônimo</strong> • LGPD</span>
            <Shield size={14} color="#3399FF" style={{ marginLeft: '0.2rem' }} />
          </div>

        </div>

        {/* User Info & Logout */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={16} />
                <span style={{ fontWeight: 600 }}>{currentUser.identifier}</span>
              </div>
              <div>{getRoleBadge(currentUser.role)}</div>
            </div>
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
          <div />

      </div>
    </header>
  );
};
