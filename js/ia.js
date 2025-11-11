// js/ia.js
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// 🧩 Coloca aquí tu API Key de Gemini
const API_KEY = "AIzaSyAUZggMa5i9LaPFrGXbHVUs5bTO2KD349iU";

// ⚙️ Inicializar Gemini
let genAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (err) {
  console.error("❌ Error al inicializar Gemini:", err);
}

// 🕹️ Frases retro de respaldo (si la IA falla o no está disponible)
const frasesRetro = [
  "🌌 Cada página que lees enciende un nuevo pixel en tu universo mental.",
  "💾 Tu mente se está actualizando... conocimiento instalado con éxito.",
  "🚀 Leer es el viaje más rápido a cualquier galaxia del tiempo.",
  "🕹️ Subiste de nivel en sabiduría. ¡No olvides guardar tu progreso!",
  "📖 En cada libro hay un portal, solo los valientes se atreven a abrirlo.",
  "💡 Cada palabra que lees brilla con luz neón dentro de ti.",
  "🎧 Las historias también tienen banda sonora, ¡escúchalas en tu imaginación!",
  "🧠 El verdadero poder retro: aprender algo nuevo cada día.",
  "💫 La nostalgia se lee entre líneas. Sigue explorando.",
  "🔥 Un lector ochentero nunca se rinde, solo cambia de misión."
];

// 🔹 Función principal
export async function generarFrase(tituloLibro = "tu lectura") {
  // 🧱 Si no hay API configurada, usar frases retro
  if (!API_KEY || API_KEY === "TU_API_KEY_AQUI") {
    console.warn("⚠️ API Key de Gemini no configurada.");
    return obtenerFraseRetro(tituloLibro);
  }

  try {
    const modelo = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Eres un narrador retro ochentero motivador.
      Crea una frase corta y original (1 o 2 líneas) inspirada en el libro "${tituloLibro}".
      Usa tono optimista y nostálgico, estilo “Aventura Literaria 80s”.
      Ejemplo: “Cada página de '1984' abre una puerta al valor de pensar libremente, viajero del neón.”
    `;

    const resultado = await modelo.generateContent(prompt);
    const texto = resultado.response.text();

    // Si la IA no devuelve texto válido, usar fallback
    if (!texto || texto.trim().length === 0) {
      console.warn("⚠️ Respuesta vacía de Gemini. Usando frase retro.");
      return obtenerFraseRetro(tituloLibro);
    }

    return texto;
  } catch (error) {
    console.error("⚠️ Error generando frase IA:", error);
    return obtenerFraseRetro(tituloLibro);
  }
}

// 🔸 Función auxiliar para generar frase retro local
function obtenerFraseRetro(titulo = "tu aventura literaria") {
  const randomIndex = Math.floor(Math.random() * frasesRetro.length);
  const frase = frasesRetro[randomIndex].replace("tu lectura", titulo);
  return frase;
}

