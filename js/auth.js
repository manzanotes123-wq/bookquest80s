// js/auth.js
import { auth, provider, db } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// --------------------------------------------------
// 🔹 Función: registrar usuario en Firestore
// --------------------------------------------------
async function registrarUsuarioEnFirestore(user) {
  if (!user) return;

  const ref = doc(db, "usuarios", user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        nombre: user.displayName || "Nuevo lector",
        correo: user.email || "sin-correo",
        xp: 0,
        fechaRegistro: new Date().toISOString()
      });
      console.log("✅ Usuario registrado en Firestore:", user.uid);
    } else {
      console.log("ℹ️ Usuario ya existía en Firestore:", user.uid);
    }
  } catch (error) {
    console.error("❌ Error al registrar usuario en Firestore:", error);
  }
}

// --------------------------------------------------
// 🔹 Referencias a elementos del DOM
// --------------------------------------------------
const $ = (id) => document.getElementById(id);
const btnLogin = $("btnLogin");
const btnRegister = $("btnRegister");
const btnGoogle = $("btnGoogle");
const clickSound = document.getElementById("clickSound");

// --------------------------------------------------
// 🔹 Iniciar sesión (email + password)
// --------------------------------------------------
btnLogin?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();

  if (!email || !pass) return alert("Por favor, llena ambos campos.");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await registrarUsuarioEnFirestore(user);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("⚠️ Error al iniciar sesión: " + err.message);
  }
});

// --------------------------------------------------
// 🔹 Crear cuenta nueva
// --------------------------------------------------
btnRegister?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();

  if (!email || !pass) return alert("Completa el correo y la contraseña.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await registrarUsuarioEnFirestore(user);
    alert("✅ Cuenta creada correctamente. ¡Bienvenido a BookQuest 80s!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("⚠️ Error al crear cuenta: " + err.message);
  }
});

// --------------------------------------------------
// 🔹 Login con Google
// --------------------------------------------------
btnGoogle?.addEventListener("click", async () => {
  clickSound?.play();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await registrarUsuarioEnFirestore(user);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("⚠️ Error al ingresar con Google: " + err.message);
  }
});

// --------------------------------------------------
// 🔹 Redirección automática si ya está logueado
// --------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (user && location.pathname.endsWith("index.html")) {
    await registrarUsuarioEnFirestore(user); // Garantiza que esté en Firestore
    window.location.href = "dashboard.html";
  }
});

