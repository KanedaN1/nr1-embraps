import React, { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LgpdModal } from './components/LgpdModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { LoginPage } from './components/LoginPage';
import { QuestionnaireSetup } from './components/QuestionnaireSetup';
import { QuestionnaireFlow } from './components/QuestionnaireFlow';
import { QuestionnaireSuccess } from './components/QuestionnaireSuccess';
import { Dashboard } from './components/Dashboard';
import { PgrReportView } from './components/PgrReportView';
import type { 
  CurrentUser, 
  Workplace, 
  JobPosition, 
  DimensionId, 
  QuestionnaireResponse 
} from './types';
import { INITIAL_RE_STATUS } from './data/mockData';
import { INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from './data/hseQuestions';
import './index.css';

type AppState = 'LOGIN' | 'SETUP' | 'QUESTIONNAIRE' | 'SUCCESS' | 'DASHBOARD' | 'REPORT';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);



  // Estado para os Setores e Cargos selecionados durante o fluxo do questionário
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace>(INITIAL_WORKPLACES[0]);
  const [selectedJob, setSelectedJob] = useState<JobPosition>(INITIAL_JOB_POSITIONS[0]);
  const [lastTotalAverage, setLastTotalAverage] = useState<number>(0);

  // Estado para qual Posto está sendo gerado o Relatório Oficial PGR / NR-1
  const [reportWorkplaceId, setReportWorkplaceId] = useState<string>(INITIAL_WORKPLACES[0].id);

  // Banco de Dados no Firebase Firestore com Fallback no LocalStorage
  const [responses, setResponses] = useState<QuestionnaireResponse[]>(() => {
    const saved = localStorage.getItem('embraps_hse_responses');
    if (!saved) return [];
    const parsed: QuestionnaireResponse[] = JSON.parse(saved);
    return parsed.filter(r => !r.id.startsWith('resp-mock-'));
  });

  const [reStatus, setReStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('embraps_hse_re_status');
    return saved ? JSON.parse(saved) : INITIAL_RE_STATUS;
  });

  useEffect(() => {
    localStorage.setItem('embraps_hse_responses', JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem('embraps_hse_re_status', JSON.stringify(reStatus));
  }, [reStatus]);

  // Carregar Dados da Nuvem (Firebase Firestore) ao iniciar
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        // 1. Buscar Respostas dos Questionários do Firestore
        const querySnapshot = await getDocs(collection(db, 'responses'));
        if (!querySnapshot.empty) {
          const cloudResponses: QuestionnaireResponse[] = [];
          querySnapshot.forEach((docSnap) => {
            cloudResponses.push(docSnap.data() as QuestionnaireResponse);
          });
          setResponses(cloudResponses);
        }

        // 2. Buscar Status dos REs do Firestore
        const reDocRef = doc(db, 're_status', 'global_status');
        const reDocSnap = await getDoc(reDocRef);
        if (reDocSnap.exists()) {
          setReStatus(reDocSnap.data() as Record<string, boolean>);
        }
      } catch (error) {
        console.warn("Aviso: Não foi possível conectar ao Firebase Firestore (usando dados locais):", error);
      }
    };

    fetchCloudData();
  }, []);

  // Scroll to top upon navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  // 1. Gerenciador de Login
  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    if (user.role === 'SESMT' || user.role === 'DIRECTOR' || user.role === 'ADMIN') {
      setAppState('DASHBOARD');
    } else {
      setAppState('SETUP');
    }
  };

  // 2. Gerenciador de Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('LOGIN');
  };

  // 3. Iniciar Questionário (após selecionar Posto e Cargo)
  const handleStartQuestionnaire = (workplace: Workplace, jobPosition: JobPosition) => {
    setSelectedWorkplace(workplace);
    setSelectedJob(jobPosition);
    setAppState('QUESTIONNAIRE');
  };

  // 4. Concluir Questionário e Enviar Dados (Anônimo e Desacoplado do RE!)
  const handleQuestionnaireComplete = async (
    dimensionScores: Record<DimensionId, number>, 
    totalAverage: number, 
    answers: Record<number, number>
  ) => {
    setLastTotalAverage(totalAverage);

    // Salva a resposta de forma ANÔNIMA (nenhum vínculo ao RE ou currentUser.identifier)
    const newResponse: QuestionnaireResponse = {
      id: `resp-live-${Date.now()}`,
      timestamp: new Date().toISOString(),
      workplaceId: selectedWorkplace.id,
      workplaceName: selectedWorkplace.name,
      jobPositionId: selectedJob.id,
      jobPositionName: selectedJob.name,
      answers,
      dimensionScores,
      totalAverage,
      employeeId: currentUser ? currentUser.identifier : undefined,
    };

    // Atualiza estado local
    setResponses(prev => [newResponse, ...prev]);

    // Envia resposta anônima para a nuvem (Firebase Firestore)
    try {
      await addDoc(collection(db, 'responses'), newResponse);
    } catch (e) {
      console.error("Erro ao enviar resposta para o Firebase Firestore:", e);
    }

    // Se for um colaborador com RE numérico, marca que esse RE já participou (para impedir 2ª resposta)
    if (currentUser && currentUser.role === 'COLLABORATOR' && /^\d+$/.test(currentUser.identifier)) {
      const updatedReStatus = {
        ...reStatus,
        [currentUser.identifier]: true
      };

      setReStatus(updatedReStatus);

      try {
        await setDoc(doc(db, 're_status', 'global_status'), updatedReStatus);
      } catch (e) {
        console.error("Erro ao atualizar status de RE no Firebase Firestore:", e);
      }
    }

    setAppState('SUCCESS');
  };

  // 5. Refazer Teste (Disponível apenas para TesteEmbraps ou Admin)
  const handleRestartTest = () => {
    setAppState('SETUP');
  };

  // 6. Excluir uma Resposta (Admin)
  const handleDeleteResponse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'responses', id));
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error("Erro ao excluir resposta no Firebase Firestore:", e);
      alert("Erro ao excluir. Verifique sua conexão ou permissões.");
    }
  };

  // 6. Abrir Relatório Oficial PGR / NR-1 para um Posto Específico
  const handleOpenReport = (workplaceId: string) => {
    setReportWorkplaceId(workplaceId);
    setAppState('REPORT');
  };

  // Renderizador do Conteúdo Principal da Aplicação
  const renderAppContent = () => (
    <>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {appState === 'LOGIN' && (
          <LoginPage 
            onLogin={handleLogin}
            reStatus={reStatus}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          />
        )}

        {appState === 'SETUP' && currentUser && (
          <QuestionnaireSetup 
            currentUser={currentUser}
            onStartQuestionnaire={handleStartQuestionnaire}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          />
        )}

        {appState === 'QUESTIONNAIRE' && (
          <QuestionnaireFlow 
            workplace={selectedWorkplace}
            jobPosition={selectedJob}
            onComplete={handleQuestionnaireComplete}
          />
        )}

        {appState === 'SUCCESS' && currentUser && (
          <QuestionnaireSuccess 
            currentUser={currentUser}
            workplace={selectedWorkplace}
            jobPosition={selectedJob}
            totalAverage={lastTotalAverage}
            onLogout={handleLogout}
            onRestartTest={currentUser.role === 'TEST' || currentUser.role === 'ADMIN' ? handleRestartTest : undefined}
          />
        )}

        {appState === 'DASHBOARD' && currentUser && (
          <Dashboard 
            currentUser={currentUser}
            responses={responses}
            onNavigateToQuestionnaire={currentUser.role === 'ADMIN' ? () => setAppState('SETUP') : undefined}
            onOpenReport={handleOpenReport}
            onDeleteResponse={handleDeleteResponse}
          />
        )}

        {appState === 'REPORT' && (
          <PgrReportView 
            workplace={
              reportWorkplaceId === 'ALL_CARGOS' 
                ? { id: 'ALL_CARGOS', name: 'Relatório Geral (Todos os Postos e Cargos)', code: 'ALL' } 
                : INITIAL_WORKPLACES.find(w => w.id === reportWorkplaceId) || INITIAL_WORKPLACES[0]
            }
            responses={responses}
            onClose={() => setAppState('DASHBOARD')}
          />
        )}
      </main>

      {/* Footer com Respaldo Jurídico e LGPD (Oculto na Impressão do Relatório PDF) */}
      <div className="no-print">
        <Footer 
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        />
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* Header com Branding Embraps (Logo Oficial) e Selo de Anonimato LGPD (Oculto na Impressão do Relatório PDF) */}
      <div className="no-print">
        <Header 
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        />
      </div>

      {renderAppContent()}

      {/* Modal de Segurança Legal e Anonimato */}
      <LgpdModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Modal da Política de Privacidade */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

    </div>
  );
};

export default App;
