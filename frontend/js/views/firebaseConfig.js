import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcsWWH-0ENmybRTdMw-5t5B7YVsXBlEdA",
  authDomain: "learnpoint-9b0b6.firebaseapp.com",
  projectId: "learnpoint-9b0b6",
  storageBucket: "learnpoint-9b0b6.firebasestorage.app",
  messagingSenderId: "132246947085",
  appId: "1:132246947085:web:b8f40b9d939fb4353a1c44",
  measurementId: "G-MZHHRYK2BP",
};
// Inicializate Firebase
const app = initializeApp(firebaseConfig);
// Export DB
export const db = getFirestore(app);