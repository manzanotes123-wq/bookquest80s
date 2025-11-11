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

// 🔹 Función principal
export async function generarFrase(tituloLibro = "tu lectura") {
  if (!API_KEY || API_KEY === "TU_API_KEY_AQUI") {
    console.warn("⚠️ API Key de Gemini no configurada.");
    return "Configura tu API Key de Gemini en js/ia.js para activar las frases IA.";
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
    return texto || "✨ La inspiración está cargando... inténtalo de nuevo.";
  } catch (error) {
    console.error("Error generando frase IA:", error);
    return "⚠️ Error al conectar con la IA. Intenta más tarde.";
  }
}
