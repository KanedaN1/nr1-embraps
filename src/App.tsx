import React, { useState, useEffect } from 'react';
import { db, auth } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
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
  QuestionnaireResponse,
  Employee 
} from './types';
import { INITIAL_RE_STATUS } from './data/mockData';
import { INITIAL_WORKPLACES, INITIAL_JOB_POSITIONS } from './data/hseQuestions';
import { INITIAL_EMPLOYEES } from './data/mockEmployees';
import './index.css';

type AppState = 'LOGIN' | 'SETUP' | 'QUESTIONNAIRE' | 'SUCCESS' | 'DASHBOARD' | 'REPORT';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  // Estado da Trava do Questionário (Bloqueio Global)
  const [surveyLocked, setSurveyLocked] = useState<boolean>(false);

  // Estado da Base Cadastral de Colaboradores (RE + Ano Nascimento + Posto + Empresa + Cargo)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Estado para os Setores e Cargos selecionados durante o fluxo do questionário
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace>(INITIAL_WORKPLACES[0]);
  const [selectedJob, setSelectedJob] = useState<JobPosition>(INITIAL_JOB_POSITIONS[0]);
  const [lastTotalAverage, setLastTotalAverage] = useState<number>(0);

  // Estado para qual Posto ou CNPJ está sendo gerado o Relatório Oficial PGR / NR-1
  const [reportWorkplaceId, setReportWorkplaceId] = useState<string>(INITIAL_WORKPLACES[0].id);

  // Banco de Dados no Firebase Firestore
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);

  const [reStatus, setReStatus] = useState<Record<string, boolean>>(INITIAL_RE_STATUS);

  // Limpeza de chaves de localStorage antigas para evitar qualquer cache no navegador
  useEffect(() => {
    try {
      localStorage.removeItem('embraps_hse_responses');
      localStorage.removeItem('embraps_hse_re_status');
      localStorage.removeItem('embraps_hse_survey_locked');
      localStorage.removeItem('embraps_hse_employees');
    } catch (e) {
      console.warn("Aviso ao limpar localStorage:", e);
    }
  }, []);

  // Escutar em Tempo Real (Cloud Push WebSocket) com sincronia do Firebase Auth
  useEffect(() => {
    let unsubLock: (() => void) | undefined;
    let unsubRe: (() => void) | undefined;
    let unsubEmp: (() => void) | undefined;
    let unsubResponses: (() => void) | undefined;

    const attachFirestoreListeners = () => {
      // Limpar ouvintes prévios se já existirem
      if (unsubLock) unsubLock();
      if (unsubRe) unsubRe();
      if (unsubEmp) unsubEmp();
      if (unsubResponses) unsubResponses();

      // 1. Trava do Questionário em Tempo Real (na coleção permitida 're_status')
      unsubLock = onSnapshot(doc(db, 're_status', 'survey_control'), (docSnap) => {
        if (docSnap.exists()) {
          setSurveyLocked(!!docSnap.data().locked);
        }
      }, (error) => {
        console.warn("Aviso ao escutar trava no Firestore:", error);
      });

      // 2. Status dos REs em Tempo Real
      unsubRe = onSnapshot(doc(db, 're_status', 'global_status'), (docSnap) => {
        if (docSnap.exists()) {
          setReStatus(docSnap.data() as Record<string, boolean>);
        }
      }, (error) => {
        console.warn("Aviso ao escutar status de REs no Firestore:", error);
      });

      // 3. Base de Colaboradores em Tempo Real (na coleção permitida 're_status')
      unsubEmp = onSnapshot(doc(db, 're_status', 'employees_data'), (docSnap) => {
        if (docSnap.exists() && Array.isArray(docSnap.data().employees)) {
          const cloudEmps = docSnap.data().employees;
          if (cloudEmps.length >= INITIAL_EMPLOYEES.length) {
            setEmployees(cloudEmps);
          }
        }
      }, (error) => {
        console.warn("Aviso ao escutar colaboradores no Firestore:", error);
      });

      // 4. Respostas dos Questionários em Tempo Real (Diretor, SESMT, Admin)
      unsubResponses = onSnapshot(collection(db, 'responses'), (querySnapshot) => {
        const cloudResponses: QuestionnaireResponse[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as QuestionnaireResponse;
          cloudResponses.push({
            ...data,
            id: docSnap.id
          });
        });
        setResponses(cloudResponses);
      }, (error) => {
        console.warn("Aviso ao escutar respostas no Firestore:", error);
      });
    };

    // Reacoplar ouvintes sempre que o estado de autenticação do Firebase mudar (Login de Admin, Diretor, SESMT ou Anônimo)
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Se desautenticado, tentar login anônimo para assegurar token ativo de leitura
        signInAnonymously(auth).catch((err) => console.warn("Aviso ao realizar login anônimo:", err));
      }
      attachFirestoreListeners();
    });

    return () => {
      unsubAuth();
      if (unsubLock) unsubLock();
      if (unsubRe) unsubRe();
      if (unsubEmp) unsubEmp();
      if (unsubResponses) unsubResponses();
    };
  }, []);

  // Alternar Trava do Questionário (Admin / SESMT) com sincronização em nuvem na coleção permitida 're_status'
  const handleToggleLock = async () => {
    const newLocked = !surveyLocked;
    setSurveyLocked(newLocked);
    try {
      await setDoc(doc(db, 're_status', 'survey_control'), { locked: newLocked }, { merge: true });
    } catch (e: any) {
      console.error("Erro ao atualizar trava no Firebase Firestore:", e);
      setSurveyLocked(!newLocked);
      alert(`Não foi possível alterar a trava no banco de dados. Motivo: ${e?.message || 'Verifique suas permissões no Firebase.'}`);
    }
  };

  // Atualizar Lista de Colaboradores (Importação pelo Admin) na coleção permitida 're_status'
  const handleImportEmployees = async (newEmps: Employee[]) => {
    setEmployees(newEmps);
    try {
      await setDoc(doc(db, 're_status', 'employees_data'), { employees: newEmps }, { merge: true });
    } catch (e) {
      console.error("Erro ao salvar colaboradores no Firebase Firestore:", e);
    }
  };


  // Scroll to top upon navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  // 1. Gerenciador de Login
  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    if (user.role === 'SESMT' || user.role === 'DIRECTOR' || user.role === 'ADMIN') {
      setAppState('DASHBOARD');
    } else if (user.role === 'COLLABORATOR' && user.employee) {
      // Direcionamento direto para o questionário com os dados cadastrados!
      const emp = user.employee;
      const matchedWp = INITIAL_WORKPLACES.find(
        w => w.name.trim().toLowerCase() === emp.workplace.trim().toLowerCase()
      ) || {
        id: `wp-${emp.workplace.toLowerCase().replace(/\s+/g, '-')}`,
        name: emp.workplace,
        code: 'P000'
      };

      const matchedJob = INITIAL_JOB_POSITIONS.find(
        j => j.name.trim().toLowerCase() === emp.jobPosition.trim().toLowerCase()
      ) || {
        id: `job-${emp.jobPosition.toLowerCase().replace(/\s+/g, '-')}`,
        name: emp.jobPosition,
        category: 'Operacional'
      };

      setSelectedWorkplace(matchedWp);
      setSelectedJob(matchedJob);
      setAppState('QUESTIONNAIRE');
    } else {
      setAppState('SETUP');
    }
  };

  // 2. Gerenciador de Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Erro ao fazer logout no Firebase:", e);
    }
    setCurrentUser(null);
    setAppState('LOGIN');
  };

  // 3. Iniciar Questionário (caso seletor manual seja usado)
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
    if (surveyLocked) {
      alert("O período do questionário foi bloqueado pela administração e não aceita novos envios.");
      return;
    }

    setLastTotalAverage(totalAverage);

    const userCompany = currentUser?.company || currentUser?.employee?.company || 'EMBRAPS';

    // Salva a resposta de forma ANÔNIMA vinculada ao Posto, Cargo e CNPJ
    const newResponse: QuestionnaireResponse = {
      id: `resp-live-${Date.now()}`,
      timestamp: new Date().toISOString(),
      workplaceId: selectedWorkplace.id,
      workplaceName: selectedWorkplace.name,
      jobPositionId: selectedJob.id,
      jobPositionName: selectedJob.name,
      company: userCompany,
      answers,
      dimensionScores,
      totalAverage,
      employeeId: currentUser ? currentUser.identifier : undefined,
    };

    // Atualiza estado local
    setResponses(prev => [newResponse, ...prev]);

    // Envia resposta anônima para a nuvem usando setDoc com o ID do documento explícito
    try {
      await setDoc(doc(db, 'responses', newResponse.id), newResponse);
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

  // 5. Refazer Teste (Disponível apenas para Admin ou Teste)
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

  // 7. Abrir Relatório Oficial PGR / NR-1
  const handleOpenReport = (targetId: string) => {
    setReportWorkplaceId(targetId);
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
            surveyLocked={surveyLocked}
            employees={employees}
          />
        )}

        {appState === 'SETUP' && currentUser && (
          <QuestionnaireSetup 
            currentUser={currentUser}
            onStartQuestionnaire={handleStartQuestionnaire}
            surveyLocked={surveyLocked}
          />
        )}

        {appState === 'QUESTIONNAIRE' && (
          <QuestionnaireFlow 
            workplace={selectedWorkplace}
            jobPosition={selectedJob}
            onComplete={handleQuestionnaireComplete}
            surveyLocked={surveyLocked}
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
            surveyLocked={surveyLocked}
            onToggleLock={handleToggleLock}
            employees={employees}
            onImportEmployees={handleImportEmployees}
          />
        )}

        {appState === 'REPORT' && (
          <PgrReportView 
            workplace={
              reportWorkplaceId === 'ALL_CARGOS_EMBRAPS' 
                ? { id: 'ALL_CARGOS_EMBRAPS', name: 'Relatório Geral de Cargos — EMBRAPS', code: 'EMBRAPS' } 
                : reportWorkplaceId === 'ALL_CARGOS_RM_QUARESMA'
                ? { id: 'ALL_CARGOS_RM_QUARESMA', name: 'Relatório Geral de Cargos — RM QUARESMA', code: 'RM_QUARESMA' }
                : reportWorkplaceId === 'ALL_CARGOS'
                ? { id: 'ALL_CARGOS', name: 'Relatório Geral (Todos os Postos e Cargos)', code: 'ALL' }
                : INITIAL_WORKPLACES.find(w => w.id === reportWorkplaceId) || INITIAL_WORKPLACES[0]
            }
            responses={responses}
            employees={employees}
            onClose={() => setAppState('DASHBOARD')}
          />
        )}
      </main>

      {/* Footer com Respaldo Jurídico e LGPD */}
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
      
      {/* Header com Branding Embraps / RM Quaresma e Trava de Questionário */}
      <div className="no-print">
        <Header 
          currentUser={currentUser}
          onLogout={handleLogout}
          surveyLocked={surveyLocked}
          onToggleLock={handleToggleLock}
        />
      </div>

      {renderAppContent()}

      {/* Modal de Segurança Legal e Anonimato */}
      <LgpdModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <PrivacyPolicyModal 
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />


    </div>
  );
};

export default App;



