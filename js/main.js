import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  collection, getDocs, addDoc, serverTimestamp, query, orderBy,
  doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { calcularLogros } from "./logros.js";
import { generarFrase } from "./ia.js";

// --------------------------------------------------
// 🔹 Referencias del DOM
// --------------------------------------------------
const $ = (id) => document.getElementById(id);
const lista = $("listaLibros");
const btnLogout = $("btnLogout");
const btnAddDemo = $("btnAddDemo");
const btnFrase = $("btnFraseIA");
const btnExportCSV = $("btnExportCSV");
const btnExportPDF = $("btnExportPDF");
const filtroGenero = $("filtroGenero");
const filtroEstado = $("filtroEstado");

// --------------------------------------------------
// 🔹 Cerrar sesión
// --------------------------------------------------
btnLogout?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// --------------------------------------------------
// 🔹 Agregar libro demo aleatorio al usuario autenticado
// --------------------------------------------------
let agregandoLibro = false;

btnAddDemo?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión primero.");

  if (agregandoLibro) return alert("⏳ Espera un momento, ya se está agregando un libro...");
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
    const disponibles = librosPosibles.filter(
      l => !titulosActuales.includes(l.titulo.toLowerCase())
    );

    if (disponibles.length === 0) {
      btnAddDemo.disabled = true;
      btnAddDemo.textContent = "✔️ Todos los libros agregados";
      agregandoLibro = false;
      return alert("🎉 Ya tienes todos los libros demo agregados.");
    }

    const ultimoGuardado = localStorage.getItem("ultimoLibroAgregado");
    let libro;
    do {
      libro = disponibles[Math.floor(Math.random() * disponibles.length)];
    } while (libro.titulo === ultimoGuardado && disponibles.length > 1);

    await addDoc(ref, {
      ...libro,
      xp: 0,
      estado: "pendiente",
      createdAt: serverTimestamp()
    });

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
// 🔹 Agregar libro personalizado (manual desde formulario)
// --------------------------------------------------
const btnAddPersonal = $("btnAddPersonal");

btnAddPersonal?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión primero.");

  const titulo = $("tituloPersonal").value.trim();
  const autor = $("autorPersonal").value.trim();
  const genero = $("generoPersonal").value.trim();
  const estado = $("estadoPersonal").value;

  if (!titulo || !autor || !genero) {
    return alert("Por favor completa todos los campos del formulario.");
  }

  try {
    const ref = collection(db, "usuarios", user.uid, "libros");
    await addDoc(ref, {
      titulo,
      autor,
      genero,
      estado,
      xp: 0,
      createdAt: serverTimestamp()
    });

    // 🧹 Limpiar campos después de guardar
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
// 🔹 Generar frase IA
// --------------------------------------------------
btnFrase?.addEventListener("click", async () => {
  btnFrase.disabled = true;
  btnFrase.textContent = "Generando...";
  try {
    const libros = document.querySelectorAll(".card[data-title]");
    const titulo = libros.length
      ? libros[Math.floor(Math.random() * libros.length)].dataset.title
      : "tu último libro";
    const frase = await generarFrase(titulo);
    $("fraseIA").innerText = frase;
  } catch (e) {
    $("fraseIA").innerText = "⚠️ No fue posible generar la frase en este momento.";
  } finally {
    btnFrase.disabled = false;
    btnFrase.textContent = "🎤 Frase motivadora IA";
  }
});

// --------------------------------------------------
// 🔹 Filtros
// --------------------------------------------------
filtroGenero?.addEventListener("change", cargarLibros);
filtroEstado?.addEventListener("change", cargarLibros);
btnExportCSV?.addEventListener("click", exportCSV);
btnExportPDF?.addEventListener("click", exportPDF);

// --------------------------------------------------
// 🔹 Cargar libros del usuario actual
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

    // 🟢 Marcar como leído (+100 XP) — solo una vez
    card.querySelector(".btnRead").addEventListener("click", async (ev) => {
      const id = ev.target.dataset.id;
      if (data.estado === "leído") {
        return alert(`✅ "${data.titulo}" ya fue leído.`);
      }
      try {
        const ref = doc(db, "usuarios", user.uid, "libros", id);
        await updateDoc(ref, {
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

    // 🔴 Eliminar libro
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
  if (!user) return;
  const snap = await getDocs(collection(db, "usuarios", user.uid, "libros"));
  let csv = "Título,Autor,Género,Estado,XP\n";
  snap.forEach((d) => {
    const x = d.data();
    csv += `"${(x.titulo || "").replace(/"/g, '""')}","${(x.autor || "").replace(/"/g, '""')}",` +
           `"${x.genero || ""}","${x.estado || ""}",${x.xp || 0}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "BookQuest80s.csv";
  a.click();
}

// --------------------------------------------------
// 🔹 Exportar libros a PDF
// --------------------------------------------------
async function exportPDF() {
  const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const docPDF = new jsPDF();
  docPDF.text("📚 Reporte de Libros - Aventura Literaria 80s", 10, 10);

  const user = auth.currentUser;
  if (!user) return;
  const snap = await getDocs(collection(db, "usuarios", user.uid, "libros"));
  let y = 20;
  snap.forEach((d) => {
    const x = d.data();
    const line = `${x.titulo || "?"} - ${x.autor || "?"} [${x.genero || "?"}/${x.estado || "?"}] (${x.xp || 0} XP)`;
    docPDF.text(line, 10, y);
    y += 10;
    if (y > 280) { docPDF.addPage(); y = 10; }
  });
  docPDF.save("BookQuest80s.pdf");
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
