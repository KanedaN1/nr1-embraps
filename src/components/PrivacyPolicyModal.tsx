import React from 'react';
import { X, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          borderRadius: '20px',
          border: '2px solid #3399FF',
          backgroundColor: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              backgroundColor: 'rgba(51, 153, 255, 0.2)',
              padding: '0.75rem',
              borderRadius: '14px',
              border: '1px solid #3399FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={32} color="#3399FF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem', color: '#FFFFFF' }}>
                Política de Privacidade
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#EBF5FF', opacity: 0.9 }}>
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
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

        {/* Content */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          
          <p>
            A <strong>Embraps</strong> valoriza a sua privacidade e se compromete a proteger os dados pessoais de todos os colaboradores e usuários do <em>Sistema de Avaliação Psicossocial (NR-1)</em>.
            Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
          </p>

          <div>
            <h3 style={{ color: '#002244', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Coleta de Dados</h3>
            <p>
              Ao utilizar este sistema, coletamos exclusivamente as informações estritamente necessárias para a elaboração do Programa de Gerenciamento de Riscos (PGR) e cumprimento das normas da Secretaria de Inspeção do Trabalho. Isso inclui:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Suas respostas ao questionário de saúde e segurança;</li>
              <li>Seu Posto de Trabalho e Cargo;</li>
              <li>Sua Matrícula/RE (utilizada apenas como chave de acesso e controle de preenchimento, nunca vinculada às suas respostas).</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: '#002244', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Uso de Armazenamento Local (Cookies/LocalStorage)</h3>
            <p>
              O sistema utiliza a tecnologia de armazenamento local (<em>LocalStorage</em>) do seu navegador <strong>exclusivamente</strong> para garantir o funcionamento técnico da plataforma (como salvar temporariamente o progresso do questionário para que você não perca os dados em caso de desconexão).
              <br/><br/>
              Não utilizamos cookies de marketing, rastreadores de publicidade (como Facebook Pixel ou Google Analytics) ou qualquer ferramenta que monitore o seu comportamento na internet. Por se tratar de armazenamento "Estritamente Necessário", a coleta de consentimento prévio (banner de cookies) é dispensada.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#002244', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Garantia de Anonimato e Compartilhamento</h3>
            <p>
              Seus dados de respostas são armazenados de forma <strong>100% anônima e agregada</strong>.
              Nem a diretoria da empresa, nem a equipe de RH ou seus gestores diretos terão acesso às respostas individuais. Os dados são usados unicamente para gerar estatísticas gerais, médias por setor e relatórios consolidados exigidos por lei. Não vendemos, alugamos ou compartilhamos dados com terceiros para fins comerciais.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#002244', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Seus Direitos</h3>
            <p>
              Você tem o direito de solicitar informações sobre o tratamento de seus dados, e entrar em contato com o Encarregado de Proteção de Dados (DPO) da empresa a qualquer momento, conforme garantido pela LGPD.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button 
              onClick={onClose} 
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}
            >
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
