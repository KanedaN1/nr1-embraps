import React from 'react';
import { X, Shield, Lock, EyeOff, CheckCircle2, FileText, Server } from 'lucide-react';

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LgpdModal: React.FC<LgpdModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 34, 68, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        className="card animate-fade-in" 
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          borderRadius: '20px',
          border: '2px solid #3399FF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div style={{
          background: 'linear-gradient(135deg, #002244 0%, #003B70 100%)',
          color: '#FFFFFF',
          padding: '1.75rem',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              padding: '0.75rem',
              borderRadius: '14px',
              border: '1px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={32} color="#10B981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem', color: '#FFFFFF' }}>
                Privacidade e Segurança Jurídica
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#EBF5FF', opacity: 0.9 }}>
                Como a Embraps e a tecnologia protegem 100% do seu anonimato
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Destaque de Respaldo Jurídico */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderLeft: '4px solid #0066CC',
            padding: '1.25rem',
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <FileText size={24} color="#0066CC" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#002244', fontWeight: 700, marginBottom: '0.35rem' }}>
                Conformidade Total com a LGPD (Lei nº 13.709/2018)
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                A coleta destes dados é regida pelos <strong>Artigos 7º (Inciso II) e 11º (Inciso II) da LGPD</strong>, 
                destinando-se exclusivamente ao cumprimento de obrigação legal e regulamentatória de 
                <strong> Saúde e Segurança do Trabalho (NR-1 / GRO / PGR)</strong> do Ministério do Trabalho e Emprego.
              </p>
            </div>
          </div>

          <h3 style={{ color: '#002244', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Lock size={20} color="#10B981" />
            Os 3 Pilares da Garantia de Anonimato
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            <div style={{ padding: '1.25rem', backgroundColor: '#F1F5F9', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#003B70', fontWeight: 600 }}>
                <Server size={20} color="#0066CC" />
                <span>Desacoplamento do RE</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                Seu número de RE é usado <strong>apenas como chave de acesso única</strong> no momento do login para garantir que cada colaborador responda apenas uma vez. Ao terminar, o sistema registra apenas <em>"Matrícula X participou"</em> em uma tabela, e salva o questionário em <strong>outra tabela anônima</strong>, sem nenhuma ligação entre elas!
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#F1F5F9', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#003B70', fontWeight: 600 }}>
                <EyeOff size={20} color="#10B981" />
                <span>Zero Rastreamento de IP</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                Nossa infraestrutura de banco de dados (Firebase Cloud) está configurada para <strong>não registrar o endereço IP</strong>, modelo do seu celular, computador ou navegador. Nem a equipe técnica de TI consegue rastrear de onde veio a resposta.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#F1F5F9', borderRadius: '14px', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#003B70', fontWeight: 600 }}>
                <CheckCircle2 size={20} color="#8B5CF6" />
                <span>Proteção Contra Retaliação (Dados Agregados)</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                A Diretoria da Embraps, o RH e a chefia imediata <strong>não recebem respostas individuais</strong>. O sistema gera unicamente gráficos e médias de notas por <em>Cargo</em> e por <em>Posto de Trabalho</em>. Se você responder sinceramente sobre pressão ou apoio da chefia, estará ajudando a empresa a implementar melhorias gerais sem nenhum risco à sua imagem profissional!
              </p>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button 
              onClick={onClose} 
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}
            >
              Compreendi e me sinto seguro(a)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
