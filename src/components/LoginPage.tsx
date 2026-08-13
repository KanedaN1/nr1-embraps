import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CurrentUser } from '../types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface LoginPageProps {
  onLogin: (user: CurrentUser) => void;
  reStatus: Record<string, boolean>;
  onOpenSecurityModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, reStatus, onOpenSecurityModal }) => {
  const [loginMode, setLoginMode] = useState<'RE' | 'ADMIN'>('RE');
  
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (loginMode === 'RE') {
      const cleanId = identifier.trim();

      if (!cleanId || !/^\d+$/.test(cleanId)) {
        setErrorMsg('Por favor, informe apenas os números da sua matrícula (RE).');
        return;
      }

      if (reStatus[cleanId] === true) {
        setSuccessMsg(`O colaborador da matrícula RE "${cleanId}" já concluiu o questionário NR-1/PGR desta etapa! Agradecemos imensamente sua colaboração para o nosso ambiente de trabalho.`);
        return;
      }

      onLogin({ identifier: cleanId, role: 'COLLABORATOR', name: `Colaborador RE ${cleanId}` });
    } else {
      if (!email || !password) {
        setErrorMsg('Por favor, preencha e-mail e senha.');
        return;
      }

      setIsLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userEmail = userCredential.user.email?.toLowerCase() || '';
        
        if (userEmail.includes('admin')) {
          onLogin({ identifier: 'Admin', role: 'ADMIN', name: 'Administrador Geral' });
        } else if (userEmail.includes('diretor')) {
          onLogin({ identifier: 'Diretor', role: 'DIRECTOR', name: 'Diretoria Executiva Embraps' });
        } else if (userEmail.includes('sesmt')) {
          onLogin({ identifier: 'SESMT', role: 'SESMT', name: 'Engenharia e Segurança (SESMT)' });
        } else {
          onLogin({ identifier: 'Admin', role: 'ADMIN', name: 'Gestor' });
        }
      } catch (error: any) {
        console.error(error);
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais no Firebase.');
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="setup-page-wrapper">
      <div className="container" style={{ maxWidth: '980px' }}>
        
        {/* Card Principal - Glassmorphism Branco & Azul */}
        <div className="card setup-card">
          
          <div className="login-grid-container">
            
            {/* Lado Esquerdo: Hero & Logo da Empresa */}
            <div className="login-left-panel">
              {/* Exibição Oficial da Logo da Empresa */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src="/assets/img/logo.png" 
                  alt="Embraps Logo" 
                  style={{ maxHeight: '54px', maxWidth: '200px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#EBF5FF', color: '#0066CC', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem' }}>
                <Shield size={16} />
                <span>Norma Regulamentadora 1 (NR-1 / GRO)</span>
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#002244', lineHeight: 1.2, marginBottom: '1rem' }}>
                Questionário de Avaliação Psicossocial
              </h2>
              
              <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Sua voz constrói uma empresa mais segura e acolhedora. Responda com sinceridade às 40 questões do padrão internacional <strong>HSE</strong> / <strong>COPSOQ II</strong> para melhorarmos o ambiente nas nossas equipes.
              </p>

              {/* Destaque de Segurança Anônima */}
              <div 
                onClick={onOpenSecurityModal}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: '#D1FAE5', padding: '0.6rem', borderRadius: '12px', color: '#10B981', flexShrink: 0 }}>
                    <Lock size={22} />
                  </div>
                  <div>
                    <h4 style={{ color: '#002244', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Garantia de Sigilo Total (LGPD)
                      <span style={{ fontSize: '0.75rem', color: '#0066CC', textDecoration: 'underline', fontWeight: 500 }}>Saiba mais</span>
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Seu RE é usado <strong>somente para evitar duplicação</strong>. Suas respostas são 100% anônimas.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Lado Direito: Formulário de Entrada */}
            <div className="login-right-panel">
              {/* Abas de Navegação (Colaborador vs Gestão) */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#F1F5F9', padding: '0.35rem', borderRadius: '12px' }}>
                <button 
                  type="button"
                  onClick={() => { setLoginMode('RE'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', backgroundColor: loginMode === 'RE' ? '#FFFFFF' : 'transparent', color: loginMode === 'RE' ? '#0F172A' : '#64748B', boxShadow: loginMode === 'RE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                  Sou Colaborador
                </button>
                <button 
                  type="button"
                  onClick={() => { setLoginMode('ADMIN'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', backgroundColor: loginMode === 'ADMIN' ? '#FFFFFF' : 'transparent', color: loginMode === 'ADMIN' ? '#0F172A' : '#64748B', boxShadow: loginMode === 'ADMIN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                  Acesso Gestão
                </button>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#002244', marginBottom: '0.4rem' }}>
                {loginMode === 'RE' ? 'Acesso à Avaliação' : 'Acesso Restrito'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
                {loginMode === 'RE' ? 'Digite sua Matrícula (RE) para prosseguir.' : 'Insira seu e-mail e senha corporativos.'}
              </p>

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {loginMode === 'RE' ? (
                  <div>
                    <label htmlFor="re-input" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#334155', marginBottom: '0.4rem' }}>
                      Número de Matrícula (RE):
                    </label>
                    <input 
                      id="re-input"
                      type="text" 
                      placeholder="Ex: 1006" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '1.1rem', padding: '0.85rem 1rem', fontWeight: 600 }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="email-input" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#334155', marginBottom: '0.4rem' }}>
                        E-mail Corporativo:
                      </label>
                      <input 
                        id="email-input"
                        type="email" 
                        placeholder="admin@embraps.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '1rem', padding: '0.85rem 1rem', fontWeight: 500 }}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label htmlFor="password-input" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#334155', marginBottom: '0.4rem' }}>
                        Senha:
                      </label>
                      <input 
                        id="password-input"
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '1rem', padding: '0.85rem 1rem', fontWeight: 500 }}
                      />
                    </div>
                  </>
                )}

                {errorMsg && (
                  <div className="animate-fade-in" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '10px', color: '#991B1B', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="animate-fade-in" style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981', padding: '0.85rem', borderRadius: '10px', color: '#065F46', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', lineHeight: 1.4 }}>
                    <CheckCircle2 size={22} style={{ flexShrink: 0, color: '#10B981' }} />
                    <div>{successMsg}</div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.25rem', opacity: isLoading ? 0.7 : 1 }}
                >
                  <span>{isLoading ? 'Autenticando...' : (loginMode === 'RE' ? 'Acessar Avaliação' : 'Entrar no Painel')}</span>
                  {!isLoading && <ArrowRight size={20} />}
                </button>
              </form>


            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
