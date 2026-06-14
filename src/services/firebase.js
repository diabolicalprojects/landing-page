import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDSBLkqCZCLNG8anbB7de0IdSGds8976Mw",
    authDomain: "diabolical-logic-ai-2026.firebaseapp.com",
    projectId: "diabolical-logic-ai-2026",
    storageBucket: "diabolical-logic-ai-2026.firebasestorage.app",
    messagingSenderId: "996449272416",
    appId: "1:996449272416:web:46a959ec81d50e1991f905"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
