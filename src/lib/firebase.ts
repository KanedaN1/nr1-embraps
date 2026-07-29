import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACLhcrLifV9grqvLLaLIUBAUJaoBUzQ6g",
  authDomain: "nr-1-embraps.firebaseapp.com",
  projectId: "nr-1-embraps",
  storageBucket: "nr-1-embraps.firebasestorage.app",
  messagingSenderId: "474769720565",
  appId: "1:474769720565:web:1925c6f2c4b94841e4b1bc",
  measurementId: "G-7H9HKJP05P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
