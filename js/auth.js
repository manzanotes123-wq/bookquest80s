// js/auth.js
import { auth, provider } from "./firebaseConfig.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const btnLogin = $("btnLogin");
const btnRegister = $("btnRegister");
const btnGoogle = $("btnGoogle");
const clickSound = document.getElementById("clickSound");

btnLogin?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
});

btnRegister?.addEventListener("click", async () => {
  clickSound?.play();
  const email = $("email").value.trim();
  const pass = $("password").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Cuenta creada correctamente");
  } catch (err) {
    alert("Error: " + err.message);
  }
});

btnGoogle?.addEventListener("click", async () => {
  clickSound?.play();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Error con Google: " + err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user && location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }
});
