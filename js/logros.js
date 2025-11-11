// js/logros.js
import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export async function calcularLogros() {
  const snap = await getDocs(collection(db, "libros"));
  let totalXP = 0;
  let librosLeidos = 0;

  snap.forEach(doc => {
    const data = doc.data();
    totalXP += data.xp || 0;
    if ((data.estado || "").toLowerCase() === "leido") librosLeidos++;
  });

  const nivel = obtenerNivel(totalXP);
  const contenedor = document.getElementById("panelLogros");
  if (!contenedor) return;
  const porcentaje = Math.min(totalXP / 6, 100);

  contenedor.innerHTML = `
    <p>Libros leídos: <b>${librosLeidos}</b></p>
    <p>Experiencia total: <b>${totalXP}</b> XP</p>
    <p>Nivel actual: <b>${nivel}</b></p>
    <div class="barra-xp"><div class="xp" style="width:${porcentaje}%"></div></div>
  `;
}

function obtenerNivel(xp) {
  if (xp < 100) return "📗 Novato Retro";
  if (xp < 300) return "📘 Explorador Literario";
  if (xp < 600) return "📙 Héroe del Saber";
  return "📕 Maestro del Neón";
}
