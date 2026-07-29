import React from 'react';
import { Shield, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  onOpenSecurityModal: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSecurityModal, onOpenPrivacyPolicy }) => {
  return (
    <footer style={{ 
      backgroundColor: '#002244', 
      color: '#CBD5E1', 
      paddingTop: '2.5rem', 
      paddingBottom: '2.5rem',
      borderTop: '4px solid #0066CC',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="#3399FF" />
              Sistema de Avaliação Psicossocial • Embraps
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '600px' }}>
              Esta plataforma atende aos requisitos de Saúde e Segurança do Trabalho (NR-1 / GRO / PGR) 
              da Secretaria de Inspeção do Trabalho, preservando o anonimato dos colaboradores.
            </p>
          </div>

          <button 
            onClick={onOpenSecurityModal}
            style={{
              backgroundColor: 'rgba(0, 102, 204, 0.25)',
              color: '#FFFFFF',
              border: '1px solid #3399FF',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.45)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.25)'}
          >
            <HelpCircle size={18} color="#10B981" />
            Como garantimos sua privacidade na LGPD?
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={14} />
            <span>Conformidade Jurídica: Lei nº 13.709/2018 (LGPD) - Art. 7º, inciso II e Art. 11º, inciso II.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={onOpenPrivacyPolicy}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                padding: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              Política de Privacidade
            </button>
            <span>&copy; {new Date().getFullYear()} Embraps • Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
