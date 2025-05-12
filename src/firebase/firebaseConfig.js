// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de tu app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB-b8JYh2rVxyRoFxeyY9kqLhJotnL9V5k",
  authDomain: "devverse-43421.firebaseapp.com",
  projectId: "devverse-43421",
  storageBucket: "devverse-43421.appspot.com",
  messagingSenderId: "501865773874",
  appId: "1:501865773874:web:988fe53684e5dd9750752b",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
