import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDi4Nn-VYxeiIObWEoXNTt_P-Mc9Ad_-UY",
  authDomain: "aventuraliteraria80s.firebaseapp.com",
  projectId: "aventuraliteraria80s",
  storageBucket: "aventuraliteraria80s.appspot.com",
  messagingSenderId: "887428899365",
  appId: "1:887428899365:web:8d17f7ceda3661de793ecc",
  measurementId: "G-80C4FLH2G"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);