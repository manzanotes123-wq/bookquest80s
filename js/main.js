// ==================================================
// 🕹️ Aventura Literaria 80s - Main Script (FINAL v2)
// ==================================================

import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  collection, getDocs, addDoc, serverTimestamp, query, orderBy,
  doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { calcularLogros } from "./logros.js";
import { generarFrase } from "./ia.js";

// --------------------------------------------------
// 🔹 Utilidades DOM
// --------------------------------------------------
const $ = (id) => document.getElementById(id);
const lista = $("listaLibros");
const filtroGenero = $("filtroGenero");
const filtroEstado = $("filtroEstado");

// --------------------------------------------------
// 🔹 Botones principales
// --------------------------------------------------
const btnLogout = $("btnLogout");
const btnAddDemo = $("btnAddDemo");
const btnAddPersonal = $("btnAddPersonal");
const btnFrase = $("btnFraseIA");
const btnExportCSV = $("btnExportCSV");
const btnExportPDF = $("btnExportPDF");
const btnResetProgreso = $("btnResetProgreso");

// --------------------------------------------------
// 🔹 Cerrar sesión
// --------------------------------------------------
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --------------------------------------------------
// 🔹 Agregar libro demo aleatorio
// --------------------------------------------------
let agregandoLibro = false;
btnAddDemo?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión primero.");
  if (agregandoLibro) return alert("⏳ Ya se está agregando un libro demo...");

  agregandoLibro = true;
  btnAddDemo.disabled = true;
  btnAddDemo.textContent = "📚 Agregando...";

  const librosPosibles = [
    { titulo: "1984", autor: "George Orwell", genero: "Distopía" },
    { titulo: "Fahrenheit 451", autor: "Ray Bradbury", genero: "Ciencia ficción" },
    { titulo: "El Principito", autor: "Antoine de Saint-Exupéry", genero: "Infantil" },
    { titulo: "Crónica de una muerte anunciada", autor: "Gabriel García Márquez", genero: "Realismo mágico" },
    { titulo: "Matar a un ruiseñor", autor: "Harper Lee", genero: "Drama" },
    { titulo: "La Odisea", autor: "Homero", genero: "Clásico" },
    { titulo: "Dune", autor: "Frank Herbert", genero: "Ciencia ficción" },
    { titulo: "Los juegos del hambre", autor: "Suzanne Collins", genero: "Aventura" },
    { titulo: "It", autor: "Stephen King", genero: "Terror" },
    { titulo: "Ready Player One", autor: "Ernest Cline", genero: "Retro Futurismo" }
  ];

  try {
    const ref = collection(db, "usuarios", user.uid, "libros");
    const snap = await getDocs(ref);
    const titulosActuales = snap.docs.map(d => d.data().titulo?.toLowerCase());
    const disponibles = librosPosibles.filter(l => !titulosActuales.includes(l.titulo.toLowerCase()));

    if (disponibles.length === 0) {
      btnAddDemo.textContent = "✔️ Todos agregados";
      return alert("🎉 Ya tienes todos los libros demo disponibles.");
    }

    const ultimoGuardado = localStorage.getItem("ultimoLibroAgregado");
    let libro;
    do { libro = disponibles[Math.floor(Math.random() * disponibles.length)]; }
    while (libro.titulo === ultimoGuardado && disponibles.length > 1);

    await addDoc(ref, { ...libro, xp: 0, estado: "pendiente", createdAt: serverTimestamp() });
    localStorage.setItem("ultimoLibroAgregado", libro.titulo);

    await cargarLibros();
    await calcularLogros();
    alert(`✅ Libro agregado: "${libro.titulo}" de ${libro.autor}`);
  } catch (e) {
    alert("❌ No se pudo agregar el libro demo: " + e.message);
  } finally {
    agregandoLibro = false;
    btnAddDemo.disabled = false;
    btnAddDemo.textContent = "➕ Agregar libro demo";
  }
});

// --------------------------------------------------
// 🔹 Agregar libro personalizado
// --------------------------------------------------
btnAddPersonal?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión primero.");

  const titulo = $("tituloPersonal").value.trim();
  const autor = $("autorPersonal").value.trim();
  const genero = $("generoPersonal").value.trim();
  const estado = $("estadoPersonal").value;

  if (!titulo || !autor || !genero)
    return alert("Completa todos los campos antes de guardar.");

  try {
    const ref = collection(db, "usuarios", user.uid, "libros");
    await addDoc(ref, { titulo, autor, genero, estado, xp: 0, createdAt: serverTimestamp() });

    $("tituloPersonal").value = "";
    $("autorPersonal").value = "";
    $("generoPersonal").value = "";
    $("estadoPersonal").selectedIndex = 0;

    await cargarLibros();
    await calcularLogros();
    alert(`✅ Libro agregado: "${titulo}" de ${autor}`);
  } catch (e) {
    alert("❌ No se pudo agregar el libro: " + e.message);
  }
});

// --------------------------------------------------
// 🔹 Generar frase IA (modo retro)
// --------------------------------------------------
btnFrase?.addEventListener("click", async () => {
  btnFrase.disabled = true;
  btnFrase.textContent = "Generando...";
  try {
    const libros = document.querySelectorAll(".card[data-title]");
    const titulo = libros.length
      ? libros[Math.floor(Math.random() * libros.length)].dataset.title
      : "tu aventura";
    const frase = await generarFrase(titulo);
    $("fraseIA").innerText = frase;

    // 🗣️ Voz retro (segura)
    if ("speechSynthesis" in window) {
      const voz = new SpeechSynthesisUtterance(frase);
      voz.lang = "es-ES";
      voz.pitch = 0.8;
      voz.rate = 1;
      voz.volume = 1;
      speechSynthesis.speak(voz);
    }
  } catch (e) {
    console.error("Error al generar frase:", e);
    $("fraseIA").innerText = "⚠️ No fue posible generar la frase.";
  } finally {
    btnFrase.disabled = false;
    btnFrase.textContent = "🎤 Frase motivadora IA";
  }
});

// --------------------------------------------------
// 🔹 Filtros y exportaciones
// --------------------------------------------------
filtroGenero?.addEventListener("change", cargarLibros);
filtroEstado?.addEventListener("change", cargarLibros);
btnExportCSV?.addEventListener("click", exportCSV);
btnExportPDF?.addEventListener("click", exportPDF);

// --------------------------------------------------
// 🔹 Reiniciar progreso completo (versión FINAL funcional)
// --------------------------------------------------
btnResetProgreso?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión primero.");
  if (!confirm("⚠️ ¿Reiniciar TODO tu progreso?\nLos libros volverán a 'pendiente' y XP a 0.")) return;

  try {
    const ref = collection(db, "usuarios", user.uid, "libros");
    const snap = await getDocs(ref);

    if (snap.empty) {
      alert("📂 No hay libros para reiniciar.");
      return;
    }

    // 🔄 Actualizar todos los libros realmente en Firestore
    const updates = [];
    for (const d of snap.docs) {
      const libroRef = doc(db, "usuarios", user.uid, "libros", d.id);
      updates.push(updateDoc(libroRef, { xp: 0, estado: "pendiente" }));
    }

    await Promise.all(updates); // ✅ Esperar todos los cambios reales

    // Esperar un poquito para asegurar sincronización con Firestore
    await new Promise(res => setTimeout(res, 1000));

    // Recargar datos actualizados
    await cargarLibros();
    await calcularLogros();

    // 🎵 Efecto + animación retro
    new Audio("assets/sounds/reset.wav").play();
    const panel = document.getElementById("panelLogros");
    if (panel) {
      const efecto = document.createElement("div");
      efecto.textContent = "✨ SYSTEM RESET ✨";
      efecto.className = "neon-reset";
      panel.appendChild(efecto);
      setTimeout(() => efecto.remove(), 2500);
    }

    alert("🔄 Progreso reiniciado correctamente.");
  } catch (err) {
    console.error("❌ Error al reiniciar progreso:", err);
    alert("❌ Ocurrió un error al reiniciar el progreso.");
  }
});


// --------------------------------------------------
// 🔹 Cargar libros
// --------------------------------------------------
async function cargarLibros() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "usuarios", user.uid, "libros"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  lista.innerHTML = "";

  const generoFiltro = filtroGenero?.value || "todos";
  const estadoFiltro = filtroEstado?.value || "todos";

  snap.forEach((d) => {
    const data = d.data();
    if (generoFiltro !== "todos" && data.genero !== generoFiltro) return;
    if (estadoFiltro !== "todos" && data.estado !== estadoFiltro) return;

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
      <button class="btnDelete" data-id="${d.id}">🗑️ Eliminar</button>
    `;
    lista.appendChild(card);

    // 📖 Marcar como leído
    card.querySelector(".btnRead").addEventListener("click", async (ev) => {
      const id = ev.target.dataset.id;
      if (data.estado === "leído") return alert(`✅ "${data.titulo}" ya fue leído.`);
      try {
        await updateDoc(doc(db, "usuarios", user.uid, "libros", id), {
          xp: (data.xp || 0) + 100,
          estado: "leído"
        });
        new Audio("assets/sounds/levelup.wav").play();
        await cargarLibros();
        await calcularLogros();
        alert(`🎉 ¡Has leído "${data.titulo}" y ganaste 100 XP!`);
      } catch (err) {
        alert("❌ Error al actualizar XP/estado: " + err.message);
      }
    });

    // 🗑️ Eliminar libro
    card.querySelector(".btnDelete").addEventListener("click", async (ev) => {
      const id = ev.target.dataset.id;
      if (!confirm("¿Eliminar este libro?")) return;
      await deleteDoc(doc(db, "usuarios", user.uid, "libros", id));
      await cargarLibros();
    });
  });
}

// --------------------------------------------------
// 🔹 Exportar libros a CSV
// --------------------------------------------------
async function exportCSV() {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión.");
  try {
    const snap = await getDocs(collection(db, "usuarios", user.uid, "libros"));
    if (snap.empty) return alert("📂 No hay libros para exportar.");
    let csv = "Título,Autor,Género,Estado,XP\n";
    snap.forEach((d) => {
      const x = d.data();
      csv += `"${x.titulo || ""}","${x.autor || ""}","${x.genero || ""}","${x.estado || ""}",${x.xp || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `BookQuest80s_${user.email.split("@")[0]}.csv`;
    a.click();
    alert("✅ CSV exportado correctamente.");
  } catch (err) {
    alert("❌ Error al exportar CSV: " + err.message);
  }
}

// --------------------------------------------------
// 🔹 Exportar libros a PDF
// --------------------------------------------------
async function exportPDF() {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión.");
  try {
    const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    const docPDF = new jsPDF();
    docPDF.setFont("courier", "normal");
    docPDF.setFontSize(14);
    docPDF.text("📚 Aventura Literaria 80s - Reporte de Libros", 10, 15);

    const snap = await getDocs(collection(db, "usuarios", user.uid, "libros"));
    if (snap.empty) return alert("📂 No hay libros para exportar.");

    let y = 30;
    docPDF.setFontSize(10);
    snap.forEach((d, i) => {
      const x = d.data();
      const line = `${i + 1}. ${x.titulo || "?"} — ${x.autor || "?"} (${x.genero || "?"}) [${x.estado || "?"}] XP:${x.xp || 0}`;
      docPDF.text(line, 10, y);
      y += 8;
      if (y > 270) { docPDF.addPage(); y = 20; }
    });

    docPDF.setFontSize(8);
    docPDF.text(`Generado por ${user.email} — ${new Date().toLocaleString()}`, 10, 285);
    docPDF.save(`BookQuest80s_${user.email.split("@")[0]}.pdf`);
    alert("✅ PDF exportado correctamente.");
  } catch (err) {
    alert("❌ Error al exportar PDF: " + err.message);
  }
}

// --------------------------------------------------
// 🔹 Verificar sesión activa
// --------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  await cargarLibros();
  await calcularLogros();
});



