// ==================================================
// 🧠 js/logros.js — versión corregida (BookQuest 80s)
// ==================================================

import { auth, db } from "./firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export async function calcularLogros() {
  const user = auth.currentUser;
  if (!user) return; // 🧱 Asegurar que haya sesión iniciada

  // 🔹 Leer los libros solo del usuario actual
  const snap = await getDocs(collection(db, "usuarios", user.uid, "libros"));
  let totalXP = 0;
  let librosLeidos = 0;

  snap.forEach((doc) => {
    const data = doc.data();
    totalXP += data.xp || 0;
    if ((data.estado || "").toLowerCase() === "leído" || (data.estado || "").toLowerCase() === "leido") {
      librosLeidos++;
    }
  });

  // 🔹 Calcular nivel
  const nivel = obtenerNivel(totalXP);

  // 🔹 Actualizar panel
  const contenedor = document.getElementById("panelLogros");
  if (!contenedor) return;

  const porcentaje = Math.min((totalXP / 2000) * 100, 100); // 2000 XP = 100%

  contenedor.innerHTML = `
    <h3>🎮 Progreso del Jugador</h3>
    <p>Libros leídos: <b>${librosLeidos}</b></p>
    <p>Experiencia total: <b>${totalXP}</b> XP</p>
    <p>Nivel actual: <b>${nivel}</b></p>
    <div class="barra-xp">
      <div class="xp" style="width:${porcentaje}%"></div>
    </div>
  `;
}

// --------------------------------------------------
// 🔹 Determinar el nivel según XP
// --------------------------------------------------
function obtenerNivel(xp) {
  if (xp < 100) return "📗 Novato Retro";
  if (xp < 300) return "📘 Explorador Literario";
  if (xp < 600) return "📙 Héroe del Saber";
  if (xp < 1200) return "📕 Maestro del Neón";
  return "🏆 Sabio Interestelar";
}
