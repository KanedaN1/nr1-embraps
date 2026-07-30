import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACLhcrLifV9grqvLLaLIUBAUJaoBUzQ6g",
  authDomain: "nr-1-embraps.firebaseapp.com",
  projectId: "nr-1-embraps",
  storageBucket: "nr-1-embraps.firebasestorage.app",
  messagingSenderId: "474769720565",
  appId: "1:474769720565:web:1925c6f2c4b94841e4b1bc",
  measurementId: "G-7H9HKJP05P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetDb() {
  console.log("Iniciando limpeza do Firebase...");
  
  try {
    const responsesSnap = await getDocs(collection(db, 'responses'));
    let deletedCount = 0;
    for (const d of responsesSnap.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
    console.log(`Deletados ${deletedCount} documentos da coleção 'responses'.`);

    await setDoc(doc(db, 're_status', 'global_status'), {});
    console.log(`Limpado o documento 'global_status' da coleção 're_status'.`);

    console.log("Limpeza concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    process.exit(1);
  }
}

resetDb();
