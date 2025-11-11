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

// 🔹 Función para registrar usuario en Firestore
async function registrarUsuarioEnFirestore(user) {
  if (!user) return;
  const ref = doc(db, "usuarios", user.uid);

  try {
    const existe = await getDoc(ref);
    if (!existe.exists()) {
      await setDoc(ref, {
        nombre: user.displayName || "Nuevo lector",
        correo: user.email,
        xp: 0,
        fechaRegistro: new Date().toISOString()
      });
      console.log("✅ Usuario registrado en Firestore");
    } else {
      console.log("ℹ️ Usuario ya existía en Firestore");
    }
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
  }
}

// 🔹 Atajos de elementos
const $ = (id) => document.getElementById(id);
const btnLogin = $("btnLogin");
const btnRegister = $("btnRegister");
const btnGoogle = $("btnGoogle");
const clickSound = document.getElementById("clickSound");

// 🔹 Iniciar sesión con correo y contraseña
btnLogin?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await registrarUsuarioEnFirestore(user);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// 🔹 Crear cuenta con correo
btnRegister?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await registrarUsuarioEnFirestore(user);
    alert("✅ Cuenta creada correctamente");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// 🔹 Login con Google
btnGoogle?.addEventListener("click", async () => {
  clickSound?.play();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await registrarUsuarioEnFirestore(user);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Error con Google: " + err.message);
  }
});

// 🔹 Redirigir automáticamente si ya está logueado
onAuthStateChanged(auth, (user) => {
  if (user && location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }
});

