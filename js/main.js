// js/main.js
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { 
  collection, getDocs, addDoc, serverTimestamp, query, orderBy,
  doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { calcularLogros } from "./logros.js";
import { generarFrase } from "./ia.js";

const $ = (id) => document.getElementById(id);
const lista = $("listaLibros");
const btnLogout = $("btnLogout");
const btnAddDemo = $("btnAddDemo");
const btnFrase = $("btnFraseIA");
const btnExportCSV = $("btnExportCSV");
const btnExportPDF = $("btnExportPDF");

const filtroGenero = $("filtroGenero");
const filtroEstado = $("filtroEstado");

btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

btnAddDemo?.addEventListener("click", async () => {
  try {
    await addDoc(collection(db, "libros"), {
      titulo: "1984",
      autor: "George Orwell",
      xp: 120,
      genero: "clasico",
      estado: "pendiente",
      createdAt: serverTimestamp()
    });
    await cargarLibros();
    await calcularLogros();
    alert("Libro demo agregado. ¡Sigue leyendo, viajero del neón!");
  } catch (e) {
    alert("No se pudo agregar el libro demo: " + e.message);
  }
});

btnFrase?.addEventListener("click", async () => {
  btnFrase.disabled = true;
  btnFrase.textContent = "Generando...";
  try {
    const libros = document.querySelectorAll(".card[data-title]");
    const titulo = libros.length ? libros[Math.floor(Math.random()*libros.length)].dataset.title : "tu último libro";
    const frase = await generarFrase(titulo);
    $("fraseIA").innerText = frase;
  } catch (e) {
    $("fraseIA").innerText = "No fue posible generar la frase en este momento.";
  } finally {
    btnFrase.disabled = false;
    btnFrase.textContent = "🎤 Frase motivadora IA";
  }
});

filtroGenero?.addEventListener("change", cargarLibros);
filtroEstado?.addEventListener("change", cargarLibros);

btnExportCSV?.addEventListener("click", exportCSV);
btnExportPDF?.addEventListener("click", exportPDF);

async function cargarLibros() {
  const q = query(collection(db, "libros"), orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  lista.innerHTML = "";
  const g = filtroGenero?.value || "todos";
  const e = filtroEstado?.value || "todos";

  snap.forEach(d => {
    const data = d.data();
    if (g !== "todos" && data.genero !== g) return;
    if (e !== "todos" && data.estado !== e) return;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.title = data.titulo || "Libro";

    card.innerHTML = `
      <h3>${data.titulo || "Libro sin título"}</h3>
      <p><b>Autor:</b> ${data.autor || "N/D"}</p>
      <p><b>Género:</b> ${data.genero || "N/D"}</p>
      <p><b>Estado:</b> ${data.estado || "N/D"}</p>
      <p><b>XP:</b> ${data.xp || 0}</p>
      <button class="btnRead" data-id="${d.id}">📖 Marcar como leído</button>
    `;

    lista.appendChild(card);

    card.querySelector(".btnRead").addEventListener("click", async (ev) => {
      const id = ev.target.dataset.id;
      try {
        const ref = doc(db, "libros", id);
        await updateDoc(ref, { 
          xp: (data.xp || 0) + 100,
          estado: "leido"
        });
        new Audio("assets/sounds/levelup.wav").play();
        await cargarLibros();
        await calcularLogros();
        alert("¡Has ganado 100 XP y el libro pasó a 'leído'!");
      } catch (err) {
        alert("Error al actualizar XP/estado: " + err.message);
      }
    });
  });
}

async function exportCSV() {
  const snap = await getDocs(collection(db, "libros"));
  let csv = "Título,Autor,Género,Estado,XP\n";
  snap.forEach(d => {
    const x = d.data();
    csv += `"${(x.titulo||"").replace('"','""')}","${(x.autor||"").replace('"','""')}",` +
           `"${x.genero||""}","${x.estado||""}",${x.xp||0}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "BookQuest80s.csv";
  a.click();
}

async function exportPDF() {
  const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const docPDF = new jsPDF();
  docPDF.text("📚 Reporte de Libros - Aventura Literaria 80s", 10, 10);
  const snap = await getDocs(collection(db, "libros"));
  let y = 20;
  snap.forEach(d => {
    const x = d.data();
    const line = `${x.titulo||"?"} - ${x.autor||"?"} [${x.genero||"?"}/${x.estado||"?"}] (${x.xp||0} XP)`;
    docPDF.text(line, 10, y);
    y += 10;
    if (y > 280) { docPDF.addPage(); y = 10; }
  });
  docPDF.save("BookQuest80s.pdf");
}

// Guardián de sesión y carga inicial
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  await cargarLibros();
  await calcularLogros();
});
